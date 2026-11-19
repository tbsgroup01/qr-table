import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Building2,
  QrCode,
  Upload,
  Check,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import logoImage from "../../../assets/qr.png";
import { uploadProfileImage } from "../../../services/uploadServices";
import {
  getRestaurantProfile,
  updateRestaurantProfile,
} from "../../../services/restroServices";

export default function Setting() {
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentRestaurant, setCurrentRestaurant] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentRestaurant") || "{}");
    } catch {
      return {};
    }
  });

  const [profileData, setProfileData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    openingTime: "",
    closingTime: "",
  });

  const [brandData, setBrandData] = useState({
    tagline: "",
    fssaiNumber: "",
    gstin: "",
    logoPreview: logoImage,
  });

  const [paymentData, setPaymentData] = useState({
    merchantName: "",
    upiId: "",
    qrImagePreview: logoImage,
    acceptUpiQr: true,
    acceptCash: true,
    acceptCards: true,
    taxPercentage: "5",
  });

  const currentPlan = (currentRestaurant.plan || "Starter").toUpperCase();

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setIsLoading(true);
        const stored = JSON.parse(localStorage.getItem("currentRestaurant") || "{}");
        const targetId = stored.id || "profile";
        const res = await getRestaurantProfile(targetId);

        if (res && res.data) {
          const data = res.data;
          setProfileData({
            restaurantName: data.name || "",
            ownerName: data.owner || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            pincode: data.pincode || "",
            openingTime: data.openingTime || "",
            closingTime: data.closingTime || "",
          });

          setBrandData({
            tagline: data.tagline || "",
            fssaiNumber: data.fssaiNumber || "",
            gstin: data.gstin || "",
            logoPreview: data.logo || logoImage,
          });

          setPaymentData({
            merchantName: data.merchantName || data.name || "",
            upiId: data.upiId || "",
            qrImagePreview: data.qrImage || logoImage,
            acceptUpiQr: data.acceptUpiQr !== undefined ? data.acceptUpiQr : true,
            acceptCash: data.acceptCash !== undefined ? data.acceptCash : true,
            acceptCards: data.acceptCards !== undefined ? data.acceptCards : true,
            taxPercentage: data.taxPercentage || "5",
          });

          setCurrentRestaurant(data);
          try {
            localStorage.setItem("currentRestaurant", JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.warn("Failed to load restaurant profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRestaurant();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = (field, value) => {
    setBrandData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadProfileImage(file);
      if (res && res.url) {
        setBrandData((prev) => ({ ...prev, logoPreview: res.url }));
        const targetId = currentRestaurant.id || "profile";
        await updateRestaurantProfile(targetId, { logo: res.url });

        const updated = { ...currentRestaurant, logo: res.url };
        setCurrentRestaurant(updated);
        try {
          localStorage.setItem("currentRestaurant", JSON.stringify(updated));
        } catch {}
        window.dispatchEvent(new CustomEvent("restaurant-updated", { detail: updated }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.warn("Logo upload error:", err.message);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadProfileImage(file);
      if (res && res.url) {
        setPaymentData((prev) => ({ ...prev, qrImagePreview: res.url }));
        const targetId = currentRestaurant.id || "profile";
        await updateRestaurantProfile(targetId, { qrImage: res.url });

        const updated = { ...currentRestaurant, qrImage: res.url };
        setCurrentRestaurant(updated);
        try {
          localStorage.setItem("currentRestaurant", JSON.stringify(updated));
        } catch {}
        window.dispatchEvent(new CustomEvent("restaurant-updated", { detail: updated }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.warn("QR upload error:", err.message);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const targetId = currentRestaurant.id || "profile";
      const payload = {
        name: profileData.restaurantName.trim(),
        owner: profileData.ownerName.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        address: profileData.address.trim(),
        city: profileData.city.trim(),
        pincode: profileData.pincode.trim(),
        openingTime: profileData.openingTime.trim(),
        closingTime: profileData.closingTime.trim(),
        tagline: brandData.tagline.trim(),
        fssaiNumber: brandData.fssaiNumber.trim(),
        gstin: brandData.gstin.trim(),
        logo: brandData.logoPreview,
        merchantName: paymentData.merchantName.trim(),
        upiId: paymentData.upiId.trim(),
        qrImage: paymentData.qrImagePreview,
        acceptUpiQr: paymentData.acceptUpiQr,
        acceptCash: paymentData.acceptCash,
        acceptCards: paymentData.acceptCards,
        taxPercentage: paymentData.taxPercentage,
      };

      const res = await updateRestaurantProfile(targetId, payload);
      const updated = res?.data || { ...currentRestaurant, ...payload };

      setCurrentRestaurant(updated);
      try {
        localStorage.setItem("currentRestaurant", JSON.stringify(updated));
      } catch {}

      window.dispatchEvent(new CustomEvent("restaurant-updated", { detail: updated }));

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Save restaurant settings failed:", err);
      setErrorMessage(err.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
    },
    {
      id: "brand",
      label: "Brand Settings",
      icon: Building2,
    },
    {
      id: "payment",
      label: "Payment Settings (QR Upload)",
      icon: QrCode,
    },
    {
      id: "subscription",
      label: "Subscription & Plan",
      icon: Crown,
    },
  ];

  return (
    <div className="space-y-6 pb-12 select-none relative">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Restaurant Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Configure profile credentials, branding visual assets, and UPI payment QR code
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving to Database...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check size={16} className="stroke-[3]" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </header>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                isActive
                  ? isDark
                    ? "bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10"
                    : "bg-orange-500/10 border-orange-500/30 shadow-md shadow-orange-500/10"
                  : isDark
                  ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/30"
                    : isDark
                    ? "bg-white/5 border-white/10 text-slate-400"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <Icon size={17} />
              </div>

              <span
                className={`text-xs sm:text-sm font-semibold truncate ${
                  isActive
                    ? "text-orange-500"
                    : isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-orange-500" />
          <span className="text-xs font-semibold">Loading restaurant settings from database...</span>
        </div>
      ) : (
        <>
          {activeTab === "profile" && (
            <div
              className={`p-6 rounded-2xl border shadow-xl space-y-6 ${
                isDark
                  ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                  : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div className="pb-4 border-b border-slate-100 dark:border-white/10">
                <h2
                  className={`text-lg font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Profile Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  General restaurant details and manager communication contacts
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Restaurant Legal / Trading Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.restaurantName}
                      onChange={(e) =>
                        handleProfileChange("restaurantName", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Primary Owner / Manager Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.ownerName}
                      onChange={(e) =>
                        handleProfileChange("ownerName", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Official Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        required
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileChange("email", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Official Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={profileData.phone}
                        onChange={(e) =>
                          handleProfileChange("phone", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Restaurant Physical Address *
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={profileData.address}
                        onChange={(e) =>
                          handleProfileChange("address", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) =>
                        handleProfileChange("city", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) =>
                        handleProfileChange("pincode", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Opening Time
                    </label>
                    <div className="relative">
                      <Clock
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={profileData.openingTime}
                        onChange={(e) =>
                          handleProfileChange("openingTime", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Closing Time
                    </label>
                    <div className="relative">
                      <Clock
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={profileData.closingTime}
                        onChange={(e) =>
                          handleProfileChange("closingTime", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save Profile Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "brand" && (
            <div
              className={`p-6 rounded-2xl border shadow-xl space-y-6 ${
                isDark
                  ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                  : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div className="pb-4 border-b border-slate-100 dark:border-white/10">
                <h2
                  className={`text-lg font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Brand Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload restaurant brand logo, marketing tagline, and statutory licenses
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-2">
                    Restaurant Brand Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-28 h-28 rounded-2xl p-2 border-2 border-dashed border-orange-500/40 bg-white flex items-center justify-center shrink-0 shadow-md">
                      <img
                        src={brandData.logoPreview}
                        alt="Brand Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20">
                        <Upload size={14} />
                        <span>Upload New Brand Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Supports PNG, JPG, WebP or SVG with transparent background (Recommended 512x512)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      Brand Tagline / Hospitality Motto
                    </label>
                    <input
                      type="text"
                      value={brandData.tagline}
                      onChange={(e) =>
                        handleBrandChange("tagline", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      FSSAI Food License Number *
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        placeholder="14-digit FSSAI number"
                        value={brandData.fssaiNumber}
                        onChange={(e) =>
                          handleBrandChange("fssaiNumber", e.target.value)
                        }
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all font-mono ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-1.5">
                      GSTIN (Tax Registration Number)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      value={brandData.gstin}
                      onChange={(e) =>
                        handleBrandChange("gstin", e.target.value.toUpperCase())
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all font-mono uppercase ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Save Brand Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div
                className={`lg:col-span-7 p-6 rounded-2xl border shadow-xl space-y-6 ${
                  isDark
                    ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                    : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div className="pb-4 border-b border-slate-100 dark:border-white/10">
                  <h2
                    className={`text-lg font-bold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Payment Settings & UPI QR Upload
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload your shop's official payment QR code for digital table order settlement
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block font-bold text-xs text-slate-400 mb-2">
                      Upload Merchant Payment QR Code *
                    </label>

                    <div className="p-5 rounded-2xl border-2 border-dashed border-orange-500/40 bg-orange-500/[0.02] text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center">
                        <QrCode size={24} />
                      </div>

                      <div className="space-y-1">
                        <p
                          className={`text-xs font-bold ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Drag & Drop your UPI QR Code image here
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports Paytm, PhonePe, Google Pay, BharatPe or Bank UPI QR (PNG / JPG)
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>Choose QR Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-xs text-slate-400 mb-1.5">
                        Merchant UPI ID / VPA *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. rajudhaba@icici"
                        value={paymentData.upiId}
                        onChange={(e) =>
                          handlePaymentChange("upiId", e.target.value)
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all font-mono ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-xs text-slate-400 mb-1.5">
                        Beneficiary / Merchant Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RAJU DHABA & RESTAURANT"
                        value={paymentData.merchantName}
                        onChange={(e) =>
                          handlePaymentChange("merchantName", e.target.value)
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all uppercase ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      <span>Save Payment Settings</span>
                    </button>
                  </div>
                </form>
              </div>

              <div
                className={`lg:col-span-5 p-6 rounded-2xl border shadow-xl flex flex-col justify-between items-center text-center space-y-4 ${
                  isDark
                    ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                    : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div className="w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Diner Payment Preview</span>
                  </div>
                  <h3
                    className={`text-base font-extrabold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Table Bill Settlement QR
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This QR will be displayed to diners when requesting bill & on printed thermal receipts
                  </p>
                </div>

                <div className="w-full max-w-xs p-5 bg-white rounded-3xl shadow-2xl border-4 border-orange-500 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={brandData.logoPreview}
                      alt="Logo"
                      className="h-7 object-contain"
                    />
                    <span className="font-black text-xs text-slate-900 tracking-tight">
                      {profileData.restaurantName || "Restaurant Name"}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
                    <img
                      src={paymentData.qrImagePreview}
                      alt="Uploaded UPI QR"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Scan & Pay Any UPI App
                    </span>
                    <p className="font-extrabold text-xs text-slate-900">
                      {paymentData.merchantName || profileData.restaurantName}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-orange-600">
                      {paymentData.upiId || "upi@bank"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] text-slate-400 font-semibold">
                    <span>GPay</span>
                    <span>•</span>
                    <span>PhonePe</span>
                    <span>•</span>
                    <span>Paytm</span>
                    <span>•</span>
                    <span>BHIM</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 max-w-xs">
                  Direct settlement to your bank account without any aggregator commission.
                </p>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark
                  ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                  : "bg-white/80 backdrop-blur-2xl border-white/70"
              }`}
            >
              <div className="max-w-3xl space-y-6">
                <div>
                  <h2
                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Subscription Plan & Entitlements
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage your restaurant subscription tier, billing period, and explore upgrade options
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent border-2 border-orange-500/40 shadow-lg relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                        <Crown size={28} className="fill-white/20 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                            Active Tier
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-500 text-white">
                            {currentPlan}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Status: {currentRestaurant.status || "Active"}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                          {currentRestaurant.name || profileData.restaurantName || "Your Restaurant"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Subscribed under owner: {currentRestaurant.owner || profileData.ownerName || "Owner"} ({currentRestaurant.email || profileData.email || "No email"})
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/plans"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <Sparkles size={16} className="fill-white" />
                      <span>Upgrade or Change Plan</span>
                      <ArrowRight size={16} className="stroke-[2.5]" />
                    </Link>
                  </div>

                  <div className="mt-6 pt-5 border-t border-orange-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-orange-500/10">
                      <span className="text-[11px] text-slate-400 block font-medium">Table Limit</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {currentPlan.includes("PRO") ? "Up to 50 Tables" : currentPlan.includes("ENTERPRISE") ? "Unlimited Tables" : "Up to 10 Tables"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-orange-500/10">
                      <span className="text-[11px] text-slate-400 block font-medium">Payment Gateway</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Razorpay Live Sync
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-orange-500/10">
                      <span className="text-[11px] text-slate-400 block font-medium">Ordering Mode</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Direct QR Digital Menu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Want to scale up with more QR tables & arcade games?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upgrading your plan unlocks instant multiplayer diner games, live kitchen analytics, and multi-outlet management.
                    </p>
                  </div>

                  <Link
                    to="/plans"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-sm shrink-0"
                  >
                    View All Plans
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
