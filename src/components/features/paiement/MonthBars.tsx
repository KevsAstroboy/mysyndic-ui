import type { MonthStatus } from "@/lib/utils/cotisation";
import { cn } from "@/lib/utils/cn";

const BAR_COLORS: Record<MonthStatus, string> = {
  paid: "#00D9A0",
  current: "#FFD166",
  future: "rgba(255,255,255,.15)",
  overdue: "#FF7B6E",
};

const LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function MonthBars({ months }: { months: MonthStatus[] }) {
  return (
    <div>
      <div className="mb-4 flex h-8 items-end gap-1">
        {months.map((s, i) => (
          <div
            key={i}
            className="flex-1 rounded-[3px]"
            style={{
              background: BAR_COLORS[s],
              height: s === "future" ? "60%" : "100%",
            }}
          />
        ))}
      </div>
      <div className="flex gap-1">
        {LABELS.map((l, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 text-center text-[8px] font-semibold",
              months[i] === "current" ? "text-white/75" : "text-white/40",
            )}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
