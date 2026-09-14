import { cn } from "@/lib/utils/cn";

interface Rule {
  ok: boolean;
  label: string;
}

export interface PasswordRulesProps {
  value: string;
}

function computeRules(value: string): Rule[] {
  return [
    { ok: value.length >= 8, label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(value), label: "Une lettre majuscule" },
    { ok: /\d/.test(value), label: "Un chiffre" },
  ];
}

/** Indicateur de robustesse du mot de passe (3 règles). */
export function PasswordRules({ value }: PasswordRulesProps) {
  const rules = computeRules(value);
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-surface-2 px-3.5 py-3">
      {rules.map((r) => (
        <div
          key={r.label}
          className={cn(
            "flex items-center gap-2 text-xs font-semibold",
            r.ok ? "text-emerald" : "text-ink-3",
          )}
        >
          <span
            className={cn(
              "h-[7px] w-[7px] shrink-0 rounded-full",
              r.ok ? "bg-emerald" : "bg-ink-3",
            )}
          />
          {r.label}
        </div>
      ))}
    </div>
  );
}
