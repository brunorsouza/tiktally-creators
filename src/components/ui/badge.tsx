import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Chip do DS: canto de 9px (não pílula), 12px/700, e cor por tinta suave —
  // fundo cheio só no `default`, que é o único caso de ênfase real.
  // Sem borda na base: no design o chip é 5px/10px de padding e nada mais, e
  // uma borda transparente somaria 2px de altura fora do ritmo da linha.
  "inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-[5px] text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-faint",
        destructive: "bg-destructive/[.08] text-destructive",
        success: "bg-success/[.08] text-success",
        warning: "bg-warning/[.08] text-warning",
        info: "bg-info/[.08] text-info",
        outline: "border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
