import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ExternalLink,
  FileCode2,
  FileText,
  GraduationCap,
  ImagePlus,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAccess } from "@/lib/admin";
import { db } from "@/lib/firebase";
import { uploadTrainingAsset } from "@/lib/training-assets";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kelola Kursus & Pelatihan" },
      { name: "description", content: "Kelola katalog kursus dan informasi pelatihan Z UP." },
    ],
  }),
  component: AdminPage,
});

const emptyCourse = { title: "", level: "Pemula", hours: "", track: "", points: "100" };
const emptyTraining = {
  title: "",
  provider: "",
  description: "",
  deliveryMode: "online",
  contentType: "manual",
  contentHtml: "",
  startsAt: "",
  endsAt: "",
  venue: "",
  address: "",
  capacity: "",
  registrationUrl: "",
};

function AdminPage() {
  const { loading, isAdmin } = useAdminAccess();
  const [course, setCourse] = useState(emptyCourse);
  const [training, setTraining] = useState(emptyTraining);
  const [trainingFile, setTrainingFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState("");

  if (loading) {
    return (
      <AppShell title="Admin" subtitle="Memeriksa izin akses">
        Memuat akses admin...
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="Akses terbatas" subtitle="Halaman ini khusus administrator">
        <Card className="mx-auto max-w-lg border-destructive/30 shadow-soft">
          <CardContent className="space-y-4 p-6 text-center">
            <ShieldCheck className="mx-auto size-10 text-destructive" />
            <div>
              <h2 className="font-bold">Kamu tidak memiliki akses admin</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Masuk dengan akun administrator yang sudah diberi izin khusus.
              </p>
            </div>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/dashboard">Kembali ke dasbor</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  async function saveCourse(event) {
    event.preventDefault();
    if (!db) {
      setStatus("Firebase belum dikonfigurasi.");
      return;
    }
    setSaving("course");
    setStatus("");
    try {
      await addDoc(collection(db, "courses"), {
        ...course,
        id: slugify(course.title),
        points: Number(course.points),
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setCourse(emptyCourse);
      setStatus("Kursus berhasil ditambahkan.");
    } catch (error) {
      console.error("Gagal menyimpan kursus", error);
      setStatus(error.message || "Kursus gagal ditambahkan.");
    } finally {
      setSaving("");
    }
  }

  async function saveTraining(event) {
    event.preventDefault();
    if (!db) {
      setStatus("Firebase belum dikonfigurasi.");
      return;
    }
    if (training.contentType !== "manual" && !trainingFile) {
      setStatus("Pilih file PDF atau HTML untuk materi pelatihan.");
      return;
    }
    if (training.deliveryMode === "offline" && (!training.startsAt || !training.venue)) {
      setStatus("Pelatihan offline wajib memiliki tanggal mulai dan tempat.");
      return;
    }

    setSaving("training");
    setStatus("");
    try {
      const [contentAsset, coverAsset] = await Promise.all([
        trainingFile ? uploadTrainingAsset(trainingFile) : null,
        coverFile ? uploadTrainingAsset(coverFile, "training/covers") : null,
      ]);
      await addDoc(collection(db, "training"), {
        title: training.title.trim(),
        provider: training.provider.trim(),
        description: training.description.trim(),
        deliveryMode: training.deliveryMode,
        contentType: training.contentType,
        contentHtml: training.contentType === "manual" ? training.contentHtml : "",
        contentUrl: contentAsset?.url || "",
        contentFileName: contentAsset?.name || "",
        coverImageUrl: coverAsset?.url || "",
        startsAt: training.startsAt || "",
        endsAt: training.endsAt || "",
        venue: training.venue.trim(),
        address: training.address.trim(),
        capacity: training.capacity ? Number(training.capacity) : null,
        registrationUrl: safeExternalUrl(training.registrationUrl),
        status: "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTraining(emptyTraining);
      setTrainingFile(null);
      setCoverFile(null);
      event.target.reset();
      setStatus("Pelatihan berhasil dipublikasikan.");
    } catch (error) {
      console.error("Gagal menyimpan pelatihan", error);
      setStatus(error.message || "Pelatihan gagal disimpan.");
    } finally {
      setSaving("");
    }
  }

  return (
    <AppShell title="Admin" subtitle="Kelola konten pembelajaran Z UP">
      <div className="grid gap-6">
        <section className="rounded-3xl bg-ink p-6 text-ink-foreground shadow-soft sm:p-8">
          <Badge className="bg-primary text-foreground">Administrator</Badge>
          <h2 className="mt-4 text-2xl font-bold">Studio pelatihan</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Publikasikan materi mandiri seperti artikel bergaya Medium, PDF, atau HTML. Pelatihan
            offline juga bisa menyimpan jadwal, tempat, kapasitas, dan link pendaftaran.
          </p>
        </section>

        {status && <p className="rounded-xl bg-secondary p-3 text-sm font-medium">{status}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminForm
            title="Tambah kursus"
            icon={BookOpen}
            onSubmit={saveCourse}
            busy={saving === "course"}
          >
            <Field label="Nama kursus *">
              <Input
                required
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Pemasaran Digital untuk UMKM"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Level">
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
                >
                  <option>Pemula</option>
                  <option>Menengah</option>
                  <option>Lanjutan</option>
                </select>
              </Field>
              <Field label="Durasi">
                <Input
                  required
                  value={course.hours}
                  onChange={(e) => setCourse({ ...course, hours: e.target.value })}
                  placeholder="12 jam"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bidang">
                <Input
                  required
                  value={course.track}
                  onChange={(e) => setCourse({ ...course, track: e.target.value })}
                  placeholder="Pemasaran"
                />
              </Field>
              <Field label="Poin">
                <Input
                  required
                  type="number"
                  min="0"
                  max="10000"
                  value={course.points}
                  onChange={(e) => setCourse({ ...course, points: e.target.value })}
                />
              </Field>
            </div>
          </AdminForm>

          <AdminForm
            title="Publikasikan pelatihan"
            icon={GraduationCap}
            onSubmit={saveTraining}
            busy={saving === "training"}
          >
            <Field label="Judul pelatihan *">
              <Input
                required
                value={training.title}
                onChange={(e) => setTraining({ ...training, title: e.target.value })}
                placeholder="Menulis CV yang Lolos ATS"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Penyelenggara *">
                <Input
                  required
                  value={training.provider}
                  onChange={(e) => setTraining({ ...training, provider: e.target.value })}
                  placeholder="Z UP Academy"
                />
              </Field>
              <Field label="Format">
                <select
                  value={training.deliveryMode}
                  onChange={(e) => setTraining({ ...training, deliveryMode: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
                >
                  <option value="online">Online / mandiri</option>
                  <option value="offline">Offline / tatap muka</option>
                </select>
              </Field>
            </div>
            <Field label="Deskripsi singkat *">
              <Textarea
                required
                rows={3}
                value={training.description}
                onChange={(e) => setTraining({ ...training, description: e.target.value })}
                placeholder="Jelaskan manfaat dan sasaran peserta..."
              />
            </Field>
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/50 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold">
                <FileText className="size-4 text-primary" /> Materi pembelajaran
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Jenis konten">
                  <select
                    value={training.contentType}
                    onChange={(e) => setTraining({ ...training, contentType: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                  >
                    <option value="manual">Artikel manual (gaya Medium)</option>
                    <option value="pdf">Dokumen PDF</option>
                    <option value="html">File HTML</option>
                  </select>
                </Field>
                <Field label="File materi">
                  <Input
                    type="file"
                    accept=".pdf,.html,.htm,text/html,application/pdf"
                    required={training.contentType !== "manual"}
                    onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
                    className="h-10 bg-card pt-2"
                  />
                </Field>
              </div>
              {training.contentType === "manual" && (
                <Field label="Isi artikel HTML *">
                  <Textarea
                    required
                    rows={8}
                    value={training.contentHtml}
                    onChange={(e) => setTraining({ ...training, contentHtml: e.target.value })}
                    placeholder="<h2>Judul bagian</h2><p>Tulis materi pelatihan di sini...</p>"
                    className="mt-3 bg-card font-mono text-xs"
                  />
                </Field>
              )}
              {training.contentType === "html" && (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <FileCode2 className="size-3.5" /> File HTML akan dibuka sebagai materi di tab
                  baru.
                </p>
              )}
            </div>
            <div className="rounded-2xl border-2 border-border p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" /> Jadwal & lokasi
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mulai">
                  <Input
                    type="datetime-local"
                    value={training.startsAt}
                    onChange={(e) => setTraining({ ...training, startsAt: e.target.value })}
                  />
                </Field>
                <Field label="Selesai">
                  <Input
                    type="datetime-local"
                    value={training.endsAt}
                    onChange={(e) => setTraining({ ...training, endsAt: e.target.value })}
                  />
                </Field>
                <Field label="Tempat">
                  <Input
                    value={training.venue}
                    onChange={(e) => setTraining({ ...training, venue: e.target.value })}
                    placeholder="Aula Kreatif Kota"
                  />
                </Field>
                <Field label="Kapasitas peserta">
                  <Input
                    type="number"
                    min="1"
                    value={training.capacity}
                    onChange={(e) => setTraining({ ...training, capacity: e.target.value })}
                    placeholder="30"
                  />
                </Field>
              </div>
              <Field label="Alamat lengkap">
                <Input
                  value={training.address}
                  onChange={(e) => setTraining({ ...training, address: e.target.value })}
                  placeholder="Jl. ... No. ... Kecamatan ..."
                />
              </Field>
            </div>
            <Field label="Gambar cover (opsional)">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="h-10 pt-2"
              />
              <span className="mt-1 flex items-center gap-1 text-xs font-normal">
                <ImagePlus className="size-3.5" /> Tersimpan di Supabase Storage saat dikonfigurasi.
              </span>
            </Field>
            <Field label="Link pendaftaran (opsional)">
              <Input
                type="url"
                value={training.registrationUrl}
                onChange={(e) => setTraining({ ...training, registrationUrl: e.target.value })}
                placeholder="https://..."
              />
            </Field>
          </AdminForm>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" /> File membutuhkan env Supabase dan sesi admin
          Supabase. Metadata tetap divalidasi oleh rules Firestore.
        </p>
      </div>
    </AppShell>
  );
}

function AdminForm({ title, icon: Icon, onSubmit, busy, children }) {
  return (
    <Card className="border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <Button type="submit" disabled={busy} className="w-full rounded-xl">
            {busy ? "Mengunggah & menyimpan..." : "Publikasikan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5 text-xs font-semibold text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safeExternalUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}
