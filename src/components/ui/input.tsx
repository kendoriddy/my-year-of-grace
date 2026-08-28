import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-terracotta/40 focus:ring-2 focus:ring-terracotta/20",
        className,
      )}
      {...props}
    />
  );
}
