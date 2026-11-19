import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Hide on customer table menu pages to avoid clashing with bottom cart
  const isCustomerPage = pathname.includes("/table") || pathname.includes("/menu") || pathname.includes("/order");

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, hash]);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isCustomerPage) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12
        items-center justify-center rounded-full
        bg-gradient-to-r from-orange-500 to-orange-400
        text-white shadow-lg shadow-orange-500/30
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40
        focus:outline-none focus:ring-4 focus:ring-orange-200
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTop;
