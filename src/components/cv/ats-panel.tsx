/**
 * Panel skor ATS real-time — menampilkan skor 0–100, ringkasan per kelompok,
 * dan daftar perbaikan yang paling berdampak lebih dulu.
 */

import { CheckCircle2, Lightbulb } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { AtsResult } from "@/lib/cv-ats";

export function AtsPanel({ ats }: { ats: AtsResult }) {
  const tone = ats.score >= 90 ? "text-accent" : ats.score >= 75 ? "text-primary" : "text-destructive";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
        <div className="grid size-24 shrink-0 place-items-center rounded-full border-4 border-primary-soft">
          <div className="text-center">
            <p className={`text-2xl font-extrabold ${tone}`}>{ats.score}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</p>
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold">{ats.label}</p>
          <Progress value={ats.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {ats.passedCount} dari {ats.conditions.length} kriteria ATS terpenuhi · skor berubah saat kamu mengetik.
          </p>
        </div>
      </div>

      {ats.failed.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Perbaikan prioritas ({ats.failed.length})
          </p>
          <ul className="mt-3 space-y-2">
            {ats.failed.slice(0, 8).map((f) => (
              <li key={f.tip} className="flex gap-2 text-sm">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  {f.tip}{" "}
                  <span className="text-xs font-semibold text-muted-foreground">+{f.points} poin</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
          Semua kriteria ATS terpenuhi — CV siap dikirim.
        </p>
      )}
    </div>
  );
}
