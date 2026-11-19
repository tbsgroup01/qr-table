import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Sidebar from "./Sidebar";
import AdminNavbar from "./AdminNavbar";
import { useTheme } from "../../../context/ThemeContext";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark, theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: false,
      offset: 20,
    });
    AOS.refresh();
  }, [location.pathname, theme]);

  const handleSignOut = () => {
    console.log("Admin sign out initiated");
  };

  return (
    <div
      className={`h-screen ${
        isDark ? "bg-[#04060d] text-white" : "bg-[#f8fafc] text-slate-900"
      } flex flex-col overflow-hidden transition-colors duration-300 font-poppins`}
    >
      {/* Top Admin Navbar (Permanently fixed at top) */}
      <AdminNavbar />

      {/* Main Layout Area: Fixed Sidebar + Scrollable Dynamic Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-3.5 sm:p-5 lg:p-5 xl:p-7 overflow-y-auto transition-all duration-300">
          <div className="mx-auto space-y-4 sm:space-y-5 xl:space-y-6 max-w-[1700px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
