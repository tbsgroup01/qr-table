import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../../../context/ThemeContext";

export default function RestaurantLayout() {
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
    console.log("Restaurant sign out initiated");
  };

  return (
    <div
      className={`h-screen ${
        isDark ? "bg-[#04060d] text-white" : "bg-[#f8fafc] text-slate-900"
      } flex flex-col overflow-hidden transition-colors duration-300 font-poppins`}
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto transition-all duration-300">
          <div className="mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
