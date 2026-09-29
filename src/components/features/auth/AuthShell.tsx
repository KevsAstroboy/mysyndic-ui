"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface AuthShellProps {
  headline: ReactNode;
  sub: string;
  /** Slogan affiché sous le nom de l'app. */
  tagline?: string;
  /** Largeur du formulaire (register = plus large). */
  wide?: boolean;
  /** Contenu secondaire (lien bas de page, note…). */
  footer?: ReactNode;
  children: ReactNode;
}

const PANEL_BG = "linear-gradient(150deg,#0d6e5a 0%,#07352a 52%,#061611 100%)";
const WEAVE =
  "repeating-linear-gradient(45deg, rgba(255,255,255,.03) 0 1px, transparent 1px 16px), repeating-linear-gradient(-45deg, rgba(255,255,255,.03) 0 1px, transparent 1px 16px)";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Wallet, title: "Cotisations", text: "Paiements suivis et relances" },
  {
    icon: Megaphone,
    title: "Communication",
    text: "Annonces et alertes du quartier",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité",
    text: "Incidents et conflits centralisés",
  },
  { icon: Users, title: "Habitants", text: "Villas, familles et colocations" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function BrandMark({
  compact = false,
  tagline,
  tone = "dark",
}: {
  compact?: boolean;
  tagline: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-[14px] border-[1.5px] font-extrabold",
          light
            ? "border-border bg-primary-light text-accent"
            : "border-white/25 bg-white/15 text-white backdrop-blur",
          compact ? "h-11 w-11 text-base" : "h-12 w-12 text-xl",
        )}
      >
        MS
      </div>
      <div className="text-left leading-tight">
        <div
          className={cn(
            "font-extrabold tracking-[-.4px]",
            light ? "text-ink" : "text-white",
            compact ? "text-[18px]" : "text-[22px]",
          )}
        >
          MySyndic
        </div>
        <div
          className={cn(
            "text-xs font-medium",
            light ? "text-ink-3" : "text-white/55",
          )}
        >
          {tagline}
        </div>
      </div>
    </div>
  );
}

/**
 * Coquille des écrans d'auth.
 * Desktop : split-screen — panneau marque animé à gauche, formulaire à droite.
 * Mobile : page épurée — marque en tête, titre puis formulaire, façon Nyuman.
 */
export function AuthShell({
  headline,
  sub,
  tagline = "La vie en cité",
  wide = false,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-dvh w-full bg-bg lg:grid-cols-[1.05fr_1fr] lg:bg-surface">
      {/* ─── Panneau marque (desktop) ─── */}
      <aside
        className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between xl:p-16"
        style={{ background: PANEL_BG }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: WEAVE }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle,rgba(0,168,124,.55),transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle,rgba(232,160,32,.38),transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="relative z-10"
        >
          <BrandMark tagline={tagline} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.08 }}
          className="relative z-10 max-w-[26rem]"
        >
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-white/80 backdrop-blur">
            <Sparkles size={13} strokeWidth={2} />
            Côte d&apos;Ivoire
          </span>

          <h2 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-[-1px] text-white xl:text-[42px]">
            Votre cité,
            <br />
            <span className="text-gold">mieux gérée.</span>
          </h2>

          <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-white/60">
            Cotisations, communication et sécurité de votre résidence —
            centralisées, sans WhatsApp ni tableurs.
          </p>

          <ul className="mt-9 space-y-2.5">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.18 + i * 0.07 }}
                className="flex items-center gap-3.5 rounded-lg border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/10 text-white">
                  <f.icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-white">
                    {f.title}
                  </span>
                  <span className="block text-xs font-medium text-white/50">
                    {f.text}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative z-10 text-xs font-medium text-white/40"
        >
          © {new Date().getFullYear()} MySyndic · Abidjan, Côte d&apos;Ivoire
        </motion.p>
      </aside>

      {/* ─── Colonne formulaire ─── */}
      <main className="relative flex min-h-dvh flex-1 flex-col bg-bg lg:bg-surface">
        {/* Marque (mobile) */}
        <div className="flex items-center px-6 pt-[max(1.5rem,env(safe-area-inset-top))] lg:hidden">
          <BrandMark compact tone="light" tagline={tagline} />
        </div>

        <div className="flex flex-1 flex-col px-5 py-8 sm:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className={cn(
              "m-auto flex w-full flex-col pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-0",
              wide ? "max-w-lg" : "max-w-md",
            )}
          >
            <div className="mb-7">
              <h1 className="text-[27px] font-extrabold leading-[1.15] tracking-[-.6px] text-ink lg:text-[32px] lg:tracking-[-.8px]">
                {headline}
              </h1>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink-2">
                {sub}
              </p>
            </div>

            {children}

            {footer && (
              <div className="mt-7 border-t border-border pt-6">{footer}</div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
