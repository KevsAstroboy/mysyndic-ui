const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/**
 * Parser de date tolérant. Le backend renvoie des formats français
 * "08/09/2026 03:18:47" (jour/mois/année + heure) que `new Date()`
 * interprète à tort comme US ("08/09" → 9 août) ou ignore l'heure.
 * On traite le jour en premier quand c'est possible, et on garde l'heure.
 */
export function parseDate(value: string): Date {
  const s = (value ?? "").trim();
  if (!s) return new Date(NaN);

  // "2026-09-08" (date seule) → minuit local, pas UTC (évite un décalage de jour).
  const isoDate = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return new Date(+isoDate[1], +isoDate[2] - 1, +isoDate[3]);
  }

  // "2026-09-08T…" ou "2026-09-08 10:00:00" → parsing natif (timezone conservée).
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s)) {
    return new Date(s);
  }

  // "08/09/2026 03:18:47", "8-9-2026", "08.09.2026" → jour/mois/année (format
  // français), heure optionnelle conservée → évite « il y a 3h » sur un
  // signalement frais (la date était tronquée à minuit).
  const dmy = s.match(
    /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (dmy) {
    let day = +dmy[1];
    let month = +dmy[2];
    if (month > 12) {
      // "03/25/2026" ne peut qu'être un format US → jour = 2e valeur.
      day = +dmy[2];
      month = +dmy[1];
    }
    let year = +dmy[3];
    if (year < 100) year += 2000;
    return new Date(
      year,
      month - 1,
      day,
      dmy[4] ? +dmy[4] : 0,
      dmy[5] ? +dmy[5] : 0,
      dmy[6] ? +dmy[6] : 0,
    );
  }

  return new Date(s);
}

/** "2026-09" → "Septembre 2026". */
export function formatMonth(mois: string): string {
  if (!mois) return "";
  const [year, month] = mois.split("-");
  const idx = Number(month) - 1;
  const label = MONTHS[idx] ?? month ?? "";
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year ?? ""}`.trim();
}

const timeToHM = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}h${m}`;
};

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Timestamp → "à l'instant" / "il y a 2h" / "hier à 18h40" / "12 sept. · 18h40". */
export function formatRelative(date: string): string {
  const d = parseDate(date);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  // Même jour → « il y a Nh » (l'heure est implicite), sinon on affiche l'heure.
  if (h < 24 && sameDay(d, now)) return `il y a ${h}h`;
  const jours = Math.floor(h / 24);
  if (jours === 1) return `hier à ${timeToHM(d)}`;
  if (jours < 7) return `il y a ${jours}j · ${timeToHM(d)}`;
  const dText = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  if (d.getFullYear() === now.getFullYear()) return `${dText} · ${timeToHM(d)}`;
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })} · ${timeToHM(d)}`;
}

/** Date complète : "12 sept. 2026 · 18h40". */
export function formatDate(date: string): string {
  const d = parseDate(date);
  if (isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${timeToHM(d)}`;
}