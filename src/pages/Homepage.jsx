import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Header from "../components/Header"; 
 
function Homepage() {
    const navigate = useNavigate();
    // We only need 'user' here to display the welcome message
    const { user } = useSelector((state) => state.authSlice);
 
    const stats = [
        { label: "Problems Solved", value: "0" },
        { label: "Acceptance Rate", value: "0%" },
        { label: "Current Streak",  value: "0 days" },
    ];
 
    return (
        <div className="min-h-screen bg-[#080808] text-white">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C9963A]/8 blur-[120px]" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#C9963A]/4 blur-[100px]" />
            </div>
 
            {/* ── Header ── */}
            <Header />
 
            {/* ── Main — z-10 so header dropdown (z-50) always wins ── */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
 
                {/* Welcome banner */}
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 mb-6 backdrop-blur-sm
                    hover:border-[#C9963A]/20 transition-colors duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-[#C9963A] text-[10px] tracking-widest uppercase mb-2 font-medium">Dashboard</p>
                            <h2 className="text-3xl font-bold mb-1.5">
                                Welcome back, <span className="text-[#C9963A]">{user?.userName || "User"}</span> 👋
                            </h2>
                            <p className="text-zinc-500 text-sm">Ready to solve some problems today?</p>
                        </div>
                        <button
                            onClick={() => navigate('/problems')}
                            className="btn rounded-xl border-none bg-[#C9963A] hover:bg-[#E0B455] text-black font-semibold
                                hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,150,58,0.3)]
                                transition-all duration-200"
                        >
                            Start Solving →
                        </button>
                    </div>
                </div>
 
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map(({ label, value }) => (
                        <div key={label}
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5
                                hover:border-[#C9963A]/20 transition-colors duration-300">
                            <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-2">{label}</p>
                            <p className="text-white text-2xl font-bold">{value}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
 
export default Homepage;