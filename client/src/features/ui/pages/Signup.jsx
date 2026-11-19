import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { createRestaurant } from "../../../services/restroServices";
import logo from "../../../assets/qr.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Store,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  QrCode
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    restaurantType: "fine-dining",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
    });
    AOS.refresh();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.restaurantName || !formData.ownerName || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await createRestaurant({
        name: formData.restaurantName.trim(),
        owner: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.restaurantType || "",
        status: "Active",
      });

      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to register restaurant.");
      }

      if (data.data) {
        localStorage.setItem("currentRestaurant", JSON.stringify(data.data));
        localStorage.setItem("userRole", "restaurant");
      }

      navigate("/plans");
    } catch (err) {
      console.error("Restaurant registration error:", err);
      setErrorMessage(
        err.message || "Unable to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-poppins flex flex-col justify-between py-6 sm:py-10">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1240px] bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* Left Visual / Branding Column */}
          <div
            data-aos="fade-right"
            data-aos-duration="900"
            className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#02241b] via-[#043324] to-[#031d16] text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10">
              
              <h2 className="mt-5 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                Get your digital <br />
                <span className="text-orange-400">QR menu live</span> in 5 mins.
              </h2>
              <p className="mt-3 text-sm text-emerald-100/70 leading-relaxed font-normal">
                Join over 1,200+ restaurants that increased their table turnover and average order value with QRServe.
              </p>
            </div>

            {/* Benefits Checklist */}
            <div className="relative z-10 space-y-3.5 my-8">
              {[
                {
                  title: "Instant QR Stand Generation",
                  desc: "Print high-resolution table QR codes with custom styling",
                  icon: QrCode,
                },
                {
                  title: "Real-time Live Order Desk",
                  desc: "Sound notifications and automatic kitchen ticket display",
                  icon: Clock,
                },
                {
                  title: "Complete Menu & Category Control",
                  desc: "Mark items out-of-stock, set special prices & add variants",
                  icon: CheckCircle2,
                },
                {
                  title: "99.9% Uptime & 24/7 Priority Support",
                  desc: "Enterprise-grade reliability during busy rush hours",
                  icon: ShieldCheck,
                },
              ].map((benefit, i) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    data-aos="fade-up"
                    data-aos-delay={150 + i * 100}
                    className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-start gap-3 shadow-lg"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{benefit.title}</h4>
                      <p className="text-[11px] text-emerald-100/70 mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Guarantee */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check size={16} className="stroke-[3]" />
              </div>
              <p className="text-xs text-emerald-100/80 font-medium">
                Cancel anytime during the trial. Zero lock-in, zero hidden fees.
              </p>
            </div>
          </div>

          {/* Right Signup Form Column */}
          <div
            data-aos="fade-left"
            data-aos-duration="800"
            className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between"
          >
            <div>
              {/* Logo inside Card */}
              <div className="mb-6">
                <Link to="/" className="inline-block group">
                  <img
                    src={logo}
                    alt="QuickTable Logo"
                    className="h-11 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-3">
                  <Sparkles size={13} />
                  <span>Start Free Trial</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Register your restaurant
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Fill in the details below to activate your QR ordering station.
                </p>
              </div>
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Store size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        placeholder="e.g. Spice Lounge Cafe"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Owner / Manager Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Owner / Manager Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="e.g. Rohit Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Work Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="owner@restaurant.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9800000000"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-400 focus:ring-offset-0 cursor-pointer accent-orange-500"
                    />
                    <span className="text-xs text-slate-600 leading-normal">
                      I agree to the{" "}
                      <Link to="/terms" className="text-orange-600 font-semibold hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-orange-600 font-semibold hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating your restaurant portal...</span>
                    </div>
                  ) : (
                    <>
                      <span>Start Free 14-Day Trial</span>
                      <ArrowRight size={16} className="stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Switch to Login */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center">
              <p className="text-xs sm:text-sm text-slate-500">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Sign in to your portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        © 2026 QRServe Systems. All rights reserved.
      </div>
    </div>
  );
}
