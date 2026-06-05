import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { MapPin, Calendar, Mail, CheckCircle2, Award, TrendingUp, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const GithubIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function ProfileSidebar({ user, rank, stats }) {
    const easy = user?.easySolved || 0;
    const medium = user?.mediumSolved || 0;
    const hard = user?.hardSolved || 0;
    const totalSolved = easy + medium + hard;
    
    // FIXED: Used Nullish Coalescing (??) so '0' doesn't get overridden by '1'
    const TOTAL_EASY = stats?.easyProblems ?? 0;
    const TOTAL_MEDIUM = stats?.mediumProblems ?? 0;
    const TOTAL_HARD = stats?.hardProblems ?? 0;

    const radialData = [
        { name: 'Hard', count: hard, fill: '#f87171' },
        { name: 'Medium', count: medium, fill: '#fbbf24' },
        { name: 'Easy', count: easy, fill: '#34d399' }
    ];

    const displayName = (user?.firstName || user?.lastName) 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
        : user?.userName;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full flex flex-col gap-4">
            
            <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9963A] to-transparent opacity-50"></div>
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#C9963A]/20 flex items-center justify-center text-[#C9963A] text-xl font-bold shrink-0 shadow-[0_0_15px_rgba(201,150,58,0.15)]">
                        {user?.userName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-xl font-bold text-white truncate tracking-wide">{displayName}</h2>
                        <p className="text-zinc-500 text-sm truncate">@{user?.userName}</p>
                    </div>
                </div>
                <div className="mt-6 space-y-2.5">
                    <div className="flex items-center gap-3 text-zinc-400 text-xs hover:text-white transition-colors">
                        <Mail size={14} className="text-zinc-500 shrink-0" />
                        <span className="truncate">{user?.emailId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 text-xs hover:text-white transition-colors">
                        <Calendar size={14} className="text-zinc-500 shrink-0" />
                        <span>Joined {new Date(user?.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={cardVariants} className="grid grid-cols-3 gap-3">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/[0.02]">
                    <Award size={16} className="text-zinc-500 mb-1.5" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Rank</span>
                    <span className="text-lg font-bold text-white">#{rank || '-'}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/[0.02]">
                    <TrendingUp size={16} className="text-[#C9963A] mb-1.5" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Rating</span>
                    <span className="text-lg font-bold text-white">{user?.rating || 1200}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/[0.02]">
                    <span className="text-[#C9963A] text-lg font-black leading-none mb-1.5">★</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Points</span>
                    <span className="text-lg font-bold text-[#C9963A]">{user?.totalPoints || 0}</span>
                </motion.div>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300">
                <div className="grid grid-cols-2 gap-4 text-center divide-x divide-white/5 relative z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
                            <Flame size={20} className="text-orange-500" />
                        </div>
                        <p className="text-white font-bold text-xl">{user?.streakCount || 0}</p>
                        <p className="text-zinc-500 text-[9px] uppercase font-bold mt-1 tracking-widest">Current Streak</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-2">
                            <Zap size={20} className="text-yellow-500" />
                        </div>
                        <p className="text-white font-bold text-xl">{user?.maxStreak || 0}</p>
                        <p className="text-zinc-500 text-[9px] uppercase font-bold mt-1 tracking-widest">Longest Streak</p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-6 shadow-lg transition-all duration-300">
                <h3 className="text-white font-bold mb-4 uppercase text-[11px] tracking-widest flex items-center justify-between">
                    Problems Solved
                    <span className="text-xs font-mono text-zinc-500">{totalSolved} total</span>
                </h3>
                
                <div className="relative h-44 w-full flex justify-center items-center mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            cx="50%" cy="50%" 
                            innerRadius="30%" outerRadius="100%" 
                            barSize={12} data={radialData}
                            startAngle={90} endAngle={-270}
                        >
                            {/* FIXED: Added '1' to Math.max to prevent Recharts from crashing if max domain is 0 */}
                            <PolarAngleAxis type="number" domain={[0, Math.max(TOTAL_EASY, TOTAL_MEDIUM, TOTAL_HARD, 1)]} angleAxisId={0} tick={false} />
                            <RadialBar minAngle={15} background={{ fill: '#1a1a1a' }} clockWise dataKey="count" cornerRadius={10} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <CheckCircle2 size={24} className="text-zinc-600 mb-1 opacity-50" />
                    </div>
                </div>
                
                <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center bg-[#161616] px-4 py-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-emerald-400">Easy</span>
                        <span className="text-zinc-300"><span className="text-white">{easy}</span> <span className="text-zinc-600">/ {TOTAL_EASY}</span></span>
                    </div>
                    <div className="flex justify-between items-center bg-[#161616] px-4 py-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-yellow-400">Medium</span>
                        <span className="text-zinc-300"><span className="text-white">{medium}</span> <span className="text-zinc-600">/ {TOTAL_MEDIUM}</span></span>
                    </div>
                    <div className="flex justify-between items-center bg-[#161616] px-4 py-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-red-400">Hard</span>
                        <span className="text-zinc-300"><span className="text-white">{hard}</span> <span className="text-zinc-600">/ {TOTAL_HARD}</span></span>
                    </div>
                </div>
            </motion.div>

            {(user?.bio || user?.college || user?.github || user?.linkedin) && (
                <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="bg-[#111] border border-white/[0.04] rounded-2xl p-6 shadow-lg space-y-4 transition-all duration-300">
                    <h3 className="text-white font-bold text-[11px] uppercase tracking-widest">About</h3>
                    {user?.bio && <p className="text-xs text-zinc-400 leading-relaxed bg-[#1a1a1a] p-3 rounded-xl border border-white/[0.02]">{user.bio}</p>}
                    
                    <div className="space-y-3 pt-2">
                        {user?.college && (
                            <div className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white transition-colors">
                                <MapPin size={16} className="text-[#C9963A] shrink-0" />
                                <span className="truncate font-medium">{user.college}</span>
                            </div>
                        )}
                        {user?.github && (
                            <div className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white transition-colors">
                                <GithubIcon size={16} className="text-[#C9963A] shrink-0" />
                                <a href={user.github} target="_blank" rel="noreferrer" className="truncate font-medium">{user.github.replace(/^https?:\/\/(www\.)?/, '')}</a>
                            </div>
                        )}
                        {user?.linkedin && (
                            <div className="flex items-center gap-3 text-xs text-zinc-400 hover:text-white transition-colors">
                                <LinkedinIcon size={16} className="text-[#C9963A] shrink-0" />
                                <a href={user.linkedin} target="_blank" rel="noreferrer" className="truncate font-medium">LinkedIn Profile</a>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default ProfileSidebar;