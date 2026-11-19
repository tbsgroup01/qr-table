import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  loginUser,
  requestPasswordOtp,
  submitResetPassword,
} from "../../../services/authServices";
import logo from "../../../assets/qr.png";
import tableMockup from "../../../assets/table-mockup.jpg";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  KeyRound,
  QrCode,
  BellRing,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot Password / Send OTP Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // "email" -> "otp" -> "new-password" -> "success"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", ""]);
  const [forgotTimer, setForgotTimer] = useState(30);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const forgotOtpRefs = useRef([]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
    });
    AOS.refresh();
  }, []);

  // Timer for Modal OTP
  useEffect(() => {
    let interval = null;
    if (showForgotModal && forgotStep === "otp" && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotTimer]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({ email: trimmedEmail, password });

      if (res && res.success) {
        localStorage.setItem("userRole", res.role);
        localStorage.setItem("token", res.token);
        localStorage.setItem("authToken", res.token);

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", trimmedEmail);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        if (res.role === "admin") {
          localStorage.setItem("adminUser", JSON.stringify(res.user));
          navigate("/admin");
        } else if (res.role === "restaurant") {
          localStorage.setItem("currentRestaurant", JSON.stringify(res.restaurant));
          navigate("/restaurant");
        }
        return;
      }

      setErrorMessage(res?.message || "Failed to login. Please try again.");
    } catch (err) {
      console.error("Login error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to connect to server. Please try again.";
      setErrorMessage(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setForgotError("");

    const targetEmail = forgotEmail.trim().toLowerCase();

    if (!targetEmail) {
      setForgotError("Please enter your registered email or phone.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await requestPasswordOtp(targetEmail);
      if (res && res.success) {
        setForgotStep("otp");
        setForgotTimer(30);
        setForgotOtp(["", "", "", ""]);
        setTimeout(() => {
          if (forgotOtpRefs.current[0]) forgotOtpRefs.current[0].focus();
        }, 100);
      } else {
        setForgotError(res?.message || "No account found with this email.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "No account found with this email.";
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 4).split("");
      const nextOtp = [...forgotOtp];
      pasted.forEach((char, i) => {
        if (i < 4) nextOtp[i] = char;
      });
      setForgotOtp(nextOtp);
      const targetIndex = Math.min(pasted.length, 3);
      if (forgotOtpRefs.current[targetIndex]) forgotOtpRefs.current[targetIndex].focus();
      return;
    }

    const nextOtp = [...forgotOtp];
    nextOtp[index] = value;
    setForgotOtp(nextOtp);

    if (value && index < 3 && forgotOtpRefs.current[index + 1]) {
      forgotOtpRefs.current[index + 1].focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      forgotOtpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyForgotOtp = (e) => {
    e.preventDefault();
    setForgotError("");
    const entered = forgotOtp.join("");
    if (entered.length < 4) {
      setForgotError("Please enter the complete 4-digit OTP.");
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep("new-password");
    }, 800);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!newPassword || newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await submitResetPassword({
        email: forgotEmail.trim().toLowerCase(),
        newPassword,
      });
      if (res && res.success) {
        setForgotStep("success");
      } else {
        setForgotError(res?.message || "Failed to update password.");
      }
    } catch (err) {
      setForgotError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetModalState = () => {
    setShowForgotModal(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp(["", "", "", ""]);
    setForgotError("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-poppins flex flex-col justify-between py-6 sm:py-10">
      {/* Main Content Split Screen */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px] bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Visual / Branding Column */}
          <div
            data-aos="fade-right"
            data-aos-duration="900"
            className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#02241b] via-[#043324] to-[#031d16] text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -left-10 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-emerald-200">
                <Sparkles size={13} className="text-amber-400" />
                <span>Smart Restaurant Ordering</span>
              </div>
              <h2 className="mt-5 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
                Turn diners into <br />
                <span className="text-orange-400">delighted regulars.</span>
              </h2>
              <p className="mt-3 text-sm text-emerald-100/70 leading-relaxed font-normal">
                Access your real-time kitchen orders, QR menu manager, table turnover stats, and revenue analytics.
              </p>
            </div>

            {/* Clean Visual Mockup / Feature Showcase */}
            <div className="relative z-10 my-6">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/20 group">
                <img
                  src={tableMockup}
                  alt="QR Table Ordering Station"
                  className="w-full h-44 xl:h-52 object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
                />
              </div>

              {/* Minimal Key Feature Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <QrCode size={16} className="mx-auto text-amber-300 mb-1" />
                  <span className="text-[11px] font-bold text-white block">QR Menu</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <BellRing size={16} className="mx-auto text-emerald-300 mb-1" />
                  <span className="text-[11px] font-bold text-white block">Live Orders</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <TrendingUp size={16} className="mx-auto text-orange-300 mb-1" />
                  <span className="text-[11px] font-bold text-white block">Analytics</span>
                </div>
              </div>
            </div>

            {/* Bottom Reassurance */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2.5 text-xs text-emerald-100/75">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Trusted by 1,200+ restaurants across India</span>
            </div>
          </div>

          {/* Right Form Column: Clean, focused login form */}
          <div
            data-aos="fade-left"
            data-aos-duration="800"
            className="lg:col-span-7 p-7 sm:p-11 xl:p-14 flex flex-col justify-between"
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

              {/* Form Header */}
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600 mb-3">
                  <Store size={13} />
                  <span>Restaurant Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Sign in to your account
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                  Enter your email and password to access your restaurant dashboard.
                </p>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* CLEAN LOGIN FORM */}
              <form onSubmit={handleLoginSubmit} className="mt-7 space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@spicelounge.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 shrink-0">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotStep("email");
                        setForgotError("");
                        setForgotEmail(email || "");
                      }}
                      className="text-[11px] sm:text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <KeyRound size={12} />
                      <span>Forgot Password?</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 border-slate-300 focus:ring-orange-400 focus:ring-offset-0 cursor-pointer accent-orange-500"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember this device for 30 days</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to Restaurant</span>
                      <ArrowRight size={16} className="stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Switch to Sign Up */}
            <div className="pt-5 mt-6 border-t border-slate-100 text-center">
              <p className="text-xs sm:text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-block whitespace-nowrap"
                >
                  Sign up free
                </Link>
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link to="/privacy" className="hover:text-slate-600 transition-colors whitespace-nowrap">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-slate-600 transition-colors whitespace-nowrap">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEND OTP & PASSWORD RESET MODAL                           */}
      {/* ========================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="text-left mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-orange-600 mb-2">
                <KeyRound size={12} />
                <span>
                  {forgotStep === "email" && "Step 1 of 3: Send OTP"}
                  {forgotStep === "otp" && "Step 2 of 3: Verify OTP"}
                  {forgotStep === "new-password" && "Step 3 of 3: New Password"}
                  {forgotStep === "success" && "Completed"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {forgotStep === "email" && "Reset Password with OTP"}
                {forgotStep === "otp" && "Verify OTP Code"}
                {forgotStep === "new-password" && "Create New Password"}
                {forgotStep === "success" && "Password Reset Successful!"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {forgotStep === "email" &&
                  "Enter your registered email address to receive a verification OTP."}
                {forgotStep === "otp" &&
                  `We have sent a 4-digit verification code to ${forgotEmail}.`}
                {forgotStep === "new-password" &&
                  "Enter and confirm your new password below to secure your portal."}
                {forgotStep === "success" &&
                  "Your password has been successfully updated. You can now log in."}
              </p>
            </div>

            {/* Error Message */}
            {forgotError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: ENTER EMAIL & CLICK SEND OTP */}
            {forgotStep === "email" && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="[EMAIL_ADDRESS]"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={resetModalState}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {forgotLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight size={14} className="stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER 4-DIGIT OTP & VERIFY */}
            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/70 text-xs flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-slate-500">Sent to: </span>
                    <strong className="text-slate-800">{forgotEmail}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotStep("email")}
                    className="text-orange-600 font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Enter Verification Code
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      Demo OTP: 4829
                    </span>
                  </div>

                  {/* 4 Digit Boxes */}
                  <div className="flex items-center justify-center gap-3">
                    {forgotOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (forgotOtpRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-xl font-black rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  {forgotTimer > 0 ? (
                    <span className="text-slate-400 font-medium">
                      Resend code in <strong className="text-slate-600">{forgotTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotTimer(30);
                        setForgotOtp(["", "", "", ""]);
                      }}
                      className="font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep("email")}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {forgotLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <ArrowRight size={14} className="stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CREATE NEW PASSWORD */}
            {forgotStep === "new-password" && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {forgotLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </div>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={15} className="stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {forgotStep === "success" && (
              <div className="py-4 text-center animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 size={36} className="stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Password Changed!</h4>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs">
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPassword(newPassword);
                    if (forgotEmail) setEmail(forgotEmail);
                    resetModalState();
                  }}
                  className="mt-6 w-full py-3 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all duration-200 cursor-pointer"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer bottom bar */}
      <div className="text-center py-4 text-xs text-slate-400">
        © 2026 QRServe Systems. All rights reserved.
      </div>
    </div>
  );
}
