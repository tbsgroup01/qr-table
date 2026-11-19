import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import heroMockup from "../../../assets/bann.jpg";
import step1Scan from "../../../assets/how-it-works-step1.png";
import step2Menu from "../../../assets/how-it-works-step2.png";
import step3Order from "../../../assets/how-it-works-step3.png";
import step4Serve from "../../../assets/how-it-works-step4.png";
import Footer from "./Footer";
import { getAllPlans } from "../../../services/plansServices";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  Store,
  Crown,
  Building2,
  Check,
  Star,
  Users,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function Hero() {
  const [activePricingSlide, setActivePricingSlide] = useState(1);
  const pricingSliderRef = useRef(null);
  const [dbPlans, setDbPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    getAllPlans()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const active = res.data.filter((p) => p.status === "Active" || !p.status);
          setDbPlans(active);
        }
      })
      .catch((err) => console.warn("Could not fetch DB plans for Hero:", err))
      .finally(() => setLoadingPlans(false));
  }, []);

  const [activeTestimonialSlide, setActiveTestimonialSlide] = useState(0);
  const testimonialSliderRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      offset: 50,
    });
    AOS.refresh();
  }, []);

  const handlePricingScroll = () => {
    if (!pricingSliderRef.current) return;
    const { scrollLeft, clientWidth } = pricingSliderRef.current;
    const cardWidth = pricingSliderRef.current.children[0]?.clientWidth || clientWidth * 0.82;
    const index = Math.round(scrollLeft / cardWidth);
    setActivePricingSlide(Math.min(Math.max(index, 0), 2));
  };

  const scrollPricingTo = (index) => {
    if (!pricingSliderRef.current) return;
    const targetCard = pricingSliderRef.current.children[index];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setActivePricingSlide(index);
  };

  const handleTestimonialScroll = () => {
    if (!testimonialSliderRef.current) return;
    const { scrollLeft, clientWidth } = testimonialSliderRef.current;
    const cardWidth = testimonialSliderRef.current.children[0]?.clientWidth || clientWidth * 0.82;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveTestimonialSlide(Math.min(Math.max(index, 0), 2));
  };

  const scrollTestimonialTo = (index) => {
    if (!testimonialSliderRef.current) return;
    const targetCard = testimonialSliderRef.current.children[index];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setActiveTestimonialSlide(index);
  };

  return (
    <div className="w-full overflow-hidden bg-white text-slate-900 font-poppins">
      {/* Hero Header Section */}
      <section className="relative w-full overflow-hidden bg-white border-b border-slate-100 min-h-[580px] lg:min-h-[580px] xl:min-h-[600px] flex items-center">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-emerald-100/50 via-emerald-50/20 to-transparent pointer-events-none z-0" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-amber-100/25 rounded-full blur-3xl pointer-events-none z-0" />

        <div
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-delay="200"
          className="hidden lg:block absolute top-0 right-0 bottom-0 w-[58%] xl:w-[55%] 2xl:w-[52%] overflow-hidden pointer-events-none z-10 pr-2 sm:pr-4 lg:pr-6"
        >
          <img
            src={heroMockup}
            alt="QR Table Ordering Station Mockup with QR Stand and Mobile Menu"
            className="w-full h-full object-cover object-right select-none"
            loading="eager"
          />
          <div className="absolute inset-y-0 left-0 w-40 xl:w-60 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14 relative z-20">
          <div className="w-full max-w-xl lg:max-w-[560px] xl:max-w-[620px] flex flex-col items-start text-left">
            <div
              data-aos="fade-down"
              data-aos-duration="600"
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 shadow-xs mb-5"
            >
              <div className="w-5 h-5 rounded-full bg-[#f97316] flex items-center justify-center text-white shrink-0 shadow-xs">
                <UtensilsCrossed size={11} className="stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-[#064e3b] tracking-tight">
                QR Table Ordering for Restaurants
              </span>
            </div>

            <h1
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="100"
              className="text-3xl sm:text-5xl lg:text-[50px] xl:text-[54px] font-black tracking-tight leading-[1.12]"
            >
              <span className="text-[#043324] block">
                Turn Every Table into a
              </span>
              <span className="text-[#f97316] block mt-1">
                Smart Ordering
              </span>
              <span className="text-[#f97316] relative inline-block mt-1">
                Station
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-[#f97316] overflow-visible"
                  viewBox="0 0 110 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8C30 3 60 3 85 7C98 9 104 8 108 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="200"
              className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-[500px] font-normal"
            >
              Let your customers scan, browse the menu, place orders, and pay from their table. A faster, contactless, and modern dining experience.
            </p>

            <div
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="300"
              className="mt-7 flex flex-wrap items-center gap-4 sm:gap-5"
            >
              <Link
                to="/signup"
                className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#f97316] to-[#f59e0b] hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/35 hover:shadow-orange-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} className="stroke-[2.5]" />
              </Link>
            </div>

            <div
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-delay="400"
              className="mt-9 pt-2 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-slate-100 sm:border-t-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap size={13} className="fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">Faster Service</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="stroke-[2.5]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">Contactless &amp; Safe</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="stroke-[2.5]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900">Higher Sales</span>
              </div>
            </div>
          </div>

          <div
            data-aos="zoom-in"
            data-aos-duration="800"
            data-aos-delay="200"
            className="block lg:hidden mt-8 w-full max-w-lg mx-auto relative rounded-2xl overflow-hidden shadow-lg border border-slate-100"
          >
            <img
              src={heroMockup}
              alt="QR Table Ordering Station Mockup"
              className="w-full h-auto object-cover object-right"
            />
          </div>
        </div>
      </section>  

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#032e22] text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-emerald-800/40">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div
              data-aos="fade-up"
              data-aos-duration="700"
              className="relative text-center max-w-2xl mx-auto mb-14"
            >
              <span className="text-orange-400 font-bold tracking-wider text-xs sm:text-sm uppercase">
                — How It Works —
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                From Scan to Serve in 4 Simple Steps
              </h2>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 items-start">           
              <div
                data-aos="fade-in"
                data-aos-delay="200"
                className="hidden lg:block absolute top-[76px] left-[15%] right-[15%] h-8 pointer-events-none z-0"
              >
                <svg className="w-full h-full overflow-visible" fill="none">
                  <path
                    d="M 60 10 Q 180 -15 300 10"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    className="opacity-40 animate-dash-flow"
                  />
                  <path
                    d="M 360 10 Q 480 -15 600 10"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    className="opacity-40 animate-dash-flow"
                  />
                  <path
                    d="M 660 10 Q 780 -15 900 10"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    className="opacity-40 animate-dash-flow"
                  />
                </svg>
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="100"
                data-aos-duration="700"
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="relative mb-6">
                  <div className="w-36 h-28 flex items-end justify-center relative pb-1">
                    <div className="absolute bottom-1 w-28 h-5 bg-emerald-400/20 rounded-full blur-md" />
                    <img
                      src={step1Scan}
                      alt="Scan QR Code"
                      className="h-24 w-auto max-w-full object-contain transform group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-300 drop-shadow-md relative z-10 select-none"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/40 absolute -bottom-3 left-1/2 -translate-x-1/2 ring-4 ring-[#032e22] z-20">
                    1
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Scan QR Code</h3>
                <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed max-w-[200px]">
                  Scan the QR code placed on your table.
                </p>
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                data-aos-duration="700"
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="relative mb-6">
                  <div className="w-36 h-28 flex items-end justify-center relative pb-1">
                    <div className="absolute bottom-1 w-28 h-5 bg-emerald-400/20 rounded-full blur-md" />
                    <img
                      src={step2Menu}
                      alt="Browse Menu"
                      className="h-24 w-auto max-w-full object-contain transform group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-300 drop-shadow-md relative z-10 select-none"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/40 absolute -bottom-3 left-1/2 -translate-x-1/2 ring-4 ring-[#032e22] z-20">
                    2
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Browse Menu</h3>
                <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed max-w-[200px]">
                  Explore a digital menu with images & prices.
                </p>
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="700"
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="relative mb-6">
                  <div className="w-36 h-28 flex items-end justify-center relative pb-1">
                    <div className="absolute bottom-1 w-28 h-5 bg-emerald-400/20 rounded-full blur-md" />
                    <img
                      src={step3Order}
                      alt="Place Order"
                      className="h-24 w-auto max-w-full object-contain transform group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-300 drop-shadow-md relative z-10 select-none"
                    />
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/40 absolute -bottom-3 left-1/2 -translate-x-1/2 ring-4 ring-[#032e22] z-20">
                    3
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Place Order</h3>
                <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed max-w-[200px]">
                  Add items, customize and place your order.
                </p>
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="400"
                data-aos-duration="700"
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="relative mb-6">
                  <div className="w-36 h-28 flex items-end justify-center relative pb-1">
                    <div className="absolute bottom-1 w-28 h-5 bg-emerald-400/20 rounded-full blur-md" />
                    <img
                      src={step4Serve}
                      alt="Enjoy Your Food"
                      className="h-24 w-auto max-w-full object-contain transform group-hover:scale-105 group-hover:-translate-y-1.5 transition-all duration-300 drop-shadow-md relative z-10 select-none"
                    />
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-orange-500/40 absolute -bottom-3 left-1/2 -translate-x-1/2 ring-4 ring-[#032e22] z-20">
                    4
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Enjoy Your Food</h3>
                <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed max-w-[200px]">
                  We prepare your order and serve it to your table.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Choose Section */}
      <section id="features" className="py-14 sm:py-20 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div
              data-aos="fade-right"
              data-aos-duration="700"
              className="lg:col-span-6 flex flex-col items-start"
            >
              <span className="text-orange-500 font-bold tracking-wider text-xs sm:text-sm uppercase mb-2">
                — Why Choose QRServe —
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Why Restaurants <br />
                <span className="text-emerald-800">Love QRServe</span>
              </h2>
              <p className="mt-4 text-base text-slate-600 max-w-md">
                A smarter, faster and more profitable dining experience for your business.
              </p>

              <div
                data-aos="zoom-in-up"
                data-aos-duration="800"
                data-aos-delay="150"
                className="mt-8 w-full max-w-md h-[340px] sm:h-[380px] rounded-t-[140px] rounded-b-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200"
              >
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Dining Room with Emerald Chairs"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-4">
              <div
                data-aos="fade-left"
                data-aos-delay="100"
                data-aos-duration="600"
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Increase Revenue</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Get more orders and higher table turnover.</p>
                </div>
              </div>

              <div
                data-aos="fade-left"
                data-aos-delay="200"
                data-aos-duration="600"
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={24} className="stroke-[2.5] fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Faster Service</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Reduce wait time and serve more guests.</p>
                </div>
              </div>

              <div
                data-aos="fade-left"
                data-aos-delay="300"
                data-aos-duration="600"
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fewer Errors</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Customers place orders directly.</p>
                </div>
              </div>

              <div
                data-aos="fade-left"
                data-aos-delay="400"
                data-aos-duration="600"
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Better Customer Experience</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">A modern, contactless and convenient dining.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative w-full overflow-hidden bg-white py-16 sm:py-24">
        <div
          className="absolute top-0 left-0 right-0 h-[320px] sm:h-[380px] lg:h-[420px] bg-no-repeat bg-top bg-cover pointer-events-none select-none z-0 opacity-90 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_70%,transparent_100%)]"
        />
        <div className="absolute top-64 left-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute top-64 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-100/35 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute top-64 right-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            data-aos="fade-up"
            data-aos-duration="700"
            className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/80 shadow-xs mb-4">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <UtensilsCrossed size={11} className="stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-orange-600 tracking-tight">
                Simple &amp; Transparent Plans
              </span>
            </div>
            <div className="relative inline-block">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-[1.2]">
                Choose a Plan That Fits Your{" "}
                <span className="text-[#f97316] relative inline-block whitespace-nowrap">
                  Restaurant&apos;s Needs
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-3 text-[#f97316] overflow-visible"
                    viewBox="0 0 220 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8C55 3 115 3 165 7C188 9 205 8 217 5"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto">
              Flexible, affordable, and feature-rich plans for restaurants of all sizes.
            </p>
          </div>

          <div
            ref={pricingSliderRef}
            onScroll={handlePricingScroll}
            className={`flex md:grid gap-4 md:gap-8 items-stretch max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-4 md:pb-0 px-2 md:px-0 ${
              dbPlans.length === 1
                ? "md:grid-cols-1 max-w-md"
                : dbPlans.length === 2
                ? "md:grid-cols-2 max-w-3xl"
                : "md:grid-cols-3"
            }`}
          >
            {loadingPlans ? (
              <div className="col-span-3 py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-orange-500" />
                <span className="text-sm font-medium">Loading pricing plans...</span>
              </div>
            ) : dbPlans.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-slate-400 text-sm">
                No active subscription plans available at the moment.
              </div>
            ) : (
              dbPlans.map((plan, index) => {
                const isPopular =
                  plan.isPopular ||
                  (dbPlans.length >= 3 && index === 1) ||
                  (plan.name && plan.name.toLowerCase().includes("pro"));

                const theme = (plan.colorTheme || "").toLowerCase();
                const isEnterprise =
                  theme === "purple" ||
                  theme === "indigo" ||
                  (dbPlans.length >= 3 && index === dbPlans.length - 1) ||
                  (plan.name && plan.name.toLowerCase().includes("enterprise"));

                let Icon = Store;
                let iconGradient = "from-emerald-500 to-teal-600 shadow-emerald-500/25";
                let cardBorder = "border-slate-200/90 hover:border-emerald-400 shadow-slate-100 hover:shadow-xl";
                let bgGlow = "from-emerald-100/60 via-emerald-50/20 to-transparent rounded-bl-[70px]";
                let priceColor = "text-emerald-950";
                let checkBg = "bg-emerald-500";
                let btnClass = "text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600";

                if (isPopular) {
                  Icon = Crown;
                  iconGradient = "from-amber-400 via-orange-500 to-amber-600 shadow-orange-500/30";
                  cardBorder = "border-2 border-orange-500 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/25 md:-translate-y-2";
                  bgGlow = "from-orange-100/70 via-amber-50/30 to-transparent rounded-bl-[80px]";
                  priceColor = "text-[#f97316]";
                  checkBg = "bg-orange-500";
                  btnClass = "text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/35 hover:shadow-orange-500/50 hover:scale-[1.01]";
                } else if (isEnterprise) {
                  Icon = Building2;
                  iconGradient = "from-blue-500 to-indigo-600 shadow-blue-500/25";
                  cardBorder = "border-slate-200/90 hover:border-indigo-400 shadow-slate-100 hover:shadow-xl";
                  bgGlow = "from-indigo-100/60 via-indigo-50/20 to-transparent rounded-bl-[70px]";
                  priceColor = "text-slate-900";
                  checkBg = "bg-indigo-500";
                  btnClass = "text-indigo-900 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600";
                }

                let features = [];
                if (Array.isArray(plan.features)) {
                  features = plan.features;
                } else if (typeof plan.features === "string") {
                  try {
                    const parsed = JSON.parse(plan.features);
                    if (Array.isArray(parsed)) features = parsed;
                  } catch {
                    features = plan.features.split(",").map((s) => s.trim()).filter(Boolean);
                  }
                }

                if (plan.tablesLimit && !features.some((f) => f.includes(plan.tablesLimit))) {
                  features = [`${plan.tablesLimit}`, ...features];
                }

                const priceNum = Math.round(Number(plan.price) || 0);
                const displayPrice = `₹${priceNum.toLocaleString("en-IN")}`;
                const cycle = plan.billingCycle ? `/${plan.billingCycle}` : "/month";

                return (
                  <div
                    key={plan.id}
                    data-aos="fade-up"
                    data-aos-delay={(index + 1) * 100}
                    data-aos-duration="700"
                    className={`w-[84vw] sm:w-[330px] md:w-auto shrink-0 snap-center md:shrink rounded-3xl bg-white border p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 group h-[440px] sm:h-[460px] md:h-auto md:min-h-[470px] ${cardBorder}`}
                  >
                    <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl pointer-events-none ${bgGlow}`} />

                    {isPopular && (
                      <div className="absolute top-0 right-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-b-lg shadow-sm flex items-center gap-1 z-20">
                        <Star size={10} className="fill-white" />
                        <span>POPULAR</span>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconGradient} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                          <Icon size={20} className="stroke-[2.2]" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">{plan.tagline || "Affordable & flexible for your business"}</p>

                        <div className="mt-3 flex items-baseline gap-1">
                          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${priceColor}`}>{displayPrice}</span>
                          <span className="text-xs font-semibold text-slate-400">{cycle}</span>
                        </div>

                        <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
                          {features.slice(0, 5).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-full ${checkBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                                <Check size={10} className="stroke-[3]" />
                              </div>
                              <span className="text-xs font-medium text-slate-700 line-clamp-1">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3">
                        <Link
                          to={`/signup?plan=${plan.id}`}
                          className={`w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 ${btnClass}`}
                        >
                          <span>Get Started</span>
                          <ArrowRight size={14} className="stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile Dot Indicators for Pricing */}
          {dbPlans.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-2 mt-3">
              {dbPlans.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollPricingTo(idx)}
                  aria-label={`Go to plan ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                    activePricingSlide === idx
                      ? "w-7 bg-orange-500 shadow-sm shadow-orange-500/50"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-14 sm:py-20 bg-slate-50/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">         
          <div
            data-aos="fade-up"
            data-aos-duration="700"
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-orange-500 font-bold tracking-wider text-xs sm:text-sm uppercase">
              — What Restaurant Owners Say —
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by restaurants to deliver a better dining experience
            </h2>
          </div>

          <div
            ref={testimonialSliderRef}
            onScroll={handleTestimonialScroll}
            className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-4 md:pb-0 px-2 md:px-0"
          >
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="700"
              className="w-[84vw] sm:w-[330px] md:w-auto shrink-0 snap-center md:shrink p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[210px] sm:h-[220px] md:h-auto md:min-h-[220px]"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;QRServe has made our restaurant operations so much smoother. Orders are faster, and our customers love the contactless experience.&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Rohit Sharma"
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Rohit Sharma</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Owner, Spice Lounge</p>
                </div>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="700"
              className="w-[84vw] sm:w-[330px] md:w-auto shrink-0 snap-center md:shrink p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[210px] sm:h-[220px] md:h-auto md:min-h-[220px]"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;A simple and powerful solution. We saw a clear increase in order value and better table turnaround time.&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Neha Verma"
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Neha Verma</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Owner, Green Leaf Bistro</p>
                </div>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="300"
              data-aos-duration="700"
              className="w-[84vw] sm:w-[330px] md:w-auto shrink-0 snap-center md:shrink p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[210px] sm:h-[220px] md:h-auto md:min-h-[220px]"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;Easy to set up, easy to use, and great support. QRServe is a must-have for modern restaurants.&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Amit Khanna"
                  className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Amit Khanna</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Owner, Urban Dine</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Dot Indicators for Testimonials */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-3">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollTestimonialTo(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                  activeTestimonialSlide === idx
                    ? "w-7 bg-orange-500 shadow-sm shadow-orange-500/50"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
