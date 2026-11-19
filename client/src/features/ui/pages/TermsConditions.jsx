import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsConditions() {
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-orange-400 mb-5 shadow-inner">
                <FileText size={28} className="stroke-[2.2]" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Terms &amp; Conditions
              </h1>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs sm:text-sm text-emerald-100/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-orange-400" />
                  <span>Last Updated: November 2026</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Terms of Service Agreement</span>
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Agreement to Terms</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Proin ut ligula vel nunc egestas porttitor morbi lectus risus iaculis.",
                    "Suspendisse potenti phasellus lacus ligula interdum eget, tempor quis.",
                    "Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
                    "Nullam cursus aliquet vulputate lorem feugiat sit amet egestas nulla."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">2</span>
                  <span>QuickTable Platform Services</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  Fusce pellentesque suscipit nibh. Integer adipiscing risus a sem. Nullam quis massa sit amet nibh viverra malesuada. Nunc sem lacus, accumsan quis, faucibus non, congue vel, arcu. Ut leo. Cras vehicula condimentum odio. Sed ac ligula. Aliquam auctor hendrerit risus.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">3</span>
                  <span>User Accounts &amp; Security</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">4</span>
                  <span>Subscription Fees &amp; Payments</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Vestibulum dapibus, mauris nec malesuada fames ac turpis velit, rhoncus eu, luctus et interdum adipiscing wisi. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Morbi mattis ullamcorper velit. Phasellus gravida semper nisi.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">5</span>
                  <span>Intellectual Property Rights</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">6</span>
                  <span>Limitation of Liability</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold flex items-center justify-center shrink-0">7</span>
                  <span>Termination &amp; Modification</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-8 bg-orange-50/50 rounded-2xl p-6 sm:p-8 border border-orange-100/60">
                <h2 className="text-lg sm:text-xl font-bold text-orange-950 tracking-tight mb-2">
                  Questions About These Terms?
                </h2>
                <p className="text-xs sm:text-sm text-orange-900/80 leading-relaxed mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque nec odio et efficitur. Mauris facilisis justo quis erat dictum sollicitudin.
                </p>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-orange-950">
                  <span>Legal Inquiries: legal@quicktable.com</span>
                  <span>•</span>
                  <span>General Support: support@quicktable.com</span>
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
