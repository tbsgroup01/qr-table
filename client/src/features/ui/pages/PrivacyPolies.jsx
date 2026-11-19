import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Clock, Lock, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolies() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#02241b] via-[#032e22] to-[#043324] text-white py-14 sm:py-18 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-start mb-8">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-full border border-white/15 transition-all shadow-sm group hover:-translate-x-0.5"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Back to Home</span>
              </button>
            </div>

            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 mb-5 shadow-inner">
                <Shield size={28} className="stroke-[2.2]" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Privacy Policy
              </h1>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs sm:text-sm text-emerald-100/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-orange-400" />
                  <span>Last Updated: November 2026</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-400" />
                  <span>Data Protection & Privacy</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 lg:p-16 shadow-sm space-y-10">

              <div>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Information We Collect</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit elit sed do eiusmod.",
                    "Tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.",
                    "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">2</span>
                  <span>How We Use Your Information</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Cookies &amp; Tracking Technologies</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">4</span>
                  <span>Third-Party Data Sharing</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">5</span>
                  <span>Data Security &amp; Retention</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">6</span>
                  <span>Your Privacy Rights</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Vivamus elementum semper nisi aenean vulputate eleifend tellus.",
                    "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.",
                    "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.",
                    "Phasellus viverra nulla ut metus varius laoreet quisque rutrum."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-8 bg-emerald-50/50 rounded-2xl p-6 sm:p-8 border border-emerald-100/60">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight mb-2">
                  Contact Our Privacy Team
                </h2>
                <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque nec odio et efficitur. Mauris facilisis justo quis erat dictum sollicitudin.
                </p>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-emerald-900">
                  <span>Email: privacy@quicktable.com</span>
                  <span>•</span>
                  <span>Support: support@quicktable.com</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
