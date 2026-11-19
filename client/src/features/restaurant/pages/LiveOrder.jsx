import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Timer,
  Search,
  Check,
  Eye,
  X,
  Printer,
  ChevronRight,
  Flame,
  Volume2,
  BellRing,
  Trash2,
  List,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useOrders } from "../../../context/OrderContext";
import Cards from "../../../components/Cards";
import Pagination from "../../../components/Pagination";
import logoImage from "../../../assets/qr.png";

export default function LiveOrder() {
  const { isDark } = useTheme();
  const { orders, updateOrderStatus, deleteOrders, newOrderAlert } = useOrders();

  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePrint = (order) => {
    if (!order) return;
    const existingFrame = document.getElementById("thermal-print-iframe");
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "thermal-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const itemsHtml = order.items
      .map((item) => {
        const numPrice = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
        const unitPrice = Math.round(numPrice / item.qty);
        return `
          <tr style="border-bottom: 1px dotted #ccc;">
            <td style="padding: 3px 0; max-width: 120px; word-break: break-word;">${item.name}</td>
            <td style="text-align: center; padding: 3px 0;">${item.qty}</td>
            <td style="text-align: right; padding: 3px 0;">₹${unitPrice}</td>
            <td style="text-align: right; padding: 3px 0; font-weight: bold;">${item.price}</td>
          </tr>
        `;
      })
      .join("");

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bill_${order.id}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 80mm;
              max-width: 80mm;
              font-family: monospace, 'Courier New', Courier;
              font-size: 11px;
              line-height: 1.25;
              color: #000;
              background: #fff;
            }
            .ticket {
              width: 78mm;
              margin: 0 auto;
              padding: 4mm 2mm;
              box-sizing: border-box;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
            .border-t { border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
            .flex { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { border-bottom: 1px solid #000; padding: 3px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center border-b">
              <img src="${logoImage}" style="height: 36px; display: block; margin: 0 auto 3px auto;" />
              <div style="font-size: 14px; font-weight: 900;">RAJU DHABA</div>
              <div style="font-size: 10px; color: #333;">Authentic Cuisine & Table Ordering</div>
              <div style="font-size: 9px; color: #555;">GSTIN: 07AAAAA0000A1Z5 | Ph: +91 98765 00000</div>
            </div>

            <div class="border-b" style="font-size: 10px;">
              <div class="flex"><span class="bold">Bill No: ${order.id}</span><span class="bold">${order.table}</span></div>
              <div class="flex" style="color: #444;"><span>Date: 13-Nov-2026</span><span>Time: ${order.timestamp}</span></div>
              <div class="flex" style="color: #444;"><span>Guests: ${order.guests}</span><span>Type: Dine-In</span></div>
            </div>

            <div class="border-b">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="border-b" style="font-size: 10px;">
              <div class="flex"><span>Subtotal:</span><span class="bold">${order.amount}</span></div>
              <div class="flex" style="color: #555; font-size: 9px;"><span>CGST (2.5%):</span><span>₹${(order.numericAmount * 0.025).toFixed(1)}</span></div>
              <div class="flex" style="color: #555; font-size: 9px;"><span>SGST (2.5%):</span><span>₹${(order.numericAmount * 0.025).toFixed(1)}</span></div>
              <div class="flex border-t" style="font-size: 13px; font-weight: 900; margin-top: 4px; padding-top: 4px;">
                <span>GRAND TOTAL:</span>
                <span>${order.amount}</span>
              </div>
              <div class="flex" style="font-size: 9px; color: #333; margin-top: 2px;">
                <span>Serving Mode:</span>
                <span class="bold">${order.servingOption || "Waiter Service (Table)"}</span>
              </div>
              <div class="flex" style="font-size: 9px; color: #333; margin-top: 2px;">
                <span>Payment Mode:</span>
                <span class="bold">${order.payment} (${order.paid ? "PAID" : "UNPAID"})</span>
              </div>
            </div>

            <div class="center" style="font-size: 9px; color: #444; padding-top: 4px;">
              <div class="bold">*** THANK YOU! VISIT AGAIN ***</div>
              <div style="font-size: 8px; color: #777;">Powered by QuickTable QR Ordering</div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }, 250);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      let statusColor = "bg-amber-500/15 border-amber-500/30 text-amber-500";
      if (newStatus === "Ready to Serve") {
        statusColor = "bg-blue-500/15 border-blue-500/30 text-blue-500";
      } else if (newStatus === "Completed") {
        statusColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-500";
      }
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus, statusColor } : null));
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.items.some((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "KITCHEN") return ord.status === "In Kitchen";
    if (activeTab === "READY") return ord.status === "Ready to Serve";
    if (activeTab === "COMPLETED") return ord.status === "Completed";
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const countKitchen = orders.filter((o) => o.status === "In Kitchen").length;
  const countReady = orders.filter((o) => o.status === "Ready to Serve").length;
  const countCompleted = orders.filter((o) => o.status === "Completed").length;

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredOrders.map((o) => o.id);
    const areAllSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...allFilteredIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm && deleteConfirm.ids.length > 0) {
      deleteOrders(deleteConfirm.ids);
      setSelectedIds((prev) =>
        prev.filter((id) => !deleteConfirm.ids.includes(id))
      );
      if (selectedOrder && deleteConfirm.ids.includes(selectedOrder.id)) {
        setSelectedOrder(null);
      }
      setDeleteConfirm(null);
    }
  };

  const metricCards = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: UtensilsCrossed,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "In Kitchen (Cooking)",
      value: countKitchen.toString(),
      icon: Flame,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      glowColor: "from-amber-500/20 via-amber-500/5 to-transparent",
      accentBorder: "hover:border-amber-500/40",
    },
    {
      title: "Ready to Serve",
      value: countReady.toString(),
      icon: Timer,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Completed Today",
      value: countCompleted.toString(),
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
  ];

  return (
    <div className="space-y-6 pb-12 select-none relative">
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
      >
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Live Kitchen Display & Orders
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Real-time table orders, kitchen ticket progress, tabular management, and dish fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KDS Active & Synced</span>
          </div>
        </div>
      </header>

      {/* Real-time New Order Flash Alert */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-orange-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <BellRing size={20} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">
                  New Order Received!
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-orange-600">
                  {newOrderAlert.table}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Order {newOrderAlert.id} • {newOrderAlert.items?.length || 0} items • {newOrderAlert.amount} ({newOrderAlert.payment})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedOrder(newOrderAlert)}
            className="px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            View Ticket Details
          </button>
        </div>
      )}

      <Cards items={metricCards} />

      {/* Control Bar: Filter Tabs, View Switcher & Search Bar */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter Tabs */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {[
              { id: "ALL", label: `All (${orders.length})` },
              { id: "KITCHEN", label: `Cooking (${countKitchen})` },
              { id: "READY", label: `Ready (${countReady})` },
              { id: "COMPLETED", label: `Served (${countCompleted})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher: Table View vs Grid Cards */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Table View with Multi-Select"
            >
              <List size={14} />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Kitchen Card Display"
            >
              <LayoutGrid size={14} />
              <span>Kitchen Cards</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search table, order #, dish or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
              isDark
                ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          data-aos="zoom-in"
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-orange-500/5 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400">
              {selectedIds.length} order{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => handleUpdateStatus(id, "Ready to Serve"));
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UtensilsCrossed size={13} />
              <span>Mark Ready</span>
            </button>
            <button
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => handleUpdateStatus(id, "Completed"));
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Mark Served</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  ids: selectedIds,
                  count: selectedIds.length,
                })
              }
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Modern Table View with Multi-Select and Row Actions */}
      {viewMode === "table" ? (
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className={`rounded-2xl border overflow-hidden shadow-xl ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/80 backdrop-blur-2xl border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark
                      ? "bg-white/[0.02] border-white/10 text-slate-400"
                      : "bg-slate-50/80 border-slate-200 text-slate-500"
                  }`}
                >
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 &&
                        filteredOrders.every((o) => selectedIds.includes(o.id))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                      title="Select all orders"
                    />
                  </th>
                  <th className="py-3.5 px-4">Order ID & Time</th>
                  <th className="py-3.5 px-4">Table & Guests</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Serving Mode</th>
                  <th className="py-3.5 px-4">Bill Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedIds.includes(ord.id);
                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/10"
                            : "bg-orange-50/80"
                          : isDark
                          ? "hover:bg-white/[0.02]"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ord.id)}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        />
                      </td>

                      {/* Order ID & Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-sm text-orange-500">
                          {ord.id}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>
                            {ord.timestamp} 
                          </span>
                        </div>
                      </td>

                      {/* Table & Guests */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-sm block">
                          {ord.table}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {ord.guests || 2} Guests
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold">
                          {ord.customerName || "Diner Guest"}
                        </div>
                        {ord.customerPhone && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {ord.customerPhone}
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium truncate" title={ord.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}>
                          {ord.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {ord.items.length} item{ord.items.length > 1 ? "s" : ""}
                          {ord.note && ord.note !== "None" && ` • Note: ${ord.note}`}
                        </span>
                      </td>

                      {/* Serving Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                            ord.servingOption?.includes("Pickup")
                              ? "bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400"
                              : "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {ord.servingOption?.includes("Pickup")
                            ? "🚶 Pickup"
                            : "🍽️ Waiter"}
                        </span>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-sm">{ord.amount}</div>
                        <div className="text-[10px] text-slate-400">
                          {ord.payment} • {ord.paid ? "PAID" : "UNPAID"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${ord.statusColor}`}
                        >
                          {ord.status === "In Kitchen" && (
                            <Flame size={12} className="text-amber-500 animate-pulse" />
                          )}
                          {ord.status === "Ready to Serve" && (
                            <UtensilsCrossed size={12} className="text-blue-500" />
                          )}
                          {ord.status === "Completed" && (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          )}
                          <span>{ord.status}</span>
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                            title="View Ticket Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintOrder(ord)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                            }`}
                            title="Print Thermal Bill"
                          >
                            <Printer size={14} />
                          </button>

                          {ord.status === "In Kitchen" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, "Ready to Serve")}
                              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                              title="Mark Ready to Serve"
                            >
                              <UtensilsCrossed size={12} />
                              <span className="hidden sm:inline">Ready</span>
                            </button>
                          )}

                          {ord.status === "Ready to Serve" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, "Completed")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                              title="Mark Served & Paid"
                            >
                              <CheckCircle2 size={12} />
                              <span className="hidden sm:inline">Serve</span>
                            </button>
                          )}

                          {/* Delete Single Order Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                ids: [ord.id],
                                count: 1,
                                orderId: ord.id,
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Interactive Kitchen Cards (KDS Tiles) */
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {filteredOrders.map((ord) => {
            const isSelected = selectedIds.includes(ord.id);
            return (
              <div
                key={ord.id}
                className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 relative ${
                  isSelected
                    ? "ring-2 ring-orange-500 shadow-orange-500/15"
                    : ""
                } ${
                  isDark
                    ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                    : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(ord.id)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        title="Select order"
                      />
                      <span className="font-extrabold text-base tracking-tight text-orange-500">
                        {ord.table}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {ord.id}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ord.statusColor}`}
                    >
                      {ord.status === "In Kitchen" && (
                        <Flame size={12} className="text-amber-500 animate-pulse" />
                      )}
                      {ord.status === "Ready to Serve" && (
                        <UtensilsCrossed size={12} className="text-blue-500" />
                      )}
                      {ord.status === "Completed" && (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      )}
                      <span>{ord.status}</span>
                    </span>
                  </div>

                  {/* Serving Mode Badge */}
                  <div className="pt-2.5 flex items-center justify-between text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        ord.servingOption?.includes("Pickup")
                          ? "bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400"
                          : "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {ord.servingOption?.includes("Pickup")
                        ? "🚶 Self-Pickup (Counter)"
                        : "🍽️ Waiter Service"}
                    </span>
                    <span className="text-slate-400 font-medium text-[10px]">
                      {ord.time}
                    </span>
                  </div>

                  <div className="py-2.5 space-y-2">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-500 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {item.qty}x
                          </span>
                          <span
                            className={`font-semibold truncate ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span className="text-slate-400 font-mono shrink-0 ml-2">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.note && ord.note !== "None" && (
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] mb-3 flex items-start gap-1.5 ${
                        isDark
                          ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      <span className="font-bold shrink-0">Note:</span>
                      <span className="truncate">{ord.note}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Bill Amount</span>
                    <span
                      className={`font-black text-sm ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {ord.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                      title="View Ticket Details"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrintOrder(ord)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                      }`}
                      title="Print 80mm Thermal Bill"
                    >
                      <Printer size={15} />
                    </button>

                    {ord.status === "In Kitchen" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, "Ready to Serve")}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <UtensilsCrossed size={14} />
                        <span>Ready</span>
                      </button>
                    )}

                    {ord.status === "Ready to Serve" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, "Completed")}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 size={14} />
                        <span>Served</span>
                      </button>
                    )}

                    {ord.status === "Completed" && (
                      <div className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-bold text-xs flex items-center justify-center gap-1.5">
                        <Check size={14} className="stroke-[3]" />
                        <span>Done</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({
                          ids: [ord.id],
                          count: 1,
                          orderId: ord.id,
                        })
                      }
                      className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-white/[0.02] border-white/10 text-slate-400"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <UtensilsCrossed size={36} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-base">No active orders found</h3>
          <p className="text-xs mt-1">
            New customer table scans will automatically appear here
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className={`relative z-10 max-w-md w-full rounded-2xl border p-6 shadow-2xl transition-all ${
              isDark
                ? "bg-[#0c1022] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">
              Delete {deleteConfirm.count > 1 ? `${deleteConfirm.count} Orders` : "Order"}?
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {deleteConfirm.count > 1
                ? `Are you sure you want to permanently delete these ${deleteConfirm.count} selected orders? This action will remove them immediately across all tabs and screens.`
                : `Are you sure you want to permanently delete order ${deleteConfirm.orderId || ""}? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete {deleteConfirm.count > 1 ? `(${deleteConfirm.count})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Side Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div
            className={`relative w-full max-w-md h-full flex flex-col justify-between shadow-2xl z-50 p-6 overflow-y-auto ${
              isDark
                ? "bg-[#0c1022] border-l border-white/10 text-white"
                : "bg-white border-l border-slate-200 text-slate-900"
            }`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    Order Ticket Details
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedOrder.id} • {selectedOrder.table}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Current Fulfillment Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1.5 ${selectedOrder.statusColor}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Received At
                  </span>
                  <span className="text-xs font-bold mt-1.5 block">
                    {selectedOrder.timestamp}
                  </span>
                </div>
              </div>

              {/* Serving Mode Information */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-slate-400 font-medium">Serving Mode:</span>
                <span className="font-extrabold text-orange-500">
                  {selectedOrder.servingOption || "Waiter Service (Table)"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Ordered Dishes & Items
                </h4>
                <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/5">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-orange-500">
                          {it.qty}x
                        </span>
                        <span className="font-semibold">{it.name}</span>
                      </div>
                      <span className="font-mono font-bold">{it.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.note && selectedOrder.note !== "None" && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Cooking & Kitchen Instructions
                  </h4>
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      isDark
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    {selectedOrder.note}
                  </div>
                </div>
              )}

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>{selectedOrder.amount}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>GST & Restaurant Tax</span>
                  <span>₹0 (Included)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold pt-2 border-t border-slate-200 dark:border-white/10">
                  <span>Total Due</span>
                  <span className="text-orange-500">
                    {selectedOrder.amount}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePrint(selectedOrder)}
                className={`py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                }`}
                title="Print 80mm Bill"
              >
                <Printer size={15} />
                <span>Print Bill (80mm)</span>
              </button>

              {selectedOrder.status === "In Kitchen" && (
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, "Ready to Serve")
                  }
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 cursor-pointer text-center"
                >
                  Mark Ready to Serve
                </button>
              )}

              {selectedOrder.status === "Ready to Serve" && (
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, "Completed")
                  }
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 cursor-pointer text-center"
                >
                  Mark Completed & Served
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 80mm Thermal Bill Preview Modal */}
      {printOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setPrintOrder(null)}
          />

          <div className="relative z-10 flex flex-col items-center max-w-sm w-full my-auto">
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-orange-400" />
                <span className="font-bold text-sm">80mm Thermal Bill Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(printOrder)}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={13} />
                  <span>Print Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOrder(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div
              className="w-[80mm] max-w-[80mm] bg-white text-black p-4 font-mono text-[11px] shadow-2xl rounded-sm border border-slate-300 select-text leading-tight"
              style={{ width: "80mm" }}
            >
              <div className="text-center pb-2 border-b border-dashed border-black">
                <img
                  src={logoImage}
                  alt="QuickTable"
                  className="h-10 mx-auto object-contain mb-1"
                />
                <h2 className="text-sm font-black uppercase tracking-tight">
                  RAJU DHABA
                </h2>
                <p className="text-[10px] text-gray-700">
                  Authentic Cuisine & Table Ordering
                </p>
                <p className="text-[9px] text-gray-600">GSTIN: 07AAAAA0000A1Z5</p>
                <p className="text-[9px] text-gray-600">Ph: +91 98765 00000</p>
              </div>

              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-bold">Bill No: {printOrder.id}</span>
                  <span className="font-bold">{printOrder.table}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Date: 13-Nov-2026</span>
                  <span>Time: {printOrder.timestamp}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Guests: {printOrder.guests}</span>
                  <span>Type: Dine-In</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black">
                  <span className="w-1/2">Item</span>
                  <span className="w-10 text-center">Qty</span>
                  <span className="w-12 text-right">Price</span>
                  <span className="w-14 text-right">Total</span>
                </div>

                <div className="divide-y divide-dotted divide-gray-200 pt-1">
                  {printOrder.items.map((item, idx) => {
                    const numPrice =
                      parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
                    const unitPrice = Math.round(numPrice / item.qty);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between py-1 text-[10px]"
                      >
                        <span className="w-1/2 font-semibold truncate">
                          {item.name}
                        </span>
                        <span className="w-10 text-center">{item.qty}</span>
                        <span className="w-12 text-right">₹{unitPrice}</span>
                        <span className="w-14 text-right font-bold">
                          {item.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">{printOrder.amount}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[9px]">
                  <span>CGST (2.5%):</span>
                  <span>₹{(printOrder.numericAmount * 0.025).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[9px]">
                  <span>SGST (2.5%):</span>
                  <span>₹{(printOrder.numericAmount * 0.025).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span>{printOrder.amount}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-700">
                  <span>Payment Mode:</span>
                  <span className="font-bold uppercase">
                    {printOrder.payment} ({printOrder.paid ? "PAID" : "UNPAID"})
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-[9px] text-gray-700 space-y-0.5">
                <p className="font-bold">*** THANK YOU! VISIT AGAIN ***</p>
                <p className="text-[8px] text-gray-500">
                  Powered by QuickTable QR Ordering
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}