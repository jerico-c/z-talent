/**
 * Model data & konfigurasi untuk Pembuat CV (adaptasi dari proyek Craftez My Resume).
 *
 * Data disimpan lokal di browser (localStorage) sehingga tidak butuh login.
 * Struktur ini sengaja dibuat datar agar mudah dikirim ke endpoint Laravel:
 *   POST /api/v1/cv  { personal, experience, education, skills, additional }
 */

export type CvPersonal = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
};

export type CvExperience = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CvEducation = {
  id: string;
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CvSkills = { technical: string; soft: string; languages: string };

export type CvAdditional = {
  certifications: string;
  projects: string;
  awards: string;
  volunteer: string;
};

export type CvData = {
  personal: CvPersonal;
  experience: CvExperience[];
  education: CvEducation[];
  skills: CvSkills;
  additional: CvAdditional;
};

export type CvSettings = { template: string; accent: string; font: string };

export const CV_STORAGE_KEY = "ztn_cv_v1";
export const CV_SETTINGS_KEY = "ztn_cv_settings_v1";

/** ID unik ringan untuk baris pengalaman/pendidikan. */
export const newId = () => Math.random().toString(36).slice(2, 10);

/** Contoh data agar pratinjau langsung terlihat hidup saat pertama dibuka. */
export const sampleCv: CvData = {
  personal: {
    fullName: "Nadia Prameswari",
    jobTitle: "Spesialis Pemasaran Digital",
    email: "nadia.prameswari@email.com",
    phone: "+62 812 3456 7890",
    location: "Batam, Kepulauan Riau",
    linkedin: "linkedin.com/in/nadiaprameswari",
    summary:
      "Spesialis pemasaran digital dengan 2 tahun pengalaman mendampingi UMKM tumbuh melalui konten organik dan iklan berbayar. Mengelola anggaran iklan hingga Rp 15 juta per bulan dengan ROAS 3,4x, serta membangun sistem konten yang menaikkan penjualan marketplace sebesar 42%.",
  },
  experience: [
    {
      id: newId(),
      title: "Freelance Pemasaran Digital",
      company: "Kedai Kopi Senja",
      startDate: "2024-03",
      endDate: "",
      description:
        "• Meluncurkan kampanye Meta Ads dengan anggaran Rp 8 juta/bulan dan menghasilkan ROAS 3,4x\n• Membangun kalender konten 30 hari yang menaikkan jangkauan Instagram 180%\n• Melatih 3 staf toko untuk mengelola konten harian secara mandiri",
    },
    {
      id: newId(),
      title: "Asisten Sosial Media",
      company: "Batik Nusa",
      startDate: "2023-01",
      endDate: "2024-02",
      description:
        "• Mengelola 4 akun marketplace dan menaikkan konversi toko 42% dalam 6 bulan\n• Menyusun laporan performa mingguan memakai Looker Studio untuk pemilik usaha\n• Mengoptimasi 120 halaman produk sehingga trafik pencarian naik 65%",
    },
  ],
  education: [
    {
      id: newId(),
      degree: "D3 Administrasi Bisnis",
      school: "Politeknik Negeri Batam",
      startDate: "2020-08",
      endDate: "2023-07",
      description: "IPK 3,62 · Ketua divisi kreatif Himpunan Mahasiswa",
    },
  ],
  skills: {
    technical:
      "Meta Ads, Google Ads, Looker Studio, Canva, Figma, SEO Marketplace, Copywriting, Spreadsheet, CRM WhatsApp",
    soft: "Komunikasi, Kolaborasi, Manajemen waktu, Berpikir analitis",
    languages: "Bahasa Indonesia (native), Inggris (aktif)",
  },
  additional: {
    certifications:
      "Keterampilan Konten Media Sosial (2026), Layanan Pelanggan Prima (2026), Pengantar Pemasaran Digital (2025)",
    projects:
      "Rebranding Toko Roti Melati — riset audiens, identitas visual, dan peluncuran konten; penjualan naik 27% dalam 2 bulan.",
    awards: "Juara 2 Kompetisi Ide Bisnis Digital Kepri 2025",
    volunteer: "Mentor kelas literasi digital untuk 40 pelaku UMKM di Batam",
  },
};

export const emptyCv: CvData = {
  personal: { fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", summary: "" },
  experience: [],
  education: [],
  skills: { technical: "", soft: "", languages: "" },
  additional: { certifications: "", projects: "", awards: "", volunteer: "" },
};

/** Tata letak dasar yang dipakai template. */
export type CvLayout = "classic" | "sidebar" | "band" | "timeline" | "compact" | "split";

export type CvTemplate = {
  id: string;
  name: string;
  layout: CvLayout;
  accent: string;
  font: "sans" | "serif";
  uppercaseHeading: boolean;
  ruled: boolean;
  atsFriendly: boolean;
  note: string;
};

/** 12 template CV — semua dirancang tetap terbaca oleh pemindai ATS. */
export const cvTemplates: CvTemplate[] = [
  { id: "modern", name: "Modern Biru", layout: "classic", accent: "#2563eb", font: "sans", uppercaseHeading: true, ruled: true, atsFriendly: true, note: "Serbaguna untuk semua bidang" },
  { id: "atsPrime", name: "ATS Prime", layout: "compact", accent: "#111827", font: "sans", uppercaseHeading: true, ruled: true, atsFriendly: true, note: "Paling aman untuk sistem seleksi" },
  { id: "emerald", name: "Emerald Growth", layout: "band", accent: "#059669", font: "sans", uppercaseHeading: true, ruled: false, atsFriendly: true, note: "Cocok untuk fresh graduate" },
  { id: "sidebarPro", name: "Sidebar Pro", layout: "sidebar", accent: "#1d4ed8", font: "sans", uppercaseHeading: true, ruled: false, atsFriendly: true, note: "Skill terlihat lebih dulu" },
  { id: "timeline", name: "Kronologis", layout: "timeline", accent: "#0f766e", font: "sans", uppercaseHeading: false, ruled: false, atsFriendly: true, note: "Menonjolkan riwayat kerja" },
  { id: "elegant", name: "Elegan Serif", layout: "classic", accent: "#334155", font: "serif", uppercaseHeading: false, ruled: true, atsFriendly: true, note: "Formal untuk korporasi" },
  { id: "creative", name: "Kreatif Ungu", layout: "band", accent: "#7c3aed", font: "sans", uppercaseHeading: false, ruled: false, atsFriendly: true, note: "Desain, konten, & branding" },
  { id: "technical", name: "Teknis", layout: "split", accent: "#0369a1", font: "sans", uppercaseHeading: true, ruled: true, atsFriendly: true, note: "IT, jaringan, dan data" },
  { id: "minimal", name: "Minimalis", layout: "compact", accent: "#475569", font: "sans", uppercaseHeading: false, ruled: false, atsFriendly: true, note: "Ringkas satu halaman" },
  { id: "executive", name: "Eksekutif", layout: "classic", accent: "#7c2d12", font: "serif", uppercaseHeading: true, ruled: true, atsFriendly: true, note: "Posisi senior & supervisor" },
  { id: "academic", name: "Akademik", layout: "timeline", accent: "#1e40af", font: "serif", uppercaseHeading: false, ruled: true, atsFriendly: true, note: "Beasiswa & riset" },
  { id: "gigReady", name: "Gig Ready", layout: "split", accent: "#ea580c", font: "sans", uppercaseHeading: true, ruled: false, atsFriendly: true, note: "Portofolio proyek lepas" },
];

export const cvFonts = [
  { id: "sans", label: "Sans (Inter)", stack: "Inter, system-ui, sans-serif" },
  { id: "serif", label: "Serif klasik", stack: "Georgia, 'Times New Roman', serif" },
] as const;

export const cvAccents = ["#2563eb", "#059669", "#7c3aed", "#0f766e", "#ea580c", "#111827"];

/** "2024-03" -> "Mar 2024"; kosong -> "Sekarang". */
export function formatMonth(value: string, fallback = "Sekarang") {
  if (!value) return fallback;
  const [year, month] = value.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const idx = Number(month) - 1;
  return names[idx] ? `${names[idx]} ${year}` : value;
}

export const splitList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
