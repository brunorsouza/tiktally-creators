import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Foto do creator, com queda limpa para as iniciais.
 *
 * Três caminhos levam ao fallback e todos acontecem de verdade: o perfil ainda
 * não carregou, a API não devolveu avatar, ou a URL carregou e quebrou (as do
 * TikTok expiram). Sem o `onError` o terceiro caso vira o ícone de imagem
 * quebrada do navegador no canto da topbar — pior que as iniciais.
 *
 * `alt=""` de propósito: quem usa este componente já rotula o elemento em
 * volta (o link "Perfil"), e um alt aqui faria o leitor de tela anunciar a
 * mesma coisa duas vezes.
 */
export function CreatorAvatar({
  url,
  fallback,
  className,
}: {
  url?: string;
  /** Iniciais, normalmente. Aparece enquanto não há foto. */
  fallback: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // A URL muda quando o perfil chega — uma falha anterior não pode condenar a nova.
  useEffect(() => setFailed(false), [url]);

  return (
    <span className={cn("overflow-hidden", className)}>
      {url && !failed ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        fallback
      )}
    </span>
  );
}
