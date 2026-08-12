⚡ Z-Talent Nexus: Youth Development Platform

📖 Deskripsi Ringkas

Z-Talent Nexus adalah aplikasi digital inovatif berbasis web yang dirancang khusus untuk memberdayakan Generasi Z dalam membangun karier dari nol. Aplikasi ini membaca minat pengguna, menutup kesenjangan keterampilan melalui rekomendasi kursus mikro-kredensial, dan menghubungkan talenta muda langsung dengan proyek berbayar dari UMKM lokal.

Fitur unggulan kami meliputi:

Asesmen Keterampilan Interaktif: Menganalisis skill gap pengguna dibandingkan dengan kebutuhan industri.

AI CV Builder: Pembuatan CV otomatis yang ramah ATS menggunakan kecerdasan buatan (Groq API).

Job Matching: Pencocokan lowongan pekerjaan dan proyek UMKM lokal secara real-time (Parse API).

Gamifikasi Pembelajaran: Sistem Experience Points (XP) dan level untuk menjaga motivasi belajar generasi muda.

Karya ini diciptakan secara spesifik untuk menjawab tema perlombaan, yaitu memberdayakan ekosistem karier muda dan akselerasi UMKM di era digital.

⚖️ Pernyataan Orisinalitas & Hak Cipta

Dengan ini, pengembang (Jerico Christianto) menyatakan bahwa:

Aplikasi Z-Talent Nexus merupakan karya asli yang dibuat sendiri dan tidak sedang dalam sengketa atau klaim dari pihak lain.

Proses pembuatan aplikasi ini secara murni dimulai sejak pengumuman resmi lomba disampaikan oleh panitia.

Aplikasi ini tidak melanggar hak cipta dan tidak menggunakan karya pihak lain tanpa izin yang sah. Semua aset pihak ketiga (seperti library Open Source) telah digunakan sesuai dengan lisensi yang berlaku.

Kami bersedia didiskualifikasi dari kompetisi apabila di kemudian hari terbukti terdapat ketidaksesuaian dengan pernyataan ini.

(Catatan untuk Panitia: Surat pernyataan bermaterai fisik telah dilampirkan secara terpisah dalam dokumen penyerahan karya).

🎨 Visualisasi Aset Desain

Untuk memberikan pengalaman pengguna (UX) yang optimal, Z-Talent Nexus dibangun dengan sistem desain (Design System) yang matang:

Skema Warna (Color Scheme): Menggunakan perpaduan Navy Blue (melambangkan profesionalisme dan teknologi) dan Orange (melambangkan energi, kreativitas, dan jiwa muda Generasi Z).

Tipografi: Menggunakan font family Sans-serif (Inter) untuk memastikan keterbacaan yang tinggi (readability) baik di antarmuka mobile maupun desktop.

Tata Letak (Layout) & Antarmuka: Mengadopsi gaya Modern Clean dengan Glassmorphism ringan pada komponen header, serta tata letak sidebar dinamis untuk navigasi dasbor.

Ikon & Ilustrasi: Menggunakan set ikon Lucide React yang konsisten, berpadu dengan visualisasi grafik radar real-time menggunakan Recharts.

🔄 Diagram Alur (Flowchart) Penggunaan

Berikut adalah cara pakai aplikasi digital Z-Talent Nexus bagi pengguna baru:

Mulai (Start) ➔ Pengguna mengakses Landing Page.

Autentikasi ➔ Pengguna menekan tombol "Mulai Sekarang" dan masuk ke halaman Login/Register.

Verifikasi ➔ Sistem Firebase memverifikasi Email/Password atau akun Google pengguna.

Dasbor Utama ➔ Pengguna melihat ringkasan profil, XP, dan status level.

Pemilihan Aksi:

Opsi A: Mengambil "Asesmen Keterampilan" untuk memperbarui grafik radar skill.

Opsi B: Melanjutkan "Kursus Saya" untuk menambah persentase XP.

Opsi C: Mengakses "CV & Portofolio" untuk men-generate CV menggunakan AI.

Opsi D: Mengakses "Siap Kerja" untuk mencari lowongan UMKM.

Selesai (End) ➔ Pengguna Log Out dari sistem.

(Catatan: Diagram flowchart grafis dan simulasi lengkap disertakan dalam dokumen lampiran).

💻 Dokumentasi Pengembang (Developer Guide)

Dokumentasi ini disediakan untuk memudahkan pengembang lain atau dewan juri dalam memahami, menguji, dan mengonfigurasi perangkat lunak di lingkungan lokal.

Persyaratan Sistem

Node.js (Versi 20 atau terbaru)

Bun Package Manager

Langkah Instalasi

Kloning Repositori:

git clone https://github.com/jerico-c/z-talent.git
cd z-talent


Instalasi Dependensi:
Aplikasi ini menggunakan bun sebagai package manager utama.

bun install


Konfigurasi Environment:
Buat file .env di root directory dan masukkan kredensial berikut:

# Firebase Auth
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id

# AI & Job API (Server-side)
GROQ_API_KEY=your_groq_api_key
PARSE_API_KEY=your_parse_api_key


Jalankan Server Lokal:

bun run dev


Aplikasi dapat diakses melalui http://localhost:5173.

🛠️ Dukungan dan Bantuan (Troubleshooting)

Untuk membantu pengguna atau penguji mengatasi masalah teknis yang mungkin terjadi selama penggunaan, berikut adalah panduan penyelesaian masalah:

Masalah: Muncul peringatan "Sistem autentikasi belum siap" di halaman Login.

Solusi: Ini berarti aplikasi gagal membaca kunci Firebase. Pastikan file .env sudah dibuat dengan benar tanpa tanda kutip ganda ("), lalu restart server terminal Anda (bun run dev).

Masalah: CV AI tidak memunculkan hasil (Error 500).

Solusi: Fitur AI dieksekusi di Server-Side. Pastikan variabel GROQ_API_KEY telah disetel di environment Netlify atau .env lokal Anda.

Masalah: Saat Deploy ke Netlify gagal (Error: readdirp not found atau berkaitan dengan npm).

Solusi: Netlify secara default menggunakan npm. Tambahkan variabel BUN_VERSION=latest di pengaturan Netlify, dan ubah build command menjadi bun install && bun run build.

Butuh Bantuan Lebih Lanjut?
Jika Anda menemukan kendala yang tidak tercantum di atas, silakan buat Issue baru di repositori GitHub ini.