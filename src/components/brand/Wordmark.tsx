import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

/**
 * Lockup da marca: o tally-check + "TikTally Creator".
 * Usado no shell (sidebar) e na tela de login.
 */
export function Wordmark({
  size = 30,
  className,
  textClassName,
}: {
  size?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className={cn("text-lg font-bold tracking-tight", textClassName)}>
        TikTally <span className="text-primary">Creator</span>
      </span>
    </div>
  );
}
