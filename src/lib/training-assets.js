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

function getUploadContentType(file) {
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "html" || extension === "htm") return "text/html";
  if (extension === "pdf") return "application/pdf";
  return file.type;
}

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
  const contentType = getUploadContentType(file);
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error("Format file harus PDF, HTML, JPG, PNG, atau WEBP.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 15 MB.");
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("content-assets")
    .upload(path, file, { contentType, upsert: false });
  if (uploadError) throw new Error(`Upload aset gagal: ${uploadError.message}`);

  const { data } = supabase.storage.from("content-assets").getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
    name: file.name,
    type: contentType,
    size: file.size,
  };
}

export async function deleteTrainingAsset(publicUrl) {
  if (!publicUrl || !supabase) return;
  const marker = "/storage/v1/object/public/content-assets/";
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return;
  const path = decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  const { error } = await supabase.storage.from("content-assets").remove([path]);
  if (error) throw new Error(`Aset gagal dihapus: ${error.message}`);
}

export async function uploadPromotionAsset(file) {
  if (!file) return null;
  if (!supabase || !auth?.currentUser) {
    throw new Error("Sesi login atau Supabase belum siap.");
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Gambar harus berformat JPG, PNG, atau WEBP.");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `promotions/${auth.currentUser.uid}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from("content-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload gambar gagal: ${error.message}`);

  const { data } = supabase.storage.from("content-assets").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
