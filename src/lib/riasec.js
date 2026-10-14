export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"];

export const RIASEC_DIMENSIONS = {
  R: {
    name: "Realistic",
    summary: "Suka bekerja dengan alat, mesin, benda fisik, atau alam terbuka.",
    description:
      "Praktis dan teknis; nyaman menghasilkan sesuatu yang nyata melalui peralatan, produk fisik, atau aktivitas lapangan.",
    careers: [
      "Insinyur teknik & konstruksi",
      "Spesialis perangkat keras & otomasi",
      "Desainer produk fisik",
    ],
    studies: [
      "Teknik Mesin / Sipil / Elektro",
      "Arsitektur & Desain Produk",
      "Teknologi Pangan & Agroteknologi",
    ],
    image: "/cards/card_R.png",
  },
  I: {
    name: "Investigative",
    summary: "Suka menganalisis data, meneliti, dan memecahkan masalah secara logis.",
    description:
      "Analitis dan ingin tahu; menikmati penelitian, pengolahan data, serta pencarian solusi berbasis bukti.",
    careers: ["Analis data & peneliti", "Pengembang sistem", "Spesialis riset & pengembangan"],
    studies: [
      "Sains Data & Statistika",
      "Ilmu Komputer / Informatika",
      "Biologi, Kimia & Sains Terapan",
    ],
    image: "/cards/card_I.png",
  },
  A: {
    name: "Artistic",
    summary: "Suka berkreasi dengan desain visual, media, dan gagasan orisinal.",
    description:
      "Kreatif dan ekspresif; membutuhkan ruang untuk menuangkan ide melalui desain, tulisan, media, dan karya orisinal.",
    careers: [
      "Desainer UI/UX & grafis",
      "Kreator konten & penulis kreatif",
      "Pengarah kreatif media",
    ],
    studies: [
      "Desain Komunikasi Visual",
      "Ilmu Komunikasi & Media Kreatif",
      "Seni Rupa, Film & Animasi",
    ],
    image: "/cards/card_A.png",
  },
  S: {
    name: "Social",
    summary: "Suka berinteraksi, mengajar, membimbing, dan membantu sesama.",
    description:
      "Komunikatif dan empatik; senang mengembangkan orang lain, membangun kolaborasi, dan memberi dampak sosial.",
    careers: [
      "Spesialis pengembangan SDM",
      "Konselor & fasilitator pendidikan",
      "Manajer hubungan masyarakat",
    ],
    studies: [
      "Psikologi",
      "Ilmu Pendidikan & Bimbingan Konseling",
      "Sosiologi & Kesejahteraan Sosial",
    ],
    image: "/cards/card_S.png",
  },
  E: {
    name: "Enterprising",
    summary: "Suka memimpin tim, bernegosiasi, dan mengembangkan peluang bisnis.",
    description:
      "Inisiatif dan strategis; terdorong memimpin, memengaruhi, mencapai target, dan mengubah peluang menjadi hasil.",
    careers: ["Manajer pemasaran produk", "Wirausahawan & pengembang bisnis", "Manajer proyek"],
    studies: ["Bisnis Digital & Pemasaran", "Manajemen", "Ilmu Komunikasi & Hubungan Masyarakat"],
    image: "/cards/card_E.png",
  },
  C: {
    name: "Conventional",
    summary: "Suka mengelola data, sistem administrasi, dan bekerja secara teratur.",
    description:
      "Terstruktur dan teliti; dapat diandalkan untuk mengelola data, anggaran, jadwal, dan prosedur.",
    careers: [
      "Analis keuangan",
      "Analis sistem & proses bisnis",
      "Spesialis operasional & kepatuhan",
    ],
    studies: ["Akuntansi, Keuangan & Aktuaria", "Sistem Informasi Manajemen", "Manajemen Logistik"],
    image: "/cards/card_C.png",
  },
};

const questions = [
  [
    "R",
    "Merakit, mengatur, atau memperbaiki perangkat keras dan peralatan teknis.",
    "Teknologi Terapan",
  ],
  [
    "R",
    "Merancang dan membuat produk fisik seperti kreasi kuliner, kerajinan, busana, atau maket bangunan.",
    "Produksi Kreatif",
  ],
  [
    "R",
    "Melakukan pekerjaan yang banyak beraktivitas di lapangan, lingkungan, atau kegiatan keolahragaan.",
    "Kegiatan Lapangan",
  ],
  [
    "I",
    "Melakukan penelitian atau pengujian ilmiah untuk memahami suatu fenomena.",
    "Penelitian Sains",
  ],
  ["I", "Mengolah data untuk menemukan pola dan memproyeksikan tren pasar.", "Analisis Data"],
  [
    "I",
    "Menelusuri penyebab masalah teknis atau persoalan rumit secara sistematis.",
    "Pemecahan Masalah",
  ],
  [
    "A",
    "Merancang tampilan visual yang menarik seperti UI/UX, identitas merek, atau ilustrasi.",
    "Desain Visual",
  ],
  ["A", "Menyusun karya tulis atau naskah kreatif untuk menyampaikan pesan.", "Penulisan Kreatif"],
  [
    "A",
    "Menghasilkan karya melalui video, fotografi, musik, animasi, atau acara.",
    "Produksi Media",
  ],
  ["S", "Mengajar, melatih, atau membimbing orang lain memahami keterampilan baru.", "Pendidikan"],
  [
    "S",
    "Mendengarkan masalah orang lain dengan empati dan memberi saran membangun.",
    "Pemberdayaan",
  ],
  ["S", "Membangun kerja sama, menjembatani perbedaan, dan mendukung tim.", "Kolaborasi"],
  [
    "E",
    "Memimpin tim, membagi tugas, dan mempresentasikan gagasan untuk mencapai tujuan.",
    "Kepemimpinan",
  ],
  [
    "E",
    "Menjalin kerja sama, melakukan negosiasi, atau mencari dukungan untuk program.",
    "Kemitraan",
  ],
  ["E", "Merintis usaha, membaca peluang pasar, dan menyusun strategi pemasaran.", "Kewirausahaan"],
  ["C", "Menyusun dan mengelola data atau dokumen agar rapi dan mudah ditemukan.", "Administrasi"],
  [
    "C",
    "Merencanakan anggaran serta mencatat dan memeriksa laporan keuangan.",
    "Manajemen Keuangan",
  ],
  ["C", "Memeriksa hasil kerja dan menyusun SOP agar kegiatan berjalan tertib.", "Standar Mutu"],
].map(([dimension, text, sector], index) => ({
  id: `${dimension}${(index % 3) + 1}`,
  dimension,
  text,
  sector,
  weight: [1.25, 1.15, 1.05][index % 3],
}));

export const RIASEC_LIKERT_QUESTIONS = questions;
export const RIASEC_FORCED_QUESTIONS = [
  {
    id: "FC1",
    options: [
      {
        dimension: "I",
        text: "Menganalisis data kebutuhan pengguna dan meneliti faktor layanan digital.",
      },
      { dimension: "A", text: "Merancang tampilan visual dan materi kreatif layanan digital." },
    ],
  },
  {
    id: "FC2",
    options: [
      { dimension: "E", text: "Menghubungi calon mitra dan melakukan negosiasi kerja sama." },
      { dimension: "C", text: "Menyusun anggaran, jadwal, dan dokumen administrasi." },
    ],
  },
  {
    id: "FC3",
    options: [
      { dimension: "R", text: "Menyiapkan instalasi peralatan teknis atau membuat produk fisik." },
      { dimension: "S", text: "Menjelaskan informasi dan mendampingi peserta acara." },
    ],
  },
  {
    id: "FC4",
    options: [
      { dimension: "E", text: "Memimpin strategi pemasaran dan penjualan produk baru." },
      {
        dimension: "I",
        text: "Melakukan penelitian dan pengujian untuk meningkatkan kualitas produk.",
      },
    ],
  },
  {
    id: "FC5",
    options: [
      { dimension: "S", text: "Membimbing peserta memahami materi dan memberi umpan balik." },
      { dimension: "C", text: "Menyusun panduan, checklist, dan sistem arsip materi." },
    ],
  },
  {
    id: "FC6",
    options: [
      { dimension: "A", text: "Menciptakan karya atau konsep baru yang orisinal dan estetis." },
      { dimension: "E", text: "Mengoordinasikan tim untuk mengelola karya menjadi peluang usaha." },
    ],
  },
];

export function calculateRiasecResult(likert, forced) {
  const scores = Object.fromEntries(
    RIASEC_ORDER.map((code) => [code, { code, raw: 0, weighted: 0, max: 0, forced: 0 }]),
  );
  for (const question of RIASEC_LIKERT_QUESTIONS) {
    const value = Number(likert[question.id] || 3);
    scores[question.dimension].raw += value;
    scores[question.dimension].weighted += value * question.weight;
    scores[question.dimension].max += 5 * question.weight;
  }
  for (const question of RIASEC_FORCED_QUESTIONS) {
    const selected = forced[question.id];
    if (selected) scores[selected].forced += 1;
  }
  const ranked = RIASEC_ORDER.map((code) => {
    const score = scores[code];
    const normalized = Math.round((score.weighted / score.max) * 82 + (score.forced / 3) * 18);
    return { ...score, normalized };
  }).sort((a, b) => b.normalized - a.normalized || b.forced - a.forced || b.weighted - a.weighted);
  const top = ranked.slice(0, 3);
  const topCodes = top.map(({ code }) => code);
  const first = RIASEC_DIMENSIONS[topCodes[0]];
  return {
    hollandCode: topCodes.join("-"),
    topCodes,
    topDimension: first,
    ranked,
    spread: ranked[0].normalized - ranked[ranked.length - 1].normalized,
    description: first.description,
    careers: top.flatMap(({ code }) => RIASEC_DIMENSIONS[code].careers).slice(0, 5),
    studies: top.flatMap(({ code }) => RIASEC_DIMENSIONS[code].studies).slice(0, 5),
  };
}
