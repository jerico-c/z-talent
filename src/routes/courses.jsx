import { createFileRoute } from "@tanstack/react-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, ExternalLink, FileCode2, FileText, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { certificates } from "@/lib/api";
import { completeCourse, useUserProfile } from "@/lib/user-profile";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Kursus Vokasi & Mikro-kredensial — Z UP" },
      {
        name: "description",
        content:
          "Kursus vokasi singkat dengan mikro-kredensial terverifikasi blockchain yang bisa dicek perusahaan.",
      },
      { property: "og:title", content: "LMS Vokasi & Mikro-kredensial" },
      {
        property: "og:description",
        content: "Kursus sesuai kebutuhan kerja dengan sertifikat yang bisa diverifikasi.",
      },
    ],
  }),
  component: CoursesPage,
});
/** Gaya badge level tetap memakai token design system. */
const levelStyles = {
  Pemula: "bg-accent-soft text-accent-foreground",
  Menengah: "bg-primary-soft text-primary",
  Lanjutan: "bg-secondary text-secondary-foreground",
};
function CoursesPage() {
  const { profile } = useUserProfile();
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [managedCourses, setManagedCourses] = useState([]);
  const [trainingInfos, setTrainingInfos] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    const stopTraining = onSnapshot(
      collection(db, "training"),
      (snapshot) =>
        setTrainingInfos(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (snapshotError) => console.error("Gagal memuat info pelatihan", snapshotError),
    );
    return () => {
      stopTraining();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase
      .from("courses")
      .select(
        "id,title,provider,description,content_type,content_html,content_url,cover_image_url,status",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          console.error("Gagal memuat kursus Supabase", queryError);
          return;
        }
        if (active) {
          setManagedCourses(
            (data || []).map((course) => ({
              ...course,
              contentType: course.content_type,
              contentHtml: course.content_html,
              contentUrl: course.content_url,
              coverImageUrl: course.cover_image_url,
              deliveryMode: "online",
              level: "Pemula",
              track: course.provider,
              hours: "Mandiri",
              points: 100,
              verified: false,
            })),
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const availableCourses = managedCourses;
  const onlineTrainings = trainingInfos.filter((training) => training.deliveryMode !== "offline");
  const offlineTrainings = trainingInfos.filter((training) => training.deliveryMode === "offline");

  const handleComplete = async (course) => {
    setSavingId(course.id);
    setError("");
    try {
      await completeCourse(course);
    } catch (completionError) {
      console.error(completionError);
      setError(completionError.message || "Kursus belum bisa diselesaikan.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <AppShell title="Kursus & Mikro-kredensial" subtitle="Pilar 2 · pembelajaran berbasis vokasi">
      <div className="grid gap-8">
        <section>
          <h2 className="text-lg font-bold tracking-tight">Kursus tersedia</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kursus dan pelatihan online dari admin untuk mengumpulkan poin dan naik level.
          </p>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {availableCourses.length === 0 && onlineTrainings.length === 0 && (
              <EmptyState message="Belum ada kursus atau pelatihan online yang dipublikasikan." />
            )}
            {availableCourses.map((course) => (
              <TrainingCard
                key={course.id}
                training={course}
                completed={profile.completedCourses.includes(course.id)}
                busy={savingId === course.id}
                onComplete={() => handleComplete(course)}
              />
            ))}
            {onlineTrainings.map((training) => (
              <TrainingCard
                key={training.id}
                training={training}
                completed={profile.completedCourses.includes(training.id)}
                busy={savingId === training.id}
                onComplete={() => handleComplete(training)}
              />
            ))}
          </div>
        </section>

        {offlineTrainings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold tracking-tight">Pelatihan offline</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jadwal tatap muka dan informasi lokasi dari admin.
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offlineTrainings.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  completed={profile.completedCourses.includes(training.id)}
                  busy={savingId === training.id}
                  onComplete={() => handleComplete(training)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold tracking-tight">Sertifikat saya</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.title} className="card-interactive border-border bg-card shadow-soft">
                <CardContent className="p-5">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <BadgeCheck className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{cert.title}</p>
                      <p className="text-xs text-muted-foreground">Diterbitkan {cert.issued}</p>
                    </div>
                  </div>
                  <p className="mt-4 truncate rounded-xl bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
                    {cert.hash}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function TrainingCard({ training, completed, busy, onComplete }) {
  const contentUrl = safeExternalUrl(training.contentUrl);
  const registrationUrl = safeExternalUrl(training.registrationUrl || training.link);

  return (
    <Card className="card-interactive border-border shadow-soft">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {training.deliveryMode === "offline" ? "Tatap muka" : "Online"}
          </Badge>
          {training.contentType && (
            <Badge variant="outline">
              {training.contentType === "manual" ? "Artikel" : training.contentType.toUpperCase()}
            </Badge>
          )}
        </div>
        {training.coverImageUrl && (
          <img
            src={training.coverImageUrl}
            alt=""
            className="h-36 w-full rounded-xl object-cover"
            loading="lazy"
          />
        )}
        <h3 className="font-bold leading-snug">{training.title}</h3>
        <p className="text-xs font-semibold text-primary">{training.provider}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{training.description}</p>
        {(training.startsAt || training.schedule) && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
            {training.schedule || formatSchedule(training.startsAt, training.endsAt)}
          </p>
        )}
        {training.venue && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {training.venue}
              {training.address && ` · ${training.address}`}
            </span>
          </p>
        )}
        {training.capacity && (
          <p className="text-xs text-muted-foreground">Kapasitas {training.capacity} peserta</p>
        )}
        {training.contentType === "manual" && training.contentHtml && (
          <div className="rounded-xl bg-muted p-3 text-sm leading-relaxed">
            <div
              className="training-content line-clamp-4"
              dangerouslySetInnerHTML={{ __html: sanitizeTrainingHtml(training.contentHtml) }}
            />
          </div>
        )}
        {training.contentType === "pdf" && contentUrl && (
          <a
            href={contentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <FileText className="size-4" /> Buka materi PDF
          </a>
        )}
        {training.contentType === "html" && contentUrl && (
          <div className="space-y-2">
            <HtmlTrainingViewer url={contentUrl} title={training.title} />
            <button
              type="button"
              onClick={() => openHtmlInNewTab(contentUrl)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <FileCode2 className="size-4" /> Buka materi HTML penuh
            </button>
          </div>
        )}
        {registrationUrl && (
          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="size-4" /> Daftar pelatihan
          </a>
        )}
        {completed ? (
          <Button disabled variant="secondary" className="w-full rounded-xl">
            Selesai · +{training.points || 100} poin
          </Button>
        ) : (
          <Button type="button" className="w-full rounded-xl" disabled={busy} onClick={onComplete}>
            {busy ? "Menyimpan..." : `Tandai selesai · +${training.points || 100} poin`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function HtmlTrainingViewer({ url, title }) {
  const [html, setHtml] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    setHtml("");
    setLoadError("");

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (active) setHtml(addBaseUrl(content, url));
      })
      .catch((error) => {
        console.error("Gagal merender materi HTML", error);
        if (active) setLoadError("Materi tidak dapat dirender di halaman ini.");
      });

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-border bg-white">
      {loadError ? (
        <p className="p-4 text-sm text-destructive">{loadError}</p>
      ) : html ? (
        <iframe
          srcDoc={html}
          title={`Materi ${title}`}
          sandbox="allow-scripts"
          className="h-72 w-full border-0"
        />
      ) : (
        <p className="p-4 text-sm text-muted-foreground">Memuat materi HTML...</p>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <Card className="border-dashed shadow-none sm:col-span-2 xl:col-span-3">
      <CardContent className="p-6 text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

function addBaseUrl(html, url) {
  const base = `<base href="${url.replace(/"/g, "&quot;")}">`;
  return /<head[\s>]/i.test(html)
    ? html.replace(/<head[^>]*>/i, (head) => `${head}${base}`)
    : `<!doctype html><html><head>${base}</head><body>${html}</body></html>`;
}

function openHtmlInNewTab(url) {
  const tab = window.open("", "_blank");
  if (!tab) {
    console.error("Browser memblokir tab baru untuk materi HTML");
    return;
  }
  tab.document.write('<p style="font-family: sans-serif">Memuat materi...</p>');
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      tab.document.open();
      tab.document.write(addBaseUrl(html, url));
      tab.document.close();
    })
    .catch((error) => {
      console.error("Gagal membuka materi HTML", error);
      tab.document.body.innerHTML =
        '<p style="font-family: sans-serif">Materi HTML tidak dapat dibuka.</p>';
    });
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

function sanitizeTrainingHtml(value) {
  return String(value)
    .replace(/<\/?(script|style|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\s(on[a-z]+|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, (attribute) =>
      /javascript\s*:/i.test(attribute) ? "" : attribute,
    );
}

function formatSchedule(startsAt, endsAt) {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return startsAt;
  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return endsAt
    ? `${formatter.format(start)} – ${formatter.format(new Date(endsAt))}`
    : formatter.format(start);
}
