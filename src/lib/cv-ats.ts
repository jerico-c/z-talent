/**
 * Mesin skor ATS — adaptasi dari pemeriksa 30 kondisi Craftez My Resume,
 * diterjemahkan dan disesuaikan untuk konteks anak muda & UMKM Indonesia.
 *
 * Semua perhitungan berjalan di sisi klien agar skor bergerak real-time
 * saat pengguna mengetik (tidak perlu panggilan API).
 */

import type { CvData } from "./cv-data";
import { splitList } from "./cv-data";

const ACTION_VERBS = [
  "memimpin","mengelola","membangun","meluncurkan","meningkatkan","mengembangkan","merancang","menyusun",
  "mengoptimasi","menganalisis","melatih","menaikkan","menurunkan","mengurangi","menghasilkan","menjalankan",
  "led","built","managed","launched","improved","developed","designed","increased","reduced","delivered",
];

const INDUSTRY_KEYWORDS = [
  "meta ads","google ads","seo","copywriting","canva","figma","looker","spreadsheet","crm","marketplace",
  "analitik","konten","branding","jaringan","mikrotik","data","excel","dashboard","kampanye","penjualan",
];

const FIRST_PERSON = /\b(saya|aku|gue|i|my|me)\b/i;

export type AtsCondition = { passed: boolean; points: number; tip: string; group: string };

export type AtsResult = {
  score: number;
  conditions: AtsCondition[];
  failed: AtsCondition[];
  passedCount: number;
  label: string;
};

/** Hitung skor ATS 0–100 beserta daftar perbaikan konkret. */
export function computeAts(cv: CvData): AtsResult {
  const { personal, experience, education, skills, additional } = cv;
  const c: AtsCondition[] = [];

  const allText = [
    personal.jobTitle,
    personal.summary,
    ...experience.map((e) => `${e.title} ${e.company} ${e.description}`),
    skills.technical,
    skills.soft,
    additional.certifications,
    additional.projects,
  ]
    .join(" ")
    .toLowerCase();

  const summaryWords = personal.summary.trim() ? personal.summary.trim().split(/\s+/).length : 0;
  const tech = splitList(skills.technical);
  const soft = splitList(skills.soft);

  const push = (group: string, passed: boolean, points: number, tip: string) =>
    c.push({ group, passed, points, tip });

  // Identitas & kontak
  push("Kontak", !!personal.fullName.trim(), 4, "Tulis nama lengkapmu di bagian atas CV.");
  push("Kontak", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email), 4, "Isi email yang valid dan profesional.");
  push("Kontak", !!personal.phone.trim(), 3, "Cantumkan nomor telepon/WhatsApp aktif.");
  push("Kontak", !!personal.location.trim(), 2, "Tambahkan kota domisili (contoh: Batam).");
  push("Kontak", !!personal.linkedin.trim(), 3, "Tambahkan tautan LinkedIn atau portofolio.");
  push("Kontak", !!personal.jobTitle.trim(), 2, "Tulis posisi yang dituju (contoh: Spesialis Pemasaran Digital).");

  // Ringkasan profesional
  push("Ringkasan", summaryWords >= 20, 4, "Tulis ringkasan profesional minimal 20 kata.");
  push("Ringkasan", summaryWords >= 30 && summaryWords <= 150, 2, "Jaga panjang ringkasan 30–150 kata agar ramah ATS.");
  push("Ringkasan", !!personal.summary && !FIRST_PERSON.test(personal.summary), 3, "Hindari kata \"saya/aku\" — pakai gaya deskriptif.");
  const jobWords = personal.jobTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  push(
    "Ringkasan",
    jobWords.length > 0 && jobWords.some((w) => personal.summary.toLowerCase().includes(w)),
    2,
    "Sebut kata kunci posisi yang dilamar di dalam ringkasan.",
  );

  // Pengalaman
  push("Pengalaman", experience.length > 0, 5, "Tambahkan minimal satu pengalaman kerja, magang, atau gig.");
  push("Pengalaman", experience.length >= 2, 3, "Tambahkan 2+ pengalaman untuk memperkuat kecocokan ATS.");
  push(
    "Pengalaman",
    experience.some((e) => ACTION_VERBS.some((v) => e.description.toLowerCase().includes(v))),
    4,
    "Mulai poin pengalaman dengan kata kerja aktif (memimpin, membangun, meningkatkan).",
  );
  push(
    "Pengalaman",
    experience.some((e) => /\d/.test(e.description)),
    4,
    "Tambahkan angka terukur (contoh: menaikkan penjualan 42%).",
  );
  push("Pengalaman", experience.length > 0 && experience.every((e) => !!e.startDate), 2, "Lengkapi tanggal mulai pada semua pengalaman.");
  push(
    "Pengalaman",
    experience.length > 0 && experience.every((e) => e.description.length > 50),
    3,
    "Jelaskan tiap pengalaman minimal 50 karakter.",
  );

  // Pendidikan & keterampilan
  push("Pendidikan", education.length > 0, 4, "Tambahkan riwayat pendidikan terakhir.");
  push("Keterampilan", tech.length >= 3, 4, "Cantumkan minimal 3 keterampilan teknis.");
  push("Keterampilan", tech.length >= 6, 3, "Daftarkan 6+ keterampilan teknis agar lebih banyak kata kunci cocok.");
  push("Keterampilan", soft.length >= 2, 2, "Tambahkan keterampilan personal (komunikasi, kolaborasi).");
  push("Keterampilan", !!skills.languages.trim(), 2, "Cantumkan kemampuan bahasa yang kamu kuasai.");

  // Kata kunci industri
  const keywordHits = INDUSTRY_KEYWORDS.filter((k) => allText.includes(k));
  const missing = INDUSTRY_KEYWORDS.filter((k) => !allText.includes(k)).slice(0, 3).join(", ");
  push("Kata kunci", keywordHits.length >= 3, 4, `Tambahkan kata kunci industri — coba: ${missing}.`);
  push("Kata kunci", keywordHits.length >= 6, 3, "Sebar 6+ kata kunci industri di ringkasan dan pengalaman.");
  const verbHits = ACTION_VERBS.filter((v) => allText.includes(v));
  push("Kata kunci", verbHits.length >= 2, 4, "Gunakan lebih banyak kata kerja berdampak di CV.");
  push("Kata kunci", verbHits.length >= 5, 2, "Gunakan 5+ kata kerja aktif berbeda di seluruh pengalaman.");

  // Bagian pendukung
  push("Pendukung", !!additional.certifications.trim(), 3, "Cantumkan mikro-kredensial/sertifikat yang kamu miliki.");
  push("Pendukung", !!additional.projects.trim(), 3, "Tambahkan 1–2 proyek beserta hasilnya.");
  push("Pendukung", !!additional.awards.trim(), 2, "Tambahkan penghargaan atau prestasi agar menonjol.");
  push("Pendukung", !!additional.volunteer.trim(), 1, "Tambahkan pengalaman relawan — menunjukkan inisiatif.");

  const total = c.reduce((s, x) => s + x.points, 0);
  const earned = c.filter((x) => x.passed).reduce((s, x) => s + x.points, 0);
  const score = Math.round((earned / total) * 100);

  const label =
    score >= 90 ? "Siap dikirim" : score >= 75 ? "Bagus, sedikit lagi" : score >= 50 ? "Perlu perbaikan" : "Masih mentah";

  return {
    score,
    conditions: c,
    failed: c.filter((x) => !x.passed).sort((a, b) => b.points - a.points),
    passedCount: c.filter((x) => x.passed).length,
    label,
  };
}
