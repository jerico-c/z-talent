/**
 * Server function pencarian lowongan "Siap Kerja".
 *
 * Data diambil dari API glints.com (parse.bot). Kunci API dibaca di server
 * (di dalam handler) sehingga tidak pernah ikut ke bundel browser.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { JobItem, JobSearchResult } from "./job-match";

const SCRAPER_URL = "https://api.parse.bot/scraper/88116b3d-bc68-4078-973a-fee343944c47/search_jobs";

const inputSchema = z.object({
  keyword: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).max(50).default(1),
  pageSize: z.number().int().min(1).max(30).default(12),
  jobType: z.string().trim().max(40).optional(),
  workArrangement: z.string().trim().max(40).optional(),
});

/** Format rupiah/mata uang lain menjadi teks yang mudah dibaca. */
function formatSalary(salary: unknown): string | null {
  if (salary == null || typeof salary !== "object") return null;
  const s = salary as { min?: number; max?: number; currency?: string; mode?: string };
  if (typeof s.min !== "number" && typeof s.max !== "number") return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: s.currency ?? "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  const per = s.mode === "MONTH" ? "/bulan" : s.mode === "YEAR" ? "/tahun" : s.mode === "HOUR" ? "/jam" : "";
  if (typeof s.min === "number" && typeof s.max === "number" && s.min !== s.max) {
    return `${fmt(s.min)} – ${fmt(s.max)}${per}`;
  }
  return `${fmt((s.min ?? s.max) as number)}${per}`;
}

/** Normalisasi respons API mentah menjadi bentuk yang dipakai UI. */
function normalize(raw: unknown): JobItem {
  const j = raw as Record<string, any>;
  return {
    id: String(j["id"] ?? crypto.randomUUID()),
    title: String(j["title"] ?? "Tanpa judul"),
    company: String(j["company"]?.name ?? "Perusahaan tidak disebutkan"),
    companyIndustry: String(j["company"]?.industry ?? ""),
    location: String(j["location"] ?? j["country"] ?? "Indonesia"),
    jobType: String(j["job_type"] ?? ""),
    workArrangement: String(j["work_arrangement"] ?? ""),
    educationLevel: String(j["education_level"] ?? ""),
    minYears: typeof j["min_years_of_experience"] === "number" ? j["min_years_of_experience"] : null,
    maxYears: typeof j["max_years_of_experience"] === "number" ? j["max_years_of_experience"] : null,
    salary: j["should_show_salary"] === false ? null : formatSalary(j["salary"] ?? j["salary_estimate"]),
    skills: Array.isArray(j["skills"])
      ? j["skills"].map((s: any) => ({ name: String(s?.name ?? ""), mustHave: Boolean(s?.must_have) })).filter((s: JobItem["skills"][number]) => s.name)
      : [],
    category: String(j["category"]?.name ?? ""),
    isHot: Boolean(j["is_hot"]),
    createdAt: String(j["created_at"] ?? ""),
  };
}

export const searchJobs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<JobSearchResult> => {
    const apiKey = process.env["PARSE_API_KEY"];
    if (!apiKey) throw new Error("Kunci API lowongan belum tersedia di server.");

    const params = new URLSearchParams({
      page: String(data.page),
      page_size: String(data.pageSize),
      country_code: "ID",
    });
    if (data.keyword) params.set("keyword", data.keyword);
    if (data.jobType) params.set("job_type", data.jobType);
    if (data.workArrangement) params.set("work_arrangement", data.workArrangement);

    const res = await fetch(`${SCRAPER_URL}?${params.toString()}`, {
      headers: { "X-API-Key": apiKey },
    });

    if (!res.ok) {
      console.error("search_jobs gagal", res.status, await res.text().catch(() => ""));
      throw new Error("Gagal mengambil daftar lowongan. Coba lagi sebentar lagi.");
    }

    const body = (await res.json()) as { data?: { jobs?: unknown[]; page?: number; has_more?: boolean } };
    const jobs = Array.isArray(body.data?.jobs) ? body.data!.jobs! : [];

    return {
      jobs: jobs.map(normalize),
      page: body.data?.page ?? data.page,
      hasMore: Boolean(body.data?.has_more),
    };
  });
