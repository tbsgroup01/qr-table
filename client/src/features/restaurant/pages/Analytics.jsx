import { useState, useEffect } from "react";
import {
  HelpCircle,
  TrendingUp,
  Clock,
  Search,
  ArrowUpRight,
  UtensilsCrossed,
  RotateCw,
  User,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import Pagination from "../../../components/Pagination";
import { getAllQuizPlays } from "../../../services/quizServices";

export default function Analytics() {
  const { isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metrics, setMetrics] = useState({
    totalPlays: 0,
    freeDishesWon: 0,
    totalRevenueDriven: 0,
  });

  const fetchPlays = async () => {
    try {
      setIsLoading(true);
      const res = await getAllQuizPlays();
      if (res && res.success) {
        setSessions(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error("Error fetching quiz plays:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlays();
    const interval = setInterval(fetchPlays, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-slate-500/15 border-slate-500/30 text-slate-400";
    if (status === "Dish Served") return "bg-emerald-500/15 border-emerald-500/30 text-emerald-500";
    if (status.includes("Active")) return "bg-amber-500/15 border-amber-500/30 text-amber-500";
    return "bg-slate-500/15 border-slate-500/30 text-slate-400";
  };

  const metricCards = [
    {
      title: "Total Quiz Plays",
      value: metrics.totalPlays ? metrics.totalPlays.toLocaleString() : "0",
      icon: HelpCircle,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Free Dishes Won",
      value: metrics.freeDishesWon ? metrics.freeDishesWon.toLocaleString() : "0",
      icon: UtensilsCrossed,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Quiz-Driven Revenue",
      value: `₹${(metrics.totalRevenueDriven || 0).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Avg Completion Time",
      value: "1m 42s",
      icon: Clock,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      glowColor: "from-amber-500/20 via-amber-500/5 to-transparent",
      accentBorder: "hover:border-amber-500/40",
    },
  ];

  const trendData = [
    { day: "Mon", plays: 320, redeemed: 210, x: 50, yPlays: 155, yRedeemed: 185 },
    { day: "Tue", plays: 290, redeemed: 195, x: 135, yPlays: 165, yRedeemed: 190 },
    { day: "Wed", plays: 380, redeemed: 270, x: 220, yPlays: 130, yRedeemed: 160 },
    { day: "Thu", plays: 410, redeemed: 295, x: 305, yPlays: 115, yRedeemed: 150 },
    { day: "Fri", plays: 540, redeemed: 380, x: 390, yPlays: 65, yRedeemed: 115 },
    { day: "Sat", plays: 620, redeemed: 460, x: 475, yPlays: 35, yRedeemed: 80 },
    { day: "Sun", plays: 580, redeemed: 420, x: 560, yPlays: 50, yRedeemed: 95 },
  ];

  const quizDistribution = [
    {
      name: "Desi Foodie Challenge",
      plays: 1192,
      percentage: 42,
      color: "from-orange-500 to-amber-500",
      reward: "Free Hot Gulab Jamun",
    },
    {
      name: "Biryani & Kebabs Trivia",
      plays: 880,
      percentage: 31,
      color: "from-blue-500 to-cyan-500",
      reward: "Free Garlic Butter Naan",
    },
    {
      name: "Guess Secret Sauce",
      plays: 511,
      percentage: 18,
      color: "from-emerald-500 to-teal-500",
      reward: "Free Masala Fries",
    },
    {
      name: "Bollywood & Chai Master",
      plays: 257,
      percentage: 9,
      color: "from-purple-500 to-indigo-500",
      reward: "Free Sweet Lassi",
    },
  ];

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (s.table && s.table.toLowerCase().includes(q)) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.quiz && s.quiz.toLowerCase().includes(q)) ||
      (s.dish && s.dish.toLowerCase().includes(q)) ||
      (s.sessionId && s.sessionId.toLowerCase().includes(q)) ||
      (s.orderId && s.orderId.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "SERVED" && s.status === "Dish Served") ||
      (statusFilter === "ACTIVE" && s.status && s.status.includes("Active"));

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      <header data-aos="fade-down" data-aos-duration="500" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Quiz & Trivia Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Customer engagement, live table quiz plays, and reward redemption tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPlays}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh Data</span>
          </button>
        </div>
      </header>

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
                Quiz Plays vs. Free Dishes Claimed
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Diners taking table quizzes compared to complimentary dishes served
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-orange-500">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Quiz Plays</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Dishes Claimed</span>
              </div>
            </div>
          </div>

          <div className="relative pt-2 pb-1">
            <svg
              viewBox="0 0 600 230"
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient
                  id="quizPlaysGrad"
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
                  id="quizRedeemedGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity={isDark ? "0.25" : "0.15"}
                  />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[
                { y: 35, label: "600" },
                { y: 85, label: "450" },
                { y: 135, label: "300" },
                { y: 185, label: "150" },
              ].map((tick) => (
                <g key={tick.label}>
                  <line
                    x1="40"
                    y1={tick.y}
                    x2="580"
                    y2={tick.y}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4 4"
                  />
                  <text
                    x="30"
                    y={tick.y + 3}
                    fill={isDark ? "#64748b" : "#94a3b8"}
                    fontSize="10"
                    textAnchor="end"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              <path
                d="M 50 155 Q 92 160 135 165 T 220 130 T 305 115 T 390 65 T 475 35 T 560 50 L 560 210 L 50 210 Z"
                fill="url(#quizPlaysGrad)"
              />
              <path
                d="M 50 155 Q 92 160 135 165 T 220 130 T 305 115 T 390 65 T 475 35 T 560 50"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M 50 185 Q 92 188 135 190 T 220 160 T 305 150 T 390 115 T 475 80 T 560 95 L 560 210 L 50 210 Z"
                fill="url(#quizRedeemedGrad)"
              />
              <path
                d="M 50 185 Q 92 188 135 190 T 220 160 T 305 150 T 390 115 T 475 80 T 560 95"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {trendData.map((d, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g key={d.day}>
                    <line
                      x1={d.x}
                      y1="25"
                      x2={d.x}
                      y2="205"
                      stroke={
                        isHovered
                          ? isDark
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.15)"
                          : "transparent"
                      }
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    <circle
                      cx={d.x}
                      cy={d.yPlays}
                      r={isHovered ? "5" : "3.5"}
                      fill="#f97316"
                      stroke={isDark ? "#0f172a" : "#ffffff"}
                      strokeWidth="2"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    <circle
                      cx={d.x}
                      cy={d.yRedeemed}
                      r={isHovered ? "5" : "3.5"}
                      fill="#10b981"
                      stroke={isDark ? "#0f172a" : "#ffffff"}
                      strokeWidth="2"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    <text
                      x={d.x}
                      y="222"
                      fill={isHovered ? (isDark ? "#fff" : "#0f172a") : (isDark ? "#64748b" : "#94a3b8")}
                      fontSize="10"
                      fontWeight={isHovered ? "bold" : "normal"}
                      textAnchor="middle"
                    >
                      {d.day}
                    </text>

                    {isHovered && (
                      <g>
                        <rect
                          x={d.x - 42}
                          y={d.yPlays - 45}
                          width="84"
                          height="36"
                          rx="8"
                          fill={isDark ? "#0f172a" : "#1e293b"}
                          stroke={isDark ? "#334155" : "#475569"}
                          strokeWidth="1"
                        />
                        <text
                          x={d.x}
                          y={d.yPlays - 32}
                          fill="#f97316"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Plays: {d.plays}
                        </text>
                        <text
                          x={d.x}
                          y={d.yPlays - 18}
                          fill="#10b981"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Dishes: {d.redeemed}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className={`lg:col-span-4 p-6 rounded-2xl border shadow-xl flex flex-col justify-between ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/60 backdrop-blur-2xl border-white/70"
          }`}
        >
          <div>
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Trivia Popularity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Player volume and reward appeal across active quizzes
            </p>

            <div className="mt-5 space-y-4">
              {quizDistribution.map((q) => (
                <div key={q.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold line-clamp-1 ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {q.name}
                    </span>
                    <span className="font-extrabold text-orange-500 shrink-0 ml-2">
                      {q.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${q.color} transition-all duration-500`}
                      style={{ width: `${q.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{q.plays} customer attempts</span>
                    <span className="font-medium text-emerald-500">
                      {q.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Conversion</span>
            <span className="font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight size={14} />
              68.5% win & claim
            </span>
          </div>
        </div>
      </div>

      <div
        data-aos="fade-up"
        data-aos-delay="250"
        className={`p-6 rounded-2xl border shadow-xl space-y-4 ${
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
              Recent Table Quiz Sessions & Free Dishes Won
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live database log of diners playing trivia, answering questions, and winning complimentary dishes
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search customer, table, quiz, dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b ${
                  isDark
                    ? "border-white/10 text-slate-400"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <th className="py-3 px-3 font-bold">Session ID</th>
                <th className="py-3 px-3 font-bold">Table</th>
                <th className="py-3 px-3 font-bold">Customer / Player</th>
                <th className="py-3 px-3 font-bold">Order ID</th>
                <th className="py-3 px-3 font-bold">Quiz Played</th>
                <th className="py-3 px-3 font-bold text-center">Score</th>
                <th className="py-3 px-3 font-bold">Free Dish Won</th>
                <th className="py-3 px-3 font-bold">Bill Total</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right">Time</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-white/5" : "divide-slate-100"
              }`}
            >
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    {isLoading ? "Loading live quiz sessions..." : "No quiz play sessions found."}
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((session) => (
                  <tr
                    key={session.id || session.sessionId}
                    className={`transition-colors ${
                      isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      {session.sessionId}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-orange-500 whitespace-nowrap">
                      {session.table}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-orange-500/20">
                          {session.customerName ? session.customerName.charAt(0).toUpperCase() : "G"}
                        </div>
                        <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                          {session.customerName || "Diner Guest"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {session.orderId || "—"}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {session.quiz}
                    </td>
                    <td className="py-3 px-3 font-bold text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                        {session.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-500 whitespace-nowrap">
                      {session.dish}
                    </td>
                    <td className="py-3 px-3 font-extrabold whitespace-nowrap">
                      <span className={isDark ? "text-white" : "text-slate-900"}>
                        {session.billAmount}
                      </span>
                      {session.isWinner && (
                        <span className="text-[10px] text-orange-500 block font-semibold">
                          + Free Dish Added
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                          session.status
                        )}`}
                      >
                        <span>{session.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(session.createdAt || session.time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSessions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
