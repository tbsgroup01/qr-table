import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-500 selection:text-white flex flex-col font-poppins">
      <Navbar />
      <main className="flex-1 font-poppins">
        <Hero />
      </main>
    </div>
  );
}
