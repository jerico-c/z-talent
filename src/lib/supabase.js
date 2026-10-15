import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/firebase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        accessToken: async () => {
          if (!auth?.currentUser) return null;
          return auth.currentUser.getIdToken();
        },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
