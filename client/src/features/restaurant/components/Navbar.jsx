import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  UtensilsCrossed,
  Clock,
  Crown,
  Sparkles,
  Trophy,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import logoImage from "../../../assets/qr.png";
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../services/notificationServices";
import { getRestaurantProfile } from "../../../services/restroServices";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dropdownRef = useRef(null);

  const [storedRestro, setStoredRestro] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentRestaurant") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setLogoError(false);
  }, [storedRestro.logo]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("currentRestaurant") || "{}");
        const targetId = stored.id || "profile";
        const res = await getRestaurantProfile(targetId);
        if (res && res.data) {
          setStoredRestro((prev) => ({ ...prev, ...res.data }));
          try {
            localStorage.setItem("currentRestaurant", JSON.stringify(res.data));
          } catch {}
        }
      } catch (err) {
        // non-blocking
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("userRole");
      localStorage.removeItem("currentRestaurant");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    navigate("/login");
  };

  useEffect(() => {
    const onRestroUpdate = (e) => {
      if (e.detail) {
        setStoredRestro((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("restaurant-updated", onRestroUpdate);
    return () => window.removeEventListener("restaurant-updated", onRestroUpdate);
  }, []);

  const currentPlan = (storedRestro.plan || "Starter").toUpperCase();
  const restroName = storedRestro.name || "Restaurant";
  const restroInitial = (restroName || "R")[0].toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications({ restaurantId: storedRestro.id || 1 });
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(
          typeof res.unreadCount === "number"
            ? res.unreadCount
            : res.data.filter((n) => !n.isRead).length
        );
      }
    } catch (err) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);

    let channel = null;
    try {
      channel = new BroadcastChannel("quicktable_order_sync_channel");
      channel.onmessage = () => {
        fetchNotifications();
      };
    } catch {
      // fallback
    }

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, []);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(storedRestro.id || 1);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Could not mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // non-blocking
      }
    }
  };

  return (
    <header
      className={`w-full h-[72px] ${
        isDark
          ? "bg-[#070913]/90 border-white/[0.08] text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          : "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
      } backdrop-blur-2xl border-b sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 select-none transition-colors duration-300`}
    >
      <div className="flex items-center shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 group overflow-hidden"
          title="QuickTable Restaurant Portal"
        >
          <img
            src={logoImage}
            alt="QuickTable"
            className="h-20 w-auto max-w-[190px] object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <button
          type="button"
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isVoiceEnabled
              ? isDark
                ? "bg-orange-500/15 border-orange-500/40 text-orange-400 hover:bg-orange-500/25"
                : "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
              : isDark
              ? "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          }`}
          title={
            isVoiceEnabled
              ? "Voice Speaker Alerts: ENABLED (Audio will announce incoming orders)"
              : "Voice Speaker Alerts: MUTED"
          }
          aria-label="Toggle voice speaker"
        >
          {isVoiceEnabled ? (
            <Volume2 size={18} className="stroke-[2.2]" />
          ) : (
            <VolumeX size={18} className="stroke-[2.2]" />
          )}

          {isVoiceEnabled && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${
              showNotifications
                ? "bg-orange-500/15 border-orange-500/40 text-orange-500"
                : isDark
                ? "bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06]"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Notifications & Live Alerts"
            aria-label="Notifications"
          >
            <Bell size={18} className="stroke-[2.2]" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black ring-2 ring-white dark:ring-[#070913] animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              <div
                className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-fade-in ${
                  isDark
                    ? "bg-[#0c1022]/95 backdrop-blur-2xl border-white/10 text-white"
                    : "bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-900"
                }`}
              >
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm tracking-tight">
                      Restaurant Alerts
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-500 text-[10px] font-extrabold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                          !item.isRead
                            ? isDark
                              ? "bg-white/[0.04] hover:bg-white/[0.06]"
                              : "bg-orange-50/60 hover:bg-orange-50"
                            : isDark
                            ? "hover:bg-white/[0.02] opacity-80"
                            : "hover:bg-slate-50 opacity-80"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                            item.type === "QUIZ"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          }`}
                        >
                          {item.type === "QUIZ" ? (
                            <Trophy size={14} />
                          ) : (
                            <UtensilsCrossed size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-bold text-xs truncate ${
                                !item.isRead
                                  ? isDark
                                    ? "text-orange-400"
                                    : "text-orange-600"
                                  : isDark
                                  ? "text-white"
                                  : "text-slate-800"
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 text-center border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Live Alerts Enabled
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className={`rounded-full p-1 flex items-center shadow-inner border ${
            isDark
              ? "bg-[#0e1224] border-[#1b2244]"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-orange-600 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Light Theme"
          >
            <Sun size={13} />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="Dark Theme"
          >
            <Moon size={13} />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        <div
          ref={dropdownRef}
          className={`relative flex items-center pl-2 border-l ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border border-transparent transition-all cursor-pointer ${
              isDropdownOpen
                ? isDark
                  ? "bg-white/[0.08] border-white/10 shadow-sm"
                  : "bg-slate-100 border-slate-200 shadow-sm"
                : isDark
                ? "hover:bg-white/[0.05] hover:border-white/10"
                : "hover:bg-slate-50 hover:border-slate-200"
            }`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            title="Profile & Account Menu"
          >
            {storedRestro.logo && !logoError ? (
              <img
                src={storedRestro.logo}
                alt={restroName}
                onError={() => setLogoError(true)}
                className="w-8 h-8 rounded-full object-cover shadow-md shrink-0 border border-orange-500/30 bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/20 shrink-0">
                {restroInitial}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span
                className={`text-xs font-bold leading-tight truncate max-w-[120px] ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                {restroName}
              </span>
              <span className="text-[10px] font-semibold text-orange-500 flex items-center gap-1 leading-tight">
                <Crown size={10} className="fill-orange-500 text-orange-500 shrink-0" />
                <span className="truncate max-w-[90px]">{currentPlan}</span>
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-50 backdrop-blur-2xl transition-all animate-fade-in ${
                isDark
                  ? "bg-[#0b0f1e]/95 border-white/10 text-white shadow-black/80"
                  : "bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-slate-900/15"
              }`}
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
                {storedRestro.logo && !logoError ? (
                  <img
                    src={storedRestro.logo}
                    alt={restroName}
                    onError={() => setLogoError(true)}
                    className="w-10 h-10 rounded-full object-cover border border-orange-500/30 shrink-0 shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {restroInitial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className={`font-bold text-xs truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                    {restroName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {storedRestro.email || "restaurant@quicktable.in"}
                  </div>
                  <div className="text-[10px] font-semibold text-orange-500 mt-0.5">
                    {currentPlan}
                  </div>
                </div>
              </div>
             

              <div className="px-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/restaurant/settings");
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                    isDark
                      ? "hover:bg-white/10 text-slate-200 hover:text-white"
                      : "hover:bg-orange-50 text-slate-700 hover:text-orange-600"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <User size={15} />
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold">Profile</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Restaurant & account details
                    </span>
                  </div>
                </button>
              </div>



              <div className="px-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                    isDark
                      ? "text-red-400 hover:bg-red-500/15 hover:text-red-300"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <LogOut size={15} />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
