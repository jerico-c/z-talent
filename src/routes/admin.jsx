import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ExternalLink,
  FileCode2,
  FileText,
  GraduationCap,
  ImagePlus,
  MapPin,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAccess } from "@/lib/admin";
import { db } from "@/lib/firebase";
import { deleteTrainingAsset, uploadTrainingAsset } from "@/lib/training-assets";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kelola Kursus & Pelatihan" },
      { name: "description", content: "Kelola katalog kursus dan informasi pelatihan Z UP." },
    ],
  }),
  component: AdminPage,
});

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
const emptyNews = { title: "", excerpt: "", contentHtml: "" };

function AdminPage() {
  const { loading, isAdmin } = useAdminAccess();
  const [training, setTraining] = useState(emptyTraining);
  const [news, setNews] = useState(emptyNews);
  const [trainingFile, setTrainingFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [newsImage, setNewsImage] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState("");
  const [managedContent, setManagedContent] = useState({
    courses: [],
    training: [],
    news: [],
    promotions: [],
  });
  const [loadingContent, setLoadingContent] = useState(false);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadManagedContent() {
      setLoadingContent(true);
      try {
        const [trainingSnapshot, coursesResult, newsResult, promotionsResult] = await Promise.all([
          getDocs(collection(db, "training")),
          supabase
            ?.from("courses")
            .select("id,title,provider,description,cover_image_url,created_at")
            .order("created_at", { ascending: false }),
          supabase
            ?.from("news_posts")
            .select("id,title,excerpt,cover_image_url,created_at")
            .order("created_at", {
              ascending: false,
            }),
          supabase
            ?.from("promotions")
            .select("id,name,owner_id,image_url,created_at")
            .order("created_at", { ascending: false }),
        ]);
        if (coursesResult?.error)
          throw new Error(`Kursus gagal dimuat: ${coursesResult.error.message}`);
        if (newsResult?.error) throw new Error(`Berita gagal dimuat: ${newsResult.error.message}`);
        if (promotionsResult?.error)
          throw new Error(`Promosi gagal dimuat: ${promotionsResult.error.message}`);
        if (!cancelled) {
          setManagedContent({
            courses: coursesResult?.data || [],
            training: trainingSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
            news: newsResult?.data || [],
            promotions: (promotionsResult?.data || []).map((item) => ({
              ...item,
              title: item.name,
            })),
          });
        }
      } catch (error) {
        console.error("Gagal memuat konten admin", error);
        if (!cancelled) setStatus(error.message || "Daftar konten gagal dimuat.");
      } finally {
        if (!cancelled) setLoadingContent(false);
      }
    }
    loadManagedContent();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

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

  async function saveTraining(event) {
    event.preventDefault();
    const isCourse = training.deliveryMode === "online";
    if (isCourse && !supabase) {
      setStatus("Supabase belum dikonfigurasi untuk menyimpan kursus.");
      return;
    }
    if (!isCourse && !db) {
      setStatus("Firebase belum dikonfigurasi untuk menyimpan pelatihan offline.");
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
        trainingFile ? uploadTrainingAsset(trainingFile, isCourse ? "courses" : "training") : null,
        coverFile
          ? uploadTrainingAsset(coverFile, isCourse ? "courses/covers" : "training/covers")
          : null,
      ]);
      if (isCourse) {
        const { error } = await supabase.from("courses").insert({
          title: training.title.trim(),
          provider: training.provider.trim(),
          description: training.description.trim(),
          content_type: training.contentType,
          content_html: training.contentType === "manual" ? training.contentHtml : "",
          content_url: contentAsset?.url || null,
          cover_image_url: coverAsset?.url || null,
          status: "published",
        });
        if (error) throw new Error(`Kursus gagal disimpan: ${error.message}`);
      } else {
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
      }
      setTraining(emptyTraining);
      setTrainingFile(null);
      setCoverFile(null);
      event.target.reset();
      setStatus(
        isCourse ? "Kursus berhasil dipublikasikan." : "Pelatihan offline berhasil dipublikasikan.",
      );
    } catch (error) {
      console.error("Gagal menyimpan pelatihan", error);
      setStatus(error.message || "Pelatihan gagal disimpan.");
    } finally {
      setSaving("");
    }
  }

  async function saveNews(event) {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase belum dikonfigurasi.");
      return;
    }
    if (!newsImage) {
      setStatus("Pilih gambar berita.");
      return;
    }
    setSaving("news");
    setStatus("");
    try {
      const imageAsset = await uploadTrainingAsset(newsImage, "news");
      const { error } = await supabase.from("news_posts").insert({
        title: news.title.trim(),
        slug: slugify(news.title),
        excerpt: news.excerpt.trim(),
        content_html: news.contentHtml,
        cover_image_url: imageAsset.url,
        status: "published",
      });
      if (error) throw new Error(`Berita gagal disimpan: ${error.message}`);
      setNews(emptyNews);
      setNewsImage(null);
      event.target.reset();
      setStatus("Berita berhasil dipublikasikan di landing page.");
    } catch (error) {
      console.error("Gagal menyimpan berita", error);
      setStatus(error.message || "Berita gagal dipublikasikan.");
    } finally {
      setSaving("");
    }
  }

  async function deleteContent(type, item) {
    const label =
      type === "news"
        ? "berita"
        : type === "courses"
          ? "kursus"
          : type === "promotions"
            ? "promosi"
            : "pelatihan";
    if (!window.confirm(`Hapus ${label} "${item.title}"? Tindakan ini tidak dapat dibatalkan.`))
      return;
    const key = `${type}-${item.id}`;
    setDeleting(key);
    setStatus("");
    try {
      if (type === "news") {
        if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
        if (item.cover_image_url) await deleteTrainingAsset(item.cover_image_url);
        const { error } = await supabase.from("news_posts").delete().eq("id", item.id);
        if (error) throw new Error(`Berita gagal dihapus: ${error.message}`);
      } else if (type === "training") {
        if (!db) throw new Error("Firebase belum dikonfigurasi.");
        await Promise.all([
          deleteTrainingAsset(item.contentUrl),
          deleteTrainingAsset(item.coverImageUrl),
        ]);
        await deleteDoc(doc(db, type, item.id));
      } else if (type === "promotions") {
        if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
        if (item.image_url) await deleteTrainingAsset(item.image_url);
        const { error } = await supabase.from("promotions").delete().eq("id", item.id);
        if (error) throw new Error(`Promosi gagal dihapus: ${error.message}`);
      } else {
        if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
        if (item.cover_image_url) await deleteTrainingAsset(item.cover_image_url);
        const { error } = await supabase.from("courses").delete().eq("id", item.id);
        if (error) throw new Error(`Kursus gagal dihapus: ${error.message}`);
      }
      setManagedContent((current) => ({
        ...current,
        [type]: current[type].filter((content) => content.id !== item.id),
      }));
      setStatus(`${label[0].toUpperCase()}${label.slice(1)} berhasil dihapus.`);
    } catch (error) {
      console.error(`Gagal menghapus ${label}`, error);
      setStatus(error.message || `${label} gagal dihapus.`);
    } finally {
      setDeleting("");
    }
  }

  return (
    <AppShell title="Admin" subtitle="Kelola konten pembelajaran Z UP">
      <div className="grid gap-6">
        <section className="border-2 border-foreground bg-ink p-6 text-ink-foreground shadow-soft sm:p-8">
          <Badge className="bg-primary text-foreground">Administrator</Badge>
          <h2 className="mt-4 font-heading text-2xl font-normal">Studio pelatihan</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Publikasikan materi mandiri seperti artikel bergaya Medium, PDF, atau HTML. Pelatihan
            offline juga bisa menyimpan jadwal, tempat, kapasitas, dan link pendaftaran.
          </p>
        </section>

        {status && <p className="rounded-xl bg-secondary p-3 text-sm font-medium">{status}</p>}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <AdminForm
            title="Tambah kursus & pelatihan"
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
          <AdminForm
            title="Posting berita"
            icon={FileText}
            onSubmit={saveNews}
            busy={saving === "news"}
          >
            <Field label="Judul berita *">
              <Input
                required
                value={news.title}
                onChange={(e) => setNews({ ...news, title: e.target.value })}
                placeholder="Program pelatihan baru untuk talenta muda"
              />
            </Field>
            <Field label="Ringkasan *">
              <Textarea
                required
                rows={3}
                value={news.excerpt}
                onChange={(e) => setNews({ ...news, excerpt: e.target.value })}
                placeholder="Ringkasan yang tampil di landing page..."
              />
            </Field>
            <Field label="Isi berita HTML *">
              <Textarea
                required
                rows={7}
                value={news.contentHtml}
                onChange={(e) => setNews({ ...news, contentHtml: e.target.value })}
                placeholder="<p>Tulis isi berita di sini...</p>"
                className="font-mono text-xs"
              />
            </Field>
            <Field label="Gambar berita *">
              <Input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setNewsImage(e.target.files?.[0] || null)}
                className="h-10 pt-2"
              />
              <span className="mt-1 text-xs font-normal">
                Gambar disimpan di bucket Supabase Storage <strong>content-assets/news</strong>.
              </span>
            </Field>
          </AdminForm>
        </div>

        <ManagedContent
          content={managedContent}
          loading={loadingContent}
          deleting={deleting}
          onDelete={deleteContent}
        />

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" /> File membutuhkan env Supabase dan sesi admin
          Supabase. Metadata tetap divalidasi oleh rules Firestore.
        </p>
      </div>
    </AppShell>
  );
}

function ManagedContent({ content, loading, deleting, onDelete }) {
  const groups = [
    { key: "courses", label: "Kursus", items: content.courses },
    { key: "training", label: "Pelatihan", items: content.training },
    { key: "news", label: "Berita", items: content.news },
    { key: "promotions", label: "Promosi usaha", items: content.promotions },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-normal">Kelola publikasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hapus kursus, pelatihan, berita, atau promosi yang sudah tidak ingin ditampilkan.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat publikasi...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {groups.map(({ key, label, items }) => (
            <Card key={key} className="border-border shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>{label}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada {label.toLowerCase()}.</p>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-2 border-border bg-secondary/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {key === "training"
                          ? item.deliveryMode === "offline"
                            ? "Offline"
                            : "Online"
                          : key === "news"
                            ? "Landing page"
                            : key === "promotions"
                              ? "Etalase komunitas"
                              : item.track || "Kursus"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label={`Hapus ${label.toLowerCase()} ${item.title}`}
                      disabled={deleting === `${key}-${item.id}`}
                      onClick={() => onDelete(key, item)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
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
