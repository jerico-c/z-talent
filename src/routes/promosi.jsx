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
import { useUserProfile } from "@/lib/user-profile";

const STORAGE_KEY = "ztalent-promotions-v2";
const emptyForm = {
  name: "",
  category: "Kuliner",
  description: "",
  city: "",
  contact: "",
  link: "",
  image: "",
};
const samplePromotions = [
  {
    id: "sample-kopi",
    name: "Kopi Lereng Magelang",
    category: "Kuliner",
    description: "Kopi lokal dengan biji pilihan dari petani lereng Sumbing.",
    city: "Magelang",
    contact: "WhatsApp tersedia",
    link: "#",
    image: "",
  },
  {
    id: "sample-ruang-karya",
    name: "Ruang Karya Muda",
    category: "Jasa kreatif",
    description: "Desain konten dan branding untuk bisnis lokal yang ingin naik kelas.",
    city: "Yogyakarta",
    contact: "Konsultasi gratis",
    link: "#",
    image: "",
  },
];

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
  const canPost = Boolean(auth?.currentUser);
  const storageKey = `${STORAGE_KEY}:${auth?.currentUser?.uid || "guest"}`;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [promotions, setPromotions] = useState([]);
  const [loadedStorageKey, setLoadedStorageKey] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setPromotions(Array.isArray(saved) ? saved : []);
      setLoadedStorageKey(storageKey);
    } catch {
      setPromotions([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(promotions));
    }
  }, [loadedStorageKey, promotions, storageKey]);

  const allPromotions = [...promotions, ...samplePromotions];

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
    const reader = new FileReader();
    reader.onload = () => updateField("image", String(reader.result));
    reader.readAsDataURL(file);
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

  function submitPromotion(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.city.trim()) return;
    setPromotions((current) => [
      {
        ...form,
        id: `${Date.now()}-${form.name}`,
        name: form.name.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        contact: form.contact.trim() || "Hubungi pemilik usaha",
        link: safeLink(form.link),
      },
      ...current,
    ]);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <AppShell
      title="Promosi Usaha"
      subtitle="Temukan, kenalkan, dan dukung wirausaha muda di komunitas Z UP"
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-soft">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <Badge className="bg-orange-400 text-slate-950">Etalase komunitas</Badge>
              <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                Usaha muda, cerita nyata, peluang baru.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                Bagikan produk atau jasamu kepada komunitas Z UP dan bantu usaha lokal saling
                menemukan pelanggan baru.
              </p>
            </div>
            <Button
              type="button"
              disabled={!canPost}
              className="w-full rounded-xl bg-orange-500 text-white hover:bg-orange-600 sm:w-fit"
              onClick={() => setShowForm((current) => !current)}
            >
              <Plus className="size-4" /> {canPost ? "Posting usahamu" : "Masuk untuk posting"}
            </Button>
          </div>
        </section>

        {showForm && (
          <Card className="border-orange-200 shadow-soft">
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
                {form.image && (
                  <div className="sm:col-span-2">
                    <img
                      src={form.image}
                      alt="Pratinjau gambar usaha"
                      className="h-40 w-full rounded-2xl object-cover sm:w-64"
                    />
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
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Terbitkan posting
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
          <span className="text-sm text-muted-foreground">{allPromotions.length} usaha</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allPromotions.map((promotion) => (
            <Card key={promotion.id} className="group overflow-hidden border-border shadow-soft">
              {promotion.image ? (
                <img
                  src={promotion.image}
                  alt={promotion.name}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="grid h-44 place-items-center bg-orange-50 text-orange-500">
                  <Store className="size-12 stroke-1" />
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug">{promotion.name}</h3>
                  <Badge variant="secondary" className="shrink-0 bg-orange-100 text-orange-800">
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
