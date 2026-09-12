import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function RetroButton({ className, variant = "outline", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan active:translate-y-px",
        variant === "primary" &&
          "neon-border bg-primary/25 text-foreground hover:bg-primary/40 hover:shadow-[0_0_28px_-6px_var(--neon-violet)]",
        variant === "outline" &&
          "border border-border bg-void/50 text-foreground/90 hover:border-cyan/70 hover:text-cyan",
        variant === "ghost" && "text-muted-foreground hover:text-cyan",
        className,
      )}
    />
  );
}
