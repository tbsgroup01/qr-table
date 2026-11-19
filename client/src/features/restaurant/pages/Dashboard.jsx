import { Link } from "react-router-dom";
import {
  IndianRupee,
  UtensilsCrossed,
  QrCode,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Timer,
  Crown,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useOrders } from "../../../context/OrderContext";
import Cards from "../../../components/Cards";

export default function Dashboard() {
  const { isDark } = useTheme();
  const { orders } = useOrders();

  const storedRestro = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("currentRestaurant") || "{}")
    : {};
  const currentPlan = (storedRestro.plan || "Starter").toUpperCase();

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.numericAmount || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status === "In Kitchen" || o.status === "Ready to Serve").length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const metricCards = [
    {
      title: "Today's Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Today's Orders",
      value: orders.length.toString(),
      icon: UtensilsCrossed,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Occupied Tables",
      value: `${activeOrdersCount} Tables`,
      icon: QrCode,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Avg. Order Value",
      value: `₹${avgOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
  ];

  const yTicks = [
    { label: "₹5,000", y: 20 },
    { label: "₹3,750", y: 55 },
    { label: "₹2,500", y: 92 },
    { label: "₹1,250", y: 130 },
    { label: "₹0", y: 168 },
  ];

  const chartPoints = [
    { time: "10 AM", x: 45, y: 155 },
    { time: "12 PM", x: 128, y: 110 },
    { time: "2 PM", x: 211, y: 65 },
    { time: "4 PM", x: 295, y: 125 },
    { time: "6 PM", x: 378, y: 80 },
    { time: "8 PM", x: 462, y: 35 },
    { time: "10 PM", x: 545, y: 95 },
  ];

  const recentOrders = orders.slice(0, 5).map((ord) => ({
    id: ord.id,
    table: ord.table,
    items: ord.items?.map((i) => `${i.qty}x ${i.name}`).join(", ") || "Assorted dishes",
    amount: ord.amount,
    payment: ord.payment,
    paid: ord.paid,
    status: ord.status,
    statusColor: ord.statusColor,
    icon: ord.status === "Completed" ? CheckCircle2 : ord.status === "Ready to Serve" ? UtensilsCrossed : Timer,
    time: ord.time || "Just now",
  }));

  return (
    <div className="space-y-6 pb-12 select-none animate-fade-in">
      <header data-aos="fade-down" data-aos-duration="500" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative animate-fade-in-up">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Restaurant Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Real-time table orders, revenue performance, and dining overview
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto shrink-0 animate-pulse-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Table Orders
        </span>
      </header>

      {/* Active Subscription & Upgrade Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
          isDark
            ? "bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20"
            : "bg-gradient-to-r from-orange-50 via-amber-50/40 to-white border-orange-200/80 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
            <Crown size={22} className="stroke-[2.2] fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Current Subscription
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-500 text-white shadow-xs">
                {currentPlan}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Plan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live QR ordering, kitchen display and analytics active. Upgrade anytime to scale tables and unlock multiplayer arcade games.
            </p>
          </div>
        </div>

        <Link
          to="/plans"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Sparkles size={14} className="fill-white" />
          <span>Upgrade Plan</span>
          <ArrowRight size={14} className="stroke-[2.5]" />
        </Link>
      </div>

      <Cards items={metricCards} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className={`lg:col-span-8 p-6 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Today's Sales Trajectory (INR ₹)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hourly order collections and kitchen billing performance
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-semibold self-start sm:self-auto shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Live Billing Sync
            </span>
          </div>

          <div className="relative pt-2 pb-1">
            <svg
              viewBox="0 0 600 215"
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient
                  id="restaurantRevenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#f97316"
                    stopOpacity={isDark ? "0.35" : "0.22"}
                  />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient
                  id="restaurantRevenueLine"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>

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
                    x2="590"
                    y2={tick.y}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4 4"
                  />
                </g>
              ))}

              <path
                d="M 45 155 C 86 132, 87 110, 128 110 C 169 110, 170 65, 211 65 C 252 65, 254 125, 295 125 C 336 125, 337 80, 378 80 C 420 80, 421 35, 462 35 C 503 35, 504 95, 545 95 L 545 168 L 45 168 Z"
                fill="url(#restaurantRevenueGradient)"
                className="animate-fade-in"
              />

              <path
                d="M 45 155 C 86 132, 87 110, 128 110 C 169 110, 170 65, 211 65 C 252 65, 254 125, 295 125 C 336 125, 337 80, 378 80 C 420 80, 421 35, 462 35 C 503 35, 504 95, 545 95"
                fill="none"
                stroke="url(#restaurantRevenueLine)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-draw-line"
              />

              {chartPoints.map((pt) => {
                const isPeak = pt.time === "8 PM";
                return (
                  <g key={pt.time}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isPeak ? "5.5" : "3.5"}
                      className={
                        isPeak
                          ? "fill-[#ea580c] stroke-white stroke-2"
                          : "fill-[#0f172a] dark:fill-white stroke-[#f97316] stroke-2"
                      }
                    />
                    <text
                      x={pt.x}
                      y="190"
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-medium"
                    >
                      {pt.time}
                    </text>
                  </g>
                );
              })}

              <g transform="translate(462, 35)">
                <rect
                  x="-32"
                  y="-28"
                  width="64"
                  height="22"
                  rx="6"
                  className="fill-[#ea580c] filter drop-shadow-md"
                />
                <text
                  x="0"
                  y="-13"
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-white"
                >
                  ₹4,200
                </text>
              </g>
            </svg>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className={`lg:col-span-4 p-6 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-base font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Table Occupancy
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              Live Status
            </span>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 py-1 flex-1">
            <div className="relative w-40 h-40 shrink-0 my-auto">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full -rotate-90 transform"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke={isDark ? "#1e293b" : "#f1f5f9"}
                  strokeWidth="13"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="13"
                  strokeDasharray="207.35 276.46"
                  strokeDashoffset="0"
                  className="transition-all duration-700"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="13"
                  strokeDasharray="69.11 276.46"
                  strokeDashoffset="-207.35"
                  className="transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={`text-3xl font-black leading-none ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  16
                </span>
                <span className="text-xs font-semibold text-slate-400 mt-1">
                  Total Tables
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <div
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-200 hover:translate-x-1 cursor-pointer ${
                  isDark
                    ? "bg-white/[0.025] border-white/[0.06] hover:border-orange-500/40"
                    : "bg-white/70 border-slate-200/80 shadow-sm hover:border-orange-500/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/50" />
                  <span
                    className={`font-bold truncate ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    Occupied (Customer Seated)
                  </span>
                </div>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 whitespace-nowrap text-xs">
                  12 (75%)
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-200 hover:translate-x-1 cursor-pointer ${
                  isDark
                    ? "bg-white/[0.025] border-white/[0.06] hover:border-emerald-500/40"
                    : "bg-white/70 border-slate-200/80 shadow-sm hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                  <span
                    className={`font-bold truncate ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    Empty / Available
                  </span>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-xs">
                  4 (25%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-aos="fade-up"
        data-aos-delay="200"
        className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 animate-fade-in-up ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Recent Table Orders
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold tracking-wider shrink-0">
              5 New
            </span>
          </div>

          <Link
            to="/restaurant/live-orders"
            className="text-xs font-semibold text-slate-400 hover:text-orange-500 flex items-center gap-1 transition-colors group cursor-pointer shrink-0"
          >
            <span>Open Kitchen Display</span>
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] font-bold text-slate-400 uppercase tracking-wider ${
                  isDark ? "border-white/[0.06]" : "border-slate-200"
                }`}
              >
                <th className="py-2.5 px-3">ORDER ID</th>
                <th className="py-2.5 px-3">TABLE</th>
                <th className="py-2.5 px-3">ITEMS</th>
                <th className="py-2.5 px-3">AMOUNT</th>
                <th className="py-2.5 px-3">PAYMENT</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">TIME</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-white/[0.04]" : "divide-slate-100"
              }`}
            >
              {recentOrders.map((order) => {
                const StatusIcon = order.icon;
                return (
                  <tr
                    key={order.id}
                    className={`transition-all duration-200 group ${
                      isDark
                        ? "hover:bg-white/[0.04]"
                        : "hover:bg-orange-500/[0.04]"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-orange-500">
                      {order.id}
                    </td>

                    <td className="py-3 px-3 font-semibold whitespace-nowrap">
                      {order.table}
                    </td>

                    <td
                      className={`py-3 px-3 max-w-[280px] truncate ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                      title={order.items}
                    >
                      {order.items}
                    </td>

                    <td className="py-3 px-3 font-bold">
                      {order.amount}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          order.paid
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {order.payment} • {order.paid ? "Paid" : "Pending"}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.statusColor}`}
                      >
                        <StatusIcon size={11} />
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 justify-end">
                        <Clock size={11} />
                        {order.time}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
