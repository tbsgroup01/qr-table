import { Link } from "react-router-dom";
import { QrCode, ArrowRight, Shield, FileText } from "lucide-react";
import logo from "../../../assets/qr.png";

export default function Footer() {
  return (
    <footer className="w-full bg-[#02241b] text-white relative overflow-hidden border-t border-emerald-950">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start pb-12">
          
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block mb-3.5 group">
                <img src={logo} alt="QuickTable" className="h-20 w-auto object-contain" />
              </Link>

              <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed max-w-sm mb-6">
                A smart QR menu solution for modern restaurants. Let your customers scan, browse, and order instantly.
              </p>

              <div className="flex items-center gap-2.5 mb-6">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-md shadow-[#1877F2]/30 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white flex items-center justify-center shadow-md shadow-[#dc2743]/30 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-[#0A66C2] hover:bg-[#095196] text-white flex items-center justify-center shadow-md shadow-[#0A66C2]/30 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-white flex items-center justify-center shadow-md shadow-[#FF0000]/30 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                <a
                  href="#"
                  aria-label="X"
                  className="w-9 h-9 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white flex items-center justify-center shadow-md shadow-black/40 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="w-56 h-20 text-emerald-400/35 opacity-80 mt-2">
              <svg viewBox="0 0 260 110" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <ellipse cx="130" cy="65" rx="58" ry="12" />
                <line x1="120" y1="77" x2="110" y2="105" />
                <line x1="140" y1="77" x2="150" y2="105" />
                <path d="M95 105 L165 105" strokeWidth="2" />
                <path d="M125 50 L135 50 L133 60 L127 60 Z" />
                <path d="M130 50 C125 40, 120 42, 118 36" />
                <path d="M130 50 C135 40, 140 42, 142 36" />
                <path d="M130 50 L130 34" />
                <path d="M60 48 C55 35, 62 25, 75 25 C88 25, 92 35, 88 48 L88 80 L58 80 Z" />
                <line x1="62" y1="80" x2="60" y2="105" />
                <line x1="84" y1="80" x2="86" y2="105" />
                <path d="M200 48 C205 35, 198 25, 185 25 C172 25, 168 35, 172 48 L172 80 L202 80 Z" />
                <line x1="198" y1="80" x2="200" y2="105" />
                <line x1="176" y1="80" x2="174" y2="105" />
                <path d="M102 38 C100 28, 106 20, 115 20 C124 20, 128 28, 126 38" strokeDasharray="3 3" />
                <path d="M134 38 C132 28, 138 20, 147 20 C156 20, 160 28, 158 38" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>

          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-base font-bold text-white tracking-tight">Quick Links</h3>
            <div className="w-8 h-0.5 bg-orange-500 rounded-full mt-1.5 mb-4" />
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100/75">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-orange-400 transition-colors">Testimonials</a>
              </li>
             
            </ul>
          </div>

          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-base font-bold text-white tracking-tight">Legal</h3>
            <div className="w-8 h-0.5 bg-orange-500 rounded-full mt-1.5 mb-4" />
            <ul className="space-y-3 text-xs sm:text-sm text-emerald-100/75">
              <li>
                <Link to="/privacy" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                  <Shield size={16} className="text-emerald-400/80 shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                  <FileText size={16} className="text-emerald-400/80 shrink-0" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 relative flex justify-start lg:justify-end">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#02241b]/95 to-black/70 backdrop-blur-xl border border-amber-500/25 p-6 sm:p-7 shadow-2xl shadow-black/50 relative z-10 w-full max-w-sm sm:max-w-md lg:ml-auto">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/35 text-orange-400 flex items-center justify-center shrink-0 shadow-inner">
                  <QrCode size={24} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                    Ready to <br /> Go Digital?
                  </h4>
                </div>
              </div>

              <p className="text-xs text-emerald-100/75 leading-relaxed mt-2.5">
                Set up your QR menu in minutes and upgrade your restaurant experience.
              </p>

              <Link
                to="/restaurant"
                className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1.5 mt-5 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
