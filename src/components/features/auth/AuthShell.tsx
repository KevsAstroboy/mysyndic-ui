import type { ReactNode } from "react";

export interface AuthShellProps {
  headline: ReactNode;
  sub: string;
  /** Slogan affiché sous le nom de l'app. */
  tagline?: string;
  children: ReactNode;
}

/**
 * Coquille des écrans d'auth — plein écran (100dvh), dégradé teal + motif,
 * carte scrollable en interne. Sur mobile : comportement « app », aucun scroll
 * de page ni fond blanc au overscroll.
 */
export function AuthShell({
  headline,
  sub,
  tagline = "La vie en cité",
  children,
}: AuthShellProps) {
  return (
    <div
      className="relative h-dvh w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #0D6E5A 0%, #052820 55%, #0a1a12 100%)",
      }}
    >
      {/* Motif kente */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(-45deg, rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px, transparent 1px, transparent 18px)",
        }}
      />
      {/* Halo décoratif */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald/25 blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col md:justify-center">
        <header className="shrink-0 px-8 pb-5 pt-[max(2rem,env(safe-area-inset-top))] md:pt-2">
          <div className="mb-5 flex items-center gap-3 md:justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border-[1.5px] border-white/20 bg-white/15 text-xl font-extrabold text-white backdrop-blur-[8px]">
              MS
            </div>
            <div className="text-left">
              <div className="text-[22px] font-extrabold leading-tight tracking-[-.4px] text-white">
                MySyndic
              </div>
              <div className="text-xs font-medium text-white/55">{tagline}</div>
            </div>
          </div>
          <h1 className="mb-2 text-[30px] font-extrabold leading-[1.1] tracking-[-.8px] text-white md:text-center">
            {headline}
          </h1>
          <p className="text-sm font-medium leading-relaxed text-white/60 md:text-center">
            {sub}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 shadow-[0_-10px_40px_rgba(0,0,0,.18)] md:mx-6 md:mb-10 md:max-h-[80vh] md:flex-none md:rounded-[28px]">
          {children}
        </div>
      </div>
    </div>
  );
}
