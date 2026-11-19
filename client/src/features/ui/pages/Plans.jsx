import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "../../../assets/qr.png";
import { getAllPlans } from "../../../services/plansServices";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../../services/revenueServices";
import {
  Check,
  Star,
  Zap,
  Crown,
  Building2,
  Store,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function PlansPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "annual"
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);
  const [activePlanSlide, setActivePlanSlide] = useState(1); // default to 1 (popular)
  const plansSliderRef = useRef(null);

  const handlePlanScroll = () => {
    if (!plansSliderRef.current) return;
    const { scrollLeft, clientWidth } = plansSliderRef.current;
    const cardWidth = plansSliderRef.current.children[0]?.clientWidth || clientWidth * 0.82;
    const index = Math.round(scrollLeft / cardWidth);
    setActivePlanSlide(Math.min(Math.max(index, 0), plans.length - 1));
  };

  const scrollPlanTo = (index) => {
    if (!plansSliderRef.current) return;
    const targetCard = plansSliderRef.current.children[index];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setActivePlanSlide(index);
  };

  const [dbPlans, setDbPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
    });
    AOS.refresh();

    getAllPlans()
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const active = res.data.filter((p) => p.status === "Active" || !p.status);
          const formatted = active.map((p, idx) => {
            const isPop = p.isPopular || (active.length >= 3 && idx === 1);
            let features = [];
            if (Array.isArray(p.features)) {
              features = p.features;
            } else if (typeof p.features === "string") {
              try {
                features = JSON.parse(p.features);
              } catch {
                features = p.features.split(",").map((s) => s.trim()).filter(Boolean);
              }
            }
            if (p.tablesLimit && !features.some((f) => f.includes(p.tablesLimit))) {
              features = [`${p.tablesLimit}`, ...features];
            }
            const price = Math.round(Number(p.price) || 0);

            return {
              id: p.id,
              name: p.name,
              tagline: p.tagline || "Flexible and powerful for your venue",
              monthlyPrice: price,
              annualPrice: Math.round(price * 0.8),
              tables: p.tablesLimit || "Standard Tables",
              badge: isPop ? "MOST POPULAR" : null,
              icon: isPop ? Crown : idx === 0 ? Store : Building2,
              accent: isPop ? "orange" : idx === 0 ? "emerald" : "indigo",
              features: features.length > 0 ? features : ["Digital QR Menu", "Table Management"],
              ctaText: isPop ? `Start with ${p.name}` : `Select ${p.name}`,
              isPopular: isPop,
            };
          });
          setDbPlans(formatted);
        }
      })
      .catch((err) => console.warn("Could not fetch DB plans:", err))
      .finally(() => setLoading(false));
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan.name);
    setIsActivating(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK.");
      }

      const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
      const storedRestro = JSON.parse(
        localStorage.getItem("currentRestaurant") || "{}"
      );

      const orderRes = await createRazorpayOrder({
        amount: price,
        planName: plan.name,
        restaurantId: storedRestro.id || null,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || "Failed to initialize payment order.");
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.order.amount,
        currency: "INR",
        name: "QuickTable",
        description: `Subscription: ${plan.name} (${billingCycle})`,
        order_id: orderRes.order.id,
        image: logo,
        handler: async (response) => {
          try {
            setIsActivating(true);
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.name,
              amount: price,
              restaurantId: storedRestro.id || null,
              restaurantName: storedRestro.name || "Restaurant",
              ownerName: storedRestro.owner || "Owner",
              tables: plan.tables || "Standard",
            });

            if (verifyRes.success) {
              const updated = { ...storedRestro, plan: plan.name };
              localStorage.setItem("currentRestaurant", JSON.stringify(updated));
              setActivatedSuccess(true);
              setTimeout(() => {
                navigate("/restaurant");
              }, 1200);
            } else {
              alert("Payment verification returned: " + (verifyRes.message || ""));
              navigate("/restaurant");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment recorded with notification: " + err.message);
            navigate("/restaurant");
          } finally {
            setIsActivating(false);
          }
        },
        prefill: {
          name: storedRestro.owner || "Restaurant Owner",
          email: storedRestro.email || "owner@restaurant.com",
          contact: storedRestro.phone || "9999999999",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setIsActivating(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (response) => {
        alert("Payment Failed: " + (response.error?.description || "Payment was declined"));
        setIsActivating(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      alert(err.message || "Failed to start payment.");
      setIsActivating(false);
    }
  };

  const plans = dbPlans.length > 0 ? dbPlans : [];

  return (
    <div className="min-h-screen w-full bg-slate-50 font-poppins flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="QRServe Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/restaurant")}
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full"
            >
              <span>Skip for now</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Congratulatory Alert Banner */}
        <div
          data-aos="fade-down"
          className="max-w-3xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-300/60 shadow-sm flex items-center gap-3.5 sm:gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            <CheckCircle2 size={22} className="stroke-[2.5]" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
              <span>Restaurant Registered Successfully!</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                14-Day Free Trial Ready
              </span>
            </h2>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Choose a subscription plan below to activate your digital menu and QR tables, or start your free 14-day trial.
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div data-aos="fade-up" className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600 mb-4">
            <Sparkles size={13} />
            <span>Select Your Plan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Choose a plan that fits your{" "}
            <span className="text-orange-500">restaurant</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Upgrade, downgrade, or cancel anytime. All plans include full digital menu management and instant QR generation.
          </p>

          {/* Billing Toggle (Monthly / Annual) */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/80 rounded-full border border-slate-300/70 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid / Mobile Slider */}
        <div
          ref={plansSliderRef}
          onScroll={handlePlanScroll}
          className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 items-stretch max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-4 md:pb-0 px-2 md:px-0"
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

            return (
              <div
                key={plan.id}
                data-aos="fade-up"
                data-aos-delay={100 + index * 120}
                className={`w-[84vw] sm:w-[330px] md:w-auto shrink-0 snap-center md:shrink rounded-3xl bg-white p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group h-[440px] sm:h-[460px] md:h-auto md:min-h-[470px] ${
                  plan.isPopular
                    ? "border-2 border-orange-500 shadow-xl shadow-orange-500/20 md:-translate-y-2 hover:shadow-orange-500/30"
                    : "border border-slate-200/90 shadow-md shadow-slate-100 hover:shadow-lg hover:border-slate-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 right-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-b-lg shadow-sm flex items-center gap-1 z-20">
                    <Star size={10} className="fill-white" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-md ${
                        plan.accent === "orange"
                          ? "bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-orange-500/30"
                          : plan.accent === "emerald"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25"
                      }`}
                    >
                      <IconComponent size={20} className="stroke-[2.2]" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium min-h-[20px]">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-1">
                      <span
                        className={`text-3xl sm:text-4xl font-black tracking-tight ${
                          plan.accent === "orange" ? "text-orange-500" : "text-slate-900"
                        }`}
                      >
                        ₹{price}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/month</span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                      <Zap size={11} className="text-amber-500 fill-amber-500" />
                      <span>{plan.tables}</span>
                    </div>

                    {/* Feature List */}
                    <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                              plan.accent === "orange"
                                ? "bg-orange-500 text-white"
                                : plan.accent === "emerald"
                                ? "bg-emerald-500 text-white"
                                : "bg-indigo-500 text-white"
                            }`}
                          >
                            <Check size={10} className="stroke-[3]" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Action CTA */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isActivating}
                      className={`w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs hover:scale-[1.01] active:scale-95 ${
                        plan.isPopular
                          ? "text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30 hover:shadow-orange-500/45"
                          : plan.accent === "emerald"
                          ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 hover:border-emerald-600 shadow-emerald-500/10"
                          : "text-indigo-900 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 hover:border-indigo-600 shadow-indigo-500/10"
                      }`}
                    >
                      {isActivating && selectedPlan === plan.name ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing Payment...</span>
                        </span>
                      ) : (
                        <>
                          <span>{plan.ctaText}</span>
                          <ArrowRight size={14} className="stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Dot Indicators for Plans */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-3">
          {plans.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollPlanTo(idx)}
              aria-label={`Go to plan ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                activePlanSlide === idx
                  ? "w-7 bg-orange-500 shadow-sm shadow-orange-500/50"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* 14-Day Free Trial Option Box */}
        <div
          data-aos="fade-up"
          className="mt-14 max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#02241b] via-[#043324] to-[#031d16] text-white p-7 sm:p-10 shadow-2xl border border-emerald-800/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-amber-300 mb-3">
              <Clock size={13} />
              <span>Free 14-Day Full-Access Trial</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Prefer testing live at your restaurant first?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
              Start with all Professional features enabled for 14 days. Zero billing upfront, no credit card required. Upgrade whenever you are ready.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleSelectPlan("14-Day Free Trial")}
              className="w-full md:w-auto px-7 py-3.5 rounded-full text-sm font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Activate Free Trial &amp; Enter Dashboard</span>
              <ArrowRight size={16} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Security & Guarantee Trust Grid */}
        <div data-aos="fade-up" className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">100% Risk Free</div>
              <p className="text-[11px] text-slate-500">Cancel or switch plans anytime</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Zap size={20} className="fill-orange-500" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Instant Table Setup</div>
              <p className="text-[11px] text-slate-500">QR codes generated immediately</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Free Staff Training</div>
              <p className="text-[11px] text-slate-500">Onboarding &amp; kitchen setup guide</p>
            </div>
          </div>
        </div>
      </main>

      {/* Plan Activation Modal */}
      {(isActivating || activatedSuccess) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-fade-in-up">
            {isActivating ? (
              <div className="py-4 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                <h4 className="text-base font-bold text-slate-900">Activating {selectedPlan}...</h4>
                <p className="text-xs text-slate-500 mt-1">Configuring your tables and kitchen desk...</p>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-slate-900">{selectedPlan} Activated!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Redirecting to your restaurant live dashboard...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-slate-400 border-t border-slate-100 bg-white">
        © 2026 QRServe Systems. All rights reserved.
      </footer>
    </div>
  );
}
