import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { currentUser, onAuthChange, signOut as localSignOut, type LocalUser } from "@/lib/localAccounts";

const AuthContext = createContext<{ user: LocalUser | null; ready: boolean; signOut: () => Promise<void> }>({ user: null, ready: false, signOut: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient(); const router = useRouter(); const navigate = useNavigate();
  useEffect(() => {
    const sync = () => { setUser(currentUser()); setReady(true); void router.invalidate(); void queryClient.invalidateQueries(); };
    setUser(currentUser()); setReady(true);
    return onAuthChange(sync);
  }, [router, queryClient]);
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await localSignOut(); await navigate({ to: "/auth", replace: true }); };
  return <AuthContext.Provider value={{ user, ready, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
