import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink/8 bg-white/80 p-6 shadow-sm backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
