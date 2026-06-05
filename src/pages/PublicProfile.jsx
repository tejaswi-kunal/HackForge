import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Header from "../components/Header";
import ProfileSidebar from "../components/ProfileSidebar"; // Reusing our amazing sidebar component
import axiosClient from "../utils/axiosClient";
import { Activity, Lock } from "lucide-react";
import { motion } from 'framer-motion';

// --- Reusing the Custom Heatmap for the Public Profile ---
const CustomHeatmap = ({ activityCalendar }) => {
    const [tooltip, setTooltip] = useState(null);
    const scrollContainerRef = useRef(null);

    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();
        const activityMap = new Map();
        (activityCalendar || []).forEach(day => activityMap.set(day.date, day.count));

        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = activityMap.get(dateStr) || 0;
            let level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;

            const monthName = d.toLocaleString('en-US', { month: 'short' });
            const year = d.getFullYear();
            const monthKey = `${monthName} ${year}`;

            let monthGroup = data.find(m => m.id === monthKey);
            if (!monthGroup) {
                monthGroup = { id: monthKey, name: monthName, days: [] };
                data.push(monthGroup);
            }
            monthGroup.days.push({
                date: dateStr, count, level,
                displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
        return data;
    }, [activityCalendar]);

    useEffect(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }, [heatmapData]);

    const getBgColor = (level) => {
        switch(level) {
            case 1: return 'bg-[#0e4429] border border-[#0e4429]';
            case 2: return 'bg-[#006d32] border border-[#006d32]';
            case 3: return 'bg-[#26a641] border border-[#26a641]';
            case 4: return 'bg-[#39d353] border border-[#39d353]';
            default: return 'bg-[#1a1a1a] border border-white/[0.04]'; 
        }
    };

    return (
        <div className="relative w-full">
            <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
                {heatmapData.map((month) => (
                    <div key={month.id} className="flex flex-col gap-2.5 shrink-0">
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest pl-1">{month.name}</span>
                        <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                            {month.days.map((day, idx) => (
                                <div key={idx} onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${day.count} submissions on ${day.displayDate}` })} onMouseLeave={() => setTooltip(null)} className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer hover:ring-2 hover:ring-white/50 transition-all duration-200 ${getBgColor(day.level)}`} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {tooltip && (
                <div className="fixed z-[9999] bg-[#111] border border-white/10 text-white text-[11px] font-semibold px-3 py-2 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none transform -translate-x-1/2 -translate-y-[130%]" style={{ top: tooltip.y, left: tooltip.x }}>
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

// --- Public Profile Page ---
function PublicProfile() {
    const { id } = useParams(); // Extract user ID from URL
    const navigate = useNavigate();
    
    const [publicUser, setPublicUser] = useState(null);
    const [rank, setRank] = useState(null);
    const [problemStats, setProblemStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                // Fetch public profile and global stats concurrently
                const [profileRes, statsRes] = await Promise.all([
                    axiosClient.get(`/auth/getPublicProfile/${id}`),
                    axiosClient.get('/problem/getProblemStats')
                ]);

                setPublicUser(profileRes.data.user);
                setRank(profileRes.data.rank);
                setProblemStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching public profile", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPublicData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#C9963A]"></span></div>;
    
    if (error || !publicUser) {
        return (
            <div className="min-h-screen bg-[#080808] text-zinc-300 flex flex-col items-center justify-center font-sans">
                <h1 className="text-3xl font-bold text-white mb-4">User Not Found</h1>
                <p className="text-zinc-500 mb-8">This profile doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/leaderboard')} className="px-6 py-3 bg-[#C9963A] text-black font-bold rounded-xl hover:bg-[#E0B455] transition-colors">Return to Leaderboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-zinc-300 pb-12 font-sans selection:bg-[#C9963A] selection:text-black">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col lg:flex-row gap-6">
                
                {/* Re-use the exact same Sidebar but pass the Public User Data! */}
                <div className="w-full lg:w-[320px] shrink-0">
                    <ProfileSidebar user={publicUser} rank={rank} stats={problemStats} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Activity Heatmap */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-[#111] border border-white/[0.04] rounded-3xl p-7 shadow-2xl hover:border-white/10 transition-colors duration-300">
                        <h3 className="text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Activity Graph
                        </h3>
                        <CustomHeatmap activityCalendar={publicUser.activityCalendar} />
                    </motion.div>

                    {/* Privacy Banner indicating why submissions are hidden */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[#111] border border-white/[0.04] rounded-3xl p-10 shadow-2xl flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
                            <Lock size={24} className="text-zinc-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg tracking-wide mb-2">Recent Submissions are Private</h3>
                        <p className="text-zinc-500 text-sm max-w-md">To ensure competitive integrity and prevent code plagiarism, recent submissions and code history are only visible to the account owner.</p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

export default PublicProfile;