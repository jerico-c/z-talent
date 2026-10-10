import { Link } from "@tanstack/react-router";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import downArrowImage from "../assets/down_arrow.png";
import leftArrowImage from "../assets/left_arrow.png";
import normalImage from "../assets/normal.png";
import rightArrowImage from "../assets/right_arrow.png";
import upArrowImage from "../assets/up_arrow.png";
export const Route = createFileRoute("/")({
  component: LandingPage,
});

const keyboardImages = {
  normal: normalImage,
  down: downArrowImage,
  left: leftArrowImage,
  right: rightArrowImage,
  up: upArrowImage,
};

export default function LandingPage() {
  const [keyboardDirection, setKeyboardDirection] = useState("normal");
  const navigate = useNavigate();

  const handleKeyboardHover = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { offsetWidth, offsetHeight } = event.currentTarget;
    const x = offsetX - offsetWidth / 2;
    const y = offsetY - offsetHeight / 2;

    if (Math.abs(x) > Math.abs(y)) {
      setKeyboardDirection(x > 0 ? "right" : "left");
    } else {
      setKeyboardDirection(y > 0 ? "down" : "up");
    }
  };

  const handleKeyboardClick = () => {
    if (keyboardDirection === "down") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else if (keyboardDirection === "left") {
      document.getElementById("news")?.scrollIntoView({ behavior: "smooth" });
    } else if (keyboardDirection === "right") {
      navigate({ to: "/login" });
    }
  };

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

        {/* Konten Kanan (Keyboard interaktif) */}
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end z-10">
          <div
            className="relative w-full max-w-2xl overflow-hidden bg-black transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer"
            onMouseMove={handleKeyboardHover}
            onMouseLeave={() => setKeyboardDirection("normal")}
            onClick={handleKeyboardClick}
            aria-label="Keyboard navigasi interaktif"
            role="button"
            tabIndex={0}
          >
            <img
              src={keyboardImages[keyboardDirection]}
              alt={`Keyboard Z UP arah ${keyboardDirection}`}
              className="w-full h-auto object-contain transition-opacity duration-150"
            />
          </div>
        </div>
      </main>

      <section id="about" className="scroll-mt-24 bg-background px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Tentang Z UP
          </p>
          <h2 className="max-w-3xl text-4xl font-extrabold text-foreground lg:text-6xl">
            Mulai dari potensi, tumbuh jadi prestasi.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Z UP membantu anak muda mengenali kekuatan diri, mengembangkan skill yang relevan, dan
            menemukan langkah karier yang sesuai. Semua dirancang agar perjalananmu dari belajar
            sampai siap kerja terasa lebih jelas dan terarah.
          </p>
        </div>
      </section>

      <section id="news" className="scroll-mt-24 bg-ink px-8 py-20 text-ink-foreground lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            News & Update
          </p>
          <h2 className="max-w-3xl text-4xl font-extrabold lg:text-6xl">
            Cerita dan peluang terbaru dari Z UP.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
              <p className="text-sm font-bold text-primary">Segera Hadir</p>
              <h3 className="mt-3 text-2xl font-bold">Program pengembangan skill</h3>
              <p className="mt-3 text-ink-muted">
                Nantikan kabar terbaru tentang pelatihan dan aktivitas pengembangan karier.
              </p>
            </article>
            <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
              <p className="text-sm font-bold text-accent">Peluang</p>
              <h3 className="mt-3 text-2xl font-bold">Temukan langkah kariermu</h3>
              <p className="mt-3 text-ink-muted">
                Dapatkan informasi peluang kerja dan proyek yang relevan dengan potensimu.
              </p>
            </article>
            <article className="border-2 border-ink-muted/50 bg-ink-foreground/5 p-6">
              <p className="text-sm font-bold text-primary">Komunitas</p>
              <h3 className="mt-3 text-2xl font-bold">Bertumbuh bersama</h3>
              <p className="mt-3 text-ink-muted">
                Ikuti cerita inspiratif dan insight dari talenta muda Indonesia.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
