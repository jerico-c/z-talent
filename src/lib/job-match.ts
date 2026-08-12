/**
 * Tipe & util pencocokan lowongan "Siap Kerja".
 *
 * Modul ini aman dipakai di browser (tidak menyentuh kunci API).
 * Skor kecocokan dihitung dari data CV yang tersimpan di localStorage,
 * dibandingkan dengan keterampilan & judul lowongan dari Glints.
 */

import type { CvData } from "./cv-data";

export type JobSkill = { name: string; mustHave: boolean };

export type JobItem = {
  id: string;
  title: string;
  company: string;
  companyIndustry: string;
  location: string;
  jobType: string;
  workArrangement: string;
  educationLevel: string;
  minYears: number | null;
  maxYears: number | null;
  salary: string | null;
  skills: JobSkill[];
  category: string;
  isHot: boolean;
  createdAt: string;
};

export type JobSearchResult = {
  jobs: JobItem[];
  page: number;
  hasMore: boolean;
};

/** Label bahasa Indonesia untuk enum dari API. */
export const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Penuh waktu",
  PART_TIME: "Paruh waktu",
  INTERNSHIP: "Magang",
  CONTRACT: "Kontrak",
  TEMPORARY: "Sementara",
  DAILY: "Harian",
  PROJECT_BASED: "Berbasis proyek",
  FREELANCE: "Pekerja lepas",
};

export const workArrangementLabels: Record<string, string> = {
  ONSITE: "Kerja di kantor",
  REMOTE: "Kerja jarak jauh",
  HYBRID: "Campuran (hybrid)",
};

export const educationLabels: Record<string, string> = {
  ELEMENTARY_SCHOOL: "SD",
  JUNIOR_HIGH_SCHOOL: "SMP",
  HIGH_SCHOOL: "SMA/SMK",
  VOCATIONAL_DIPLOMA: "Diploma (D1–D3)",
  DIPLOMA: "Diploma",
  BACHELOR_DEGREE: "Sarjana (S1)",
  MASTER_DEGREE: "Magister (S2)",
  DOCTORATE_DEGREE: "Doktor (S3)",
};

export const humanLabel = (map: Record<string, string>, value: string) =>
  map[value] ?? value.replace(/_/g, " ").toLowerCase();

/** Kumpulkan seluruh kata kunci keterampilan dari CV pengguna. */
export function cvKeywords(cv: CvData): string[] {
  const raw = [
    cv.personal.jobTitle,
    cv.personal.summary,
    cv.skills.technical,
    cv.skills.soft,
    cv.skills.languages,
    cv.additional.certifications,
    cv.additional.projects,
    ...cv.experience.map((e) => `${e.title} ${e.company} ${e.description}`),
    ...cv.education.map((e) => `${e.degree} ${e.school}`),
  ]
    .join(" ")
    .toLowerCase();

  return Array.from(new Set(raw.split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2)));
}

/**
 * Skor kecocokan 0–100: 70% dari keterampilan yang cocok,
 * 30% dari kemiripan judul pekerjaan dengan posisi yang dituju di CV.
 */
export function matchScore(job: JobItem, keywords: string[], targetTitle: string) {
  const set = new Set(keywords);
  const hit = (text: string) =>
    text
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((w) => w.length > 2)
      .some((w) => set.has(w));

  const matchedSkills = job.skills.filter((s) => hit(s.name));
  const skillPart = job.skills.length > 0 ? matchedSkills.length / job.skills.length : 0.4;

  const titleWords = targetTitle
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  const jobTitle = job.title.toLowerCase();
  const titlePart =
    titleWords.length > 0 ? titleWords.filter((w) => jobTitle.includes(w)).length / titleWords.length : 0;

  const score = Math.round((skillPart * 0.7 + titlePart * 0.3) * 100);
  return {
    score: Math.max(12, Math.min(99, score)),
    matchedSkills: matchedSkills.map((s) => s.name),
    missingSkills: job.skills.filter((s) => !hit(s.name)).map((s) => s.name),
  };
}

/** Keterangan singkat arti skor agar mudah dipahami pengguna. */
export function matchLabel(score: number) {
  if (score >= 80) return "Sangat cocok";
  if (score >= 60) return "Cukup cocok";
  if (score >= 40) return "Perlu tambah skill";
  return "Masih jauh";
}
