import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Layers,
  Sparkles,
  IndianRupee,
  Zap,
  CheckCircle2,
  Crown,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
} from "../../../services/plansServices";

const INITIAL_PLANS = [
  {
    name: "Starter Trial",
    price: 1,
    billingCycle: "month",
    tagline: "Ideal for new venues evaluating digital QR table ordering",
    tablesLimit: "5 Tables Max",
    isPopular: false,
    status: "Active",
    colorTheme: "blue",
    features: [
      "Up to 5 active QR tables",
      "Instant digital menu browsing",
      "Direct customer table ordering",
      "Daily order summary email",
      "Community & standard support",
    ],
  },
  {
    name: "Pro Growth",
    price: 99,
    billingCycle: "month",
    tagline: "Designed for bustling cafes & diners expanding floor capacity",
    tablesLimit: "25 Tables Max",
    isPopular: true,
    status: "Active",
    colorTheme: "orange",
    features: [
      "Up to 25 active QR tables",
      "Live order status & kitchen tracker",
      "Interactive diner multiplayer games",
      "Custom branding & restaurant logo",
      "Analytics & sales revenue breakdown",
      "Priority WhatsApp & phone support",
    ],
  },
  {
    name: "Enterprise Ultimate",
    price: 999,
    billingCycle: "month",
    tagline: "Comprehensive power suite for large restaurant chains & multi-outlets",
    tablesLimit: "Unlimited Tables",
    isPopular: false,
    status: "Active",
    colorTheme: "purple",
    features: [
      "Unlimited QR tables & dining sections",
      "Multi-outlet central admin dashboard",
      "Dedicated account manager & 24/7 SLA",
      "Custom domain sync (e.g. menu.yourbrand.com)",
      "Automated billing, taxes & ledger export",
      "Early access to beta arcade games",
    ],
  },
];

export default function Plans() {
  const { isDark } = useTheme();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  // Form State for Drawer
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingCycle: "month",
    tagline: "",
    tablesLimit: "",
    isPopular: false,
    status: "Active",
    colorTheme: "orange",
    featuresText: "",
  });

  // Helper to get theme styling for cards
  const getThemeStyles = (plan) => {
    const priceNum = parseFloat(plan.price) || 0;
    const theme =
      plan.colorTheme ||
      (priceNum >= 500 ? "purple" : priceNum >= 50 ? "orange" : "blue");

    if (theme === "purple") {
      return {
        badgeColor:
          "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300",
        accentGlow: "from-purple-500/20 via-purple-500/5 to-transparent",
      };
    }
    if (theme === "orange") {
      return {
        badgeColor:
          "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400",
        accentGlow: "from-orange-500/20 via-amber-500/5 to-transparent",
      };
    }
    return {
      badgeColor:
        "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
      accentGlow: "from-blue-500/15 via-blue-500/5 to-transparent",
    };
  };

  // Fetch all plans from backend controller
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const json = await getAllPlans();
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data);
      }
    } catch (err) {
      console.warn("Could not connect to plans controller API:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Top metric stats calculated dynamically from active controller plans
  const sortedPlans = [...plans].sort(
    (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
  );
  const entryPlan = sortedPlans[0];
  const proPlan =
    sortedPlans.find((p) => p.isPopular) || sortedPlans[1] || sortedPlans[0];
  const enterprisePlan = sortedPlans[sortedPlans.length - 1];

  const metricCards = [
    {
      title: "Active SaaS Plans",
      value: plans.filter((p) => p.status === "Active").length.toString(),
      icon: Layers,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Entry Trial Tier",
      value: `₹${entryPlan ? parseFloat(entryPlan.price) : 1}`,
      icon: Zap,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accentBorder: "hover:border-cyan-500/40",
    },
    {
      title: "Pro Popular Tier",
      value: `₹${proPlan ? parseFloat(proPlan.price) : 99}`,
      icon: Sparkles,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Enterprise Suite",
      value: `₹${enterprisePlan ? parseFloat(enterprisePlan.price) : 999}`,
      icon: Crown,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
  ];

  // Open Drawer in Create Mode
  const handleOpenAddDrawer = () => {
    setEditingPlanId(null);
    setFormData({
      name: "",
      price: "",
      billingCycle: "month",
      tagline: "",
      tablesLimit: "10 Tables Max",
      isPopular: false,
      status: "Active",
      colorTheme: "orange",
      featuresText:
        "Instant digital menu sync\nQR table ordering\nReal-time order tracker\nStandard customer support",
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer in Edit Mode
  const handleOpenEditDrawer = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      billingCycle: plan.billingCycle || "month",
      tagline: plan.tagline || "",
      tablesLimit: plan.tablesLimit || "",
      isPopular: Boolean(plan.isPopular),
      status: plan.status || "Active",
      colorTheme: plan.colorTheme || "orange",
      featuresText: Array.isArray(plan.features)
        ? plan.features.join("\n")
        : typeof plan.features === "string"
        ? JSON.parse(plan.features || "[]").join("\n")
        : "",
    });
    setIsDrawerOpen(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPlanId(null);
  };

  // Save Plan Form Submit (Create or Update in Backend Controller)
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanPrice = parseFloat(formData.price) || 0;
    const parsedFeatures = formData.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const determinedTheme =
      cleanPrice >= 500 ? "purple" : cleanPrice >= 50 ? "orange" : "blue";

    const payload = {
      name: formData.name.trim(),
      price: cleanPrice,
      billingCycle: formData.billingCycle || "month",
      tagline: formData.tagline.trim(),
      tablesLimit: formData.tablesLimit.trim() || "10 Tables Max",
      isPopular: Boolean(formData.isPopular),
      status: formData.status || "Active",
      colorTheme: formData.colorTheme || determinedTheme,
      features: parsedFeatures,
    };

    try {
      if (editingPlanId) {
        const json = await updatePlan(editingPlanId, payload);
        if (json.success && json.data) {
          setPlans((prev) =>
            prev.map((p) => (p.id === editingPlanId ? json.data : p))
          );
        } else {
          setPlans((prev) =>
            prev.map((p) =>
              p.id === editingPlanId ? { ...p, ...payload } : p
            )
          );
        }
      } else {
        const json = await createPlan(payload);
        if (json.success && json.data) {
          setPlans((prev) => [...prev, json.data]);
        } else {
          setPlans((prev) => [
            ...prev,
            { id: Date.now(), ...payload },
          ]);
        }
      }
    } catch (err) {
      console.error("Error saving plan via controller:", err);
      // Optimistic update fallback
      if (editingPlanId) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlanId ? { ...p, ...payload } : p
          )
        );
      } else {
        setPlans((prev) => [...prev, { id: Date.now(), ...payload }]);
      }
    } finally {
      setIsSubmitting(false);
      handleCloseDrawer();
    }
  };

  // Delete Plan (DELETE /api/plans/:id)
  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (editingPlanId === id) {
        handleCloseDrawer();
      }
    } catch (err) {
      console.error("Error deleting plan via controller:", err);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Toggle Plan Status (PATCH /api/plans/:id/status)
  const handleToggleStatus = async (id) => {
    try {
      const json = await togglePlanStatus(id);
      if (json.success && json.data) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? json.data : p))
        );
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      {/* 1. Header with Add New Plan Button & Live Status */}
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
              Plans & Pricing Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Controller
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Configure subscription tiers, QR ordering limits, and venue pricing
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPlans}
            disabled={loading}
            title="Refresh plans from database"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs"
            }`}
          >
            <RefreshCw
              size={15}
              className={`${loading ? "animate-spin text-orange-500" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenAddDrawer}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Add New Plan</span>
          </button>
        </div>
      </header>

      {/* 2. Top Metric Cards */}
      <Cards items={metricCards} />

      {/* 3. Plans Pricing Grid */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
      >
        {plans.map((plan) => {
          const isPro = Boolean(plan.isPopular);
          const { badgeColor, accentGlow } = getThemeStyles(plan);
          const planFeatures = Array.isArray(plan.features)
            ? plan.features
            : typeof plan.features === "string"
            ? JSON.parse(plan.features || "[]")
            : [];

          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 group ${
                isPro
                  ? isDark
                    ? "bg-white/[0.04] border-orange-500/40 shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/30"
                    : "bg-white/80 border-orange-500/50 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/20"
                  : isDark
                  ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08] shadow-xl hover:border-white/20"
                  : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl"
              }`}
            >
              {/* Top ambient glow orb */}
              <div
                className={`absolute -right-10 -top-10 w-44 h-44 rounded-full bg-gradient-to-br ${accentGlow} blur-3xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              {/* Card Header Content */}
              <div className="relative z-10 space-y-4">
                {/* Plan Badge & Popular Pill */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${badgeColor}`}
                  >
                    {plan.name}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {plan.status === "Inactive" && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-bold border border-slate-500/30">
                        Inactive
                      </span>
                    )}

                    {isPro && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm shadow-orange-500/30">
                        <Sparkles size={11} className="fill-white" />
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-400">₹</span>
                    <span
                      className={`text-4xl sm:text-5xl font-black tracking-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {parseFloat(plan.price) || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      /{plan.billingCycle || "month"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 min-h-[34px] leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Table Limit Badge */}
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                    isDark
                      ? "bg-white/[0.025] border-white/5 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <Layers size={15} className="text-orange-500 shrink-0" />
                  <span>Limit:</span>
                  <span className="font-bold text-orange-500">
                    {plan.tablesLimit || "5 Tables Max"}
                  </span>
                </div>

                {/* Features List */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    What's Included:
                  </span>
                  <ul className="space-y-2 text-xs">
                    {planFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span
                          className={`leading-tight ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons: Edit Plan & Delete */}
              <div className="relative z-10 pt-6 mt-6 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditDrawer(plan)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPro
                      ? "bg-orange-500 hover:bg-orange-600 text-white border-transparent shadow-md shadow-orange-500/25"
                      : isDark
                      ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/10"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  <Edit3 size={14} />
                  <span>Edit Plan</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  title={`Mark as ${plan.status === "Active" ? "Inactive" : "Active"}`}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    plan.status === "Active"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                      : "bg-slate-500/10 border-slate-500/20 text-slate-400 hover:bg-slate-500/20"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                      : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                  }`}
                  title="Delete Plan"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Right Side Drawer for Adding / Editing Plan */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseDrawer}
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
                    {editingPlanId ? "Edit Subscription Plan" : "Create New Plan"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingPlanId
                      ? "Update pricing, features, and table capacities in database"
                      : "Introduce a new tier to the QR Table database catalog"}
                  </p>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body (Form) */}
              <form
                id="planDrawerForm"
                onSubmit={handleSavePlan}
                className="p-6 space-y-4 overflow-y-auto flex-1 text-xs"
              >
                {/* Plan Name */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starter Trial, Pro Venues"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                {/* Price and Billing Cycle */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1">
                      Price (INR ₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="1, 99, 999"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border outline-none font-bold text-sm transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">
                      Billing Interval
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingCycle: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2.5 rounded-xl border outline-none cursor-pointer ${
                        isDark
                          ? "bg-[#141933] border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                      <option value="one-time">One-Time Lifetime</option>
                    </select>
                  </div>
                </div>

                {/* Tables Limit */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">
                    Tables Limit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Tables Max, 25 Tables Max, Unlimited"
                    value={formData.tablesLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, tablesLimit: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                {/* Tagline Description */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">
                    Tagline Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short summary of who this plan is best suited for..."
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border outline-none resize-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                {/* Features (One per line) */}
                <div>
                  <label className="block font-bold text-slate-400 mb-1">
                    Features (One per line)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Up to 10 QR tables&#10;Live kitchen order sync&#10;Priority WhatsApp support"
                    value={formData.featuresText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuresText: e.target.value,
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border outline-none font-mono text-[11px] resize-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                {/* Toggles: Most Popular & Status */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isDark
                        ? "bg-white/[0.02] border-white/10"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="font-semibold text-xs">Most Popular</span>
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPopular: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
                    />
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isDark
                        ? "bg-white/[0.02] border-white/10"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="font-semibold text-xs">Active Tier</span>
                    <input
                      type="checkbox"
                      checked={formData.status === "Active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.checked ? "Active" : "Inactive",
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>
              </form>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={isSubmitting}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
                    isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="planDrawerForm"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>
                    {isSubmitting
                      ? "Saving..."
                      : editingPlanId
                      ? "Update Plan"
                      : "Create Plan"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
