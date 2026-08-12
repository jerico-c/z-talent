import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Clock, Layers, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { certificates, courses } from "@/lib/api";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Kursus Vokasi & Mikro-kredensial — Z-Talent Nexus" },
      {
        name: "description",
        content: "Kursus vokasi singkat dengan mikro-kredensial terverifikasi blockchain yang bisa dicek perusahaan.",
      },
      { property: "og:title", content: "LMS Vokasi & Mikro-kredensial" },
      { property: "og:description", content: "Kursus sesuai kebutuhan kerja dengan sertifikat yang bisa diverifikasi." },
    ],
  }),
  component: CoursesPage,
});

/** Gaya badge level tetap memakai token design system. */
const levelStyles: Record<string, string> = {
  Pemula: "bg-accent-soft text-accent-foreground",
  Menengah: "bg-primary-soft text-primary",
  Lanjutan: "bg-secondary text-secondary-foreground",
};

function CoursesPage() {
  return (
    <AppShell title="Kursus & Mikro-kredensial" subtitle="Pilar 2 · pembelajaran berbasis vokasi">
      <div className="grid gap-8">
        <section>
          <h2 className="text-lg font-bold tracking-tight">Kursus tersedia</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.title} className="card-interactive flex flex-col border-border shadow-soft">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={levelStyles[c.level]}>{c.level}</Badge>
                    <Badge variant="outline" className="gap-1">
                      <Layers className="size-3" /> {c.track}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {c.hours}
                    </span>
                    {c.verified && (
                      <span className="inline-flex items-center gap-1 font-semibold text-accent">
                        <ShieldCheck className="size-3.5" /> Sertifikat terverifikasi blockchain
                      </span>
                    )}
                  </div>
                  <Button className="w-full rounded-xl">Daftar sekarang</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-tight">Sertifikat saya</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.title} className="card-interactive border-border bg-card shadow-soft">
                <CardContent className="p-5">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                      <BadgeCheck className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{cert.title}</p>
                      <p className="text-xs text-muted-foreground">Diterbitkan {cert.issued}</p>
                    </div>
                  </div>
                  <p className="mt-4 truncate rounded-xl bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
                    {cert.hash}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
