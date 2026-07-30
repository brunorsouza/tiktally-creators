import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { callEdge } from "@/services/tiktok-creator";

/**
 * Callback do OAuth de creator do TikTok Shop.
 * Recebe ?code=...&state=... e troca pelo creator access_token via edge fn.
 */
export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Conectando sua conta...");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const expected = sessionStorage.getItem("tt_oauth_state");

    if (!code) {
      setStatus("error");
      setMessage("Código de autorização ausente. Tente conectar novamente.");
      return;
    }
    if (expected && state && state !== expected) {
      setStatus("error");
      setMessage("Falha de validação de segurança (state). Tente novamente.");
      return;
    }

    callEdge("creator-token-exchange", { code })
      .then(() => {
        toast.success("Conta de creator conectada!");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Não foi possível conectar. Tente novamente.");
      });
  }, [params, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      {status === "working" ? (
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <p className="max-w-sm text-sm text-destructive">{message}</p>
      )}
      {status === "working" && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
