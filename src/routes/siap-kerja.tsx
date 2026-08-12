import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Clock, GraduationCap, Loader2, MapPin, Search, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CV_STORAGE_KEY, sampleCv, type CvData } from "@/lib/cv-data";
import {
  cvKeywords,
  educationLabels,
  humanLabel,
  jobTypeLabels,
  matchLabel,
  matchScore,
  workArrangementLabels,
  type JobItem,
} from "@/lib/job-match";
import { searchJobs } from "@/lib/jobs.functions";

export const Route = createFileRoute("/siap-kerja")({
  head: () => ({
    meta: [
      { title: "Siap Kerja — Lowongan yang Cocok dengan CV-mu | Z-Talent Nexus" },
      {
        name: "description",
        content:
          "Daftar lowongan kerja nyata di Indonesia yang diurutkan sesuai keterampilan pada CV-mu, lengkap dengan gaji, lokasi, dan skill yang masih perlu dipelajari.",
      },
      { property: "og:title", content: "Siap Kerja — Lowongan sesuai CV-mu" },
      {
        property: "og:description",
        content: "Lowongan nyata dari Glints Indonesia, dicocokkan otomatis dengan keterampilan di CV-mu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SiapKerjaPage,
});

/** Pilihan penyaring dalam bahasa sehari-hari. */
const typeFilters = [
  { value: "", label: "Semua jenis" },
  { value: "FULL_TIME", label: "Penuh waktu" },
  { value: "PART_TIME", label: "Paruh waktu" },
  { value: "INTERNSHIP", label: "Magang" },
  { value: "CONTRACT", label: "Kontrak" },
] as const;

const arrangementFilters = [
  { value: "", label: "Semua lokasi kerja" },
  { value: "ONSITE", label: "Di kantor" },
  { value: "REMOTE", label: "Jarak jauh" },
  { value: "HYBRID", label: "Hybrid" },
] as const;

function toneFor(score: number) {
  if (score >= 80) return "bg-accent-soft text-accent-foreground";
  if (score >= 60) return "bg-primary-soft text-primary";
  return "bg-secondary text-secondary-foreground";
}

function SiapKerjaPage() {
  const [cv, setCv] = useState<CvData>(sampleCv);
  const [keyword, setKeyword] = useState(sampleCv.personal.jobTitle);
  const [query, setQuery] = useState(sampleCv.personal.jobTitle);
  const [jobType, setJobType] = useState<string>("");
  const [arrangement, setArrangement] = useState<string>("");
  const [page, setPage] = useState(1);

  /** Ambil CV tersimpan di browser agar pencocokan memakai data asli pengguna. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CV_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CvData;
        setCv(parsed);
        const title = parsed.personal?.jobTitle ?? "";
        if (title) {
          setKeyword(title);
          setQuery(title);
        }
      }
    } catch {
      /* draf rusak — pakai contoh */
    }
  }, []);

  const fetchJobs = useServerFn(searchJobs);
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["siap-kerja", query, jobType, arrangement, page],
    queryFn: () =>
      fetchJobs({
        data: {
          ...(query ? { keyword: query } : {}),
          page,
          pageSize: 12,
          ...(jobType ? { jobType } : {}),
          ...(arrangement ? { workArrangement: arrangement } : {}),
        },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const keywords = useMemo(() => cvKeywords(cv), [cv]);
  const targetTitle = cv.personal.jobTitle ?? "";

  const ranked = useMemo(() => {
    const jobs: JobItem[] = data?.jobs ?? [];
    return jobs
      .map((job) => ({ job, ...matchScore(job, keywords, targetTitle) }))
      .sort((a, b) => b.score - a.score);
  }, [data, keywords, targetTitle]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(keyword.trim());
  };

  return (
    <AppShell
      title="Siap Kerja"
      subtitle="Lowongan kerja nyata di Indonesia, diurutkan sesuai keterampilan di CV-mu"
    >
      {/* Pencarian & penyaring */}
      <Card className="border-border shadow-soft">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari posisi, keahlian, atau nama perusahaan"
                aria-label="Kata kunci pekerjaan"
                className="rounded-xl pl-9"
              />
            </div>
            <Button type="submit" className="rounded-xl">
              Cari lowongan
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {typeFilters.map((f) => (
              <Button
                key={f.label}
                type="button"
                size="sm"
                variant={jobType === f.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => {
                  setJobType(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {arrangementFilters.map((f) => (
              <Button
                key={f.label}
                type="button"
                size="sm"
                variant={arrangement === f.value ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => {
                  setArrangement(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Angka kecocokan dihitung dari keahlian, ringkasan, dan pengalaman pada CV yang kamu susun di halaman
            CV & Portofolio.
          </p>
        </CardContent>
      </Card>

      {/* Daftar lowongan */}
      {isPending ? (
        <div className="grid place-items-center gap-3 rounded-3xl border border-border bg-card p-12 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Mencari lowongan yang cocok dengan CV-mu…</p>
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-semibold">Daftar lowongan belum bisa dimuat</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Terjadi kendala pada layanan lowongan."}
          </p>
        </div>
      ) : ranked.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold">Belum ada lowongan untuk kata kunci ini</p>
          <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci lain atau ubah penyaringnya.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ranked.map(({ job, score, matchedSkills, missingSkills }) => (
              <article
                key={job.id}
                className="card-interactive flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <h3 className="text-sm font-bold leading-snug">{job.title}</h3>
                  <Badge className={`shrink-0 ${toneFor(score)}`}>{score}% cocok</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Building2 className="size-3.5" /> {job.company}
                </p>
                <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" /> {job.location}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[11px]">
                    {humanLabel(jobTypeLabels, job.jobType)}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {humanLabel(workArrangementLabels, job.workArrangement)}
                  </Badge>
                  {job.isHot && <Badge className="bg-primary-soft text-[11px] text-primary">Banyak dilamar</Badge>}
                </div>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1 font-semibold text-foreground">
                    <Wallet className="size-3.5" /> {job.salary ?? "Gaji dirahasiakan"}
                  </p>
                  {job.educationLevel && (
                    <p className="flex items-center gap-1">
                      <GraduationCap className="size-3.5" /> Minimal {humanLabel(educationLabels, job.educationLevel)}
                    </p>
                  )}
                  {job.minYears != null && (
                    <p className="flex items-center gap-1">
                      <Clock className="size-3.5" /> Pengalaman {job.minYears}
                      {job.maxYears != null && job.maxYears !== job.minYears ? `–${job.maxYears}` : ""} tahun
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-secondary/60 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {matchLabel(score)}
                  </p>
                  {matchedSkills.length > 0 && (
                    <p className="text-xs">
                      <span className="font-semibold text-foreground">Sudah kamu punya:</span>{" "}
                      {matchedSkills.slice(0, 4).join(", ")}
                    </p>
                  )}
                  {missingSkills.length > 0 && (
                    <p className="text-xs">
                      <span className="font-semibold text-foreground">Perlu dipelajari:</span>{" "}
                      {missingSkills.slice(0, 4).join(", ")}
                    </p>
                  )}
                </div>

                <Button asChild size="sm" className="mt-4 w-full rounded-xl">
                  <a
                    href={`https://glints.com/id/opportunities/jobs/explore?keyword=${encodeURIComponent(job.title)}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Lihat & lamar
                  </a>
                </Button>
              </article>
            ))}
          </div>

          {/* Navigasi halaman */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-muted-foreground">Halaman {page}</span>
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={!data?.hasMore || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
