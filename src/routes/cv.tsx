import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AtsPanel } from "@/components/cv/ats-panel";
import { CvBuilderForm } from "@/components/cv/cv-builder-form";
import { CvPreview } from "@/components/cv/cv-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAts } from "@/lib/cv-ats";
import {
  CV_SETTINGS_KEY,
  CV_STORAGE_KEY,
  cvAccents,
  cvTemplates,
  emptyCv,
  sampleCv,
  type CvData,
} from "@/lib/cv-data";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "Pembuat CV & Pemeriksa ATS — Z-Talent" },
      {
        name: "description",
        content:
          "Susun CV profesional dengan pratinjau langsung, 12 template ramah ATS, skor ATS real-time, asisten AI, dan ekspor PDF gratis.",
      },
      { property: "og:title", content: "Pembuat CV & Pemeriksa ATS Gratis" },
      {
        property: "og:description",
        content: "12 template ramah ATS, skor ATS real-time, asisten AI, dan ekspor PDF tanpa login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CvPage,
});

function CvPage() {
  const [cv, setCv] = useState<CvData>(sampleCv);
  const [templateId, setTemplateId] = useState(cvTemplates[0]!.id);
  const [accent, setAccent] = useState(cvTemplates[0]!.accent);
  const [loaded, setLoaded] = useState(false);

  /** Muat draf tersimpan dari browser setelah hidrasi. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CV_STORAGE_KEY);
      if (raw) setCv(JSON.parse(raw) as CvData);
      const s = localStorage.getItem(CV_SETTINGS_KEY);
      if (s) {
        const parsed = JSON.parse(s) as { template?: string; accent?: string };
        if (parsed.template) setTemplateId(parsed.template);
        if (parsed.accent) setAccent(parsed.accent);
      }
    } catch {
      /* draf rusak — abaikan dan pakai contoh */
    }
    setLoaded(true);
  }, []);

  /** Simpan otomatis setiap perubahan. */
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cv));
    localStorage.setItem(CV_SETTINGS_KEY, JSON.stringify({ template: templateId, accent }));
  }, [cv, templateId, accent, loaded]);

  const template = cvTemplates.find((t) => t.id === templateId) ?? cvTemplates[0]!;
  const ats = useMemo(() => computeAts(cv), [cv]);

  return (
    <AppShell title="Pembuat CV & Pemeriksa ATS" subtitle="Pilar 3 · susun, nilai, dan unduh CV dalam satu halaman">
      {/* Bilah aksi */}
      <div className="mb-5 flex flex-wrap items-center gap-2 print:hidden">
        <Badge variant="secondary" className="bg-accent-soft text-accent-foreground">
          <Save className="mr-1 size-3" /> Tersimpan otomatis di perangkat ini
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setCv(sampleCv)}>
            <FileText className="size-4" /> Isi contoh
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setCv(emptyCv);
              toast.success("Formulir dikosongkan.");
            }}
          >
            <RotateCcw className="size-4" /> Kosongkan
          </Button>
          <Button className="rounded-xl" onClick={() => window.print()}>
            <Download className="size-4" /> Unduh PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Kolom kiri: formulir + template */}
        <div className="min-w-0 space-y-6 print:hidden">
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Isi data CV</CardTitle>
            </CardHeader>
            <CardContent>
              <CvBuilderForm cv={cv} onChange={setCv} />
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Template & warna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {cvTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplateId(t.id);
                      setAccent(t.accent);
                    }}
                    className={`rounded-2xl border p-3 text-left transition-colors ${
                      t.id === templateId
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-3 shrink-0 rounded-full" style={{ background: t.accent }} />
                      <span className="truncate text-sm font-semibold">{t.name}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{t.note}</p>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">Warna aksen</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cvAccents.map((c) => (
                    <button
                      key={c}
                      aria-label={`Warna ${c}`}
                      onClick={() => setAccent(c)}
                      className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        accent === c ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan: skor ATS + pratinjau langsung */}
        <div className="min-w-0 space-y-6">
          <Card className="border-border shadow-soft print:hidden">
            <CardHeader>
              <CardTitle className="text-base">Skor ATS real-time</CardTitle>
            </CardHeader>
            <CardContent>
              <AtsPanel ats={ats} />
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-border bg-secondary/50 p-3 print:border-0 print:bg-white print:p-0">
            <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground print:hidden">
              Pratinjau langsung · {template.name}
            </p>
            <div className="overflow-x-auto">
              <CvPreview cv={cv} template={template} accent={accent} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
