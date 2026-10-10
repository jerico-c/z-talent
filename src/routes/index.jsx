import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
// Mengimpor gambar lokal dari folder assets
import heroImage from "../assets/hero-dashboard.jpg";
export const Route = createFileRoute("/")({
  component: LandingPage,
});
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header / Navigasi Atas */}
      <header className="w-full border-b-2 border-foreground bg-primary px-6 py-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.png" alt="Z UP Logo" className="h-15 w-auto object-contain" />
          </Link>
        </div>
        <nav>
          {/* Diubah mengarah ke /login dan menggunakan warna Navy Blue */}
          <Link to="/login">
            <Button className="bg-foreground text-background hover:bg-foreground/90 px-6">
              Masuk Dasbor
            </Button>
          </Link>
        </nav>
      </header>

      {/* Bagian Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 bg-ink text-ink-foreground overflow-hidden relative">
        {/* Dekorasi Latar Belakang (Opsional) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rotate-12 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/30 -rotate-12 pointer-events-none"></div>

        {/* Konten Kiri (Teks) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 z-10">
          {/* Badge Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border-2 border-primary bg-primary/10 text-primary text-sm font-bold w-fit">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Platform Pengembangan Karier Anak Muda</span>
          </div>

          {/* Headline Utama */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            Wujudkan Potensi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
              Generasi Z
            </span>
          </h1>

          {/* Deskripsi Natural (Copywriting Baru) */}
          <p className="text-lg lg:text-xl text-slate-300 max-w-xl leading-relaxed">
            Z UP hadir buat kamu yang ingin bangun karier dari nol. Kami bantu kenali minatmu, asah
            skill lewat pelatihan yang pas, bikin CV otomatis yang tembus HRD, sampai ngehubungin
            kamu langsung ke lowongan kerja atau proyek UMKM terdekat.
          </p>

          {/* Tombol CTA yang langsung diarahkan ke halaman Login */}
          <div className="mt-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-primary text-foreground hover:bg-primary/90 px-8 py-6 text-lg group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Statistik Bawah */}
          <div className="flex gap-10 mt-8 pt-8 border-t-2 border-ink-muted/50">
            <div>
              <div className="flex items-center gap-2 text-ink-muted mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Talenta Bergabung</span>
              </div>
              <p className="text-3xl font-bold text-primary">2.450+</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-ink-muted mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Tingkat Penempatan</span>
              </div>
              <p className="text-3xl font-bold text-accent">78%</p>
            </div>
          </div>
        </div>

        {/* Konten Kanan (Gambar Hero Dashboard lokal) */}
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end z-10">
          <div className="relative w-full max-w-2xl rounded-sm overflow-hidden shadow-[10px_10px_0_var(--primary)] border-2 border-ink-foreground transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={heroImage}
              alt="Dashboard Z UP"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay Gradient pada Gambar */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
