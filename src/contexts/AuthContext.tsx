import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth dev: enquanto `VITE_USE_MOCK` != "false", o login é LOCAL (sem Supabase) —
 * qualquer e-mail + senha de 4+ chars entra, e a sessão persiste no localStorage.
 * Serve pra testar a UI/mocks sem backend. Quando `VITE_USE_MOCK=false`, usa o
 * Supabase Auth real (signup/signin de verdade).
 */
const MOCK_AUTH = import.meta.env.VITE_USE_MOCK !== "false";
const MOCK_KEY = "tc-mock-session";

function makeMockSession(email: string): Session {
  const user = {
    id: "mock-" + (email.replace(/[^a-z0-9]/gi, "").slice(0, 24) || "user"),
    aud: "authenticated",
    role: "authenticated",
    email,
    app_metadata: { provider: "mock" },
    user_metadata: { name: email.split("@")[0] },
    created_at: new Date().toISOString(),
  } as unknown as User;
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  } as unknown as Session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH) {
      const raw = localStorage.getItem(MOCK_KEY);
      if (raw) {
        try {
          const s = JSON.parse(raw) as Session;
          setSession(s);
          setUser(s.user ?? null);
        } catch {
          localStorage.removeItem(MOCK_KEY);
        }
      }
      setLoading(false);
      return;
    }

    // ── Supabase real ──
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (MOCK_AUTH) {
      if (!email.trim() || password.length < 4) {
        return { error: new Error("Informe um e-mail e uma senha de 4+ caracteres.") };
      }
      const s = makeMockSession(email.trim());
      localStorage.setItem(MOCK_KEY, JSON.stringify(s));
      setSession(s);
      setUser(s.user);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    if (MOCK_AUTH) {
      // Em dev não há cadastro real: cai direto no login local.
      return signIn(email, password);
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL}/` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (MOCK_AUTH) {
      localStorage.removeItem(MOCK_KEY);
      setSession(null);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
