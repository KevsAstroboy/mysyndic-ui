import {
  Building2,
  CreditCard,
  FileText,
  Globe,
  Home,
  Info,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Rss,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

/**
 * « Le préfixe le plus long gagne » : sur /cites/global, l'item parent /cites
 * ne doit PAS être actif en même temps que /cites/global.
 */
export function isItemActive(pathname: string, items: NavItem[], href: string): boolean {
  const best = items
    .filter(
      (i) =>
        pathname === i.href ||
        pathname.startsWith(i.href.endsWith("/") ? i.href : `${i.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  return best?.href === href;
}

export const HABITANT_NAV: NavItem[] = [
  { href: "/accueil", label: "Accueil", icon: Home, group: "Principal" },
  { href: "/cotisation", label: "Cotisation", icon: CreditCard, group: "Principal" },
  { href: "/quartier", label: "Quartier", icon: Info, group: "Principal" },
  { href: "/feed", label: "Feed", icon: Rss, group: "Vie de la cité" },
  { href: "/messages", label: "Messages", icon: MessageCircle, group: "Vie de la cité" },
  { href: "/profil", label: "Profil", icon: User, group: "Vie de la cité" },
];

export const SYNDIC_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/paiements", label: "Paiements", icon: CreditCard, group: "Gestion" },
  { href: "/habitants", label: "Habitants", icon: Users, group: "Gestion" },
  { href: "/comptes", label: "Comptes", icon: User, group: "Administration" },
  { href: "/configuration", label: "Configuration", icon: Settings, group: "Administration" },
  { href: "/alertes", label: "Alertes de sécurité", icon: ShieldAlert, group: "Sécurité" },
  { href: "/annonces", label: "Annonces", icon: Megaphone, group: "Communication" },
  { href: "/feed", label: "Feed", icon: Rss, group: "Communication" },
  { href: "/conflits", label: "Conflits", icon: Scale, group: "Communication" },
  { href: "/incidents", label: "Incidents", icon: Info, group: "Communication" },
  { href: "/messages", label: "Messages", icon: MessageCircle, group: "Communication" },
  { href: "/documents", label: "Documents", icon: FileText, group: "Communication" },
  { href: "/profil", label: "Profil", icon: User, group: "Mon espace" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/comptes", label: "Comptes", icon: Users },
  { href: "/configuration", label: "Configuration", icon: Settings },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  { href: "/cites", label: "Toutes les cités", icon: Building2 },
  { href: "/cites/global", label: "Vue globale", icon: Globe },
  { href: "/cites/revenus", label: "Revenus", icon: Wallet },
  { href: "/profils", label: "Permissions", icon: Shield },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export const SECURITE_NAV: NavItem[] = [
  { href: "/alertes", label: "Alertes", icon: ShieldAlert },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];
