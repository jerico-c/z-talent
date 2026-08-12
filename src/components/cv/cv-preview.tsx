/**
 * Pratinjau CV — satu renderer yang mendukung 6 tata letak,
 * dipakai oleh 12 template (lihat cvTemplates di src/lib/cv-data.ts).
 *
 * Kelas warna sengaja memakai nilai inline dari template karena bagian ini
 * adalah dokumen cetak (kertas putih), bukan bagian tema aplikasi.
 */

import { formatMonth, splitList, type CvData, type CvTemplate } from "@/lib/cv-data";

type Props = { cv: CvData; template: CvTemplate; accent: string };

function Heading({ children, t, accent }: { children: string; t: CvTemplate; accent: string }) {
  return (
    <h3
      className={`mt-4 text-[11px] font-bold tracking-[0.14em] ${t.uppercaseHeading ? "uppercase" : "tracking-normal text-[12px]"} ${
        t.ruled ? "border-b pb-1" : ""
      }`}
      style={{ color: accent, borderColor: `${accent}44` }}
    >
      {children}
    </h3>
  );
}

function Bullets({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10.5px] leading-relaxed text-slate-700">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

function Chips({ items, accent }: { items: string[]; accent: string }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {items.map((s) => (
        <span
          key={s}
          className="rounded border px-1.5 py-0.5 text-[9.5px] font-medium text-slate-700"
          style={{ borderColor: `${accent}55`, background: `${accent}0f` }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function CvPreview({ cv, template, accent }: Props) {
  const { personal, experience, education, skills, additional } = cv;
  const t = template;
  const fontFamily = t.font === "serif" ? "Georgia, 'Times New Roman', serif" : "Inter, system-ui, sans-serif";

  const contacts = [personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean);

  const ExperienceBlock = (
    <section>
      <Heading t={t} accent={accent}>
        Pengalaman
      </Heading>
      {experience.length === 0 && <p className="mt-1 text-[10.5px] text-slate-400">Belum ada pengalaman.</p>}
      <div className={t.layout === "timeline" ? "mt-2 space-y-3 border-l pl-3" : "mt-2 space-y-3"} style={t.layout === "timeline" ? { borderColor: `${accent}55` } : undefined}>
        {experience.map((e) => (
          <article key={e.id} className="relative">
            {t.layout === "timeline" && (
              <span className="absolute -left-[17px] top-1 size-2 rounded-full" style={{ background: accent }} />
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <p className="text-[11.5px] font-bold text-slate-900">{e.title || "Posisi"}</p>
              <p className="text-[10px] text-slate-500">
                {formatMonth(e.startDate, "—")} – {formatMonth(e.endDate)}
              </p>
            </div>
            <p className="text-[10.5px] font-medium" style={{ color: accent }}>
              {e.company}
            </p>
            <Bullets text={e.description} />
          </article>
        ))}
      </div>
    </section>
  );

  const EducationBlock = (
    <section>
      <Heading t={t} accent={accent}>
        Pendidikan
      </Heading>
      <div className="mt-2 space-y-2">
        {education.map((e) => (
          <div key={e.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <p className="text-[11px] font-bold text-slate-900">{e.degree || "Program studi"}</p>
              <p className="text-[10px] text-slate-500">
                {formatMonth(e.startDate, "—")} – {formatMonth(e.endDate, "Sekarang")}
              </p>
            </div>
            <p className="text-[10.5px] text-slate-600">{e.school}</p>
            {e.description && <p className="text-[10px] text-slate-600">{e.description}</p>}
          </div>
        ))}
        {education.length === 0 && <p className="text-[10.5px] text-slate-400">Belum ada pendidikan.</p>}
      </div>
    </section>
  );

  const SkillsBlock = (
    <section>
      <Heading t={t} accent={accent}>
        Keterampilan
      </Heading>
      {skills.technical && <Chips items={splitList(skills.technical)} accent={accent} />}
      {skills.soft && <p className="mt-1.5 text-[10.5px] text-slate-700">Personal: {skills.soft}</p>}
      {skills.languages && <p className="text-[10.5px] text-slate-700">Bahasa: {skills.languages}</p>}
    </section>
  );

  const AdditionalBlock = (
    <section>
      {additional.certifications && (
        <>
          <Heading t={t} accent={accent}>
            Sertifikat & Mikro-kredensial
          </Heading>
          <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{additional.certifications}</p>
        </>
      )}
      {additional.projects && (
        <>
          <Heading t={t} accent={accent}>
            Proyek
          </Heading>
          <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{additional.projects}</p>
        </>
      )}
      {additional.awards && (
        <>
          <Heading t={t} accent={accent}>
            Penghargaan
          </Heading>
          <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{additional.awards}</p>
        </>
      )}
      {additional.volunteer && (
        <>
          <Heading t={t} accent={accent}>
            Relawan
          </Heading>
          <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{additional.volunteer}</p>
        </>
      )}
    </section>
  );

  const SummaryBlock = personal.summary ? (
    <section>
      <Heading t={t} accent={accent}>
        Ringkasan Profesional
      </Heading>
      <p className="mt-1 text-[10.5px] leading-relaxed text-slate-700">{personal.summary}</p>
    </section>
  ) : null;

  /** Kepala dokumen — bervariasi per tata letak. */
  const Header = (
    <header
      className={
        t.layout === "band"
          ? "-mx-8 -mt-8 mb-4 px-8 py-6 text-white"
          : t.layout === "compact"
            ? "mb-2"
            : "mb-3 pb-3"
      }
      style={
        t.layout === "band"
          ? { background: accent }
          : t.ruled
            ? { borderBottom: `2px solid ${accent}` }
            : undefined
      }
    >
      <h2
        className={`text-[19px] font-extrabold leading-tight ${t.layout === "band" ? "text-white" : "text-slate-900"}`}
      >
        {personal.fullName || "Nama Lengkap"}
      </h2>
      <p
        className="text-[11.5px] font-semibold"
        style={{ color: t.layout === "band" ? "rgba(255,255,255,0.9)" : accent }}
      >
        {personal.jobTitle || "Posisi yang dituju"}
      </p>
      <p className={`mt-1 text-[10px] ${t.layout === "band" ? "text-white/85" : "text-slate-600"}`}>
        {contacts.join(" · ")}
      </p>
    </header>
  );

  return (
    <div
      id="cv-print-area"
      className="mx-auto w-full max-w-[820px] bg-white p-8 text-slate-900 shadow-lift print:max-w-none print:shadow-none"
      style={{ fontFamily, aspectRatio: "auto" }}
    >
      {Header}

      {t.layout === "sidebar" ? (
        <div className="grid grid-cols-[minmax(0,1fr)_11rem] gap-6">
          <div className="min-w-0">
            {SummaryBlock}
            {ExperienceBlock}
            {EducationBlock}
          </div>
          <div className="min-w-0 rounded-lg p-3" style={{ background: `${accent}0f` }}>
            {SkillsBlock}
            {AdditionalBlock}
          </div>
        </div>
      ) : t.layout === "split" ? (
        <div className="space-y-1">
          {SummaryBlock}
          {SkillsBlock}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="min-w-0">{ExperienceBlock}</div>
            <div className="min-w-0">
              {EducationBlock}
              {AdditionalBlock}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {SummaryBlock}
          {ExperienceBlock}
          {SkillsBlock}
          {EducationBlock}
          {AdditionalBlock}
        </div>
      )}
    </div>
  );
}
