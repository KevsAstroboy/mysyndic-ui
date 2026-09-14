"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  Bell,
  CalendarClock,
  CreditCard,
  Droplet,
  Home,
  MessageCircle,
  Trash2,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlerteSheet } from "@/components/features/alerte/AlerteSheet";
import { HeroCard } from "@/components/features/paiement/HeroCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { annonceApi } from "@/lib/api/annonce";
import { alerteApi } from "@/lib/api/alerte";
import { configurationApi } from "@/lib/api/configuration";
import { incidentApi } from "@/lib/api/incident";
import { paiementApi } from "@/lib/api/paiement";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { compute12Months, currentMonth, statutCode } from "@/lib/utils/cotisation";
import { cn } from "@/lib/utils/cn";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth, formatRelative } from "@/lib/utils/formatDate";
import type { Annonce } from "@/types/annonce.types";
import type { Incident } from "@/types/incident.types";

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2.5 pt-5 md:px-0">
      <h2 className="text-base font-extrabold tracking-[-.3px] text-ink">
        {title}
      </h2>
      {link && (
        <Link href={link} className="text-[13px] font-semibold text-primary">
          Voir tout
        </Link>
      )}
    </div>
  );
}

const QUICK_TONES: Record<string, string> = {
  green: "bg-emerald-soft text-emerald",
  teal: "bg-primary-light text-primary",
  gold: "bg-gold-soft text-gold",
  red: "bg-danger-soft text-danger",
};

function QuickAction({
  href,
  onClick,
  icon: Icon,
  tone,
  label,
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  tone: string;
  label: string;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-2 rounded-md bg-surface px-2 py-3.5 shadow-card">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-sm",
          QUICK_TONES[tone],
        )}
      >
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <span className="text-center text-[10px] font-bold leading-tight text-ink-2">
        {label}
      </span>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return <button onClick={onClick} className="text-left">{inner}</button>;
}

function AnnonceCard({ annonce }: { annonce: Annonce }) {
  return (
    <div className="w-60 shrink-0 rounded-md bg-surface p-4 shadow-card">
      <span className="mb-2 inline-flex rounded-pill bg-primary-light px-2 py-[3px] text-[10px] font-bold tracking-[.02em] text-primary">
        {annonce.categorie?.libelle ?? "Annonce"}
      </span>
      <div className="mb-2 text-[13px] font-bold leading-[1.35] text-ink">
        {annonce.titre}
      </div>
      <div className="text-[11px] font-medium text-ink-3">
        {formatRelative(annonce.created_at ?? "")}
      </div>
    </div>
  );
}

function incidentCategoryKey(categorie?: { libelle?: string; code: string } | null) {
  return `${categorie?.libelle ?? ""} ${categorie?.code ?? ""}`.toLowerCase();
}

function incidentIcon(categorie?: { libelle?: string; code: string } | null) {
  const s = incidentCategoryKey(categorie);
  if (/(eau|fuite|water)/.test(s))
    return { Icon: Droplet, cls: "bg-[#EAF4FD] text-[#2196F3]" };
  if (/(elec|éclairage|eclairage|courant|electric|panne)/.test(s))
    return { Icon: Zap, cls: "bg-gold-soft text-gold" };
  if (/(propret|déchet|dechet|clean|collecte)/.test(s))
    return { Icon: Trash2, cls: "bg-emerald-soft text-emerald" };
  return { Icon: Wrench, cls: "bg-primary-light text-primary" };
}

function incidentTone(categorie?: { libelle?: string; code: string } | null): string {
  const s = incidentCategoryKey(categorie);
  if (/(eau|fuite|water)/.test(s)) return "blue";
  if (/(elec|éclairage|eclairage|courant|electric|panne)/.test(s)) return "gold";
  if (/(propret|déchet|dechet|clean|collecte)/.test(s)) return "green";
  return "teal";
}

function IncidentItem({ incident }: { incident: Incident }) {
  const { Icon, cls } = incidentIcon(incident.categorie);
  return (
    <Link
      href={`/quartier/incidents/${incident.id}`}
      className="flex items-center gap-3 rounded-md bg-surface p-3.5 shadow-card"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm",
          cls,
        )}
      >
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-ink">
          {incident.titre ?? incident.description}
        </div>
        <div className="text-[11px] font-medium text-ink-3">
          {incident.auteur
            ? `${incident.auteur.prenom} ${incident.auteur.nom} · `
            : ""}
          {formatRelative(incident.created_at ?? "")}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-bold text-ink-3">
        <MessageCircle size={14} strokeWidth={1.7} />
        {incident.likes_count}
      </div>
    </Link>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const { Icon, cls } = incidentIcon(incident.categorie);
  return (
    <Link
      href={`/quartier/incidents/${incident.id}`}
      className="flex items-start gap-3 rounded-md bg-surface p-4 shadow-card"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm",
          cls,
        )}
      >
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-[13px] font-bold leading-snug text-ink">
          {incident.titre ?? incident.description}
        </div>
        <div className="mt-1 text-[11px] font-medium text-ink-3">
          {incident.auteur
            ? `${incident.auteur.prenom} ${incident.auteur.nom} · `
            : ""}
          {formatRelative(incident.created_at ?? "")}
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-ink-3">
        <MessageCircle size={14} strokeWidth={1.7} />
        {incident.likes_count}
      </span>
    </Link>
  );
}

const DOT_TONES: Record<string, string> = {
  green: "bg-emerald",
  gold: "bg-gold",
  red: "bg-danger",
  teal: "bg-primary",
  blue: "bg-[#2196F3]",
};

interface ActivityItem {
  id: string;
  tone: string;
  text: string;
  time: string;
  href?: string;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const inner = (
    <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          DOT_TONES[item.tone] ?? "bg-primary",
        )}
      />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-2">
        {item.text}
      </span>
      <span className="shrink-0 text-[11px] font-medium text-ink-3">
        {item.time}
      </span>
    </div>
  );
  if (item.href) return <Link href={item.href} className="block">{inner}</Link>;
  return inner;
}

function ActivityPanel({
  title,
  link,
  items,
  empty,
}: {
  title: string;
  link?: string;
  items: ActivityItem[];
  empty: string;
}) {
  return (
    <div className="rounded-lg bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
          {title}
        </h2>
        {link && (
          <Link href={link} className="text-[13px] font-semibold text-primary">
            Voir tout
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-1 text-[13px] font-medium text-ink-3">{empty}</p>
      ) : (
        items.map((item) => <ActivityRow key={item.id} item={item} />)
      )}
    </div>
  );
}

const KPI_TONES: Record<string, string> = {
  teal: "bg-primary-light text-primary",
  green: "bg-emerald-soft text-emerald",
  gold: "bg-gold-soft text-gold",
  red: "bg-danger-soft text-danger",
};

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  delta,
  deltaTone = "up",
}: {
  icon: LucideIcon;
  tone: string;
  label: string;
  value: string;
  delta: string;
  deltaTone?: "up" | "mid" | "down";
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-md bg-surface p-[18px] shadow-card">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm",
          KPI_TONES[tone],
        )}
      >
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-ink-3">{label}</div>
        <div className="mt-1 text-2xl font-extrabold leading-none tracking-[-.5px] text-ink">
          {value}
        </div>
        <div
          className={cn(
            "mt-1 text-[11px] font-semibold",
            deltaTone === "mid"
              ? "text-gold"
              : deltaTone === "down"
                ? "text-danger"
                : "text-emerald",
          )}
        >
          {delta}
        </div>
      </div>
    </div>
  );
}

function compactFCFA(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function AccueilPage() {
  const router = useRouter();
  const { citeId, profilActif } = useAuth();
  const { unreadCount } = useNotifications();
  const me = useCurrentVilla();
  const villa = me.data?.villa;
  const villaId = villa?.id;

  const [alerteOpen, setAlerteOpen] = useState(false);

  const config = useQuery({
    queryKey: ["configuration"],
    queryFn: configurationApi.get,
  });
  const paiements = useQuery({
    queryKey: QUERY_KEYS.paiements(villaId ?? ""),
    queryFn: () => paiementApi.historiqueVilla(villaId!),
    enabled: !!villaId,
    refetchInterval: 60_000,
  });
  const annonces = useQuery({
    queryKey: QUERY_KEYS.annonces(citeId ?? ""),
    queryFn: () => annonceApi.list(citeId!),
    enabled: !!citeId,
    refetchInterval: 30_000,
  });
  const incidents = useQuery({
    queryKey: QUERY_KEYS.incidents(citeId ?? ""),
    queryFn: () => incidentApi.list(citeId!),
    enabled: !!citeId,
    refetchInterval: 30_000,
  });
  // Activité récente : les alertes signalées apparaissent aussi.
  const alertes = useQuery({
    queryKey: ["mes-alertes", "activite"],
    queryFn: () => alerteApi.mesAlertes({ page: 1, size: 5 }),
    refetchInterval: 30_000,
  });

  const moisCourant = currentMonth();
  const [year] = moisCourant.split("-").map(Number);
  const montant = config.data?.cotisation_mensuelle ?? 25000;
  const paiementsList = paiements.data ?? [];
  const months = compute12Months(paiementsList, moisCourant);

  const currentPaiement = paiementsList.find((p) => p.mois === moisCourant);
  // Statut issu de la base (source de vérité) : le code DB prime sur l'id.
  const currentCode = currentPaiement ? statutCode(currentPaiement) : undefined;
  const statut =
    currentCode === "CONFIRME"
      ? "CONFIRME"
      : currentCode === "REMBOURSE"
        ? "REMBOURSE"
        : currentCode === "ANNULE"
          ? "ANNULE"
          : currentCode === "ECHOUE"
            ? "ECHOUE"
            : currentPaiement
              ? "EN_ATTENTE"
              : "IMPAYE";

  const STATUT_LABEL: Record<string, string> = {
    CONFIRME: "Payé",
    EN_ATTENTE: "En attente",
    ECHOUE: "Échoué",
    ANNULE: "Annulé",
    REMBOURSE: "Remboursé",
    IMPAYE: "Impayé",
  };
  const STATUT_TONE: Record<string, "up" | "mid" | "down"> = {
    CONFIRME: "up",
    EN_ATTENTE: "mid",
    ECHOUE: "down",
    ANNULE: "down",
    REMBOURSE: "mid",
    IMPAYE: "down",
  };

  const confirmed = paiementsList.filter((p) => p.statut_id === 2);
  const moisPayes = confirmed.length;
  const totalVerse = confirmed.reduce((s, p) => s + (p.montant ?? 0), 0);
  const incidentsCount = (incidents.data ?? []).length;

  const annonceItems: ActivityItem[] = (annonces.data ?? []).map((a) => ({
    id: a.id,
    tone: "teal",
    text: a.titre,
    time: formatRelative(a.created_at ?? ""),
    href: "/quartier/annonces",
  }));

  const incidentItems: ActivityItem[] = (incidents.data ?? [])
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      tone: incidentTone(i.categorie),
      text: i.titre ?? i.description,
      time: formatRelative(i.created_at ?? ""),
      href: `/quartier/incidents/${i.id}`,
    }));

  const activity = useMemo(() => {
    const items: (ActivityItem & { createdAt: string })[] = [];
    for (const p of confirmed) {
      items.push({
        id: `p-${p.id ?? p.mois}`,
        tone: "green",
        text: `Paiement ${formatMonth(p.mois).toLowerCase()} confirmé`,
        time: formatRelative(p.created_at ?? ""),
        href: "/cotisation",
        createdAt: p.created_at ?? "",
      });
    }
    for (const i of incidents.data ?? []) {
      items.push({
        id: `i-${i.id}`,
        tone: incidentTone(i.categorie),
        text: i.titre ?? i.description,
        time: formatRelative(i.created_at ?? ""),
        href: `/quartier/incidents/${i.id}`,
        createdAt: i.created_at ?? "",
      });
    }
    for (const al of alertes.data?.items ?? []) {
      items.push({
        id: `al-${al.id}`,
        tone: "red",
        text: `Alerte signalée${al.motif_alerte?.libelle ? ` : ${al.motif_alerte.libelle}` : ""}`,
        time: formatRelative(al.created_at ?? ""),
        href: "/quartier/alertes",
        createdAt: al.created_at ?? "",
      });
    }
    for (const a of annonces.data ?? []) {
      items.push({
        id: `a-${a.id}`,
        tone: "teal",
        text: a.titre,
        time: formatRelative(a.created_at ?? ""),
        href: "/quartier/annonces",
        createdAt: a.created_at ?? "",
      });
    }
    return items
      .sort((x, y) => (y.createdAt || "").localeCompare(x.createdAt || ""))
      .slice(0, 5)
      .map(({ createdAt: _createdAt, ...rest }) => rest);
  }, [confirmed, incidents.data, annonces.data, alertes.data]);

  const heroLoading = me.isLoading || config.isLoading;

  return (
    <>
      {/* ── En-tête desktop ── */}
      <PageHeader
        title="Accueil"
        subtitle={`${formatMonth(moisCourant)} · ${profilActif?.citeNom ?? "Ma cité"}`}
        actions={
          <>
            <Link
              href="/profil"
              className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface-2 text-ink-2"
            >
              <Bell size={18} strokeWidth={1.7} />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-surface bg-danger" />
              )}
            </Link>
            <Button
              variant="danger"
              size="md"
              onClick={() => setAlerteOpen(true)}
            >
              <Zap size={15} strokeWidth={1.8} />
              Urgence
            </Button>
            <Button size="md" onClick={() => router.push("/cotisation")}>
              <CreditCard size={15} strokeWidth={1.8} />
              Payer ma cotisation
            </Button>
          </>
        }
      />

      {/* ── Salutation mobile (sticky) ── */}
      <TopBar />

      <div className="mx-auto w-full max-w-6xl md:px-8">
        {/* ── Héros (mobile) ── */}
        <div className="md:hidden">
          {heroLoading ? (
            <div className="mx-4 mt-1 h-[240px] overflow-hidden rounded-xl bg-primary-dark shadow-float">
              <div className="shimmer h-full w-full" />
            </div>
          ) : (
            <HeroCard
              className="mx-4"
              mois={moisCourant}
              montant={montant}
              statut={statut}
              months={months}
              villaNumero={villa?.numero}
              villaRue={villa?.rue}
              onPayer={() => router.push("/cotisation")}
            />
          )}
        </div>

        {/* ── KPIs (desktop) ── */}
        <section className="hidden md:grid md:grid-cols-4 md:gap-3.5 md:pt-6">
          {paiements.isLoading ? (
            <>
              <Skeleton className="h-[92px] rounded-md" />
              <Skeleton className="h-[92px] rounded-md" />
              <Skeleton className="h-[92px] rounded-md" />
              <Skeleton className="h-[92px] rounded-md" />
            </>
          ) : (
            <>
              <KpiCard
                icon={CreditCard}
                tone="teal"
                label="Mois payés"
                value={`${moisPayes}/12`}
                delta={`${moisPayes} mois réglés en ${year}`}
              />
              <KpiCard
                icon={Banknote}
                tone="green"
                label="Total versé"
                value={compactFCFA(totalVerse)}
                delta={`FCFA en ${year}`}
              />
              <KpiCard
                icon={AlertTriangle}
                tone="gold"
                label="Incidents ouverts"
                value={String(incidentsCount)}
                delta="Dans la cité"
                deltaTone="mid"
              />
              <KpiCard
                icon={CalendarClock}
                tone={statut === "CONFIRME" ? "green" : statut === "EN_ATTENTE" ? "gold" : "red"}
                label={`Cotisation ${formatMonth(moisCourant)}`}
                value={formatFCFA(montant)}
                delta={STATUT_LABEL[statut]}
                deltaTone={STATUT_TONE[statut]}
              />
            </>
          )}
        </section>

        {/* ── Accès rapide (mobile) ── */}
        <section className="md:hidden">
          <SectionHeader title="Accès rapide" />
          <div className="grid grid-cols-4 gap-2 px-4">
            <QuickAction href="/cotisation" icon={CreditCard} tone="green" label="Cotisation" />
            <QuickAction href="/quartier" icon={Home} tone="teal" label="Quartier" />
            <QuickAction href="/messages" icon={MessageCircle} tone="gold" label="Messages" />
            <QuickAction
              onClick={() => setAlerteOpen(true)}
              icon={AlertTriangle}
              tone="red"
              label="Urgence"
            />
          </div>
        </section>

        {/* ── Panneaux bas (desktop) ── */}
        <section className="hidden md:grid md:grid-cols-[1.4fr_1fr] md:gap-4 md:pt-5">
          {heroLoading || annonces.isLoading || incidents.isLoading ? (
            <Skeleton className="h-[260px] rounded-lg" />
          ) : (
            <ActivityPanel
              title="Activité récente"
              items={activity}
              empty="Aucune activité récente"
            />
          )}
          {annonces.isLoading ? (
            <Skeleton className="h-[260px] rounded-lg" />
          ) : (
            <ActivityPanel
              title="Annonces"
              link="/quartier/annonces"
              items={annonceItems}
              empty="Aucune annonce pour le moment"
            />
          )}
        </section>

        {/* ── Incidents (desktop) ── */}
        <section className="hidden md:block md:pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
              Incidents du quartier
            </h2>
            <Link href="/quartier" className="text-[13px] font-semibold text-primary">
              Voir tout
            </Link>
          </div>
          {incidents.isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-[84px] rounded-md" />
              <Skeleton className="h-[84px] rounded-md" />
              <Skeleton className="h-[84px] rounded-md" />
            </div>
          ) : (incidents.data ?? []).length === 0 ? (
            <p className="text-[13px] font-medium text-ink-3">
              Aucun incident pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {(incidents.data ?? []).slice(0, 6).map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          )}
        </section>

        {/* ── Annonces (mobile) ── */}
        <section className="md:hidden">
          <SectionHeader title="Annonces" link="/quartier/annonces" />
          {annonces.isLoading ? (
            <div className="flex gap-3 overflow-hidden px-4">
              <Skeleton className="h-[96px] w-60 shrink-0" />
              <Skeleton className="h-[96px] w-60 shrink-0" />
            </div>
          ) : (annonces.data ?? []).length === 0 ? (
            <p className="px-5 text-[13px] font-medium text-ink-3">
              Aucune annonce pour le moment.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(annonces.data ?? []).map((a) => (
                <AnnonceCard key={a.id} annonce={a} />
              ))}
            </div>
          )}
        </section>

        {/* ── Incidents récents (mobile) ── */}
        <section className="md:hidden">
          <SectionHeader title="Incidents récents" link="/quartier" />
          <div className="flex flex-col gap-2 px-4 pb-2">
            {incidents.isLoading
              ? [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md bg-surface p-3.5 shadow-card"
                  >
                    <Skeleton className="h-10 w-10 rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : (incidents.data ?? []).slice(0, 3).map((inc) => (
                  <IncidentItem key={inc.id} incident={inc} />
                ))}
          </div>
        </section>
      </div>

      <AlerteSheet open={alerteOpen} onClose={() => setAlerteOpen(false)} />
    </>
  );
}
