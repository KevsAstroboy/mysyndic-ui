"use client";

import { motion } from "framer-motion";
import { Check, CreditCard, Home, LayoutDashboard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatFCFA } from "@/lib/utils/formatFCFA";

const CONFETTI: {
  left: string;
  size: number;
  delay: number;
  duration: number;
  spin: number;
  color: string;
}[] = [
  { left: "6%", size: 8, delay: 0, duration: 6, spin: 300, color: "#00A87C" },
  { left: "14%", size: 5, delay: 1.2, duration: 7, spin: -260, color: "#E8C26A" },
  { left: "23%", size: 6, delay: 0.6, duration: 5.4, spin: 220, color: "#ffffff" },
  { left: "32%", size: 4, delay: 2, duration: 8, spin: -180, color: "#0D6E5A" },
  { left: "41%", size: 7, delay: 0.9, duration: 6.6, spin: 320, color: "#F2A49A" },
  { left: "52%", size: 5, delay: 1.7, duration: 7.4, spin: -300, color: "#E8C26A" },
  { left: "60%", size: 6, delay: 0.3, duration: 5.8, spin: 240, color: "#00A87C" },
  { left: "69%", size: 4, delay: 2.4, duration: 8.4, spin: -200, color: "#ffffff" },
  { left: "77%", size: 8, delay: 1, duration: 6.2, spin: 280, color: "#0D6E5A" },
  { left: "86%", size: 5, delay: 1.9, duration: 7.8, spin: -320, color: "#F2A49A" },
  { left: "93%", size: 6, delay: 0.5, duration: 6.9, spin: 260, color: "#E8C26A" },
];

const BLOBS: { left: string; top: string; size: number; delay: number }[] = [
  { left: "-12%", top: "-10%", size: 420, delay: 0 },
  { left: "78%", top: "-6%", size: 360, delay: 1.4 },
  { left: "-8%", top: "62%", size: 380, delay: 0.7 },
  { left: "82%", top: "68%", size: 440, delay: 2 },
];

export default function PaiementConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const { user } = useAuth();
  const sp = useSearchParams();
  const prénom = (user?.prenom ?? "").trim();
  const amountRaw = sp.get("amount") ?? sp.get("montant");
  const montant = amountRaw ? Number(amountRaw) : 0;
  const reference =
    sp.get("trxref") || sp.get("reference") || "";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden font-sans"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 18%, #0E7A63 0%, #0B5C47 42%, #07382D 78%, #04231C 100%)",
      }}
    >
      {/* Brume d'ambiance — halos qui dérivent */}
      {BLOBS.map((b, i) => (
        <motion.span
          key={i}
          animate={{
            x: [0, b.delay % 2 === 0 ? 34 : -30, 0],
            y: [0, 26, 0],
            transition: { duration: 14 + b.delay * 2, repeat: Infinity },
          }}
          className="pointer-events-none absolute rounded-full opacity-[.16]"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: i % 2 === 0 ? "#14B892" : "#E8C26A",
            filter: "blur(46px)",
          }}
        />
      ))}

      {/* Confettis — pluie continue */}
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          animate={{
            y: [24, 500],
            x: [0, c.left === "93%" ? -70 : c.left === "6%" ? 70 : 0],
            rotate: [0, c.spin],
            opacity: [0, 1, 1, 0],
            transition: {
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          className="pointer-events-none absolute rounded-[1px]"
          style={{
            left: c.left,
            top: -20,
            width: c.size,
            height: c.size * 1.6,
            background: c.color,
          }}
        />
      ))}

      {/* Cocher de succès */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 190, damping: 15 }}
        className="relative flex h-32 w-32 items-center justify-center"
      >
        {/* Anneau rotatif pointillé */}
        <motion.span
          animate={{ rotate: 360, transition: { duration: 26, repeat: Infinity, ease: "linear" } }}
          className="absolute inset-0 h-32 w-32 rounded-full border-[3px] border-dashed border-white/25"
        />
        {/* Halo pulsé */}
        <motion.span
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.5, 0.05, 0.5],
            transition: { duration: 3.4, repeat: Infinity },
          }}
          className="absolute -inset-4 rounded-full border-2 border-emerald/40"
        />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald shadow-[0_14px_46px_rgba(13,110,90,.45),inset_0_0_0_2px_rgba(255,255,255,.18)]">
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.06 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
          >
            <Check size={26} strokeWidth={3.2} className="text-white" />
          </motion.span>
        </span>
      </motion.div>

      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.55, ease: "easeOut" }}
        className="mt-8 text-center text-[30px] font-extrabold leading-none tracking-[-.7px] text-white md:text-[38px]"
      >
        {prénom ? `Merci ${prénom}` : "Merci"}
        <span className="text-emerald"> !</span>
      </motion.h1>

      {/* Message communautaire */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.5 }}
        className="mt-3 max-w-md text-center"
      >
        <p className="text-[14px] font-medium leading-relaxed text-white/80">
          Votre cotisation fait vivre toute la résidence. Bienvenue dans la
          famille <span className="font-semibold text-white">MySyndic</span> —
          chaque contribution rend la cité meilleure pour tous.
        </p>
        <p className="mt-1.5 text-[12px] font-medium text-white/55">
          Vous serez notifié dès la confirmation définitive de votre paiement.
        </p>
      </motion.div>

      {/* Détail — montant reçu */}
      {montant > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 flex items-center gap-2.5 rounded-pill bg-white/10 px-4 py-2.5 backdrop-blur"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/15 text-emerald">
            <CreditCard size={15} strokeWidth={1.7} />
          </span>
          <span className="text-[13px] font-extrabold text-white">
            {formatFCFA(montant)} FCFA
          </span>
          <span className="text-[10px] font-medium text-white/45">reçus</span>
          {reference && (
            <span className="font-mono text-[10px] text-white/40">
              · {reference.slice(0, 12)}
            </span>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.62 }}
        className="mt-7 flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row"
        style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}
      >
        <Button
          size="lg"
          onClick={() => router.push("/accueil")}
          className="w-full rounded-md py-4 text-[15px] tracking-[-.1px] shadow-[0_10px_36px_rgba(13,110,90,.45)] sm:w-[240px]"
        >
          <Home size={17} strokeWidth={2} /> Retour à l&apos;accueil
        </Button>
        <button
          type="button"
          onClick={() => router.push("/cotisation")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white/10 px-5 py-3.5 text-sm font-bold text-white/85 backdrop-blur transition-colors hover:bg-white/16 sm:w-[220px]"
        >
          <LayoutDashboard size={15} strokeWidth={1.8} />
          Suivre mes cotisations
        </button>
      </motion.div>

      {/* Marque */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 flex items-center gap-2 text-white/40"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white/10 text-[10px] font-extrabold text-white">
          MS
        </span>
        <span className="text-[11px] font-semibold">
          MySyndic · Gestion de cité résidentielle
        </span>
      </motion.div>
    </div>
  );
}