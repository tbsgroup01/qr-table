import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Menu,
  X,
  Home,
  Zap,
  Sparkles,
  CreditCard,
  MessageSquare,
  LogIn,
  ChevronRight,
} from "lucide-react";
import logo from "../../../assets/qr.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "#", icon: Home },
    { name: "How It Works", href: "#how-it-works", icon: Zap },
    { name: "Features", href: "#features", icon: Sparkles },
    { name: "Pricing", href: "#pricing", icon: CreditCard },
    { name: "Testimonials", href: "#testimonials", icon: MessageSquare },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex flex-col">
                <img src={logo} alt="QuickTable" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 shadow-sm hover:border-slate-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight size={13} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Open sidebar menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Off-Canvas Mobile Left Sidebar rendered into document.body portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-300 ${
              mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Full-Screen Dark Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
              aria-hidden="true"
            />

            {/* Solid White Right Sliding Sidebar Drawer */}
            <aside
              className={`fixed inset-y-0 right-0 w-[280px] sm:w-[310px] max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out z-[10000] overflow-hidden ${
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Sidebar Top: Logo & Close Button */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <img src={logo} alt="QuickTable" className="h-16 w-auto object-contain" />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sidebar Navigation Links (Compact Spacing) */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-0.5 no-scrollbar bg-white">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl  text-base font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-orange-600">
                          {link.name}
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all"
                      />
                    </a>
                  );
                })}
              </div>

              {/* Sidebar Bottom: Quick Action CTAs (Pinned to Bottom, without copyright text) */}
              <div className="p-4 pb-6 sm:pb-7 border-t border-slate-100 bg-slate-50/90 space-y-2 shrink-0">
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </Link>

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <LogIn size={13} className="text-slate-400" />
                  <span>Sign In to Portal</span>
                </Link>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
