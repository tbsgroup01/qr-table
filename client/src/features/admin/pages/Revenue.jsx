import { useState, useEffect } from "react";
import {
  IndianRupee,
  Layers,
  Store,
  TrendingUp,
  Search,
  Eye,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  Calendar,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import Pagination from "../../../components/Pagination";
import {
  getAllTransactions,
  deleteTransaction as apiDeleteTx,
  bulkDeleteTransactions as apiBulkDeleteTx,
} from "../../../services/revenueServices";

export default function Revenue() {
  const { isDark } = useTheme();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer State for Transaction Details
  const [drawerTx, setDrawerTx] = useState(null);

  // Transactions list state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    platformRevenue: 0,
    saasSubscriptions: 0,
    activePaidVenues: 0,
    avgRevenuePerVenue: 0,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAllTransactions();
      if (res?.success && Array.isArray(res.data)) {
        const formatted = res.data.map((t, idx) => ({
          id: t.invoiceNumber || `INV-${t.id}`,
          dbId: t.id,
          restaurant: t.restaurantName,
          initial: (t.restaurantName || "R")[0].toUpperCase(),
          avatarBg:
            idx % 3 === 0
              ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
              : idx % 3 === 1
              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
              : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          plan: t.plan || "STARTER",
          planColor:
            (t.plan || "").toUpperCase().includes("PRO") || (t.plan || "").toUpperCase().includes("PREMIUM")
              ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          amount: `₹${Number(t.amount || 0).toLocaleString("en-IN")}`,
          numericAmount: Number(t.amount || 0),
          method: t.method || "Razorpay (Online)",
          status: t.status || "Paid",
          date: t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Today"),
          owner: t.ownerName || "Owner",
          tables: t.tables || "5 max",
        }));
        setTransactions(formatted);

        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.warn("Could not fetch revenue transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenueNum = metrics.platformRevenue || transactions.reduce((sum, t) => sum + (t.numericAmount || 0), 0);
  const activeVenuesNum = metrics.activePaidVenues || new Set(transactions.map((t) => t.restaurant)).size;
  const avgRevNum = activeVenuesNum > 0 ? Math.round(totalRevenueNum / activeVenuesNum) : 0;

  // Metric stats matching Dashboard theme
  const metricCards = [
    {
      title: "Platform Revenue",
      value: `₹${totalRevenueNum.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "SaaS Subscriptions",
      value: `₹${totalRevenueNum.toLocaleString("en-IN")}`,
      icon: Layers,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
    {
      title: "Active Paid Venues",
      value: String(activeVenuesNum),
      icon: Store,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Avg. Revenue / Venue",
      value: `₹${avgRevNum.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accentBorder: "hover:border-cyan-500/40",
    },
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || tx.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Bulk Selection Handlers
  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedIds.includes(tx.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredSet = new Set(filteredTransactions.map((tx) => tx.id));
      setSelectedIds(selectedIds.filter((id) => !filteredSet.has(id)));
    } else {
      const combined = new Set([
        ...selectedIds,
        ...filteredTransactions.map((tx) => tx.id),
      ]);
      setSelectedIds(Array.from(combined));
    }
  };

  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const toDeleteIds = transactions
      .filter((tx) => selectedIds.includes(tx.id))
      .map((t) => t.dbId || t.id);

    setTransactions((prev) => prev.filter((tx) => !selectedIds.includes(tx.id)));
    if (drawerTx && selectedIds.includes(drawerTx.id)) {
      setDrawerTx(null);
    }
    setSelectedIds([]);

    try {
      await apiBulkDeleteTx(toDeleteIds);
      fetchTransactions();
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  const deleteTransaction = async (id, e) => {
    if (e) e.stopPropagation();
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    if (drawerTx && drawerTx.id === id) {
      setDrawerTx(null);
    }

    if (tx?.dbId) {
      try {
        await apiDeleteTx(tx.dbId);
        fetchTransactions();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      {/* 1. Header: Clean title without unrequested badges */}
      <header data-aos="fade-down" data-aos-duration="500" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Revenue & Financials (INR ₹)
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Platform subscription collections, venue payouts, and transactional ledger
          </p>
        </div>
      </header>

      {/* 2. Top Metric Cards */}
      <Cards items={metricCards} />

      {/* 3. Transactions Ledger Table Container (Full Width) */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className={`p-6 rounded-2xl border shadow-xl flex flex-col space-y-5 ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Top Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Recent Transactions Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-extrabold tracking-wider">
              {filteredTransactions.length} Invoices
            </span>

            {/* Bulk Delete Action Trigger */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm animate-fade-in"
                title="Delete all selected transactions"
              >
                <Trash2 size={13} className="stroke-[2.2]" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          {/* Search Box & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search invoice, venue, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border transition-all outline-none ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/50 focus:bg-white/[0.07]"
                    : "bg-white/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 focus:bg-white shadow-sm"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 hidden sm:inline text-[11px] font-semibold">
                Status:
              </span>
              {["ALL", "PAID", "PENDING"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedStatus === status
                      ? "bg-slate-800 dark:bg-white dark:text-slate-900 text-white shadow-sm"
                      : isDark
                      ? "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] font-bold text-slate-400 uppercase tracking-wider ${
                  isDark ? "border-white/[0.06]" : "border-slate-200"
                }`}
              >
                {/* Master Bulk Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                    title="Select All / Deselect All"
                  />
                </th>
                <th className="py-3 px-3">INVOICE</th>
                <th className="py-3 px-3">RESTAURANT</th>
                <th className="py-3 px-3">PLAN</th>
                <th className="py-3 px-3">AMOUNT</th>
                <th className="py-3 px-3">METHOD</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-white/[0.04]" : "divide-slate-100"
              }`}
            >
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <Receipt className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="font-semibold text-sm">No transactions found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search query or filter selection
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setDrawerTx(tx)}
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
                          onChange={(e) => handleToggleRow(tx.id, e)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Invoice ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-orange-500">
                        {tx.id}
                      </td>

                      {/* Restaurant Avatar & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border ${tx.avatarBg} font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            {tx.initial}
                          </div>
                          <span
                            className={`font-semibold truncate max-w-[130px] transition-colors group-hover:text-orange-500 ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {tx.restaurant}
                          </span>
                        </div>
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide border ${tx.planColor}`}
                        >
                          {tx.plan}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3.5 px-3 font-extrabold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {tx.amount}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {tx.method}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {tx.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {tx.date}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye Button (Drawer) */}
                          <button
                            onClick={() => setDrawerTx(tx)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:scale-105"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:scale-105"
                            }`}
                            title="View Invoice Details"
                          >
                            <Eye size={14} className="stroke-[2.2]" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => deleteTransaction(tx.id, e)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:scale-105"
                                : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:scale-105"
                            }`}
                            title="Remove Record"
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
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 4. Right Side Drawer for Transaction Details */}
      {drawerTx && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDrawerTx(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              className={`w-screen max-w-md shadow-2xl border-l flex flex-col justify-between transform transition-all duration-300 ease-in-out ${
                isDark
                  ? "bg-[#0b0f24]/95 backdrop-blur-2xl border-white/10 text-white"
                  : "bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-900"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    Transaction Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Settlement breakdown for {drawerTx.id}
                  </p>
                </div>
                <button
                  onClick={() => setDrawerTx(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
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
                    className={`w-12 h-12 rounded-xl border ${drawerTx.avatarBg} font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {drawerTx.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold truncate">
                        {drawerTx.restaurant}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${drawerTx.planColor}`}
                      >
                        {drawerTx.plan}
                      </span>
                    </div>
                    <span className="text-xs text-orange-500 font-mono font-bold block mt-0.5">
                      {drawerTx.id}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-500">
                    {drawerTx.amount}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Settlement Summary
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
                      <span className="text-slate-400 font-semibold">
                        Registered Owner
                      </span>
                      <span className="font-bold">{drawerTx.owner}</span>
                    </div>

                    {/* Method */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <span className="text-slate-400 font-semibold">
                        Payment Gateway
                      </span>
                      <span className="font-bold">{drawerTx.method}</span>
                    </div>

                    {/* Tables */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <span className="text-slate-400 font-semibold">
                        Tables Limit
                      </span>
                      <span className="font-bold">{drawerTx.tables}</span>
                    </div>

                    {/* Status */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <span className="text-slate-400 font-semibold">
                        Payment Status
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {drawerTx.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <span className="text-slate-400 font-semibold">
                        Transaction Date
                      </span>
                      <span className="font-bold">{drawerTx.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setDrawerTx(null)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/10 hover:bg-white/15 text-white border-white/10"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  Close Receipt
                </button>
                <button
                  onClick={(e) => deleteTransaction(drawerTx.id, e)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-500/10 border border-rose-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}