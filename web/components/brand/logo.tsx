import { cn } from "@/lib/utils";

/**
 * Wordmark "elleito.ai" — Inter bold, ponto em laranja (--primary).
 * Sem SVG por enquanto (ADR de estilo futuro).
 */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-bold tracking-tight",
        sizes[size],
        className,
      )}
      aria-label="elleito.ai"
    >
      elleito<span className="text-primary">.</span>ai
    </span>
  );
}
