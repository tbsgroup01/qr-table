import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import logoImage from "../../../assets/qr.png";
import { getAdminProfile } from "../../../services/adminServices";
import { getSettings } from "../../../services/adminSettingsServices";

function updateBrowserFavicon(url) {
  if (!url) return;
  try {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  } catch (err) {
    console.warn("Favicon update error:", err);
  }
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("adminUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          name: parsed.name || "",
          email: parsed.email || "",
          role: parsed.role || "Admin",
          avatar: parsed.avatar || null,
        };
      }
    } catch {}
    return {
      name: "",
      email: "",
      role: "Admin",
      avatar: null,
    };
  });

  const [siteSettings, setSiteSettings] = useState({
    navbarLogo: null,
    faviconIcon: null,
    platformName: "QuickTable",
  });

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        if (res?.success && res.data) {
          setAdminProfile(res.data);
          try {
            const current = JSON.parse(localStorage.getItem("adminUser") || "{}");
            localStorage.setItem("adminUser", JSON.stringify({ ...current, ...res.data }));
          } catch {}
        }
      })
      .catch((err) => console.warn("AdminNavbar profile fetch:", err));

    getSettings()
      .then((res) => {
        if (res?.success && res.data) {
          setSiteSettings(res.data);
          if (res.data.faviconIcon) {
            updateBrowserFavicon(res.data.faviconIcon);
          }
        }
      })
      .catch((err) => console.warn("AdminNavbar settings fetch:", err));

    const onProfileUpdate = (e) => {
      if (e.detail) {
        setAdminProfile((prev) => ({ ...prev, ...e.detail }));
        try {
          const current = JSON.parse(localStorage.getItem("adminUser") || "{}");
          localStorage.setItem("adminUser", JSON.stringify({ ...current, ...e.detail }));
        } catch {}
      }
    };
    const onSettingsUpdate = (e) => {
      if (e.detail) {
        setSiteSettings((prev) => ({ ...prev, ...e.detail }));
        if (e.detail.faviconIcon) {
          updateBrowserFavicon(e.detail.faviconIcon);
        }
      }
    };

    window.addEventListener("admin-profile-updated", onProfileUpdate);
    window.addEventListener("admin-settings-updated", onSettingsUpdate);

    return () => {
      window.removeEventListener("admin-profile-updated", onProfileUpdate);
      window.removeEventListener("admin-settings-updated", onSettingsUpdate);
    };
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
      localStorage.removeItem("adminUser");
      localStorage.removeItem("currentRestaurant");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch {}
    navigate("/login");
  };

  const displayName = adminProfile.name || adminProfile.email || "Admin";
  const initial = displayName.trim().charAt(0).toUpperCase();

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
          to="/admin"
          className="flex items-center gap-2 group overflow-hidden"
          title={siteSettings.platformName || "QuickTable Admin"}
        >
          <img
            src={siteSettings.navbarLogo || logoImage}
            alt={siteSettings.platformName || "QuickTable"}
            className="h-14 sm:h-16 max-w-[210px] object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Sun
              size={13}
              className={theme === "light" ? "text-amber-500" : ""}
            />
            <span>Day</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Moon size={13} fill={theme === "dark" ? "currentColor" : "none"} />
            <span>Night</span>
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={`rounded-full py-1 pl-1 pr-3 sm:pr-3.5 flex items-center gap-2 cursor-pointer transition-all shadow-sm border ${
              isDropdownOpen
                ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/10"
                : isDark
                ? "bg-[#0e1224] border-[#1b2244] hover:border-orange-500/40 text-white"
                : "bg-slate-100 border-slate-200 hover:border-orange-500/40 text-slate-800"
            }`}
          >
            {adminProfile.avatar ? (
              <img
                src={adminProfile.avatar}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0 border border-orange-500/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-orange-500/25 shrink-0 uppercase">
                {initial}
              </div>
            )}
            <span className="text-xs font-bold hidden sm:inline max-w-[130px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-orange-500" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className={`absolute right-0 mt-2.5 w-64 rounded-2xl border shadow-2xl py-2 z-50 backdrop-blur-2xl transition-all ${
                isDark
                  ? "bg-[#0b0f1e]/95 border-white/10 text-white shadow-black/80"
                  : "bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-slate-900/15"
              }`}
            >
            

              <div className="px-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin/settings");
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
                    <span className="block font-bold">Profile Setting</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Account & security details
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin/settings");
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                    isDark
                      ? "hover:bg-white/10 text-slate-200 hover:text-white"
                      : "hover:bg-orange-50 text-slate-700 hover:text-orange-600"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Settings size={15} />
                  </div>
                  <div className="flex-1">
                    <span className="block font-bold">Platform Settings</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Logos & gateway keys
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

        <button
          type="button"
          onClick={handleLogout}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? "bg-[#0e1224] border-[#1b2244] text-red-400 hover:text-red-300 hover:border-red-500/40"
              : "bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300"
          }`}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
