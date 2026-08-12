import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react";

import heroImage from "@/assets/hero-dashboard.jpg";
import { Button } from "@/components/ui/button";
import { platformStats } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Z-Talent Nexus — Ekosistem Karier Anak Muda & Lowongan Kerja" },
      {
        name: "description",
        content:
          "Temukan minatmu lewat asesmen AI, raih mikro-kredensial terverifikasi, dan temukan lowongan kerja yang cocok dengan CV-mu di Z-Talent Nexus.",
      },
      { property: "og:title", content: "Z-Talent Nexus — Memberdayakan Generasi Emas 2045" },
      {
        property: "og:description",
        content: "Asesmen keterampilan AI, mikro-kredensial vokasi, dan pencocokan lowongan kerja untuk anak muda.",
      },
    ],
  }),
  component: Landing,
});

/** Tiga pilar platform. */
const pillars = [
  {
    icon: Sparkles,
    tag: "Pilar 1",
    title: "Asesmen Minat & Kesenjangan Keterampilan AI",
    body: "Asesmen terpandu memetakan minatmu terhadap kebutuhan pasar kerja nyata, lalu menyebutkan keterampilan yang masih memisahkanmu dari pekerjaan impian.",
    to: "/assessment" as const,
  },
  {
    icon: GraduationCap,
    tag: "Pilar 2",
    title: "LMS Vokasi & Mikro-kredensial",
    body: "Kursus singkat sesuai kebutuhan kerja bersama mitra industri. Setiap penyelesaian menerbitkan sertifikat terverifikasi blockchain yang bisa dicek perusahaan.",
    to: "/courses" as const,
  },
  {
    icon: Briefcase,
    tag: "Pilar 3",
    title: "Ulasan CV Cerdas & Siap Kerja",
    body: "Pemeriksa ATS merapikan CV-mu agar lolos sistem seleksi nyata, lalu mencocokkanmu dengan lowongan kerja nyata di Indonesia yang paling sesuai keahlianmu.",
    to: "/cv" as const,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigasi */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Zap className="size-4" />
            </span>
            <span className="truncate font-bold tracking-tight">Z-Talent Nexus</span>
          </div>
          <Button asChild size="sm" className="rounded-xl">
            <Link to="/dashboard">Masuk dasbor</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-hero text-ink-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/15 bg-ink-foreground/5 px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="size-3.5 text-accent" />
              Ekosistem Karier Muda · LMS · Akselerator UMKM
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Memberdayakan{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Generasi Emas 2045
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
              Temukan pekerjaan yang benar-benar cocok untukmu. Z-Talent Nexus membaca minatmu, menutup
              kesenjangan keterampilan lewat mikro-kredensial, dan menghubungkanmu langsung ke proyek berbayar
              dari UMKM di kotamu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="group rounded-xl shadow-lift">
                <Link to="/assessment">
                  Mulai asesmen gratis
                  <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-6 sm:max-w-md">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Users className="size-3.5" /> Anak muda tergabung
                </dt>
                <dd className="text-2xl font-bold">2.450</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <TrendingUp className="size-3.5" /> Tingkat penempatan
                </dt>
                <dd className="text-2xl font-bold">78%</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-brand opacity-25 blur-3xl" />
            <img
              src={heroImage}
              alt="Dasbor Z-Talent Nexus menampilkan radar keterampilan, progres kursus, dan lencana sertifikat terverifikasi"
              width={1280}
              height={960}
              className="relative w-full rounded-3xl border border-ink-foreground/10 shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* Banner statistik langsung */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold tracking-tight text-primary">{s.value}</p>
              <p className="mt-1 text-sm font-semibold">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pilar */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tiga pilar, satu jalur berkelanjutan dari rasa ingin tahu hingga proyek berbayar
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, tag, title, body, to }) => (
            <Link
              key={title}
              to={to}
              className="card-interactive group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <span className="mt-5 text-xs font-bold uppercase tracking-widest text-accent">{tag}</span>
              <h3 className="mt-2 text-lg font-bold leading-snug">{title}</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{body}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Jelajahi
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Z-Talent Nexus · dibangun untuk anak muda, UMKM, dan Generasi Emas 2045
      </footer>
    </div>
  );
}
