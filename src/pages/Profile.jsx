import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "../components/Header";
import ProfileSidebar from "../components/ProfileSidebar";
import axiosClient from "../utils/axiosClient";
import { X, Activity, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

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
                date: dateStr,
                count,
                level,
                displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }
        return data;
    }, [activityCalendar]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
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
                                <div
                                    key={idx}
                                    onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${day.count} submissions on ${day.displayDate}` })}
                                    onMouseLeave={() => setTooltip(null)}
                                    className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer hover:ring-2 hover:ring-white/50 transition-all duration-200 ${getBgColor(day.level)}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4 text-[10px] text-zinc-500 font-semibold uppercase tracking-widest pl-1">
                <span>Less</span>
                <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#1a1a1a] border border-white/[0.04]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#0e4429]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#006d32]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#26a641]"></div>
                    <div className="w-3.5 h-3.5 rounded-[3px] bg-[#39d353]"></div>
                </div>
                <span>More</span>
            </div>

            {tooltip && (
                <div className="fixed z-[9999] bg-[#111] border border-white/10 text-white text-[11px] font-semibold px-3 py-2 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none transform -translate-x-1/2 -translate-y-[130%]" style={{ top: tooltip.y, left: tooltip.x }}>
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};


function Profile() {
    const [userData, setUserData] = useState(null);
    const [rank, setRank] = useState(null);
    const [problemStats, setProblemStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState(null);

    // FIXED: Separate states for Trend Graphs vs Paginated List
    const [trendSubmissions, setTrendSubmissions] = useState([]); 
    const [listSubmissions, setListSubmissions] = useState([]);
    
    // FIXED: Real Backend Pagination States
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Initial Load: Fetch User Data, Stats, and large batch of subs for the Graph
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [accRes, graphRes, statsRes] = await Promise.all([
                    axiosClient.get('/auth/getAccount'),
                    axiosClient.get('/auth/getUserSubmissions?limit=50'), // Big limit for graphs
                    axiosClient.get('/problem/getProblemStats')
                ]);

                setUserData(accRes.data.user);
                setRank(accRes.data.rank);
                setTrendSubmissions(graphRes.data.submissions);
                setProblemStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching initial profile data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // FIXED: Watch the 'page' state and fetch paginated list from backend
    useEffect(() => {
        const fetchPaginatedList = async () => {
            try {
                const res = await axiosClient.get(`/auth/getUserSubmissions?page=${page}&limit=10`);
                setListSubmissions(res.data.submissions);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error("Error fetching paginated submissions", err);
            }
        };
        fetchPaginatedList();
    }, [page]);

    // Graph Data Calculations
    const trendData = useMemo(() => {
        const data = [];
        const today = new Date();
        for(let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const displayDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Uses trendSubmissions for accuracy
            const dailySubs = trendSubmissions.filter(sub => new Date(sub.createdAt).toISOString().split('T')[0] === dateStr);
            const accepted = dailySubs.filter(sub => sub.status === 'Accepted').length;
            
            data.push({ name: displayDay, total: dailySubs.length, accepted: accepted });
        }
        return data;
    }, [trendSubmissions]);

    const ratingData = useMemo(() => {
        const currentRating = userData?.rating || 1200;
        return [
            { name: 'Contest 1', rating: currentRating - 150 },
            { name: 'Contest 2', rating: currentRating - 80 },
            { name: 'Contest 3', rating: currentRating - 120 },
            { name: 'Contest 4', rating: currentRating - 50 },
            { name: 'Contest 5', rating: currentRating + 30 },
            { name: 'Contest 6', rating: currentRating }
        ];
    }, [userData]);

    if (loading) {
        return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-[#C9963A]"></span></div>;
    }

    return (
        <div className="min-h-screen bg-[#080808] text-zinc-300 pb-12 font-sans selection:bg-[#C9963A] selection:text-black">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col lg:flex-row gap-6">
                
                <div className="w-full lg:w-[320px] shrink-0">
                    <ProfileSidebar user={userData} rank={rank} stats={problemStats} />
                </div>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Rating Graph */}
                    <motion.div variants={itemVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-7 shadow-2xl w-full h-[320px] flex flex-col hover:border-white/10 transition-colors duration-300">
                        <h3 className="text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#C9963A]" /> Rating History
                        </h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C9963A" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#C9963A" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px', color: '#fff'}} itemStyle={{color: '#C9963A'}} />
                                    <Area type="monotone" dataKey="rating" stroke="#C9963A" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Heatmap */}
                    <motion.div variants={itemVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-7 shadow-2xl hover:border-white/10 transition-colors duration-300">
                        <h3 className="text-white font-bold mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> Activity Graph
                        </h3>
                        <CustomHeatmap activityCalendar={userData?.activityCalendar} />
                    </motion.div>

                    {/* 7-Day Trend Graphs */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-[#111] border border-white/[0.04] rounded-3xl p-7 shadow-2xl h-[300px] flex flex-col hover:border-white/10 transition-colors duration-300">
                            <h3 className="text-white font-bold mb-6 text-[11px] uppercase tracking-widest">7-Day Submissions</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ left: -25 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px'}} />
                                        <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-white/[0.04] rounded-3xl p-7 shadow-2xl h-[300px] flex flex-col hover:border-white/10 transition-colors duration-300">
                            <h3 className="text-white font-bold mb-6 text-[11px] uppercase tracking-widest">7-Day Accepted</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ left: -25 }}>
                                        <defs>
                                            <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#555" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px'}} />
                                        <Area type="monotone" dataKey="accepted" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Paginated Submissions List */}
                    <motion.div variants={itemVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl shadow-2xl overflow-hidden flex-1 hover:border-white/10 transition-colors duration-300">
                        <div className="px-7 py-5 border-b border-white/[0.04] bg-[#161616] flex justify-between items-center">
                            <h3 className="text-white font-bold text-[11px] uppercase tracking-widest">Recent Submissions</h3>
                        </div>
                        
                        <div className="p-5">
                            {listSubmissions.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-10">No recent submissions found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {listSubmissions.map((sub) => (
                                        <motion.div whileHover={{ scale: 1.01 }} key={sub._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161616] border border-white/[0.02] rounded-2xl hover:bg-[#1a1a1a] hover:border-white/10 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${sub.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                                                <span className="font-semibold text-white text-sm truncate max-w-[180px] sm:max-w-[300px]">
                                                    {sub.problem?.title || "Unknown"}
                                                </span>
                                                {sub.problem?.difficulty && (
                                                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold tracking-widest uppercase ml-2 bg-black/40 ${
                                                        sub.problem.difficulty === 'easy' ? 'text-emerald-400' :
                                                        sub.problem.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                        {sub.problem.difficulty}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-5 text-xs mt-3 sm:mt-0 ml-5 sm:ml-0">
                                                <span className="text-zinc-400 font-mono bg-black/40 px-3 py-1.5 rounded-lg">{sub.submittedCode?.language}</span>
                                                <span className="text-zinc-600 font-medium">{new Date(sub.createdAt).toLocaleDateString('en-GB')}</span>
                                                <button onClick={() => setSelectedCode(sub)} className="text-[#C9963A] font-semibold hover:text-white transition-colors">
                                                    View Code
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FIXED: Dynamic Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-white/[0.04] bg-[#161616] flex items-center justify-between">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span className="text-xs font-semibold text-zinc-500">
                                    Page <span className="text-white">{page}</span> of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Code Viewer Modal */}
            {selectedCode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 bg-[#161616]">
                            <div>
                                <h3 className="text-white font-bold text-lg">{selectedCode.problem?.title}</h3>
                                <div className="flex gap-4 mt-2 text-xs font-semibold">
                                    <span className={selectedCode.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}>{selectedCode.status}</span>
                                    <span className="text-zinc-600">|</span>
                                    <span className="text-zinc-400 font-mono">{selectedCode.submittedCode?.language}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCode(null)} className="p-2 bg-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-7 bg-[#0a0a0a] max-h-[70vh] overflow-y-auto">
                            <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">{selectedCode.submittedCode?.completeCode}</pre>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default Profile;