import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logoutUser } from "../redux/authSlice";
 
const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);
 
const ChevronIcon = ({ open }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);
 
function Homepage() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);   // ✅ proper useRef
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user } = useSelector((state) => state.authSlice);
 
    // ✅ close on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);
 
    const handleLogout = () => {
        setDropdownOpen(false);
        dispatch(logoutUser());
    };
 
    const getInitials = (name) => name ? name.slice(0, 2).toUpperCase() : "?";
 
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
            <header className="relative z-20 border-b border-white/[0.06] bg-black/50 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
 
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-7 h-7 rounded-lg bg-[#C9963A] flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6"/>
                                <polyline points="8 6 2 12 8 18"/>
                            </svg>
                        </div>
                        <span className="text-white font-semibold text-sm tracking-wide">DevCode</span>
                    </div>
 
                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            { label: "Problems", path: "/problems" },
                            { label: "Contest",  path: "/contest"  },
                            { label: "Discuss",  path: "/discuss"  },
                        ].map(({ label, path }) => (
                            <button key={label} onClick={() => navigate(path)}
                                className="px-4 py-2 rounded-xl text-zinc-500 text-sm hover:text-white hover:bg-white/[0.05] transition-all duration-200">
                                {label}
                            </button>
                        ))}
                    </nav>
 
                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {/* Streak pill */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                            <span className="text-sm">🔥</span>
                            <span className="text-zinc-400 text-xs">0 streak</span>
                        </div>
 
                        {/* User dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                                    bg-white/[0.04] border border-white/[0.08]
                                    hover:border-[#C9963A]/35 hover:bg-white/[0.07]
                                    transition-all duration-200"
                            >
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#C9963A] to-[#E0B455] flex items-center justify-center">
                                    <span className="text-black text-[10px] font-bold">{getInitials(user?.userName)}</span>
                                </div>
                                <span className="text-white text-sm font-medium max-w-[110px] truncate">
                                    {user?.userName || "User"}
                                </span>
                                <ChevronIcon open={dropdownOpen} />
                            </button>
 
                            {/* ✅ dropdown — z-50 so it floats above everything */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52
                                    bg-[#111] border border-white/[0.08]
                                    rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]
                                    overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-white/[0.06]">
                                        <p className="text-white text-sm font-medium truncate">{user?.userName || "User"}</p>
                                        <p className="text-zinc-600 text-xs mt-0.5 truncate">{user?.emailId || ""}</p>
                                    </div>
                                    <div className="p-1.5">
                                        <button
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                text-red-400 text-sm text-left
                                                hover:bg-red-500/10 disabled:opacity-50
                                                transition-colors duration-150"
                                        >
                                            {loading
                                                ? <span className="loading loading-spinner loading-xs text-red-400" />
                                                : <LogoutIcon />
                                            }
                                            {loading ? "Logging out..." : "Logout"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
 
            {/* ── Main — z-10 so header dropdown (z-50) always wins ── */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
 
                {/* Welcome banner */}
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 mb-6 backdrop-blur-sm
                    hover:border-[#C9963A]/20 transition-colors duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-[#C9963A] text-[10px] tracking-widest uppercase mb-2 font-medium">Dashboard</p>
                            <h2 className="text-3xl font-bold mb-1.5">
                                Welcome back, <span className="text-[#C9963A]">{user?.userName}</span> 👋
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