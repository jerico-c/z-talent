import { onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export function useAdminAccess() {
  const [state, setState] = useState({ loading: Boolean(auth), isAdmin: false });

  useEffect(() => {
    if (!auth) {
      setState({ loading: false, isAdmin: false });
      return undefined;
    }

    return onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, isAdmin: false });
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        setState({ loading: false, isAdmin: token.claims.admin === true });
      } catch (error) {
        console.error("Gagal memeriksa akses admin", error);
        setState({ loading: false, isAdmin: false });
      }
    });
  }, []);

  return state;
}
