import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Mail, MessageCircle, User } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { captureLead } from "@/services/leads";

/**
 * FeiraPage — `/feira`, a página pública de captura de lead.
 *
 * Destino do QR Code do banner de estande. Quem escaneia deixa nome, WhatsApp e
 * e-mail; o registro vai para `pricing_leads` no Supabase do CREATOR, pela edge
 * `capture-lead`, e aparece na tela de Leads do backoffice creator.
 *
 * ## Por que não mostra preço
 * O plano `pro` do creator está no banco com os valores herdados do seller, e a
 * própria migration os marca como provisórios. Anunciar um número que ainda vai
 * mudar é pior do que não anunciar nenhum: quem escaneou guarda o valor que
 * viu. A página captura o contato e diz o que acontece depois.
 *
 * ## Público
 * Esta é a única rota pública além de `/auth`. Nada aqui depende de sessão, e
 * ela não deve ganhar dependência de sessão: quem chega pelo QR não tem conta.
 *
 * ## Lista de espera, não cadastro
 * O produto ainda não abriu. A página diz isso na cara, coleta o contato para
 * avisar no lançamento e NÃO oferece criar conta: mandar alguém para um
 * cadastro de um produto que ainda não entrega o que o material prometeu
 * queima o lead no primeiro contato. Quando abrir, é aqui que o CTA volta.
 */

const MIN_WHATSAPP_DIGITOS = 10;

/** Máscara de telefone BR: (XX) XXXXX-XXXX */
function formatPhone(value: string): string {
  const n = value.replace(/\D/g, "");
  if (n.length <= 2) return n.length ? `(${n}` : "";
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
}

const PROVAS = [
  "Comissão liquidada e pendente, pedido por pedido",
  "Quanto cada vídeo e cada live rendeu de verdade",
  "Amostras, vitrine e links de afiliado no mesmo lugar",
];

/** Campo do formulário. 52px de altura: alvo de toque confortável no celular. */
function Campo({
  id,
  label,
  icon: Icon,
  erro,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: typeof Mail;
  erro?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-semibold text-muted-foreground">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-3.5 transition-colors focus-within:border-primary ${
          erro ? "border-destructive" : ""
        }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-faint" />
        <input id={id} className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-faint" {...props} />
      </div>
      {erro && <p className="mt-1.5 text-xs text-destructive">{erro}</p>}
    </div>
  );
}

export default function FeiraPage() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<{ nome?: string; whatsapp?: string; email?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const validar = () => {
    const e: typeof erros = {};
    if (nome.trim().length < 2) e.nome = "Escreva seu nome.";
    if (whatsapp.replace(/\D/g, "").length < MIN_WHATSAPP_DIGITOS) e.whatsapp = "WhatsApp incompleto.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "E-mail inválido.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    try {
      const id = await captureLead({
        name: nome.trim(),
        email: email.trim(),
        whatsapp,
        source: "feira",
      });
      setLeadId(id);
    } catch (err) {
      console.error("[feira] captura falhou:", err);
      toast.error("Não deu para enviar", { description: "Tente de novo em alguns segundos." });
    } finally {
      setEnviando(false);
    }
  };

  const primeiroNome = nome.trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-[720px] items-center px-5">
          <span className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-[17px] font-extrabold tracking-[-0.02em]">TikTally Creator</span>
          </span>
          <span className="ml-auto rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Em breve
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-10">
        {!leadId ? (
          <>
            <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[42px]">
              Você postou, vendeu.
              <br />
              <span className="text-primary">Quanto entrou?</span>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[18px]">
              O TikTally Creator lê suas comissões direto do TikTok Shop e mostra o que cada vídeo e
              cada live rendeu. Estamos terminando de construir. Deixe seu contato para ser avisado
              quando abrir.
            </p>

            <ul className="mt-7 grid gap-2.5">
              {PROVAS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] text-muted-foreground">
                  <Check className="mt-[3px] h-4 w-4 shrink-0 text-success" />
                  {p}
                </li>
              ))}
            </ul>

            <form onSubmit={enviar} className="mt-8 grid gap-4 rounded-2xl border bg-card p-5 md:p-6">
              <Campo
                id="nome"
                label="Seu nome"
                icon={User}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como podemos te chamar"
                autoComplete="name"
                autoFocus
                erro={erros.nome}
              />
              <Campo
                id="whatsapp"
                label="WhatsApp"
                icon={MessageCircle}
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                placeholder="(11) 90000-0000"
                // Teclado numérico no celular: quem está de pé no estande não
                // deve ter que trocar de teclado para digitar o telefone.
                inputMode="tel"
                autoComplete="tel"
                maxLength={16}
                erro={erros.whatsapp}
              />
              <Campo
                id="email"
                label="E-mail"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                erro={erros.email}
              />

              <button
                type="submit"
                disabled={enviando}
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-bold text-primary-foreground transition-opacity disabled:opacity-60"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                {enviando ? "Enviando" : "Avise quando abrir"}
              </button>
              <p className="text-center text-[12px] text-faint">
                Usamos seu contato só para falar com você sobre o TikTally Creator.
              </p>
            </form>
          </>
        ) : (
          <div className="rounded-2xl border bg-card p-6 md:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check className="h-6 w-6 text-success" />
            </span>
            <h1 className="mt-5 text-[28px] font-extrabold leading-[1.14] tracking-[-0.03em] md:text-[34px]">
              Pronto{primeiroNome ? `, ${primeiroNome}` : ""}.
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
              Você está na lista. Assim que o TikTally Creator abrir, a gente te chama no WhatsApp
              para você ver o painel com os seus próprios números, não com os de exemplo.
            </p>

            <div className="mt-6 border-t pt-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-faint">
                Enquanto isso
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Passe no estande para ver o painel funcionando com uma conta de verdade. É a melhor
                forma de saber se ele resolve o seu caso antes de a gente abrir.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
