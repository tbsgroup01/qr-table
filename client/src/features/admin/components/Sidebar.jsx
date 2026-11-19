import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Store,
  Users,
  Layers,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import tableMockup from "../../../assets/table-mockup.jpg";

export default function Sidebar({ isCollapsed, onToggle }) {
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      to: "/admin",
      end: true,
      icon: Home,
    },
    {
      name: "Restaurants",
      to: "/admin/restaurants",
      icon: Store,
    },
    {
      name: "Users",
      to: "/admin/users",
      icon: Users,
    },
    {
      name: "Plans & Pricing",
      to: "/admin/plans",
      icon: Layers,
    },
    {
      name: "Revenue (₹)",
      to: "/admin/revenue",
      icon: BarChart3,
    },
    {
      name: "Settings",
      to: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`relative ${
        isCollapsed ? "w-[72px]" : "w-[225px] xl:w-[250px]"
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
      <div className={`${isCollapsed ? "p-2 pt-3" : "px-3 pt-3 xl:px-3.5 xl:pt-3.5"} relative z-10`}>
        {!isCollapsed ? (
          <h3 className="text-[10px] xl:text-[11px] font-bold tracking-widest text-emerald-100/60 uppercase px-3 pt-1 pb-2 transition-opacity duration-200">
            PLATFORM MANAGEMENT
          </h3>
        ) : (
          <div className="w-6 h-[1px] bg-emerald-700/40 mx-auto my-2" />
        )}

        <nav className="space-y-1 xl:space-y-1.5">
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
                      ? "justify-center px-0 py-2.5"
                      : "justify-between px-3.5 py-2.5 xl:px-4 xl:py-2.5"
                  } rounded-xl xl:rounded-2xl font-semibold text-xs xl:text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={19}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-white/85 group-hover:text-white"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-xs xl:text-sm tracking-wide truncate">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {isActive && !isCollapsed && (
                      <span className="w-2 h-2 rounded-full bg-white shrink-0 ml-auto shadow-xs" />
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
      </div>

      {/* Bottom Restaurant QR Table Mockup Section */}
      {!isCollapsed && (
        <div className="mt-auto relative w-full overflow-hidden pointer-events-none select-none">
          <div className="relative w-full h-32 sm:h-36 xl:h-44 2xl:h-52 overflow-hidden">
            <img
              src={tableMockup}
              alt="Restaurant Table QR"
              className="w-full h-full object-cover object-[center_bottom] opacity-85"
            />
            {/* Rich Dark Gradient Blend into Sidebar Background */}
            <div className="absolute top-0 inset-x-0 h-16 xl:h-20 bg-gradient-to-b from-[#02241b] via-[#02241b]/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#02241b]/90 to-transparent pointer-events-none" />
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
