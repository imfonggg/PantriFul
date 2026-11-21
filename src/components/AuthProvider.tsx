import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext<{ user: User | null; ready: boolean; signOut: () => Promise<void> }>({ user: null, ready: false, signOut: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient(); const router = useRouter(); const navigate = useNavigate();
  useEffect(() => {
    let alive = true;
    // If Supabase isn't configured (e.g. a deploy without its env vars), keep
    // the food finder working and just treat everyone as signed out.
    let auth: typeof supabase.auth;
    try { auth = supabase.auth; } catch { setReady(true); return; }
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null); setReady(true);
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
        void router.invalidate();
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      }
    });
    void auth.getUser().then(({ data }) => { if (alive) { setUser(data.user); setReady(true); } });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [router, queryClient]);
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  return <AuthContext.Provider value={{ user, ready, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
