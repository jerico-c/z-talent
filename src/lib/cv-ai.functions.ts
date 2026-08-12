/**
 * Asisten AI CV — memakai Groq API (gratis) lewat server function,
 * sehingga kunci API tidak pernah ikut ke bundel browser.
 *
 * Diadaptasi dari modul ai.js proyek Craftez My Resume.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "llama-3.3-70b-versatile";

const inputSchema = z.object({
  action: z.enum(["summary", "bullets", "autofill"]),
  /** Konteks bebas: posisi yang dituju, satu baris tentang diri, atau isi poin pengalaman. */
  context: z.string().min(3).max(4000),
  jobTitle: z.string().max(200).optional(),
});

const prompts = {
  summary: (ctx: string, title?: string) =>
    `Tulis SATU ringkasan profesional CV dalam Bahasa Indonesia untuk posisi "${title || "yang relevan"}".
Konteks kandidat: ${ctx}
Aturan: 40-90 kata, tanpa kata "saya", awali dengan peran/keahlian, sertakan minimal satu angka atau hasil terukur, ramah ATS.
Kembalikan JSON: {"summary":"..."}`,
  bullets: (ctx: string, title?: string) =>
    `Ubah deskripsi pekerjaan berikut menjadi 4 poin pencapaian CV Bahasa Indonesia untuk posisi "${title || "tersebut"}".
Deskripsi asli: ${ctx}
Aturan: setiap poin mulai kata kerja aktif (Memimpin, Membangun, Meningkatkan, ...), maksimal 20 kata, minimal 2 poin memuat angka/persentase, ramah ATS.
Kembalikan JSON: {"bullets":["...","...","...","..."]}`,
  autofill: (ctx: string) =>
    `Buat draf isi CV Bahasa Indonesia dari deskripsi singkat kandidat berikut: ${ctx}
Kembalikan JSON dengan bentuk persis:
{"jobTitle":"...","summary":"...","technical":"minimal 8 keahlian dipisah koma","soft":"4 keahlian personal dipisah koma","languages":"...","projects":"1-2 proyek beserta hasil terukur","certifications":"..."}
Aturan: realistis, ramah ATS, tanpa kata "saya", sertakan angka terukur pada summary dan projects.`,
} as const;

/** POST /api/v1/cv/ai — menghasilkan teks CV memakai Groq. */
export const generateCvText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "Kunci Groq API belum dipasang.", json: "" };
    }

    const prompt =
      data.action === "autofill"
        ? prompts.autofill(data.context)
        : prompts[data.action](data.context, data.jobTitle);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Kamu penulis CV profesional Indonesia. Keluarkan HANYA objek JSON valid, tanpa teks tambahan. Setiap hasil harus segar dan tidak menyalin contoh.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { ok: false as const, error: `Groq menolak permintaan (${res.status}). ${detail.slice(0, 200)}`, json: "" };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";

    try {
      JSON.parse(content);
    } catch {
      return { ok: false as const, error: "Jawaban AI tidak berformat JSON.", json: "" };
    }

    /** JSON dikirim sebagai string agar aman diserialisasi lintas jaringan. */
    return { ok: true as const, error: "", json: content };
  });
