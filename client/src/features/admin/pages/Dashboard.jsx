import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Users,
  Gamepad2,
  IndianRupee,
  Database,
  ArrowRight,
  UserPlus,
  Layers,
  BarChart3,
  RefreshCw,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import { getDashboardOverview } from "../../../services/adminServices";
import { updateRestaurant } from "../../../services/restroServices";

export default function Dashboard() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRestaurants: 0,
    activeVenues: 0,
    totalPlayers: 0,
    gamesPlayedToday: 0,
    totalGamesPlayed: 0,
    platformRevenue: 0,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [subscriptionDistribution, setSubscriptionDistribution] = useState([]);
  const [revenueTrajectory, setRevenueTrajectory] = useState([]);

  // Fetch real database overview
  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await getDashboardOverview();
      if (res?.success && res.data) {
        if (res.data.metrics) setMetrics(res.data.metrics);
        if (Array.isArray(res.data.restaurants)) setRestaurants(res.data.restaurants);
        if (Array.isArray(res.data.subscriptionDistribution)) {
          setSubscriptionDistribution(res.data.subscriptionDistribution);
        }
        if (Array.isArray(res.data.revenueTrajectory)) {
          setRevenueTrajectory(res.data.revenueTrajectory);
        }
      }
    } catch (err) {
      console.warn("Dashboard overview fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Real-time status toggle for onboarded restaurants
  const handleToggleStatus = async (id, e) => {
    e.stopPropagation();
    const target = restaurants.find((r) => r.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    try {
      await updateRestaurant(id, { status: newStatus });
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      setMetrics((prev) => ({
        ...prev,
        activeVenues:
          newStatus === "Active"
            ? prev.activeVenues + 1
            : Math.max(0, prev.activeVenues - 1),
      }));
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // 1. Metric Cards from DB
  const metricCards = [
    {
      title: "Total Restaurants",
      value: String(metrics.totalRestaurants || restaurants.length || 0),
      icon: Store,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Total Players",
      value: String(metrics.totalPlayers || 0),
      icon: Users,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
    {
      title: "Games Played Today",
      value: String(metrics.gamesPlayedToday || 0),
      icon: Gamepad2,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accentBorder: "hover:border-cyan-500/40",
    },
    {
      title: "Platform Revenue",
      value: `₹${Number(metrics.platformRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
  ];

  // Quick Action Shortcuts
  const quickActions = [
    {
      label: "Check Restaurant",
      to: "/admin/restaurants",
      icon: Store,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-200/80 dark:border-purple-500/20 hover:border-purple-500/40",
    },
    {
      label: "User",
      to: "/admin/users",
      icon: UserPlus,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/80 dark:border-blue-500/20 hover:border-blue-500/40",
    },
    {
      label: "Manage Plans",
      to: "/admin/plans",
      icon: Layers,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20 hover:border-amber-500/40",
    },
    {
      label: "View Revenue",
      to: "/admin/revenue",
      icon: BarChart3,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-500/40",
    },
  ];

  // 2. Dynamic Trajectory Chart Data
  const defaultMonths = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const xCoords = [45, 145, 245, 345, 445, 545];

  const chartData = useMemo(() => {
    const list =
      revenueTrajectory.length >= 6
        ? revenueTrajectory.slice(-6)
        : defaultMonths.map((m) => {
            const match = revenueTrajectory.find((r) => r.month === m);
            return match || { month: m, amount: m === "Nov" ? metrics.platformRevenue || 198 : 0 };
          });

    const maxRev = Math.max(...list.map((l) => l.amount), 6000);
    const ceiling = Math.ceil(maxRev / 1000) * 1000;

    const points = list.map((item, idx) => {
      const x = xCoords[idx] || 45 + idx * 100;
      const normalizedRatio = ceiling > 0 ? item.amount / ceiling : 0;
      // Y range: 168 (₹0) to 38 (top peak)
      const y = Math.round(168 - normalizedRatio * (168 - 38));
      return {
        month: item.month,
        amount: item.amount,
        x,
        y: Math.max(38, Math.min(168, y)),
      };
    });

    // Generate smooth SVG cubic bezier path
    let linePath = "";
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) * 0.5;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) * 0.5;
        const cy2 = p1.y;
        linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      }
    }

    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} 168 L ${points[0].x} 168 Z`
        : "";

    const peakPoint = points[points.length - 1] || { x: 545, y: 38, amount: metrics.platformRevenue };

    return {
      points,
      linePath,
      areaPath,
      peakPoint,
      ceiling,
    };
  }, [revenueTrajectory, metrics.platformRevenue]);

  const yTicks = [
    { label: `₹${(chartData.ceiling || 6000).toLocaleString("en-IN")}`, y: 20 },
    { label: `₹${Math.round((chartData.ceiling || 6000) * 0.75).toLocaleString("en-IN")}`, y: 55 },
    { label: `₹${Math.round((chartData.ceiling || 6000) * 0.5).toLocaleString("en-IN")}`, y: 92 },
    { label: `₹${Math.round((chartData.ceiling || 6000) * 0.25).toLocaleString("en-IN")}`, y: 130 },
    { label: "₹0", y: 168 },
  ];

  // 3. Dynamic Donut Chart Data
  const donutData = useMemo(() => {
    const total = metrics.totalRestaurants || restaurants.length || 0;
    const circumference = 276.46; // 2 * pi * 44
    let accumulatedOffset = 0;

    const list =
      subscriptionDistribution.length > 0
        ? subscriptionDistribution
        : [
            {
              name: "Starter Plan",
              count: 1,
              percentage: 50,
              bg: "bg-emerald-500",
              text: "text-emerald-500",
              stroke: "#10b981",
            },
            {
              name: "Pro Growth",
              count: 1,
              percentage: 50,
              bg: "bg-orange-500",
              text: "text-orange-500",
              stroke: "#f97316",
            },
          ];

    const slices = list.map((item) => {
      const arcLength = (item.percentage / 100) * circumference;
      const strokeDasharray = `${arcLength} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += arcLength;
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return { total, slices, list };
  }, [subscriptionDistribution, metrics.totalRestaurants, restaurants.length]);

  // Plan styling helper
  const getPlanBadge = (plan = "") => {
    const p = String(plan).toUpperCase();
    if (p.includes("PRO") || p.includes("GROWTH")) {
      return "bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400";
    }
    if (p.includes("PREMIUM")) {
      return "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300";
    }
    if (p.includes("ENTERPRISE")) {
      return "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400";
    }
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  };

  const getAvatarBg = (initial = "R") => {
    const colors = [
      "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
      "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
      "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    ];
    const charCode = initial.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className="space-y-4 sm:space-y-5 xl:space-y-6 pb-12 select-none">
      {/* 1. Header with Live DB indicator */}
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative"
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={`text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-tight leading-none ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Platform Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Database Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time system health, restaurant tenancy, and SaaS subscription metrics
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOverview}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
          title="Refresh database metrics"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin text-orange-500" : ""} />
          <span>{isLoading ? "Syncing..." : "Refresh DB"}</span>
        </button>
      </header>

      {/* 2. Top Metric Cards (Rendered from Cards Component) */}
      <Cards items={metricCards} />

      {/* 3. Middle Row: Spline Line Chart (6 cols) + Subscription Distribution (3 cols) + Quick Actions (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 xl:gap-5 items-stretch">
        {/* Left: Revenue Growth Trajectory (INR ₹) - 6 cols */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className={`lg:col-span-6 p-4 sm:p-4.5 xl:p-6 rounded-xl sm:rounded-2xl border shadow-xl flex flex-col justify-between space-y-3 xl:space-y-4 ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
            <div>
              <h2
                className={`text-sm sm:text-base xl:text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Revenue Growth Trajectory (INR ₹)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Real-time collections across all venue subscriptions and table orders
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 xl:px-3 xl:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold self-start sm:self-auto shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          {/* Curved Line / Spline Chart View */}
          <div className="relative pt-1 pb-1">
            <svg
              viewBox="0 0 600 215"
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Purple Area Gradient */}
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8b5cf6"
                    stopOpacity={isDark ? "0.35" : "0.22"}
                  />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>

                {/* Line Gradient */}
                <linearGradient
                  id="revenueLine"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {yTicks.map((tick) => (
                <g key={tick.label}>
                  <text
                    x="35"
                    y={tick.y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {tick.label}
                  </text>
                  <line
                    x1="45"
                    y1={tick.y}
                    x2="575"
                    y2={tick.y}
                    stroke={isDark ? "#334155" : "#e2e8f0"}
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    opacity={isDark ? "0.4" : "0.8"}
                  />
                </g>
              ))}

              {/* Area Under Curve */}
              {chartData.areaPath && (
                <path d={chartData.areaPath} fill="url(#revenueGradient)" />
              )}

              {/* Smooth Curved Line */}
              {chartData.linePath && (
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke="url(#revenueLine)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Point Circles on Spline */}
              {chartData.points.map((pt, idx) => {
                const isLast = idx === chartData.points.length - 1;
                return (
                  <g key={pt.month}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isLast ? "5" : "4"}
                      className="fill-[#7c3aed] stroke-white dark:stroke-[#070913] stroke-2 transition-all cursor-pointer hover:r-6"
                    />
                    {/* X-Axis Month Label */}
                    <text
                      x={pt.x}
                      y="192"
                      textAnchor="middle"
                      className={`text-[11px] font-semibold ${
                        isLast
                          ? "fill-[#8b5cf6]"
                          : isDark
                          ? "fill-slate-400"
                          : "fill-slate-500"
                      }`}
                    >
                      {pt.month}
                    </text>
                  </g>
                );
              })}

              {/* Peak Floating Pill Badge */}
              {chartData.peakPoint && (
                <g transform={`translate(${chartData.peakPoint.x}, ${chartData.peakPoint.y})`}>
                  <rect
                    x="-36"
                    y="-28"
                    width="72"
                    height="22"
                    rx="6"
                    className="fill-[#7c3aed] filter drop-shadow-md"
                  />
                  <text
                    x="0"
                    y="-13"
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-white"
                  >
                    ₹{Number(metrics.platformRevenue || chartData.peakPoint.amount || 0).toLocaleString("en-IN")}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Middle: Subscription Distribution Donut Chart - 3 cols */}
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className={`lg:col-span-3 p-3.5 sm:p-4 xl:p-5 rounded-xl sm:rounded-2xl border shadow-xl flex flex-col justify-between space-y-2.5 xl:space-y-3.5 ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-xs sm:text-sm xl:text-base font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Subscription Distribution
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
              Active Tiers
            </span>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 py-0.5 flex-1">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 xl:w-36 xl:h-36 shrink-0 my-auto">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full -rotate-90 transform"
              >
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke={isDark ? "#1e293b" : "#f1f5f9"}
                  strokeWidth="13"
                />

                {/* Dynamic Plan Arcs from DB */}
                {donutData.slices.map((slice) => (
                  <circle
                    key={slice.name}
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke={slice.stroke}
                    strokeWidth="13"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-700"
                  />
                ))}
              </svg>

              {/* Center Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={`text-xl sm:text-2xl font-black leading-none ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {donutData.total}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                  Restaurants
                </span>
              </div>
            </div>

            {/* Plan Breakdown List from DB */}
            <div className="w-full space-y-1.5 pt-1">
              {donutData.list.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between p-1.5 sm:p-2 xl:p-2.5 rounded-xl border transition-colors ${
                    isDark
                      ? "bg-white/[0.025] border-white/[0.06]"
                      : "bg-white/70 border-slate-200/80 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full ${item.bg} shrink-0 shadow-xs`} />
                    <span
                      className={`font-bold text-[11px] xl:text-xs truncate ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`font-bold whitespace-nowrap text-[11px] xl:text-xs shrink-0 ml-1.5 ${item.text}`}
                  >
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions - 3 cols */}
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className={`lg:col-span-3 p-3.5 sm:p-4 xl:p-5 rounded-xl sm:rounded-2xl border shadow-xl flex flex-col justify-between space-y-2.5 xl:space-y-3.5 ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-xs sm:text-sm xl:text-base font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Quick Actions
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
              Shortcuts
            </span>
          </div>

          {/* 4 Action Cards in a 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 xl:gap-2.5 flex-1 py-0.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`p-2 sm:p-2.5 xl:p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-200 group cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 ${action.bg}`}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-lg bg-white dark:bg-slate-800/90 shadow-xs flex items-center justify-center shrink-0 ${action.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={18} className="stroke-[2.2]" />
                  </div>
                  <span
                    className={`text-[10.5px] sm:text-[11px] xl:text-xs font-bold leading-tight line-clamp-1 truncate w-full text-center ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                    title={action.label}
                  >
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Real Onboarded Restaurants Table (From MySQL DB) */}
      <div
        data-aos="fade-up"
        data-aos-delay="200"
        className={`p-4 sm:p-4.5 xl:p-6 rounded-xl sm:rounded-2xl border shadow-xl flex flex-col justify-between space-y-3 sm:space-y-4 ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2
              className={`text-sm sm:text-base xl:text-lg font-bold tracking-tight truncate ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Real Onboarded Restaurants
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[9px] sm:text-[10px] font-extrabold tracking-wider shrink-0">
              {restaurants.length} Registered
            </span>
          </div>

          <Link
            to="/admin/restaurants"
            className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-orange-500 flex items-center gap-1 transition-colors group cursor-pointer shrink-0"
          >
            <span>Manage All Venues</span>
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] xl:text-[11px] font-bold text-slate-400 uppercase tracking-wider ${
                  isDark ? "border-white/[0.06]" : "border-slate-200"
                }`}
              >
                <th className="py-2 xl:py-2.5 px-2">RESTAURANT</th>
                <th className="py-2 xl:py-2.5 px-2">OWNER</th>
                <th className="py-2 xl:py-2.5 px-2">PLAN</th>
                <th className="py-2 xl:py-2.5 px-2">TABLES LIMIT</th>
                <th className="py-2 xl:py-2.5 px-2">STATUS</th>
                <th className="py-2 xl:py-2.5 px-2 text-right">JOINED</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-white/[0.04]" : "divide-slate-100"
              }`}
            >
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No onboarded restaurants found in database.
                  </td>
                </tr>
              ) : (
                restaurants.map((resto) => {
                  const initial = (resto.name || "R").charAt(0).toUpperCase();
                  const avatarBg = getAvatarBg(initial);
                  const planBadgeClass = getPlanBadge(resto.plan);
                  const tablesText =
                    typeof resto.tablesCount === "number" && resto.tablesCount > 0
                      ? `${resto.tablesCount} tables`
                      : "5 max";
                  const joinedDate = resto.createdAt
                    ? new Date(resto.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Nov 2026";

                  return (
                    <tr
                      key={resto.id}
                      className={`transition-colors group ${
                        isDark ? "hover:bg-white/[0.025]" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Restaurant Name with Avatar */}
                      <td className="py-2.5 xl:py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border ${avatarBg} font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {initial}
                          </div>
                          <span
                            className={`font-semibold text-xs xl:text-sm truncate max-w-[140px] xl:max-w-none transition-colors group-hover:text-orange-500 ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {resto.name}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td
                        className={`py-2.5 xl:py-3 px-2 truncate max-w-[110px] xl:max-w-none text-[11px] xl:text-xs ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {resto.owner}
                      </td>

                      {/* Plan */}
                      <td className="py-2.5 xl:py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md border ${planBadgeClass} text-[9px] xl:text-[10px] font-extrabold tracking-wider`}
                        >
                          {resto.plan || "STARTER"}
                        </span>
                      </td>

                      {/* Tables Limit */}
                      <td className="py-2.5 xl:py-3 px-2 text-[10px] xl:text-[11px] text-slate-400 truncate">
                        {tablesText}
                      </td>

                      {/* Status Slider Toggle Switch */}
                      <td
                        className="py-2.5 xl:py-3 px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(resto.id, e)}
                            className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              resto.status === "Active"
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={resto.status === "Active"}
                            title={`Click to switch to ${
                              resto.status === "Active" ? "Inactive" : "Active"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                resto.status === "Active"
                                  ? "translate-x-4.5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] xl:text-[11px] font-bold ${
                              resto.status === "Active"
                                ? "text-emerald-500"
                                : "text-slate-400"
                            }`}
                          >
                            {resto.status}
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-2.5 xl:py-3 px-2 text-slate-400 text-[10px] xl:text-[11px] text-right whitespace-nowrap">
                        {joinedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
