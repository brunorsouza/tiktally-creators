import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, User, Zap, Package, Music2,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { title: string; sub: string; cta: string; busy: string }> = {
  signin: {
    title: "Bem-vindo de volta",
    sub: "Suas vendas de hoje já estão esperando.",
    cta: "Entrar",
    busy: "Entrando...",
  },
  signup: {
    title: "Comece em dois minutos",
    sub: "Depois é só conectar sua conta do TikTok Shop.",
    cta: "Criar minha conta",
    busy: "Criando conta...",
  },
};

const POINTS = [
  { icon: Zap, label: "Cada venda aparece em segundos, não no dia seguinte." },
  { icon: Package, label: "Amostras, vitrine e links no mesmo lugar." },
  { icon: Lock, label: "Conexão oficial com o TikTok Shop, sem senha compartilhada." },
];

const MIN_PASSWORD = 8;

/** Traduz os erros mais comuns do Supabase Auth — a mensagem crua é em inglês. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Esse e-mail já tem conta. Tente entrar.";
  }
  if (m.includes("password should be at least")) {
    return `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  }
  return message;
}

/** Campo com ícone à esquerda — o formato do DS. */
function Field({
  id,
  label,
  icon: Icon,
  hint,
  trailing,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: typeof Mail;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-3 transition-colors focus-within:border-primary">
        <Icon className="h-[18px] w-[18px] shrink-0 text-faint" />
        <input
          id={id}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
          {...props}
        />
        {trailing}
      </div>
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // A aba vive na URL: /auth?modo=cadastro é linkável e sobrevive ao refresh.
  const mode: Mode = params.get("modo") === "cadastro" ? "signup" : "signin";
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trocar de aba limpa o erro da aba anterior — ele não se aplica mais.
  useEffect(() => setError(null), [mode]);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password) return false;
    if (mode === "signup") return !!name.trim() && password.length >= MIN_PASSWORD;
    return true;
  }, [mode, name, email, password]);

  if (user) return <Navigate to="/" replace />;

  const setMode = (next: Mode) => {
    const p = new URLSearchParams(params);
    if (next === "signup") p.set("modo", "cadastro");
    else p.delete("modo");
    setParams(p, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !canSubmit) return;

    setBusy(true);
    setError(null);
    const { error: err } =
      mode === "signin"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name);
    setBusy(false);

    if (err) {
      setError(friendlyError(err.message));
      return;
    }
    if (mode === "signup") {
      toast.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativa.");
    }
    navigate("/");
  };

  return (
    <div className="bg-paper flex min-h-screen flex-wrap">
      {/* ── Painel da marca — vira o topo no mobile ── */}
      <section className="flex min-w-[340px] flex-[1.15] flex-col justify-between gap-10 border-b bg-panel px-7 py-10 md:border-b-0 md:border-r lg:px-[60px] lg:py-14">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <span className="font-display text-lg font-extrabold tracking-tight">
            TikTally <span className="text-primary">Creator</span>
          </span>
        </div>

        <div className="max-w-[480px]">
          <h1 className="text-balance font-display text-[34px] font-extrabold leading-[1.08] tracking-tight lg:text-[44px]">
            Todo o seu dinheiro do TikTok Shop em uma tela só.
          </h1>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Comissão, pedidos, amostras e vídeos juntos. Sem planilha, sem abrir cinco abas para
            saber quanto entrou hoje.
          </p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg border text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[15px] text-muted-foreground">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex max-w-[440px] items-center gap-3.5 rounded-lg bg-ink px-5 py-4 text-ink-foreground">
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
          <p className="text-[13.5px] leading-snug opacity-75">
            Leitura via API oficial do TikTok Shop. Seu token fica no servidor, nunca no navegador.
          </p>
        </div>
      </section>

      {/* ── Formulário ── */}
      <section className="grid min-w-[340px] flex-1 place-items-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-[400px]">
          {/* Abas Entrar / Criar conta */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-secondary p-1" role="tablist">
            {(["signin", "signup"] as const).map((m) => {
              const on = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-[14.5px] font-semibold transition-colors",
                    on ? "bg-card text-foreground shadow-sm" : "text-faint hover:text-foreground"
                  )}
                >
                  {m === "signin" ? "Entrar" : "Criar conta"}
                </button>
              );
            })}
          </div>

          <h2 className="font-display text-[26px] font-extrabold tracking-tight">{copy.title}</h2>
          <p className="mb-6 mt-2 text-[14.5px] leading-relaxed text-faint">{copy.sub}</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <Field
                id="name"
                label="Nome"
                icon={User}
                type="text"
                autoComplete="name"
                placeholder="Como as lojas vão te ver"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <Field
              id="email"
              label="E-mail"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Field
              id="password"
              label="Senha"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={mode === "signin" ? "Sua senha" : `mínimo de ${MIN_PASSWORD} caracteres`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={
                mode === "signup" && password && password.length < MIN_PASSWORD
                  ? `Faltam ${MIN_PASSWORD - password.length} caracteres.`
                  : undefined
              }
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="shrink-0 text-faint transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              }
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                <span className="min-w-0">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !canSubmit}
              className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-[15.5px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? copy.busy : copy.cta}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3.5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12.5px] text-faint">e depois</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Não é login social: o TikTok Shop é conectado DEPOIS, já autenticado. */}
          <div className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3.5">
            <Music2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Você conecta sua conta do TikTok Shop pelo login oficial deles, direto no app. Leva um
              clique e não pede sua senha.
            </p>
          </div>

          <p className="mt-6 text-center text-[12.5px] leading-relaxed text-faint">
            Ao continuar você aceita os termos de uso e a política de privacidade do TikTally.
          </p>
        </div>
      </section>
    </div>
  );
}
