import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

function useCountUp(value, duration = 4000) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (typeof value !== "string" && typeof value !== "number") {
      setDisplayValue(value);
      return;
    }

    const strValue = String(value).trim();

    if (strValue.includes("/")) {
      const parts = strValue.split("/");
      const num1 = parseInt(parts[0].replace(/[^0-9]/g, ""), 10);
      const num2 = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);

      if (isNaN(num1) || isNaN(num2)) {
        setDisplayValue(value);
        return;
      }

      let start = null;
      let frameId;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current1 = Math.round(ease * num1);
        setDisplayValue(`${current1} / ${num2}`);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(strValue);
        }
      };

      frameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frameId);
    }

    const match = strValue.match(/^([^0-9]*)([\d,]+)(\.[0-9]+)?(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || "";
    const rawNumStr = match[2].replace(/,/g, "");
    const targetNum = parseInt(rawNumStr, 10);
    const hasCommas = match[2].includes(",");
    const decimalPart = match[3] || "";
    const suffix = match[4] || "";

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    let start = null;
    let frameId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * targetNum);

      const formatted = hasCommas ? current.toLocaleString("en-IN") : current.toString();
      setDisplayValue(`${prefix}${formatted}${decimalPart}${suffix}`);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(strValue);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return displayValue;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500 dark:text-blue-400",
  iconBg = "bg-blue-500/10 border-blue-500/20",
  glowColor = "from-blue-500/15 via-blue-500/5 to-transparent",
  accentBorder = "hover:border-blue-500/40",
  trend,
  trendUp,
}) {
  const { isDark } = useTheme();
  const animatedValue = useCountUp(value);

  return (
    <div
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-3.5 xl:p-4 2xl:p-5 border transition-all duration-300 group cursor-default h-full flex flex-col justify-center ${
        isDark
          ? "bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-2xl border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          : "bg-white/60 hover:bg-white/80 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)]"
      } ${accentBorder} hover:-translate-y-1`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 xl:w-32 xl:h-32 rounded-full bg-gradient-to-br ${glowColor} blur-2xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100`}
      />

      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-2.5 xl:gap-3">
        {Icon && (
          <div
            className={`w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 xl:w-11 xl:h-11 rounded-xl sm:rounded-2xl border ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-all duration-300`}
          >
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 xl:w-5 xl:h-5 stroke-[2.2]" />
          </div>
        )}

        <div className="min-w-0 text-right flex-1 overflow-hidden">
          <p
            className={`text-[10.5px] sm:text-xs xl:text-[12.5px] 2xl:text-sm font-semibold tracking-tight whitespace-nowrap truncate leading-tight ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
            title={title}
          >
            {title}
          </p>
          <h3
            className={`text-xl sm:text-2xl xl:text-[26px] 2xl:text-3xl font-bold tracking-tight leading-none mt-1 sm:mt-1.5 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {animatedValue}
          </h3>

          {trend && (
            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] sm:text-xs font-semibold">
              <span
                className={
                  trendUp
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-slate-400"
                }
              >
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Cards({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-3 xl:gap-4.5 items-stretch">
      {items.map((card, idx) => (
        <div
          key={card.title || idx}
          data-aos="fade-up"
          data-aos-delay={idx * 60}
          data-aos-duration="500"
          className="animate-fade-in-up h-full"
          style={{ animationDelay: `${idx * 70}ms` }}
        >
          <MetricCard {...card} />
        </div>
      ))}
    </div>
  );
}
