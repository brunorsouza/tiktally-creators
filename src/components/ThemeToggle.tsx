import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "light", icon: Sun, label: "Claro" },
  { key: "dark", icon: Moon, label: "Escuro" },
  { key: "black", icon: MoonStar, label: "Black" },
] as const;

/** Seletor de tema segmentado: Claro / Escuro / Black. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={cn("flex items-center gap-1 rounded-lg border bg-muted/40 p-1", className)}
      role="group"
      aria-label="Tema"
    >
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const active = mounted && theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md px-2 py-1.5 transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
