import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/html",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadTrainingAsset(file, folder = "training") {
  if (!file) return null;
  if (!supabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.",
    );
  }
  if (!auth?.currentUser) {
    throw new Error("Sesi login belum siap. Muat ulang halaman setelah login sebagai admin.");
  }
  const tokenResult = await auth.currentUser.getIdTokenResult();
  if (tokenResult.claims.admin !== true) {
    throw new Error("Akun ini belum memiliki akses admin untuk mengunggah aset.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Format file harus PDF, HTML, JPG, PNG, atau WEBP.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 15 MB.");
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("content-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`Upload aset gagal: ${uploadError.message}`);

  const { data } = supabase.storage.from("content-assets").getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}
