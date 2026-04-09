import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl md:text-4xl">{title}</h2>
      {description ? <p className="max-w-3xl text-base text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
