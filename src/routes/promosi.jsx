import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MapPin, Megaphone, Plus, Store, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { useAdminAccess } from "@/lib/admin";
import { deleteTrainingAsset, uploadPromotionAsset } from "@/lib/training-assets";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/lib/user-profile";

const emptyForm = {
  name: "",
  category: "Kuliner",
  description: "",
  city: "",
  contact: "",
  link: "",
};

export const Route = createFileRoute("/promosi")({
  head: () => ({
    meta: [
      { title: "Promosi Usaha — Z UP" },
      {
        name: "description",
        content: "Temukan dan promosikan usaha anak muda di komunitas Z UP.",
      },
    ],
  }),
  component: PromosiPage,
});

function PromosiPage() {
  const { profile } = useUserProfile();
  const { isAdmin } = useAdminAccess();
  const canPost = Boolean(auth?.currentUser);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPromotions() {
      if (!supabase) {
        setError("Supabase belum dikonfigurasi.");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("promotions")
        .select("id,owner_id,name,category,description,city,contact,link,image_url,created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (queryError) {
        console.error("Gagal memuat promosi usaha", queryError);
        if (active) setError(`Promosi gagal dimuat: ${queryError.message}`);
      } else if (active) {
        setPromotions(data || []);
      }
      if (active) setLoading(false);
    }
    loadPromotions();
    return () => {
      active = false;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      return;
    }
    setImageFile(file);
  }

  function safeLink(value) {
    if (!value.trim()) return "#";
    try {
      const url = new URL(value.trim());
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "#";
    } catch {
      return "#";
    }
  }

  async function submitPromotion(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.city.trim()) return;
    if (!supabase || !auth?.currentUser) {
      setError("Sesi login atau Supabase belum siap.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const imageAsset = await uploadPromotionAsset(imageFile);
      const { data, error: insertError } = await supabase
        .from("promotions")
        .insert({
          owner_id: auth.currentUser.uid,
          name: form.name.trim(),
          category: form.category,
          description: form.description.trim(),
          city: form.city.trim(),
          contact: form.contact.trim() || "Hubungi pemilik usaha",
          link: safeLink(form.link),
          image_url: imageAsset?.url || null,
          status: "published",
        })
        .select("id,owner_id,name,category,description,city,contact,link,image_url,created_at")
        .single();
      if (insertError) throw new Error(`Posting gagal disimpan: ${insertError.message}`);
      setPromotions((current) => [data, ...current]);
      setForm(emptyForm);
      setImageFile(null);
      setShowForm(false);
    } catch (submitError) {
      console.error("Gagal menyimpan promosi usaha", submitError);
      setError(submitError.message || "Posting gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePromotion(promotion) {
    const owner = promotion.owner_id === auth?.currentUser?.uid;
    if (!owner && !isAdmin) return;
    if (!window.confirm(`Hapus posting "${promotion.name}"?`)) return;
    setDeleting(promotion.id);
    setError("");
    try {
      if (promotion.image_url) await deleteTrainingAsset(promotion.image_url);
      const { error: deleteError } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotion.id);
      if (deleteError) throw new Error(`Posting gagal dihapus: ${deleteError.message}`);
      setPromotions((current) => current.filter((item) => item.id !== promotion.id));
    } catch (deleteError) {
      console.error("Gagal menghapus promosi usaha", deleteError);
      setError(deleteError.message || "Posting gagal dihapus.");
    } finally {
      setDeleting("");
    }
  }

  return (
    <AppShell
      title="Promosi Usaha"
      subtitle="Temukan, kenalkan, dan dukung wirausaha muda di komunitas Z UP"
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-3xl bg-ink text-ink-foreground shadow-soft">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <Badge className="bg-primary text-foreground">Etalase komunitas</Badge>
              <h2 className="mt-4 max-w-2xl font-heading text-2xl font-normal sm:text-3xl">
                Usaha muda, cerita nyata, peluang baru.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                Bagikan produk atau jasamu kepada komunitas Z UP dan bantu usaha lokal saling
                menemukan pelanggan baru.
              </p>
            </div>
            <Button
              type="button"
              disabled={!canPost}
              className="w-full rounded-xl bg-primary text-ink-foreground hover:bg-primary/90 sm:w-fit"
              onClick={() => setShowForm((current) => !current)}
            >
              <Plus className="size-4" /> {canPost ? "Posting usahamu" : "Masuk untuk posting"}
            </Button>
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {showForm && (
          <Card className="border-foreground shadow-soft">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">Buat posting usaha</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Isi informasi yang ingin dilihat calon pelanggan.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setShowForm(false)}
                  aria-label="Tutup formulir"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <form onSubmit={submitPromotion} className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama usaha *">
                  <Input
                    required
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Contoh: Studio Foto Senja"
                    className="rounded-xl"
                  />
                </Field>
                <Field label="Kategori">
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option>Kuliner</option>
                    <option>Fashion</option>
                    <option>Jasa kreatif</option>
                    <option>Teknologi</option>
                    <option>Kerajinan</option>
                    <option>Pendidikan</option>
                  </select>
                </Field>
                <Field label="Kota / lokasi *">
                  <Input
                    required
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    placeholder={profile.city || "Contoh: Batam"}
                    className="rounded-xl"
                  />
                </Field>
                <Field label="Kontak pemesanan">
                  <Input
                    value={form.contact}
                    onChange={(event) => updateField("contact", event.target.value)}
                    placeholder="WhatsApp 0812..."
                    className="rounded-xl"
                  />
                </Field>
                <Field label="Link toko / media sosial">
                  <Input
                    type="url"
                    value={form.link}
                    onChange={(event) => updateField("link", event.target.value)}
                    placeholder="https://instagram.com/usahamu"
                    className="rounded-xl"
                  />
                </Field>
                <Field label="Gambar usaha (maks. 2 MB)">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImage}
                    className="h-auto rounded-xl py-2 text-xs"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Detail usaha *">
                    <Textarea
                      required
                      value={form.description}
                      onChange={(event) => updateField("description", event.target.value)}
                      placeholder="Jelaskan produk, layanan, keunggulan, atau cara pemesanan..."
                      rows={4}
                      className="rounded-xl"
                    />
                  </Field>
                </div>
                {imageFile && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Gambar dipilih: {imageFile.name}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-ink text-ink-foreground hover:bg-raven"
                  >
                    {saving ? "Menyimpan..." : "Terbitkan posting"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Usaha dari komunitas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Dukung karya dan bisnis anak muda.</p>
          </div>
          <span className="text-sm text-muted-foreground">{promotions.length} usaha</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-muted-foreground">Memuat posting usaha...</p>}
          {!loading && promotions.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada posting usaha dari komunitas.</p>
          )}
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="group overflow-hidden border-border shadow-soft">
              {promotion.image_url ? (
                <img
                  src={promotion.image_url}
                  alt={promotion.name}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="grid h-44 place-items-center bg-primary/10 text-primary">
                  <Store className="size-12 stroke-1" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug">{promotion.name}</h3>
                  <Badge variant="secondary" className="shrink-0 bg-primary-soft text-foreground">
                    {promotion.category}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {promotion.description}
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {promotion.city}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Megaphone className="size-3.5" />
                    {promotion.contact}
                  </p>
                </div>
                {promotion.link !== "#" && (
                  <a
                    href={promotion.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Lihat detail <ExternalLink className="size-3.5" />
                  </a>
                )}
                {(promotion.owner_id === auth?.currentUser?.uid || isAdmin) && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-4 rounded-xl"
                    disabled={deleting === promotion.id}
                    onClick={() => deletePromotion(promotion)}
                  >
                    {deleting === promotion.id ? "Menghapus..." : "Hapus posting"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
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
