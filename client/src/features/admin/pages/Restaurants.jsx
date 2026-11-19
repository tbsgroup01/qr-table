import { useState, useEffect } from "react";
import {
  Store,
  Search,
  Eye,
  CheckCircle2,
  IndianRupee,
  Trash2,
  X,
  User,
  Phone,
  Layers,
  Calendar,
  QrCode,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import Pagination from "../../../components/Pagination";
import {
  getAllRestaurants,
  updateRestaurant,
  deleteRestaurant as apiDeleteRestaurant,
  bulkDeleteRestaurants,
} from "../../../services/restroServices";

export default function Restaurants() {
  const { isDark } = useTheme();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer State
  const [drawerResto, setDrawerResto] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Metrics from DB
  const [metrics, setMetrics] = useState({
    totalRestaurants: 0,
    activeVenues: 0,
    activeQrTables: 0,
    platformRevenue: 0,
  });

  // Restaurants list state (Live from DB)
  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await getAllRestaurants();
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((r, idx) => {
          const planName = (r.plan || "STARTER").toUpperCase();
          let planColor =
            "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
          if (planName === "PREMIUM") {
            planColor =
              "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300";
          } else if (planName === "ENTERPRISE") {
            planColor =
              "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300";
          }

          return {
            id: r.id,
            name: r.name,
            initial: (r.name || "R")[0].toUpperCase(),
            avatarBg:
              idx % 2 === 0
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
            owner: r.owner || "N/A",
            phone: r.phone || "N/A",
            email: r.email || "N/A",
            address: r.address || "",
            plan: planName,
            planColor,
            tablesLimit:
              typeof r.tablesCount === "number"
                ? `${r.tablesCount} tables`
                : "5 max",
            status: r.status || "Active",
            joined: r.createdAt
              ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : "Nov 2026",
          };
        });

        setRestaurants(formatted);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.warn("Could not fetch restaurants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Metric stats calculated dynamically from database
  const metricCards = [
    {
      title: "Total Restaurants",
      value: (metrics.totalRestaurants || restaurants.length).toString(),
      icon: Store,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Active Venues",
      value: (
        metrics.activeVenues ||
        restaurants.filter((r) => r.status === "Active").length
      ).toString(),
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Active QR Tables",
      value: (metrics.activeQrTables || 0).toString(),
      icon: QrCode,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accentBorder: "hover:border-cyan-500/40",
    },
    {
      title: "Platform Revenue",
      value: `₹${(metrics.platformRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
  ];

  // Filter restaurants by query, plan, status
  const filteredRestaurants = restaurants.filter((resto) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (resto.name && resto.name.toLowerCase().includes(q)) ||
      (resto.owner && resto.owner.toLowerCase().includes(q)) ||
      (resto.phone && resto.phone.toLowerCase().includes(q));

    const matchesPlan =
      selectedPlan === "ALL" || resto.plan.toUpperCase() === selectedPlan;

    const matchesStatus =
      selectedStatus === "ALL" || resto.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlan, selectedStatus]);

  const totalPages = Math.ceil(filteredRestaurants.length / pageSize) || 1;
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Master Select All / Deselect All
  const isAllSelected =
    filteredRestaurants.length > 0 &&
    filteredRestaurants.every((r) => selectedIds.includes(r.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredRestaurants.map((r) => r.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIds.has(id)));
    } else {
      const combined = new Set([
        ...selectedIds,
        ...filteredRestaurants.map((r) => r.id),
      ]);
      setSelectedIds(Array.from(combined));
    }
  };

  // Toggle Single Row Selection
  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Delete Selected in Database
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteRestaurants(selectedIds);
      setRestaurants((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      if (drawerResto && selectedIds.includes(drawerResto.id)) {
        setDrawerResto(null);
      }
      setSelectedIds([]);
      fetchRestaurants();
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  // Single Delete in Database
  const deleteRestaurant = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiDeleteRestaurant(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (drawerResto && drawerResto.id === id) {
        setDrawerResto(null);
      }
      fetchRestaurants();
    } catch (err) {
      console.error("Delete restaurant error:", err);
    }
  };

  // Toggle restaurant active status in Database
  const toggleStatus = async (id, e) => {
    if (e) e.stopPropagation();
    const target = restaurants.find((r) => r.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    try {
      await updateRestaurant(id, { status: newStatus });
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (drawerResto && drawerResto.id === id) {
        setDrawerResto((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchRestaurants();
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      {/* 1. Header: Matches Dashboard.jsx theme */}
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Restaurants Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Database Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage onboarded restaurants, menu sync, QR tables, and subscription plans
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={fetchRestaurants}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* 2. Top Metric Cards (Rendered using Cards Component) */}
      <Cards items={metricCards} />

      {/* 3. Main Restaurant Directory (Glassy Container) */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className={`p-6 rounded-2xl border shadow-xl flex flex-col space-y-5 ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Top Controls: Title, Count Badge, Bulk Delete Button, Search Input, and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Registered Restaurants
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-extrabold tracking-wider">
              {filteredRestaurants.length} Venues
            </span>

            {/* Bulk Delete Action Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm animate-fade-in"
                title="Delete all selected restaurants"
              >
                <Trash2 size={13} className="stroke-[2.2]" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          {/* Search Bar & Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[220px] sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search restaurant, owner, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-xs"
                }`}
              />
            </div>

            {/* Plan Filter Pills */}
            <div
              className={`flex items-center p-1 rounded-xl border text-[11px] font-semibold gap-1 ${
                isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-100/80 border-slate-200"
              }`}
            >
              <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">
                Plan:
              </span>
              {["ALL", "STARTER", "PREMIUM"].map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    selectedPlan === plan
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            {/* Status Filter Pills */}
            <div
              className={`flex items-center p-1 rounded-xl border text-[11px] font-semibold gap-1 ${
                isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-100/80 border-slate-200"
              }`}
            >
              <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">
                Status:
              </span>
              {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Responsive Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] font-extrabold uppercase tracking-wider ${
                  isDark
                    ? "border-white/10 text-slate-400"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {/* Master Bulk Select Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                    title="Select All / Deselect All"
                  />
                </th>
                <th className="py-3 px-3">RESTAURANT</th>
                <th className="py-3 px-3">OWNER</th>
                <th className="py-3 px-3">CONTACT</th>
                <th className="py-3 px-3">PLAN</th>
                <th className="py-3 px-3">TABLES COUNT</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">JOINED</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-white/[0.04]" : "divide-slate-100"
              }`}
            >
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <RotateCw className="mx-auto mb-2 animate-spin text-orange-500" size={24} />
                    <p className="font-semibold text-sm">Loading restaurants from database...</p>
                  </td>
                </tr>
              ) : filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <Store className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="font-semibold text-sm">No restaurants found in database</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search query or onboard a new venue
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRestaurants.map((resto) => {
                  const isSelected = selectedIds.includes(resto.id);
                  return (
                    <tr
                      key={resto.id}
                      onClick={() => setDrawerResto(resto)}
                      className={`transition-colors group cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/10 hover:bg-orange-500/15"
                            : "bg-orange-50/70 hover:bg-orange-50"
                          : isDark
                          ? "hover:bg-white/[0.025]"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleRow(resto.id, e)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Restaurant Name & Avatar */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border ${resto.avatarBg} font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {resto.initial}
                          </div>
                          <span
                            className={`font-semibold truncate max-w-[130px] transition-colors group-hover:text-orange-500 ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {resto.name}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td
                        className={`py-3.5 px-3 font-medium truncate max-w-[110px] ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {resto.owner}
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                        {resto.phone}
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide border ${resto.planColor}`}
                        >
                          {resto.plan}
                        </span>
                      </td>

                      {/* Tables Count */}
                      <td
                        className={`py-3.5 px-3 font-medium ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {resto.tablesLimit}
                      </td>

                      {/* Status Slider Toggle */}
                      <td
                        className="py-3.5 px-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => toggleStatus(resto.id, e)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              resto.status === "Active"
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={resto.status === "Active"}
                            title={`Click to switch to ${resto.status === "Active" ? "Inactive" : "Active"}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                resto.status === "Active" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
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
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {resto.joined}
                      </td>

                      {/* Actions: Eye Icon (Opens Drawer) & Delete Icon */}
                      <td
                        className="py-3.5 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDrawerResto(resto)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:scale-105"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:scale-105"
                            }`}
                            title="View Restaurant Details"
                          >
                            <Eye size={14} className="stroke-[2.2]" />
                          </button>

                          <button
                            onClick={(e) => deleteRestaurant(resto.id, e)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:scale-105"
                                : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:scale-105"
                            }`}
                            title="Remove Restaurant from DB"
                          >
                            <Trash2 size={14} className="stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRestaurants.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 5. Detailed Slide-Over Drawer */}
      {drawerResto && (
        <div className="fixed inset-0 z-50 overflow-hidden font-poppins">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerResto(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              className={`w-screen max-w-md border-l shadow-2xl flex flex-col justify-between ${
                isDark
                  ? "bg-[#0b0f1d] border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    Restaurant Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live database record overview
                  </p>
                </div>
                <button
                  onClick={() => setDrawerResto(null)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                      : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Profile Card */}
                <div
                  className={`p-5 rounded-2xl border flex items-center gap-4 ${
                    isDark
                      ? "bg-white/[0.03] border-white/10"
                      : "bg-slate-50 border-slate-200/80 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl border ${drawerResto.avatarBg} font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {drawerResto.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold truncate">
                        {drawerResto.name}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${drawerResto.planColor}`}
                      >
                        {drawerResto.plan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Venue Information
                  </h5>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    {/* Owner */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <User size={15} />
                        <span className="font-semibold">Registered Owner</span>
                      </div>
                      <span className="font-bold">{drawerResto.owner}</span>
                    </div>

                    {/* Contact */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Phone size={15} />
                        <span className="font-semibold">Contact Phone</span>
                      </div>
                      <span className="font-mono font-bold">{drawerResto.phone}</span>
                    </div>

                    {/* Tables */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Layers size={15} />
                        <span className="font-semibold">Active Tables</span>
                      </div>
                      <span className="font-bold">{drawerResto.tablesLimit}</span>
                    </div>

                    {/* Status */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <ShieldCheck size={15} />
                        <span className="font-semibold">Venue Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleStatus(drawerResto.id, e)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            drawerResto.status === "Active"
                              ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                              : isDark
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                          role="switch"
                          aria-checked={drawerResto.status === "Active"}
                          title={`Click to switch to ${drawerResto.status === "Active" ? "Inactive" : "Active"}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              drawerResto.status === "Active" ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            drawerResto.status === "Active"
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          {drawerResto.status}
                        </span>
                      </div>
                    </div>

                    {/* Joined */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Calendar size={15} />
                        <span className="font-semibold">Onboarded Since</span>
                      </div>
                      <span className="font-bold">{drawerResto.joined}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => toggleStatus(drawerResto.id, e)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    drawerResto.status === "Active"
                      ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                  }`}
                >
                  {drawerResto.status === "Active" ? "Deactivate Venue" : "Activate Venue"}
                </button>
                <button
                  onClick={(e) => deleteRestaurant(drawerResto.id, e)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-500/10 border border-rose-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
