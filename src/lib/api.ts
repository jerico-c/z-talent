/**
 * Lapisan API tiruan (mock) untuk Z-Talent.
 *
 * Setiap data di sini mencerminkan endpoint RESTful Laravel, sehingga menukar
 * data tiruan dengan panggilan HTTP asli hanya perlu satu baris perubahan:
 *
 *   const res = await fetch(`${API_BASE}/api/v1/courses`);
 *   return res.json();
 */

export const API_BASE = import.meta.env["VITE_API_BASE_URL"] ?? "";

/** GET /api/v1/stats */
export type PlatformStats = { label: string; value: string; hint: string };

export const platformStats: PlatformStats[] = [
  { label: "Anak Muda Aktif", value: "2.450", hint: "profil terverifikasi" },
  { label: "Gig UMKM Tersedia", value: "120", hint: "terbuka bulan ini" },
  { label: "Mikro-kredensial Terbit", value: "5.830", hint: "terverifikasi blockchain" },
  { label: "Tingkat Kecocokan Gig", value: "78%", hint: "rata-rata penempatan" },
];

/** GET /api/v1/me */
export const currentUser = {
  name: "John Doe",
  initials: "NP",
  city: "Batam",
  skillLevel: "Level 3 · Praktisi",
  xp: 68,
};

/** GET /api/v1/skills/radar */
export const skillRadar = [
  { skill: "Pemasaran Digital", you: 78, demand: 92 },
  { skill: "Literasi Data", you: 54, demand: 88 },
  { skill: "Jaringan", you: 41, demand: 74 },
  { skill: "Desain", you: 82, demand: 66 },
  { skill: "Komunikasi", you: 71, demand: 80 },
  { skill: "Dasar Keuangan", you: 38, demand: 70 },
];

/** GET /api/v1/enrollments */
export const enrollments = [
  { title: "Pemasaran Digital untuk UMKM", progress: 72, next: "Modul 6 · Iklan Berbayar" },
  { title: "Dasar Administrasi Jaringan", progress: 35, next: "Modul 3 · Subnetting" },
  { title: "Literasi Keuangan untuk Pekerja Lepas", progress: 90, next: "Asesmen akhir" },
];

/** GET /api/v1/assessment/questions */
export const assessmentQuestions = [
  {
    question: "Kegiatan apa yang membuatmu lupa waktu?",
    options: [
      "Membuat visual & menceritakan kisah brand",
      "Memperbaiki perangkat, kabel, dan jaringan",
      "Menelusuri angka untuk menemukan pola",
      "Berbicara dengan orang & menutup penjualan",
    ],
  },
  {
    question: "Bagaimana cara kerja yang kamu sukai?",
    options: [
      "Kerja mandiri dan fokus dengan brief yang jelas",
      "Langsung praktik di lapangan bersama tim kecil",
      "Proyek terstruktur dengan target yang jelas",
      "Serba cepat, banyak berinteraksi",
    ],
  },
  {
    question: "Hasil apa yang paling membuatmu bangga?",
    options: [
      "Brand toko lokal yang dikenal banyak orang",
      "Sistem sebuah workshop yang berjalan lancar",
      "Dasbor yang dipakai bisnis untuk mengambil keputusan",
      "Komunitas yang tumbuh karena kamu",
    ],
  },
  {
    question: "Alat mana yang paling ingin kamu pelajari?",
    options: ["Figma & Canva", "Mikrotik & Cisco", "Looker Studio & Spreadsheet", "CRM & WhatsApp Business"],
  },
];

/** POST /api/v1/assessment/submit */
export const assessmentResult = {
  paths: [
    { role: "Spesialis Pemasaran Digital (UMKM)", fit: 92 },
    { role: "Desainer Brand & Konten", fit: 84 },
    { role: "Analis Data Junior", fit: 61 },
  ],
  gaps: [
    { skill: "Iklan Berbayar & Pengelolaan Anggaran", have: 40, need: 85 },
    { skill: "Analitik Marketplace", have: 35, need: 80 },
    { skill: "Copywriting untuk Konversi", have: 58, need: 82 },
  ],
};

/** GET /api/v1/courses */
export const courses = [
  {
    title: "Pemasaran Digital untuk UMKM",
    level: "Pemula",
    hours: "12 jam",
    track: "Pemasaran",
    verified: true,
  },
  { title: "Administrasi Jaringan", level: "Menengah", hours: "20 jam", track: "Infrastruktur IT", verified: true },
  { title: "Sprint Desain UI/UX", level: "Menengah", hours: "16 jam", track: "Desain", verified: true },
  { title: "Dasar Pembukuan & Arus Kas", level: "Pemula", hours: "8 jam", track: "Keuangan", verified: true },
  { title: "Operasional & Pemenuhan Marketplace", level: "Pemula", hours: "10 jam", track: "Perdagangan", verified: false },
  { title: "Analisis Data dengan Spreadsheet", level: "Lanjutan", hours: "24 jam", track: "Data", verified: true },
];

/** GET /api/v1/certificates */
export const certificates = [
  { title: "Keterampilan Konten Media Sosial", issued: "Mar 2026", hash: "0x8f2c…a91d" },
  { title: "Layanan Pelanggan Prima", issued: "Jan 2026", hash: "0x41ba…77e0" },
  { title: "Pengantar Pemasaran Digital", issued: "Nov 2025", hash: "0xd7e5…3c12" },
];

/** POST /api/v1/cv/review */
export const cvReview = {
  score: 85,
  strengths: ["Struktur kronologis terbalik yang jelas", "Hasil terukur pada 3 dari 4 poin pengalaman"],
  feedback: [
    "Tambahkan kata kerja aktif — ganti \"bertanggung jawab atas\" dengan \"memimpin\", \"meluncurkan\", \"mengembangkan\".",
    "Cantumkan mikro-kredensial Pemasaran Digital terbarumu di bagian Sertifikasi.",
    "Tambahkan 2–3 kata kunci keahlian dari lowongan (Meta Ads, analitik marketplace).",
    "Hapus foto dan status pernikahan — sistem ATS sering mengabaikan blok tersebut.",
  ],
};

/** GET /api/v1/gigs */
export const gigs = [
  {
    title: "Desain Logo untuk Kedai Kopi Senja",
    msme: "Kedai Kopi Senja",
    budget: "Rp 1.200.000",
    duration: "5 hari",
    match: 94,
    stage: "Terbuka",
    skills: ["Branding", "Illustrator"],
  },
  {
    title: "Pemasangan Wi-Fi untuk IKM Center",
    msme: "IKM Center Batam",
    budget: "Rp 2.500.000",
    duration: "1 minggu",
    match: 62,
    stage: "Terbuka",
    skills: ["Jaringan", "Mikrotik"],
  },
  {
    title: "Rencana Konten Instagram — 30 Hari",
    msme: "Toko Roti Melati",
    budget: "Rp 1.800.000",
    duration: "2 minggu",
    match: 89,
    stage: "Dilamar",
    skills: ["Copywriting", "Canva"],
  },
  {
    title: "Optimasi Toko Marketplace",
    msme: "Batik Nusa",
    budget: "Rp 2.100.000",
    duration: "10 hari",
    match: 81,
    stage: "Dilamar",
    skills: ["Marketplace", "SEO"],
  },
  {
    title: "Sheet Arus Kas untuk Warung",
    msme: "Warung Bu Tini",
    budget: "Rp 900.000",
    duration: "4 hari",
    match: 70,
    stage: "Ditinjau",
    skills: ["Spreadsheet"],
  },
  {
    title: "Foto Produk — 20 SKU",
    msme: "Snack Rumahan Ayu",
    budget: "Rp 1.500.000",
    duration: "3 hari",
    match: 77,
    stage: "Ditinjau",
    skills: ["Fotografi"],
  },
];

export const gigStages = ["Terbuka", "Dilamar", "Ditinjau"] as const;
