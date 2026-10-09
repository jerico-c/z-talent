import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAccess } from "@/lib/admin";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kelola Kursus & Pelatihan" },
      { name: "description", content: "Kelola katalog kursus dan informasi pelatihan Z-Talent." },
    ],
  }),
  component: AdminPage,
});

const emptyCourse = { title: "", level: "Pemula", hours: "", track: "", points: "100" };
const emptyTraining = { title: "", provider: "", description: "", schedule: "", link: "" };

function AdminPage() {
  const { loading, isAdmin } = useAdminAccess();
  const [course, setCourse] = useState(emptyCourse);
  const [training, setTraining] = useState(emptyTraining);
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
    setSaving("course");
    setStatus("");
    try {
      await addDoc(collection(db, "courses"), {
        ...course,
        id: course.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        points: Number(course.points),
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setCourse(emptyCourse);
      setStatus("Kursus berhasil ditambahkan.");
    } catch (error) {
      setStatus(error.message || "Kursus gagal ditambahkan.");
    } finally {
      setSaving("");
    }
  }

  async function saveTraining(event) {
    event.preventDefault();
    setSaving("training");
    setStatus("");
    try {
      await addDoc(collection(db, "training"), {
        ...training,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTraining(emptyTraining);
      setStatus("Info pelatihan berhasil ditambahkan.");
    } catch (error) {
      setStatus(error.message || "Info pelatihan gagal ditambahkan.");
    } finally {
      setSaving("");
    }
  }

  return (
    <AppShell title="Admin" subtitle="Kelola konten pembelajaran Z-Talent">
      <div className="grid gap-6">
        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft sm:p-8">
          <Badge className="bg-orange-400 text-slate-950">Administrator</Badge>
          <h2 className="mt-4 text-2xl font-bold">Panel pengelolaan konten</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Tambahkan kursus dan pelatihan yang akan tampil untuk pengguna. Setiap perubahan
            divalidasi kembali oleh aturan Firestore berbasis custom claim admin.
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
            title="Tambah info pelatihan"
            icon={GraduationCap}
            onSubmit={saveTraining}
            busy={saving === "training"}
          >
            <Field label="Judul pelatihan *">
              <Input
                required
                value={training.title}
                onChange={(e) => setTraining({ ...training, title: e.target.value })}
                placeholder="Pelatihan Iklan Meta untuk UMKM"
              />
            </Field>
            <Field label="Penyelenggara *">
              <Input
                required
                value={training.provider}
                onChange={(e) => setTraining({ ...training, provider: e.target.value })}
                placeholder="Balai Latihan Kerja"
              />
            </Field>
            <Field label="Jadwal">
              <Input
                value={training.schedule}
                onChange={(e) => setTraining({ ...training, schedule: e.target.value })}
                placeholder="12–14 Oktober 2026"
              />
            </Field>
            <Field label="Link pendaftaran">
              <Input
                type="url"
                value={training.link}
                onChange={(e) => setTraining({ ...training, link: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Deskripsi *">
              <Textarea
                required
                rows={4}
                value={training.description}
                onChange={(e) => setTraining({ ...training, description: e.target.value })}
                placeholder="Jelaskan materi dan sasaran peserta..."
              />
            </Field>
          </AdminForm>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" /> Konten baru tampil di halaman Kursus setelah
          berhasil disimpan.
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
            {busy ? "Menyimpan..." : "Simpan"}
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
