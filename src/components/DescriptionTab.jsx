import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, ChevronUp, Activity, CheckCircle2 } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/10 border-red-400/20"             },
};

function DescriptionTab({ problem }) {
    const diff = DIFFICULTY_STYLE[problem.difficulty] || DIFFICULTY_STYLE.easy;
    
    // Community States
    const [likes, setLikes] = useState(problem.likes || 0);
    const [dislikes, setDislikes] = useState(problem.dislikes || 0);
    const [reaction, setReaction] = useState(null); // 'like', 'dislike', or null

    // Hints State
    const [openHint, setOpenHint] = useState(null);

    // Calculate Acceptance Rate dynamically
    const totalSubs = problem.totalSubmissions || 0;
    const acceptedSubs = problem.acceptedSubmissions || 0;
    const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + "%" : "0%";

    // Fetch initial user reaction
    useEffect(() => {
        const fetchReaction = async () => {
            try {
                const res = await axiosClient.get(`/problem/reaction/${problem._id}`);
                setReaction(res.data.reaction);
            } catch (err) {
                console.error("Failed to fetch reaction", err);
            }
        };
        fetchReaction();
    }, [problem._id]);

    const handleLike = async () => {
        try {
            const res = await axiosClient.post(`/problem/like/${problem._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
            setReaction(reaction === 'like' ? null : 'like');
        } catch (err) {
            console.error("Error liking problem", err);
        }
    };

    const handleDislike = async () => {
        try {
            const res = await axiosClient.post(`/problem/dislike/${problem._id}`);
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
            setReaction(reaction === 'dislike' ? null : 'dislike');
        } catch (err) {
            console.error("Error disliking problem", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-3">{problem.title}</h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${diff.cls}`}>
                            {diff.label}
                        </span>
                        {problem.tags?.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-zinc-400 text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Like & Dislike Buttons */}
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-1">
                        <button 
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                reaction === 'like' ? 'bg-emerald-400/20 text-emerald-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <ThumbsUp size={14} className={reaction === 'like' ? 'fill-emerald-400/20' : ''} />
                            {likes}
                        </button>
                        <div className="w-[1px] h-4 bg-white/10"></div>
                        <button 
                            onClick={handleDislike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                reaction === 'dislike' ? 'bg-red-400/20 text-red-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <ThumbsDown size={14} className={reaction === 'dislike' ? 'fill-red-400/20' : ''} />
                            {dislikes}
                        </button>
                    </div>
                </div>

                {/* Submission & Acceptance Stats */}
                <div className="flex items-center gap-6 text-xs text-zinc-400 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1.5">
                        <Activity size={14} className="text-[#C9963A]" />
                        <span>Submissions:</span>
                        <span className="font-semibold text-zinc-200">{totalSubs.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>Acceptance Rate:</span>
                        <span className="font-semibold text-zinc-200">{acceptanceRate}</span>
                    </div>
                </div>
            </div>

            {/* Description HTML */}
            <div className="prose prose-invert max-w-none text-zinc-300 text-sm border-t border-white/10 pt-4">
                <div dangerouslySetInnerHTML={{ __html: problem.description || "No description provided." }} />
            </div>

            {/* Examples (Visible Test Cases) */}
            {problem.visibleTestCases?.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h3 className="text-white font-semibold mb-2">Examples</h3>
                    {problem.visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <p className="font-semibold text-zinc-400 mb-2 text-xs uppercase tracking-wider">Example {idx + 1}</p>
                            <div className="mb-2">
                                <span className="text-zinc-500 text-xs font-mono">Input:</span>
                                <pre className="mt-1 bg-[#111] p-2 rounded-lg text-sm text-zinc-300 overflow-x-auto">{tc.input}</pre>
                            </div>
                            <div className="mb-2">
                                <span className="text-zinc-500 text-xs font-mono">Output:</span>
                                <pre className="mt-1 bg-[#111] p-2 rounded-lg text-sm text-zinc-300 overflow-x-auto">{tc.output}</pre>
                            </div>
                            {tc.explanation && (
                                <div className="mt-2">
                                    <span className="text-zinc-500 text-xs font-mono">Explanation:</span>
                                    <p className="mt-1 text-sm text-zinc-300">{tc.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Hints Section - ONLY shows if hints exist and the array is not empty */}
            {problem.hints && problem.hints.length > 0 && (
                <div className="mt-10 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Lightbulb size={18} className="text-[#C9963A]" /> Hints
                    </h3>
                    
                    <div className="space-y-2">
                        {problem.hints.map((hint, idx) => (
                            <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                                <button 
                                    onClick={() => setOpenHint(openHint === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-medium">Hint {idx + 1}</span>
                                    {openHint === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {/* The hint text is hidden until the button above is clicked */}
                                {openHint === idx && (
                                    <div className="p-4 pt-0 text-sm text-zinc-400 border-t border-white/5 bg-black/20">
                                        {hint}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DescriptionTab;