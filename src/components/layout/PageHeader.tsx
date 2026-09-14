"use client";

/**
 * En-tête de page desktop — barre blanche `border-b` (masquée en mobile).
 * Titre + sous-titre à gauche, actions à droite.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-8 py-5">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-[-.4px] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs font-medium text-ink-3">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        )}
      </div>
    </header>
  );
}
