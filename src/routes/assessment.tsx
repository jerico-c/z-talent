import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, Target } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { assessmentQuestions, assessmentResult } from "@/lib/api";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Asesmen Minat & Kesenjangan Keterampilan AI — Z-Talent Nexus" },
      {
        name: "description",
        content: "Asesmen interaktif singkat yang memetakan minatmu ke jalur karier dan menunjukkan kesenjangan keterampilanmu.",
      },
      { property: "og:title", content: "Asesmen Minat & Kesenjangan Keterampilan AI" },
      { property: "og:description", content: "Temukan jalur kariermu dan keterampilan yang masih perlu kamu kuasai." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const total = assessmentQuestions.length;
  const done = step >= total;
  const current = assessmentQuestions[Math.min(step, total - 1)]!;

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <AppShell title="Asesmen Minat & Keterampilan" subtitle="Pilar 1 · sekitar 3 menit">
      <div className="mx-auto max-w-3xl">
        {!done ? (
          <Card className="border-border shadow-soft">
            <CardHeader className="space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <Badge variant="secondary" className="w-fit bg-primary-soft text-primary">
                  Pertanyaan {step + 1} dari {total}
                </Badge>
                <button
                  onClick={reset}
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Mulai ulang
                </button>
              </div>
              <Progress value={(step / total) * 100} className="h-2" />
              <CardTitle className="text-xl leading-snug">{current.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {current.options.map((opt, i) => {
                const selected = answers[step] === i;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswers((a) => ({ ...a, [step]: i }))}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    <span className="min-w-0 text-sm font-medium">{opt}</span>
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                );
              })}

              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="size-4" /> Kembali
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={answers[step] === undefined}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {step === total - 1 ? "Lihat hasil saya" : "Lanjut"} <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="border-border shadow-soft">
              <CardHeader>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-foreground">
                  <Sparkles className="size-3.5" /> Hasilmu sudah siap
                </span>
                <CardTitle className="mt-3 text-xl">Jalur karier yang direkomendasikan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentResult.paths.map((p) => (
                  <div key={p.role} className="rounded-2xl border border-border p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="truncate text-sm font-semibold">{p.role}</p>
                      <span className="shrink-0 text-sm font-bold text-primary">{p.fit}% cocok</span>
                    </div>
                    <Progress value={p.fit} className="mt-2 h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-4 text-accent" /> Kesenjangan keterampilanmu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {assessmentResult.gaps.map((g) => (
                  <div key={g.skill}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="truncate text-sm font-medium">{g.skill}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {g.have}% → target {g.need}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${g.have}%` }} />
                    </div>
                  </div>
                ))}
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <Button asChild className="rounded-xl">
                    <Link to="/courses">
                      Tutup kesenjangan dengan kursus <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" className="rounded-xl" onClick={reset}>
                    <RotateCcw className="size-4" /> Ulangi asesmen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
