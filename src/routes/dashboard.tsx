import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowRight, Briefcase, Flame, GraduationCap, Target } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currentUser, enrollments, skillRadar } from "@/lib/api";
import { humanLabel, jobTypeLabels } from "@/lib/job-match";
import { searchJobs } from "@/lib/jobs.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dasbor — Z-Talent Nexus" },
      { name: "description", content: "Pantau level keterampilan, progres kursus, dan lowongan kerja yang cocok untukmu." },
      { property: "og:title", content: "Dasbor Z-Talent Nexus kamu" },
      { property: "og:description", content: "Radar keterampilan, progres kursus, dan lowongan kerja yang cocok dalam satu tampilan." },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Level keterampilan", value: "Level 3", icon: Target },
  { label: "Kursus berjalan", value: "3", icon: GraduationCap },
  { label: "Sertifikat diraih", value: "3", icon: Flame },
  { label: "Lowongan cocok", value: "6", icon: Briefcase },
];

function Dashboard() {
  const fetchJobs = useServerFn(searchJobs);
  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs", currentUser.city],
    queryFn: () => fetchJobs({ data: { keyword: "digital marketing", page: 1, pageSize: 3 } }),
    staleTime: 5 * 60 * 1000,
  });
  const topJobs = jobsQuery.data?.jobs ?? [];

  return (
    <AppShell title={`Selamat datang kembali, ${currentUser.name.split(" ")[0]} 👋`} subtitle="Ini perkembanganmu minggu ini">
      <div className="grid gap-6">
        {/* Baris KPI */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="card-interactive border-border shadow-soft">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Radar: keterampilanmu vs kebutuhan industri */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Keterampilanmu vs kebutuhan industri</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar} outerRadius="72%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Kebutuhan industri"
                    dataKey="demand"
                    stroke="var(--color-chart-2)"
                    fill="var(--color-chart-2)"
                    fillOpacity={0.18}
                  />
                  <Radar
                    name="Kamu"
                    dataKey="you"
                    stroke="var(--color-chart-1)"
                    fill="var(--color-chart-1)"
                    fillOpacity={0.35}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Kursus berjalan */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Lanjutkan belajar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {enrollments.map((c) => (
                <div key={c.title}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <span className="shrink-0 text-xs font-bold text-primary">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="mt-2 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{c.next}</p>
                </div>
              ))}
              <Button asChild variant="secondary" className="w-full rounded-xl">
                <Link to="/courses">
                  Lihat semua kursus <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lowongan rekomendasi (data langsung dari API lowongan) */}
        <Card className="border-border shadow-soft">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <CardTitle className="text-base">Lowongan yang cocok untukmu</CardTitle>
            <Button asChild size="sm" variant="ghost" className="rounded-xl text-primary">
              <Link to="/siap-kerja">Lihat semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {jobsQuery.isPending && (
              <p className="text-sm text-muted-foreground md:col-span-3">Memuat lowongan terbaru…</p>
            )}
            {jobsQuery.isError && (
              <p className="text-sm text-muted-foreground md:col-span-3">
                Daftar lowongan belum bisa dimuat. Coba buka halaman Siap Kerja.
              </p>
            )}
            {topJobs.map((j) => (
              <div key={j.id} className="card-interactive rounded-2xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <p className="text-sm font-semibold leading-snug">{j.title}</p>
                  <Badge className="shrink-0 bg-accent-soft text-accent-foreground">
                    {humanLabel(jobTypeLabels, j.jobType)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{j.company}</p>
                <p className="mt-3 text-sm font-bold text-primary">{j.salary ?? "Gaji dirahasiakan"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
