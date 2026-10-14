import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateRiasecResult,
  RIASEC_DIMENSIONS,
  RIASEC_FORCED_QUESTIONS,
  RIASEC_LIKERT_QUESTIONS,
} from "@/lib/riasec";
import { useUserProfile } from "@/lib/user-profile";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "Tes Minat & Bakat RIASEC — Z UP" }] }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const { profile } = useUserProfile();
  const [name, setName] = useState(profile.name === "John Doe" ? "" : profile.name);
  const [page, setPage] = useState(-1);
  const [likert, setLikert] = useState({});
  const [forced, setForced] = useState({});
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const totalPages = 4;
  const questions =
    page < 3 ? RIASEC_LIKERT_QUESTIONS.slice(page * 6, page * 6 + 6) : RIASEC_FORCED_QUESTIONS;
  const answered = Object.keys(likert).length + Object.keys(forced).length;

  useEffect(() => {
    if (result) renderCard(result.topCodes[0], name, canvasRef.current);
  }, [result, name]);

  const reset = () => {
    setPage(-1);
    setLikert({});
    setForced({});
    setResult(null);
  };
  const next = () => {
    if (page < 3) setPage(page + 1);
    else setResult(calculateRiasecResult(likert, forced));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const previous = () => setPage((value) => Math.max(0, value - 1));

  return (
    <AppShell title="Tes Minat & Bakat RIASEC" subtitle="Pilar 1 · sekitar 3–5 menit">
      <div className="mx-auto grid max-w-5xl gap-6">
        {page === -1 && !result && (
          <Card className="overflow-hidden">
            <div className="bg-hero p-7 text-white sm:p-10">
              <Badge className="border-white/30 bg-white/15 text-white">ASESMEN KARIER</Badge>
              <h2 className="mt-4 max-w-2xl text-3xl font-black sm:text-5xl">
                Kenali arah minat dan bakatmu.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
                Jawab 18 pernyataan minat dan 6 pilihan prioritas. Sistem akan menghitung Holland
                Code RIASEC untuk memberikan rekomendasi karier, studi, dan kartu identitas yang
                bisa kamu bagikan.
              </p>
            </div>
            <CardContent className="space-y-6 p-6 sm:p-10">
              <div className="grid gap-3 sm:grid-cols-3">
                {["18 skala minat", "6 pilihan prioritas", "Kartu hasil siap dibagikan"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="border-2 border-foreground bg-secondary p-4 shadow-[3px_3px_0_var(--foreground)]"
                    >
                      <p className="text-2xl font-black text-primary">{index + 1}</p>
                      <p className="mt-2 text-sm font-bold">{item}</p>
                    </div>
                  ),
                )}
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Nama yang ditampilkan di kartu</span>
                <input
                  value={name}
                  maxLength={28}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="h-11 w-full border-2 border-foreground bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-accent sm:max-w-md"
                />
              </label>
              <Button
                className="w-full sm:w-auto"
                disabled={!name.trim()}
                onClick={() => setPage(0)}
              >
                Mulai tes <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        )}

        {page >= 0 && !result && (
          <Card>
            <CardHeader className="gap-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">
                  {page < 3 ? `Bagian A · Halaman ${page + 1}/3` : "Bagian B · Prioritas"}
                </Badge>
                <span className="text-xs font-bold text-muted-foreground">
                  {answered} / 24 terjawab
                </span>
              </div>
              <Progress value={(answered / 24) * 100} className="h-3" />
              <CardTitle>
                {page < 3
                  ? "Seberapa tertarik kamu pada aktivitas ini?"
                  : "Pilih aktivitas yang paling menggambarkan dirimu"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {page < 3
                ? questions.map((question, index) => (
                    <LikertQuestion
                      key={question.id}
                      question={question}
                      number={page * 6 + index + 1}
                      value={likert[question.id]}
                      onChange={(value) =>
                        setLikert((current) => ({ ...current, [question.id]: value }))
                      }
                    />
                  ))
                : questions.map((question, index) => (
                    <ForcedQuestion
                      key={question.id}
                      question={question}
                      number={index + 1}
                      value={forced[question.id]}
                      onChange={(value) =>
                        setForced((current) => ({ ...current, [question.id]: value }))
                      }
                    />
                  ))}
              <div className="flex justify-between gap-3 border-t-2 border-foreground pt-5">
                <Button variant="secondary" disabled={page === 0} onClick={previous}>
                  <ArrowLeft /> Kembali
                </Button>
                <Button
                  disabled={questions.some(
                    (question) =>
                      (page < 3 ? likert[question.id] : forced[question.id]) === undefined,
                  )}
                  onClick={next}
                >
                  {page === 3 ? "Lihat hasil" : "Selanjutnya"} <ArrowRight />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {result && <ResultView result={result} name={name} canvasRef={canvasRef} onReset={reset} />}
      </div>
    </AppShell>
  );
}

function LikertQuestion({ question, number, value, onChange }) {
  return (
    <div className="border-2 border-foreground bg-card p-4">
      <div className="mb-3 flex justify-between gap-3 text-xs font-bold">
        <Badge variant="secondary">#{number}</Badge>
        <span className="text-muted-foreground">{question.sector}</span>
      </div>
      <p className="mb-4 text-sm font-semibold leading-relaxed">{question.text}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {["Sangat tidak tertarik", "Tidak tertarik", "Netral", "Tertarik", "Sangat tertarik"].map(
          (label, index) => {
            const option = index + 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(option)}
                className={`min-h-16 border-2 p-1 text-center text-[10px] font-bold transition ${value === option ? "border-foreground bg-primary shadow-[2px_2px_0_var(--foreground)]" : "border-border bg-secondary hover:bg-primary-soft"}`}
              >
                <span className="block text-base">{option}</span>
                {label}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

function ForcedQuestion({ question, number, value, onChange }) {
  return (
    <div className="border-2 border-foreground bg-card p-4">
      <p className="mb-3 text-xs font-bold text-muted-foreground">Prioritas #{number}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <button
            key={option.dimension}
            type="button"
            onClick={() => onChange(option.dimension)}
            className={`border-2 p-4 text-left text-sm font-semibold transition ${value === option.dimension ? "border-foreground bg-primary shadow-[3px_3px_0_var(--foreground)]" : "border-border bg-secondary hover:bg-primary-soft"}`}
          >
            <span className="mb-2 flex items-center gap-2 text-xs font-black">
              <span className="grid size-6 place-items-center border-2 border-foreground">
                {index ? "B" : "A"}
              </span>
              {RIASEC_DIMENSIONS[option.dimension].name}
            </span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultView({ result, name, canvasRef, onReset }) {
  const top = result.topDimension;
  const shareUrl = `${window.location.origin}/assessment?result=${result.hollandCode}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link hasil berhasil disalin.");
    } catch {
      toast.error("Link tidak dapat disalin. Silakan salin URL dari bilah alamat.");
    }
  };
  const download = () => {
    const link = document.createElement("a");
    link.download = `Kartu_RIASEC_${top.name}_${name.trim().replace(/\s+/g, "_")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("Kartu berhasil diunduh.");
  };
  const share = async () => {
    const canvas = canvasRef.current;
    if (navigator.share) {
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        await navigator.share({
          title: "Hasil Tes RIASEC",
          text: `${name} memiliki profil ${result.hollandCode}.`,
          url: shareUrl,
          files: blob ? [new File([blob], "kartu-riasec.png", { type: "image/png" })] : undefined,
        });
      } catch (error) {
        if (error.name !== "AbortError") toast.error("Hasil belum dapat dibagikan.");
      }
    } else {
      await copyLink();
    }
  };
  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <div className="bg-hero p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Holland Code
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-wider">{result.hollandCode}</h2>
              <p className="mt-2 text-sm text-white/80">{top.description}</p>
            </div>
            <Button variant="secondary" onClick={onReset}>
              <RotateCcw /> Ulangi tes
            </Button>
          </div>
        </div>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="overflow-hidden border-2 border-foreground bg-black">
              <canvas ref={canvasRef} className="block h-auto w-full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={download}>
                <Download /> Unduh kartu
              </Button>
              <Button variant="secondary" onClick={share}>
                <Share2 /> Bagikan
              </Button>
              <Button variant="outline" onClick={copyLink}>
                <Clipboard /> Copy link
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase">Skor dimensi</p>
              {result.ranked.map((item) => (
                <div key={item.code} className="mb-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>
                      {item.code} · {RIASEC_DIMENSIONS[item.code].name}
                    </span>
                    <span>{item.normalized}%</span>
                  </div>
                  <Progress value={item.normalized} className="mt-1 h-2" />
                </div>
              ))}
            </div>
            <div className="border-t-2 border-foreground pt-4">
              <p className="text-xs font-black uppercase">Rekomendasi karier</p>
              <ul className="mt-2 list-inside list-disc text-sm">
                {result.careers.map((career) => (
                  <li key={career}>{career}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-black uppercase">Pilihan studi</p>
              <ul className="mt-2 list-inside list-disc text-sm">
                {result.studies.map((study) => (
                  <li key={study}>{study}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function renderCard(code, name, canvas) {
  if (!canvas) return;
  const image = new Image();
  image.src = RIASEC_DIMENSIONS[code].image;
  await new Promise((resolve) => {
    image.onload = resolve;
    image.onerror = resolve;
  });
  canvas.width = image.naturalWidth || 1000;
  canvas.height = image.naturalHeight || 625;
  const context = canvas.getContext("2d");
  if (image.complete && image.naturalWidth)
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const cardFontSize = 44;
  await document.fonts.load(`${cardFontSize}px "Anonymous Pro"`);
  context.fillStyle = "#0f0f0f";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = `${cardFontSize}px "Anonymous Pro", monospace`;
  context.fillText((name.trim() || "PESERTA ASESMEN").toUpperCase(), 632, 211);
}
