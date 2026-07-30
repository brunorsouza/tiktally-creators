import { cn } from "@/lib/utils";

/**
 * Marca TikTally Creator — o "tally-check": um check ROSA com um quadradinho
 * CIANO deslocado atrás do vértice (espelho do seller, que é check ciano +
 * quadrado rosa). Dual-tone estilo TikTok.
 *
 * Usa os tokens `--brand-pink` / `--brand-cyan` do DS, então adapta a
 * light/dark automaticamente. SVG inline = escala sem perder nitidez.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="TikTally Creator"
    >
      {/* quadrado ciano — acento atrás do vértice, levemente girado */}
      <rect
        x="19.45"
        y="24.65"
        width="10.3"
        height="10.3"
        rx="3.4"
        transform="rotate(-12 24.6 29.8)"
        fill="hsl(var(--brand-cyan))"
      />
      {/* check rosa — dois traços arredondados */}
      <path
        d="M14.1 23.4 L21.75 31.1 L34.3 15.4"
        stroke="hsl(var(--brand-pink))"
        strokeWidth="5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
