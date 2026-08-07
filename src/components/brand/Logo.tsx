import { cn } from "@/lib/utils";

/**
 * Marca TikTally Creator — o "tally-check": check MAGENTA com uma pílula CIANO
 * inclinada atrás do vértice.
 *
 * Geometria copiada literalmente do arquivo oficial da marca
 * (`tiktallypay/assets/images/tiktally-logo-inverted.svg`, viewBox 500×500).
 * Só o viewBox foi apertado para o bounding box do desenho (o original tem
 * bastante respiro em volta), pra marca encher o espaço nos tamanhos de app
 * — 24 a 38 px. Não redesenhe: se precisar mexer, volte no arquivo oficial.
 *
 * Cores saem de `--brand-pink` / `--brand-cyan`, FIXOS nos três temas: a marca
 * não muda de cor com o tema. SVG inline = escala sem perder nitidez.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="102 100 290 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="TikTally Creator"
    >
      {/* pílula ciano — acento inclinado atrás do check */}
      <g transform="translate(265 303) rotate(-47)">
        <rect x="-60" y="-32" width="120" height="64" rx="32" fill="hsl(var(--brand-cyan))" />
      </g>
      {/* check magenta */}
      <path
        d="M 147 238 L 215 312 L 347 160"
        fill="none"
        stroke="hsl(var(--brand-pink))"
        strokeWidth="78"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
