import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  QrCode,
  UtensilsCrossed,
  CheckCircle2,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Printer,
  Eye,
  Download,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Crown,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useOrders } from "../../../context/OrderContext";
import Cards from "../../../components/Cards";
import {
  getAllTables,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
} from "../../../services/tablesServices";
import Pagination from "../../../components/Pagination";
import logoImage from "../../../assets/qr.png";

export default function Tables() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { getTableActiveOrder } = useOrders();

  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [planInfo, setPlanInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [previewStandee, setPreviewStandee] = useState(null);

  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "4",
  });

  const [tablesList, setTablesList] = useState([
    {
      id: 1,
      tableNumber: "Table 01",
      number: "01",
      capacity: 2,
      section: "Main Dining AC",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-01",
    },
    {
      id: 2,
      tableNumber: "Table 02",
      number: "02",
      capacity: 2,
      section: "Main Dining AC",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1047",
      activeAmount: "₹450",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-02",
    },
    {
      id: 3,
      tableNumber: "Table 03",
      number: "03",
      capacity: 4,
      section: "Main Dining AC",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-03",
    },
    {
      id: 4,
      tableNumber: "Table 04",
      number: "04",
      capacity: 4,
      section: "Main Dining AC",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1048",
      activeAmount: "₹760",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-04",
    },
    {
      id: 5,
      tableNumber: "Table 05",
      number: "05",
      capacity: 6,
      section: "Family Lounge",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-05",
    },
    {
      id: 6,
      tableNumber: "Table 06",
      number: "06",
      capacity: 4,
      section: "Family Lounge",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1045",
      activeAmount: "₹380",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-06",
    },
    {
      id: 7,
      tableNumber: "Table 07",
      number: "07",
      capacity: 8,
      section: "Family Lounge",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-07",
    },
    {
      id: 8,
      tableNumber: "Table 08",
      number: "08",
      capacity: 4,
      section: "Rooftop Terrace",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-08",
    },
    {
      id: 9,
      tableNumber: "Table 09",
      number: "09",
      capacity: 4,
      section: "Rooftop Terrace",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1046",
      activeAmount: "₹920",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-09",
    },
    {
      id: 10,
      tableNumber: "Table 10",
      number: "10",
      capacity: 6,
      section: "Rooftop Terrace",
      status: "Available",
      statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
      activeOrder: null,
      activeAmount: null,
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-10",
    },
    {
      id: 11,
      tableNumber: "Table 11",
      number: "11",
      capacity: 2,
      section: "Rooftop Terrace",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1044",
      activeAmount: "₹640",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-11",
    },
    {
      id: 12,
      tableNumber: "Table 12",
      number: "12",
      capacity: 4,
      section: "Rooftop Terrace",
      status: "Occupied",
      statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
      activeOrder: "#ORD-1043",
      activeAmount: "₹1,150",
      qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-12",
    },
  ]);

  const totalTables = tablesList.length;
  const occupiedCount = tablesList.filter((t) => t.status === "Occupied").length;
  const availableCount = tablesList.filter((t) => t.status === "Available").length;
  const totalCapacity = tablesList.reduce((acc, curr) => acc + curr.capacity, 0);

  const metricCards = [
    {
      title: "Total Dining Tables",
      value: totalTables.toString(),
      icon: QrCode,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Occupied Tables",
      value: occupiedCount.toString(),
      icon: UtensilsCrossed,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      glowColor: "from-amber-500/20 via-amber-500/5 to-transparent",
      accentBorder: "hover:border-amber-500/40",
    },
    {
      title: "Available Vacant",
      value: availableCount.toString(),
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Total Seating Capacity",
      value: `${totalCapacity} Guests`,
      icon: Users,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
  ];

  // Fetch tables from database controller
  const fetchTables = async () => {
    try {
      const storedRestro = JSON.parse(
        localStorage.getItem("currentRestaurant") || "{}"
      );
      const json = await getAllTables({
        restaurantId: storedRestro.id || 1,
      });

      if (json && json.planInfo) {
        setPlanInfo(json.planInfo);
      }

      if (json && json.success && Array.isArray(json.data)) {
        const formatted = json.data.map((t) => {
          const num = t.tableNumber || 1;
          const numStr = String(num).padStart(2, "0");
          return {
            id: t.id,
            tableNumber: t.tableName || `Table ${numStr}`,
            number: numStr,
            capacity: t.seatingCapacity || 4,
            section:
              num <= 4
                ? "Main Dining AC"
                : num <= 8
                ? "Family Lounge"
                : "Rooftop Terrace",
            status: t.status || "Available",
            statusColor:
              t.status === "Occupied"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
            activeOrder: null,
            activeAmount: null,
            qrUrl:
              t.qrCode ||
              `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-${numStr}`,
          };
        });
        setTablesList(formatted);
      }
    } catch (err) {
      console.warn("Could not connect to tables API, using fallback data:", err.message);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleToggleStatus = async (id) => {
    const table = tablesList.find((t) => t.id === id);
    if (!table) return;
    const nextStatus = table.status === "Available" ? "Occupied" : "Available";

    // Optimistic UI update
    setTablesList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextColor =
            nextStatus === "Available"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
              : "bg-amber-500/15 border-amber-500/30 text-amber-500";
          return {
            ...t,
            status: nextStatus,
            statusColor: nextColor,
            activeOrder:
              nextStatus === "Available" ? null : t.activeOrder || "#ORD-LIVE",
          };
        }
        return t;
      })
    );

    try {
      await updateTableStatus(id, nextStatus);
    } catch (err) {
      console.error("Error updating table status via controller:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    // Optimistic UI delete
    setTablesList((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTable(id);
    } catch (err) {
      console.error("Error deleting table via controller:", err);
    }
  };

  const handleOpenAdd = () => {
    if (planInfo && !planInfo.isUnlimited && !planInfo.canAddMore) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingTable(null);
    setFormData({
      tableNumber: `Table ${totalTables + 1 < 10 ? "0" : ""}${totalTables + 1}`,
      capacity: "4",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity.toString(),
    });
    setIsDrawerOpen(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.tableNumber || !formData.capacity) return;

    const numStr =
      formData.tableNumber.replace(/[^0-9]/g, "") ||
      String(tablesList.length + 1);
    const parsedNumber = parseInt(numStr, 10) || tablesList.length + 1;
    const parsedCapacity = parseInt(formData.capacity, 10) || 4;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://quicktable.in/raju-dhaba/table-${numStr.padStart(2, "0")}`;

    if (editingTable) {
      // Local update
      setTablesList((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? {
                ...t,
                tableNumber: formData.tableNumber,
                number: numStr.padStart(2, "0"),
                capacity: parsedCapacity,
                qrUrl,
              }
            : t
        )
      );

      try {
        await updateTable(editingTable.id, {
          tableName: formData.tableNumber,
          seatingCapacity: parsedCapacity,
        });
      } catch (err) {
        console.error("Error updating table via controller:", err);
      }
    } else {
      // Create new table
      const tempId = Date.now();
      const newTable = {
        id: tempId,
        tableNumber: formData.tableNumber,
        number: numStr.padStart(2, "0"),
        capacity: parsedCapacity,
        section: "Main Dining AC",
        status: "Available",
        statusColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
        activeOrder: null,
        activeAmount: null,
        qrUrl,
      };
      setTablesList((prev) => [...prev, newTable]);

      try {
        const storedRestro = JSON.parse(
          localStorage.getItem("currentRestaurant") || "{}"
        );
        const json = await createTable({
          restaurantId: storedRestro.id || 1,
          tableNumber: parsedNumber,
          tableName: formData.tableNumber,
          seatingCapacity: parsedCapacity,
          status: "Available",
        });

        if (json.limitReached) {
          setTablesList((prev) => prev.filter((t) => t.id !== tempId));
          setIsDrawerOpen(false);
          setShowUpgradeModal(true);
          return;
        }

        if (json.success && json.data) {
          setTablesList((prev) =>
            prev.map((t) =>
              t.id === tempId ? { ...t, id: json.data.id } : t
            )
          );
          fetchTables();
        }
      } catch (err) {
        setTablesList((prev) => prev.filter((t) => t.id !== tempId));
        console.error("Error creating table via controller:", err);
        const errMsg = err?.response?.data?.message || err?.message || "";
        if (err?.response?.data?.limitReached || errMsg.toLowerCase().includes("limit reached")) {
          setIsDrawerOpen(false);
          setShowUpgradeModal(true);
        }
      }
    }

    setIsDrawerOpen(false);
  };

  const displayTables = tablesList.map((t) => {
    const activeOrder = getTableActiveOrder(t.number);
    const origin = typeof window !== "undefined" ? window.location.origin : "http://192.168.29.207:5173";
    const realMenuUrl = `${origin}/qr-tablerestro/table/${t.number}`;
    const finalQrImage =
      t.qrUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(realMenuUrl)}`;

    if (activeOrder) {
      return {
        ...t,
        status: "Occupied",
        statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
        activeOrder: activeOrder.id,
        activeAmount: activeOrder.amount,
        qrUrl: finalQrImage,
        menuUrl: `/table/${t.number}`,
      };
    }
    return {
      ...t,
      qrUrl: finalQrImage,
      menuUrl: `/table/${t.number}`,
    };
  });

  const filteredTables = displayTables.filter((t) => {
    const matchesSearch =
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.activeOrder && t.activeOrder.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      activeStatus === "ALL" || t.status.toUpperCase() === activeStatus;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStatus]);

  const totalPages = Math.ceil(filteredTables.length / pageSize) || 1;
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrintStandee = (table) => {
    const existingFrame = document.getElementById("standee-print-iframe");
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "standee-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const standeeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Standee_${table.tableNumber}</title>
          <style>
            @page {
              size: A5 portrait;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              margin: 0;
              padding: 20px;
              color: #111;
              background: #fff;
            }
            .card {
              border: 3px solid #f97316;
              border-radius: 24px;
              padding: 30px 20px;
              max-width: 380px;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .logo { height: 45px; margin-bottom: 8px; }
            .venue { font-size: 20px; font-weight: 900; color: #111; margin-bottom: 2px; }
            .section { font-size: 12px; color: #666; margin-bottom: 15px; }
            .table-badge {
              display: inline-block;
              background: #f97316;
              color: white;
              font-size: 24px;
              font-weight: 900;
              padding: 8px 24px;
              border-radius: 12px;
              letter-spacing: 1px;
              margin-bottom: 16px;
            }
            .qr-box {
              background: #fff;
              border: 2px dashed #e2e8f0;
              border-radius: 16px;
              padding: 12px;
              display: inline-block;
              margin-bottom: 15px;
            }
            .qr-box img { width: 190px; height: 190px; display: block; }
            .action-title { font-size: 15px; font-weight: 800; color: #111; margin-bottom: 4px; }
            .action-sub { font-size: 11px; color: #666; line-height: 1.4; max-width: 260px; margin: 0 auto; }
            .footer { font-size: 10px; color: #999; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${logoImage}" class="logo" />
            <div class="venue">RAJU DHABA</div>
            <div class="section">Digital Table Ordering</div>
            <div class="table-badge">${table.tableNumber.toUpperCase()}</div>
            <div class="qr-box">
              <img src="${table.qrUrl}" alt="Scan QR" />
            </div>
            <div class="action-title">Scan QR Code to Order</div>
            <div class="action-sub">Open your phone camera, scan this table QR code, browse the live menu & place orders directly!</div>
            <div class="footer">Powered by QuickTable • No App Download Required</div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(standeeHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }, 250);
  };

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      <header data-aos="fade-down" data-aos-duration="500" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            QR Tables & Seating
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage table QR codes, scannable acrylic standees, and real-time dining occupancy
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {planInfo && (
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                !planInfo.canAddMore && !planInfo.isUnlimited
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : isDark
                  ? "bg-white/[0.04] border-white/10 text-slate-300"
                  : "bg-orange-50/70 border-orange-200 text-orange-700"
              }`}
            >
              <Crown
                size={14}
                className={
                  !planInfo.canAddMore && !planInfo.isUnlimited
                    ? "text-rose-500"
                    : "text-orange-500"
                }
              />
              <span>
                {planInfo.planName}: {planInfo.currentCount} / {planInfo.maxLimit} Tables
              </span>
              {!planInfo.canAddMore && !planInfo.isUnlimited && (
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/plans")}
                  className="ml-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] uppercase font-black hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-0.5"
                >
                  <span>Upgrade</span>
                  <ArrowUpRight size={11} />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Add New Table</span>
          </button>
        </div>
      </header>

      <Cards items={metricCards} />

      <div data-aos="fade-up" data-aos-delay="100" className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border max-w-fit ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {[
              { id: "ALL", label: `All Tables (${totalTables})` },
              { id: "OCCUPIED", label: `Occupied (${occupiedCount})` },
              { id: "AVAILABLE", label: `Available (${availableCount})` },
            ].map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveStatus(tab.id)}
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

        </div>

        <div className="relative min-w-[240px] sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search table # or order tag..."
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

      <div data-aos="fade-up" data-aos-delay="150" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginatedTables.map((table) => (
          <div
            key={table.id}
            className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
              isDark
                ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-orange-500">
                    {table.tableNumber}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${table.statusColor}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      table.status === "Occupied"
                        ? "bg-amber-500 animate-pulse"
                        : table.status === "Available"
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span>{table.status}</span>
                </span>
              </div>

              <div className="my-4 p-3 rounded-xl border flex flex-col items-center justify-center text-center bg-white dark:bg-[#0c1020] border-slate-200 dark:border-white/10 shadow-inner group/qr">
                <div className="relative w-36 h-36 p-2 rounded-xl bg-white flex items-center justify-center shadow-md">
                  <img
                    src={table.qrUrl}
                    alt={`QR Code for ${table.tableNumber}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewStandee(table)}
                      className="p-2 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md hover:scale-105 transition-transform"
                      title="Preview Standee"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintStandee(table)}
                      className="p-2 rounded-lg bg-orange-500 text-white font-bold text-xs shadow-md hover:scale-105 transition-transform"
                      title="Print Standee"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between w-full px-1 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Users size={13} />
                    {table.capacity} Seater
                  </span>

                  <button
                    type="button"
                    onClick={() => setPreviewStandee(table)}
                    className="text-[11px] font-bold text-orange-500 hover:text-orange-600 cursor-pointer"
                  >
                    View Standee
                  </button>
                </div>
              </div>

              {table.status === "Occupied" && table.activeOrder && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] mb-3 flex items-center justify-between ${
                    isDark
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <UtensilsCrossed size={12} />
                    {table.activeOrder}
                  </span>
                  <span className="font-black">{table.activeAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(table.id)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    table.status === "Available"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500 hover:text-white"
                  }`}
                >
                  {table.status === "Available" ? "Mark Occupied" : "Mark Vacant"}
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintStandee(table)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                  }`}
                  title="Print Standee"
                >
                  <Printer size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(table)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                  }`}
                  title="Edit Table"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(table.id)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                      : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600"
                  }`}
                  title="Delete Table"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Customer Menu Link for 1-Click Scan Testing */}
              <Link
                to={`/table/${table.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl text-center text-xs font-bold text-orange-600 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center justify-center gap-1.5 transition-colors"
                title={`Open digital menu for ${table.tableNumber}`}
              >
                <Smartphone size={13} />
                <span>Test Menu (Customer View)</span>
                <ExternalLink size={11} className="stroke-[2.5]" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTables.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {filteredTables.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-white/[0.02] border-white/10 text-slate-400"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <QrCode size={36} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-base">No tables found</h3>
          <p className="text-xs mt-1">
            Try adjusting your search criteria or add a new table
          </p>
        </div>
      )}

      {previewStandee && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setPreviewStandee(null)}
          />

          <div className="relative z-10 flex flex-col items-center max-w-sm w-full my-auto">
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-orange-400" />
                <span className="font-bold text-sm">Table QR Standee Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintStandee(previewStandee)}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={13} />
                  <span>Print Standee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewStandee(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="w-full bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-orange-500 text-center space-y-4">
              <div className="flex justify-center">
                <img src={logoImage} alt="QuickTable" className="h-10 object-contain" />
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  RAJU DHABA
                </h2>
                <p className="text-xs text-slate-500">
                  Digital Table Ordering
                </p>
              </div>

              <div>
                <span className="inline-block px-6 py-2 rounded-xl bg-orange-500 text-white font-black text-lg tracking-wider shadow-md shadow-orange-500/25">
                  {previewStandee.tableNumber.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                <img
                  src={previewStandee.qrUrl}
                  alt={`QR ${previewStandee.tableNumber}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Scan to View Menu & Order
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Open your phone camera, scan this table QR code, browse the live menu & place orders directly!
                </p>
              </div>

              <div className="pt-1 flex items-center justify-center">
                <Link
                  to={`/table/${previewStandee.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <ExternalLink size={13} />
                  <span>Open Table {previewStandee.number} Menu Link</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400">
                Powered by QuickTable • No App Download Required
              </div>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            className={`relative w-full max-w-md h-full flex flex-col justify-between shadow-2xl z-50 p-6 overflow-y-auto ${
              isDark
                ? "bg-[#0c1022] border-l border-white/10 text-white"
                : "bg-white border-l border-slate-200 text-slate-900"
            }`}
          >
            <form onSubmit={handleSaveForm} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {editingTable ? "Edit Table" : "Add New Table"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure dining table number and seating capacity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Table Number / Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Table 13"
                    value={formData.tableNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, tableNumber: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Seating Capacity (Guests) *
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-[#0e1329] border-white/10 text-white focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-orange-500/60"
                    }`}
                  >
                    <option value="2">2 Seater</option>
                    <option value="4">4 Seater</option>
                    <option value="6">6 Seater</option>
                    <option value="8">8 Seater</option>
                    <option value="12">12 Seater (Large)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>{editingTable ? "Update Table" : "Save Table"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowUpgradeModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 z-50 text-center animate-zoom-in ${
              isDark
                ? "bg-[#0b0f1e] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-500 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-orange-500/10">
              <Crown size={32} className="stroke-[2.5]" />
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-wider">
              Limit Reached
            </span>

            <h3 className="text-xl sm:text-2xl font-black mt-3 tracking-tight">
              Table QR Limit Reached!
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Your venue is currently on the{" "}
              <strong className="text-orange-500 font-extrabold">
                {planInfo?.planName || "Starter Trial"}
              </strong>{" "}
              plan which allows up to{" "}
              <strong className="text-white dark:text-white font-extrabold">
                {planInfo?.maxLimit || 5} active tables
              </strong>
              . Upgrade your subscription plan to unlock more scannable table QR codes and expand your dining floor.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className={`w-full sm:w-1/2 py-3 rounded-2xl border font-bold text-xs cursor-pointer transition-all ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                Maybe Later
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/restaurant/plans");
                }}
                className="w-full sm:w-1/2 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Upgrade Plan</span>
                <ArrowUpRight size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
