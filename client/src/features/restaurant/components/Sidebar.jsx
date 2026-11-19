import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  BellRing,
  BookOpen,
  QrCode,
  HelpCircle,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import tableMockup from "../../../assets/table-mockup.jpg";

export default function Sidebar({ isCollapsed, onToggle, onSignOut }) {
  const navigate = useNavigate();

  const [storedRestro, setStoredRestro] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentRestaurant") || "{}");
    } catch {
      return {};
    }
  });

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

  const handleSignOutClick = () => {
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
    if (onSignOut) onSignOut();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      to: "/restaurant",
      end: true,
      icon: LayoutGrid,
    },
    {
      name: "Live Orders",
      to: "/restaurant/live-orders",
      icon: BellRing,
    },
    {
      name: "Menu",
      to: "/restaurant/menu",
      icon: BookOpen,
    },
    {
      name: "Tables",
      to: "/restaurant/tables",
      icon: QrCode,
    },
    {
      name: "Quiz",
      to: "/restaurant/quiz",
      icon: HelpCircle,
    },
    {
      name: "Analytics",
      to: "/restaurant/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      to: "/restaurant/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`relative ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      } h-full bg-[#02241b] text-white border-r border-emerald-950/80 flex flex-col justify-between select-none z-40 transition-all duration-300 ease-in-out shrink-0`}
    >
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full border-2 border-white bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-black/30 cursor-pointer transition-all duration-200 hover:scale-115 active:scale-95"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={15} className="stroke-[3] ml-0.5 text-white" />
        ) : (
          <ChevronLeft size={15} className="stroke-[3] mr-0.5 text-white" />
        )}
      </button>

      {/* Top Navigation Section */}
      <div
        className={`flex-1 overflow-y-auto ${
          isCollapsed ? "p-2.5 pt-3" : "px-3.5 pt-3.5"
        } relative z-10`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {!isCollapsed ? (
          <h3 className="text-[11px] font-bold tracking-widest text-emerald-100/60 uppercase px-3.5 pt-1.5 pb-2.5 transition-opacity duration-200">
            RESTAURANT MANAGEMENT
          </h3>
        ) : (
          <div className="w-6 h-[1px] bg-emerald-700/40 mx-auto my-2" />
        )}

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.end}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center ${
                    isCollapsed
                      ? "justify-center px-0 py-3"
                      : "justify-between px-4 py-3"
                  } rounded-2xl font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        size={20}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-white/85 group-hover:text-white"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-sm tracking-wide truncate">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {isActive && !isCollapsed && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 ml-auto shadow-xs" />
                    )}

                    {isActive && isCollapsed && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Active Plan & Upgrade Card */}
        {!isCollapsed ? (
          <div className="mt-4 p-3 rounded-2xl bg-white/[0.05] border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                Current Plan
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {currentPlan}
              </span>
            </div>
            <p className="text-[11px] text-white/70 line-clamp-1 mb-2.5">
              Live QR orders & menu active
            </p>
            <button
              type="button"
              onClick={() => navigate("/plans")}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Crown size={12} className="fill-white" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/plans")}
              title={`Current Plan: ${currentPlan} - Click to Upgrade`}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Crown size={18} className="fill-white" />
            </button>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="mt-3 pt-3 border-t border-emerald-900/60">
          <button
            type="button"
            onClick={handleSignOutClick}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0 py-3" : "gap-3.5 px-4 py-3"
            } rounded-2xl font-semibold text-sm text-emerald-100/75 hover:text-white hover:bg-rose-500/20 transition-all duration-200 cursor-pointer group`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut
              size={20}
              className="shrink-0 text-emerald-200/70 group-hover:text-rose-300 transition-colors"
            />
            {!isCollapsed && (
              <span className="text-sm tracking-wide truncate group-hover:text-rose-200">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Restaurant QR Table Mockup Section */}
      {!isCollapsed && (
        <div className="mt-auto relative w-full overflow-hidden pointer-events-none select-none">
          <div className="relative w-full h-48 sm:h-56 overflow-hidden">
            <img
              src={tableMockup}
              alt="Restaurant Table QR"
              className="w-full h-full object-cover object-[center_bottom] opacity-90"
            />
            {/* Rich Dark Gradient Blend into Sidebar Background */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#02241b] via-[#02241b]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#02241b]/90 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02241b]/25 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="mt-auto w-full h-16 overflow-hidden relative pointer-events-none opacity-40">
          <img
            src={tableMockup}
            alt="Table QR"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#02241b]" />
        </div>
      )}
    </aside>
  );
}