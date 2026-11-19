import { useState, useEffect } from "react";
import {
  User,
  Globe,
  CreditCard,
  Lock,
  Mail,
  Phone,
  Save,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import qrLogo from "../../../assets/qr.png";
import qrfavLogo from "../../../assets/qrfav.png";
import {
  getAdminProfile,
  updateAdminProfile,
} from "../../../services/adminServices";
import {
  getSettings,
  updateSettings,
  updatePaymentSettings,
} from "../../../services/adminSettingsServices";
import {
  uploadImage,
  uploadProfileImage,
} from "../../../services/uploadServices";

export default function Settings() {
  const { isDark } = useTheme();

  // Active Tab: "profile" | "site" | "payment"
  const [activeTab, setActiveTab] = useState("profile");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Tab 1: Profile Settings State (Directly from MySQL DB)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Root Administrator",
    currentPassword: "",
    newPassword: "",
  });
  const [profileAvatar, setProfileAvatar] = useState(null);

  // Tab 2: Site Settings State (Directly from MySQL DB)
  const [site, setSite] = useState({
    platformName: "",
    tagline: "",
    supportEmail: "",
    supportPhone: "",
  });
  const [navbarLogo, setNavbarLogo] = useState(qrLogo);
  const [faviconLogo, setFaviconLogo] = useState(qrfavLogo);

  // Tab 3: Payment Integration State (Directly from MySQL DB)
  const [payment, setPayment] = useState({
    keyId: "",
    keySecret: "",
  });
  const [showSecret, setShowSecret] = useState(false);

  const showSuccess = (msg) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Load all settings from MySQL on mount
  useEffect(() => {
    async function loadSettingsFromDB() {
      try {
        setIsLoading(true);

        // 1. Fetch real Admin Profile from DB
        const adminRes = await getAdminProfile();
        if (adminRes?.success && adminRes.data) {
          const adm = adminRes.data;
          setProfile({
            name: adm.name || "",
            email: adm.email || "",
            phone: adm.phone || "",
            role: adm.role || "Root Administrator",
            currentPassword: "",
            newPassword: "",
          });
          if (adm.avatar) setProfileAvatar(adm.avatar);
        }

        // 2. Fetch real Site and Payment Settings from DB
        const settingsRes = await getSettings();
        if (settingsRes?.success && settingsRes.data) {
          const s = settingsRes.data;
          setSite({
            platformName: s.platformName || "QuickTable",
            tagline: s.platformTagline || "",
            supportEmail: s.supportEmail || "",
            supportPhone: s.supportHotline || "",
          });
          if (s.navbarLogo) setNavbarLogo(s.navbarLogo);
          if (s.faviconIcon) setFaviconLogo(s.faviconIcon);
          setPayment({
            keyId: s.razorpayKeyId || "",
            keySecret: s.razorpayKeySecret || "",
          });
        }
      } catch (err) {
        console.error("Failed to load settings from DB:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettingsFromDB();
  }, []);

  // Image Upload Handlers with Backend Upload API
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadProfileImage(file);
      if (res?.url) {
        setProfileAvatar(res.url);
        await updateAdminProfile({ avatar: res.url });
        try {
          const current = JSON.parse(localStorage.getItem("adminUser") || "{}");
          localStorage.setItem("adminUser", JSON.stringify({ ...current, avatar: res.url }));
        } catch {}
        window.dispatchEvent(
          new CustomEvent("admin-profile-updated", {
            detail: { avatar: res.url },
          })
        );
        showSuccess("Profile photo uploaded & saved to database!");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      showError(err.message || "Failed to upload photo");
    }
  };

  const handleNavbarLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      if (res?.url) {
        setNavbarLogo(res.url);
        await updateSettings({ navbarLogo: res.url });
        window.dispatchEvent(
          new CustomEvent("admin-settings-updated", {
            detail: { navbarLogo: res.url },
          })
        );
        showSuccess("Navbar brand logo uploaded & saved to database!");
      }
    } catch (err) {
      console.error("Navbar logo upload failed:", err);
      showError(err.message || "Failed to upload navbar logo");
    }
  };

  const handleFaviconChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      if (res?.url) {
        setFaviconLogo(res.url);
        await updateSettings({ faviconIcon: res.url });
        window.dispatchEvent(
          new CustomEvent("admin-settings-updated", {
            detail: { faviconIcon: res.url },
          })
        );
        showSuccess("Browser favicon uploaded & saved to database!");
      }
    } catch (err) {
      console.error("Favicon upload failed:", err);
      showError(err.message || "Failed to upload favicon");
    }
  };

  // Handle Save Directly to MySQL Database
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (activeTab === "profile") {
        await updateAdminProfile({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          avatar: profileAvatar,
          currentPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        });
        setProfile((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
        try {
          const current = JSON.parse(localStorage.getItem("adminUser") || "{}");
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              ...current,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              avatar: profileAvatar,
            })
          );
        } catch {}
        window.dispatchEvent(
          new CustomEvent("admin-profile-updated", {
            detail: {
              name: profile.name,
              email: profile.email,
              role: profile.role,
              avatar: profileAvatar,
            },
          })
        );
        showSuccess("Admin profile saved to database!");
      } else if (activeTab === "site") {
        await updateSettings({
          platformName: site.platformName,
          platformTagline: site.tagline,
          supportEmail: site.supportEmail,
          supportHotline: site.supportPhone,
          navbarLogo,
          faviconIcon: faviconLogo,
        });
        window.dispatchEvent(
          new CustomEvent("admin-settings-updated", {
            detail: {
              navbarLogo,
              faviconIcon: faviconLogo,
              platformName: site.platformName,
            },
          })
        );
        showSuccess("Site configurations saved to database!");
      } else if (activeTab === "payment") {
        await updatePaymentSettings({
          razorpayKeyId: payment.keyId,
          razorpayKeySecret: payment.keySecret,
        });
        showSuccess("Payment gateway keys saved to database!");
      }
    } catch (err) {
      console.error("Settings save error:", err);
      showError(err.message || "Failed to save settings to database");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "site", label: "Site Settings", icon: Globe },
    { id: "payment", label: "Payment Integration", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 pb-12 select-none relative">
      {/* 1. Header */}
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
              Platform Settings
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Database Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage super admin profile, site configurations, and payment integrations
          </p>
        </div>

        {/* Save & Error Notification Toasts */}
        {toastMessage && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 animate-fade-in self-start sm:self-auto">
            <Check size={14} className="stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 animate-fade-in self-start sm:self-auto">
            <AlertCircle size={14} className="stroke-[3]" />
            <span>{errorMessage}</span>
          </div>
        )}
      </header>

      {/* 2. Glassmorphic Tabs Bar */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className={`p-1.5 rounded-md flex flex-wrap gap-1.5 max-w-fit ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-sm"
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-md font-bold text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Glassmorphic Settings Container */}
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className={`p-6 sm:p-8 rounded-2xl border shadow-xl ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <span className="text-xs font-semibold">Loading settings from database...</span>
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: PROFILE SETTINGS ==================== */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Top Profile Card with Photo Upload */}
                <div
                  className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark
                      ? "bg-white/[0.025] border-white/5"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Profile Photo / Avatar with Upload Overlay */}
                    <div className="relative group/avatar shrink-0">
                      {profileAvatar ? (
                        <img
                          src={profileAvatar}
                          alt="Admin Profile"
                          className="w-16 h-16 rounded-2xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                          {(profile.name || profile.email || "A").charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Camera overlay upload trigger */}
                      <label
                        htmlFor="profile-avatar-upload"
                        className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer shadow-inner"
                        title="Upload profile picture"
                      >
                        <Camera size={18} />
                        <span className="text-[9px] font-bold mt-0.5">Upload</span>
                      </label>
                      <input
                        type="file"
                        id="profile-avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold truncate">
                          {profile.name || profile.email || "Admin"}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-extrabold uppercase tracking-wide">
                          {profile.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                    </div>
                  </div>

                  {/* Upload Photo Button */}
                  <label
                    htmlFor="profile-avatar-upload"
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shrink-0 ${
                      isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <Camera size={14} className="text-orange-500" />
                    <span>Upload Profile Photo</span>
                  </label>
                </div>

                {/* Profile Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Admin Role
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        disabled
                        value={profile.role}
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border opacity-70 cursor-not-allowed ${
                          isDark
                            ? "bg-white/[0.02] border-white/5 text-slate-400"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Security Update */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password & Security
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-400 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={profile.currentPassword}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              currentPassword: e.target.value,
                            })
                          }
                          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                            isDark
                              ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                              : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-400 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="password"
                          placeholder="Leave blank to keep current"
                          value={profile.newPassword}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              newPassword: e.target.value,
                            })
                          }
                          className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                            isDark
                              ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                              : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ==================== TAB 2: SITE SETTINGS ==================== */}
            {activeTab === "site" && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Global Platform Configurations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage public restaurant facing branding, icons, and domain details
                  </p>
                </div>

                {/* Upload Navbar Brand Logo and Favicon Icon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Box 1: Navbar Logo */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 ${
                      isDark
                        ? "bg-white/[0.025] border-white/5"
                        : "bg-white border-slate-200/80 shadow-sm"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Navbar Brand Logo
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Displayed at the top-left of the navbar
                      </p>
                    </div>

                    <div className="flex items-center gap-4 py-1">
                      <div className="w-16 h-16 rounded-2xl border p-2 bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border-slate-200 dark:border-white/10 shadow-inner">
                        <img
                          src={navbarLogo}
                          alt="Navbar Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="navbar-logo-upload"
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isDark
                              ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                          }`}
                        >
                          <UploadCloud size={14} className="text-orange-500" />
                          <span>Upload Navbar Logo</span>
                        </label>
                        <input
                          type="file"
                          id="navbar-logo-upload"
                          accept="image/*"
                          onChange={handleNavbarLogoChange}
                          className="hidden"
                        />
                        <span className="block text-[10px] text-slate-400 mt-1 truncate">
                          Recommended: PNG or SVG (transparent)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Favicon Icon */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col justify-between gap-3 ${
                      isDark
                        ? "bg-white/[0.025] border-white/5"
                        : "bg-white border-slate-200/80 shadow-sm"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Browser Favicon Icon
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Displayed in browser tabs and bookmarks
                      </p>
                    </div>

                    <div className="flex items-center gap-4 py-1">
                      <div className="w-16 h-16 rounded-2xl border p-2 bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border-slate-200 dark:border-white/10 shadow-inner">
                        <img
                          src={faviconLogo}
                          alt="Favicon Icon"
                          className="w-10 h-10 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="favicon-upload"
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isDark
                              ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                          }`}
                        >
                          <UploadCloud size={14} className="text-orange-500" />
                          <span>Upload Favicon Icon</span>
                        </label>
                        <input
                          type="file"
                          id="favicon-upload"
                          accept="image/*"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                        <span className="block text-[10px] text-slate-400 mt-1 truncate">
                          Recommended: 32x32px or 64x64px ICO/PNG
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      required
                      value={site.platformName}
                      onChange={(e) =>
                        setSite({ ...site, platformName: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-bold transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Platform Tagline
                    </label>
                    <input
                      type="text"
                      value={site.tagline}
                      onChange={(e) =>
                        setSite({ ...site, tagline: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      required
                      value={site.supportEmail}
                      onChange={(e) =>
                        setSite({ ...site, supportEmail: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Support Hotline
                    </label>
                    <input
                      type="text"
                      value={site.supportPhone}
                      onChange={(e) =>
                        setSite({ ...site, supportPhone: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                      }`}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Site Settings"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ==================== TAB 3: PAYMENT INTEGRATION ==================== */}
            {activeTab === "payment" && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Gateway Banner */}
                <div
                  className={`p-5 rounded-2xl flex items-center gap-3.5 ${
                    isDark
                      ? "bg-white/[0.025] border-white/5"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold">
                        Razorpay Payment Gateway
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold">
                        LIVE PRODUCTION
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      UPI, Credit/Debit Cards, NetBanking, and Auto-reconciled Payouts
                    </p>
                  </div>
                </div>

                {/* Gateway API Keys */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_live_..."
                      value={payment.keyId}
                      onChange={(e) =>
                        setPayment({ ...payment, keyId: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1.5">
                      Razorpay Key Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecret ? "text" : "password"}
                        placeholder="Key secret"
                        value={payment.keySecret}
                        onChange={(e) =>
                          setPayment({ ...payment, keySecret: e.target.value })
                        }
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Gateway Configuration"}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
