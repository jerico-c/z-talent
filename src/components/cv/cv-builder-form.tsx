/**
 * Formulir pembuat CV — dibagi menjadi 5 langkah bertab.
 * Semua perubahan langsung memicu pratinjau & skor ATS real-time.
 */

import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateCvText } from "@/lib/cv-ai.functions";
import { newId, type CvData } from "@/lib/cv-data";

type Props = { cv: CvData; onChange: (next: CvData) => void };

/** Baris field kecil yang dipakai berulang. */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl"
      />
    </div>
  );
}

export function CvBuilderForm({ cv, onChange }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState("");

  const setPersonal = (patch: Partial<CvData["personal"]>) =>
    onChange({ ...cv, personal: { ...cv.personal, ...patch } });
  const setSkills = (patch: Partial<CvData["skills"]>) => onChange({ ...cv, skills: { ...cv.skills, ...patch } });
  const setAdditional = (patch: Partial<CvData["additional"]>) =>
    onChange({ ...cv, additional: { ...cv.additional, ...patch } });

  /** Panggil asisten AI (Groq) dan tempelkan hasilnya ke field yang relevan. */
  async function runAi(action: "summary" | "bullets" | "autofill", context: string, expId?: string) {
    if (context.trim().length < 5) {
      toast.error("Isi dulu sedikit konteks agar AI punya bahan.");
      return;
    }
    setBusy(expId ? `bullets-${expId}` : action);
    try {
      const res = await generateCvText({
        data: { action, context, jobTitle: cv.personal.jobTitle || undefined },
      });
      if (!res.ok) {
        toast.error(res.error || "Asisten AI sedang tidak tersedia.");
        return;
      }
      const parsed = JSON.parse(res.json) as Record<string, unknown>;

      if (action === "summary" && typeof parsed["summary"] === "string") {
        setPersonal({ summary: parsed["summary"] });
        toast.success("Ringkasan profesional diperbarui.");
      } else if (action === "bullets" && Array.isArray(parsed["bullets"])) {
        const text = (parsed["bullets"] as string[]).map((b) => `• ${b}`).join("\n");
        onChange({
          ...cv,
          experience: cv.experience.map((e) => (e.id === expId ? { ...e, description: text } : e)),
        });
        toast.success("Poin pengalaman ditulis ulang.");
      } else if (action === "autofill") {
        const g = (k: string) => (typeof parsed[k] === "string" ? (parsed[k] as string) : "");
        onChange({
          ...cv,
          personal: {
            ...cv.personal,
            jobTitle: g("jobTitle") || cv.personal.jobTitle,
            summary: g("summary") || cv.personal.summary,
          },
          skills: {
            technical: g("technical") || cv.skills.technical,
            soft: g("soft") || cv.skills.soft,
            languages: g("languages") || cv.skills.languages,
          },
          additional: {
            ...cv.additional,
            projects: g("projects") || cv.additional.projects,
            certifications: g("certifications") || cv.additional.certifications,
          },
        });
        toast.success("Draf CV dibuat dari deskripsimu.");
      } else {
        toast.error("AI tidak mengembalikan isi yang bisa dipakai.");
      }
    } catch {
      toast.error("Gagal menghubungi asisten AI.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Tabs defaultValue="diri" className="gap-4">
      <TabsList className="flex w-full flex-wrap">
        <TabsTrigger value="diri" className="flex-1">
          Data Diri
        </TabsTrigger>
        <TabsTrigger value="pengalaman" className="flex-1">
          Pengalaman
        </TabsTrigger>
        <TabsTrigger value="pendidikan" className="flex-1">
          Pendidikan
        </TabsTrigger>
        <TabsTrigger value="skill" className="flex-1">
          Keterampilan
        </TabsTrigger>
        <TabsTrigger value="tambahan" className="flex-1">
          Tambahan
        </TabsTrigger>
      </TabsList>

      {/* ── Langkah 1: data diri + asisten AI ───────────────── */}
      <TabsContent value="diri" className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Isi otomatis dengan AI</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ceritakan dirimu dalam satu baris, AI akan menyusun draf ringkasan, keterampilan, dan proyek.
          </p>
          <Textarea
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            placeholder="Contoh: lulusan D3 administrasi bisnis di Batam, 2 tahun bantu UMKM kelola Instagram dan iklan Meta"
            className="mt-3 rounded-xl"
            rows={2}
          />
          <Button
            className="mt-3 rounded-xl"
            disabled={busy === "autofill"}
            onClick={() => runAi("autofill", aiBrief)}
          >
            {busy === "autofill" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Buat draf CV
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" value={cv.personal.fullName} onChange={(v) => setPersonal({ fullName: v })} placeholder="Nadia Prameswari" />
          <Field label="Posisi yang dituju" value={cv.personal.jobTitle} onChange={(v) => setPersonal({ jobTitle: v })} placeholder="Spesialis Pemasaran Digital" />
          <Field label="Email" type="email" value={cv.personal.email} onChange={(v) => setPersonal({ email: v })} placeholder="nama@email.com" />
          <Field label="Telepon / WhatsApp" value={cv.personal.phone} onChange={(v) => setPersonal({ phone: v })} placeholder="+62 812 3456 7890" />
          <Field label="Kota" value={cv.personal.location} onChange={(v) => setPersonal({ location: v })} placeholder="Batam" />
          <Field label="LinkedIn / portofolio" value={cv.personal.linkedin} onChange={(v) => setPersonal({ linkedin: v })} placeholder="linkedin.com/in/…" />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-xs font-semibold text-muted-foreground">Ringkasan profesional</Label>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={busy === "summary"}
              onClick={() => runAi("summary", cv.personal.summary || aiBrief || cv.personal.jobTitle)}
            >
              {busy === "summary" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              Tulis dengan AI
            </Button>
          </div>
          <Textarea
            value={cv.personal.summary}
            onChange={(e) => setPersonal({ summary: e.target.value })}
            rows={5}
            className="rounded-xl"
            placeholder="Ringkas keahlian, pengalaman, dan hasil terukur dalam 40–90 kata."
          />
        </div>
      </TabsContent>

      {/* ── Langkah 2: pengalaman ───────────────────────────── */}
      <TabsContent value="pengalaman" className="space-y-4">
        {cv.experience.map((e) => (
          <div key={e.id} className="space-y-3 rounded-2xl border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Posisi"
                value={e.title}
                onChange={(v) =>
                  onChange({ ...cv, experience: cv.experience.map((x) => (x.id === e.id ? { ...x, title: v } : x)) })
                }
              />
              <Field
                label="Perusahaan / UMKM"
                value={e.company}
                onChange={(v) =>
                  onChange({ ...cv, experience: cv.experience.map((x) => (x.id === e.id ? { ...x, company: v } : x)) })
                }
              />
              <Field
                label="Mulai"
                type="month"
                value={e.startDate}
                onChange={(v) =>
                  onChange({ ...cv, experience: cv.experience.map((x) => (x.id === e.id ? { ...x, startDate: v } : x)) })
                }
              />
              <Field
                label="Selesai (kosongkan bila masih aktif)"
                type="month"
                value={e.endDate}
                onChange={(v) =>
                  onChange({ ...cv, experience: cv.experience.map((x) => (x.id === e.id ? { ...x, endDate: v } : x)) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Poin pencapaian</Label>
              <Textarea
                rows={4}
                className="rounded-xl"
                value={e.description}
                placeholder="• Meluncurkan kampanye iklan dengan ROAS 3,4x"
                onChange={(v) =>
                  onChange({
                    ...cv,
                    experience: cv.experience.map((x) => (x.id === e.id ? { ...x, description: v.target.value } : x)),
                  })
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={busy === `bullets-${e.id}`}
                onClick={() => runAi("bullets", `${e.title} di ${e.company}. ${e.description}`, e.id)}
              >
                {busy === `bullets-${e.id}` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                Perbaiki dengan AI
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl text-destructive"
                onClick={() => onChange({ ...cv, experience: cv.experience.filter((x) => x.id !== e.id) })}
              >
                <Trash2 className="size-3.5" /> Hapus
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() =>
            onChange({
              ...cv,
              experience: [
                ...cv.experience,
                { id: newId(), title: "", company: "", startDate: "", endDate: "", description: "" },
              ],
            })
          }
        >
          <Plus className="size-4" /> Tambah pengalaman
        </Button>
      </TabsContent>

      {/* ── Langkah 3: pendidikan ───────────────────────────── */}
      <TabsContent value="pendidikan" className="space-y-4">
        {cv.education.map((e) => (
          <div key={e.id} className="space-y-3 rounded-2xl border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Program studi / jurusan"
                value={e.degree}
                onChange={(v) =>
                  onChange({ ...cv, education: cv.education.map((x) => (x.id === e.id ? { ...x, degree: v } : x)) })
                }
              />
              <Field
                label="Sekolah / kampus"
                value={e.school}
                onChange={(v) =>
                  onChange({ ...cv, education: cv.education.map((x) => (x.id === e.id ? { ...x, school: v } : x)) })
                }
              />
              <Field
                label="Mulai"
                type="month"
                value={e.startDate}
                onChange={(v) =>
                  onChange({ ...cv, education: cv.education.map((x) => (x.id === e.id ? { ...x, startDate: v } : x)) })
                }
              />
              <Field
                label="Selesai"
                type="month"
                value={e.endDate}
                onChange={(v) =>
                  onChange({ ...cv, education: cv.education.map((x) => (x.id === e.id ? { ...x, endDate: v } : x)) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Catatan (IPK, organisasi)</Label>
              <Textarea
                rows={2}
                className="rounded-xl"
                value={e.description}
                onChange={(v) =>
                  onChange({
                    ...cv,
                    education: cv.education.map((x) => (x.id === e.id ? { ...x, description: v.target.value } : x)),
                  })
                }
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-destructive"
              onClick={() => onChange({ ...cv, education: cv.education.filter((x) => x.id !== e.id) })}
            >
              <Trash2 className="size-3.5" /> Hapus
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() =>
            onChange({
              ...cv,
              education: [
                ...cv.education,
                { id: newId(), degree: "", school: "", startDate: "", endDate: "", description: "" },
              ],
            })
          }
        >
          <Plus className="size-4" /> Tambah pendidikan
        </Button>
      </TabsContent>

      {/* ── Langkah 4: keterampilan ─────────────────────────── */}
      <TabsContent value="skill" className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Keterampilan teknis (pisahkan dengan koma)</Label>
          <Textarea
            rows={3}
            className="rounded-xl"
            value={cv.skills.technical}
            placeholder="Meta Ads, Canva, SEO Marketplace, Spreadsheet"
            onChange={(e) => setSkills({ technical: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Keterampilan personal</Label>
          <Textarea
            rows={2}
            className="rounded-xl"
            value={cv.skills.soft}
            placeholder="Komunikasi, Kolaborasi, Manajemen waktu"
            onChange={(e) => setSkills({ soft: e.target.value })}
          />
        </div>
        <Field label="Bahasa" value={cv.skills.languages} onChange={(v) => setSkills({ languages: v })} placeholder="Indonesia (native), Inggris (aktif)" />
      </TabsContent>

      {/* ── Langkah 5: bagian pendukung ─────────────────────── */}
      <TabsContent value="tambahan" className="space-y-4">
        {(
          [
            ["certifications", "Sertifikat & mikro-kredensial"],
            ["projects", "Proyek"],
            ["awards", "Penghargaan"],
            ["volunteer", "Pengalaman relawan"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
            <Textarea
              rows={3}
              className="rounded-xl"
              value={cv.additional[key]}
              onChange={(e) => setAdditional({ [key]: e.target.value })}
            />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
