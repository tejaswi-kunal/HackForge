import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import Header from "../components/Header";
 
const TAGS = [
    "array","string","hashmap","hashset","linkedList","stack","queue",
    "heap","priorityQueue","tree","binaryTree","binarySearchTree","trie",
    "graph","dfs","bfs","topologicalSort","shortestPath","unionFind",
    "dynamicProgramming","greedy","backtracking","divideAndConquer",
    "binarySearch","twoPointers","slidingWindow","bitManipulation",
    "math","geometry","recursion","sorting","matrix","prefixSum",
    "monotonicStack","gameTheory"
];
 
const DIFFICULTY_STYLE = {
    easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"   },
    hard:   { label: "Hard",   cls: "text-red-400 bg-red-400/10 border-red-400/20"             },
};

// ── Icons specific to Problems page ─────────────────────────────
const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M7 12.5l3.5 3.5 7-7" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);
 
function Problems() {
    const navigate = useNavigate();
    const LIMIT = 10;
 
    const [search, setSearch]             = useState("");
    const [difficulty, setDifficulty]     = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [showTagPanel, setShowTagPanel] = useState(false);
    const [sortBy, setSortBy]             = useState("");
    const [sortOrder, setSortOrder]       = useState("desc");
 
    const [page, setPage]             = useState(1);
    const [total, setTotal]           = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [problems, setProblems]     = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchError, setFetchError]     = useState(null);
 
    const fetchProblems = useCallback(async (currentPage) => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const params = new URLSearchParams();
            if (search)     params.append("search", search);
            if (difficulty) params.append("difficulty", difficulty);
            selectedTags.forEach(t => params.append("tags", t));
            if (sortBy)     params.append("sortBy", sortBy);
            params.append("sortOrder", sortOrder);
            params.append("page", currentPage);
            params.append("limit", LIMIT);
 
            const res = await axiosClient.get(`/problem/filter?${params.toString()}`);
 
            setProblems(res.data.problems);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            setFetchError(err.response?.data || err.message || "Failed to fetch problems");
        } finally {
            setFetchLoading(false);
        }
    }, [search, difficulty, selectedTags, sortBy, sortOrder]);
 
    useEffect(() => {
        setPage(1);
        fetchProblems(1);
    }, [search, difficulty, selectedTags, sortBy, sortOrder]);
 
    useEffect(() => {
        fetchProblems(page);
    }, [page]);
 
    const toggleTag = (tag) =>
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
 
    const clearFilters = () => {
        setSearch("");
        setDifficulty("");
        setSelectedTags([]);
        setSortBy("");
        setSortOrder("desc");
    };
 
    const acceptanceRate = (p) =>
        p.totalSubmissions
            ? ((p.acceptedSubmissions / p.totalSubmissions) * 100).toFixed(1) + "%"
            : "—";
 
    const hasFilters = search || difficulty || selectedTags.length > 0 || sortBy;
 
    return (
        <div className="min-h-screen bg-[#080808] text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C9963A]/8 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 w-80 h-80 rounded-full bg-[#C9963A]/4 blur-[100px]" />
            </div>
 
            {/* ── Header ── */}
            <Header />
 
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
 
                {/* Title */}
                <div className="mb-8">
                    <p className="text-[#C9963A] text-[10px] tracking-widest uppercase mb-2 font-medium">Practice</p>
                    <h1 className="text-3xl font-bold">Problems</h1>
                    <p className="text-zinc-500 text-sm mt-1">{total} problems available</p>
                </div>
 
                {/* Filter bar */}
                <div className="flex flex-wrap gap-3 mb-5">
 
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search problems..."
                            className="input w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-zinc-600
                                rounded-xl pl-9 text-sm focus:outline-none focus:border-[#C9963A]/50 focus:bg-white/[0.06]
                                transition-all duration-200"
                        />
                    </div>
 
                    {/* Difficulty */}
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                        className="select bg-white/[0.04] border border-white/10 text-sm text-white rounded-xl
                            focus:outline-none focus:border-[#C9963A]/50 transition-all duration-200 min-w-[130px]">
                        <option value="" className="bg-[#111]">All Levels</option>
                        <option value="easy" className="bg-[#111]">Easy</option>
                        <option value="medium" className="bg-[#111]">Medium</option>
                        <option value="hard" className="bg-[#111]">Hard</option>
                    </select>
 
                    {/* Sort */}
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="select bg-white/[0.04] border border-white/10 text-sm text-white rounded-xl
                            focus:outline-none focus:border-[#C9963A]/50 transition-all duration-200 min-w-[140px]">
                        <option value="" className="bg-[#111]">Sort By</option>
                        <option value="likes" className="bg-[#111]">Likes</option>
                        <option value="totalSubmissions" className="bg-[#111]">Submissions</option>
                        <option value="acceptedSubmissions" className="bg-[#111]">Accepted</option>
                        <option value="createdAt" className="bg-[#111]">Newest</option>
                    </select>
 
                    {sortBy && (
                        <button onClick={() => setSortOrder(v => v === "asc" ? "desc" : "asc")}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 text-sm
                                hover:border-[#C9963A]/40 hover:text-white transition-all duration-200">
                            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                        </button>
                    )}
 
                    {/* Tags toggle */}
                    <button onClick={() => setShowTagPanel(v => !v)}
                        className={`px-4 py-2 rounded-xl border text-sm flex items-center gap-2 transition-all duration-200
                            ${showTagPanel || selectedTags.length > 0
                                ? "bg-[#C9963A]/10 border-[#C9963A]/40 text-[#C9963A]"
                                : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                            }`}>
                        Tags
                        {selectedTags.length > 0 && (
                            <span className="bg-[#C9963A] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {selectedTags.length}
                            </span>
                        )}
                    </button>
 
                    {hasFilters && (
                        <button onClick={clearFilters}
                            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-500 text-sm
                                hover:text-red-400 hover:border-red-400/30 transition-all duration-200">
                            Clear
                        </button>
                    )}
                </div>
 
                {/* Tag panel */}
                {showTagPanel && (
                    <div className="mb-5 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded-lg text-xs border transition-all duration-150
                                    ${selectedTags.includes(tag)
                                        ? "bg-[#C9963A]/15 border-[#C9963A]/40 text-[#C9963A]"
                                        : "bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20"
                                    }`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
 
                {/* Active tag chips */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTags.map(tag => (
                            <span key={tag}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C9963A]/10 border border-[#C9963A]/30 text-[#C9963A] text-xs">
                                {tag}
                                <button onClick={() => toggleTag(tag)} className="hover:text-white transition-colors">×</button>
                            </span>
                        ))}
                    </div>
                )}
 
                {/* Table */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                    <div className="grid grid-cols-[44px_1fr_110px_100px_100px_70px] gap-4 px-5 py-3
                        border-b border-white/[0.06] text-zinc-600 text-[11px] uppercase tracking-wider">
                        <div>#</div>
                        <div>Title</div>
                        <div>Difficulty</div>
                        <div>Acceptance</div>
                        <div>Submissions</div>
                        <div>Likes</div>
                    </div>
 
                    {fetchLoading && (
                        <div className="flex items-center justify-center py-24">
                            <span className="loading loading-spinner loading-md text-[#C9963A]" />
                        </div>
                    )}
 
                    {fetchError && !fetchLoading && (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-sm">{fetchError}</p>
                        </div>
                    )}
 
                    {!fetchLoading && !fetchError && problems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-2">
                            <p className="text-zinc-500 text-sm">No problems found</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="text-[#C9963A] text-xs hover:underline">Clear filters</button>
                            )}
                        </div>
                    )}
 
                    {!fetchLoading && !fetchError && problems.map((problem, idx) => {
                        const diff   = DIFFICULTY_STYLE[problem.difficulty] || {};
                        const rowNum = (page - 1) * LIMIT + idx + 1;
 
                        return (
                            <div
                                key={problem._id}
                                onClick={() => navigate(`/problem/${problem._id}`)}
                                className="grid grid-cols-[44px_1fr_110px_100px_100px_70px] gap-4 px-5 py-4
                                    border-b border-white/[0.04] last:border-0
                                    hover:bg-white/[0.03] cursor-pointer transition-colors duration-150 group"
                            >
                                <div className="flex items-center">
                                    {problem.isSolved
                                        ? <span className="text-emerald-400"><CheckCircleIcon /></span>
                                        : <span className="text-zinc-600 text-sm">{rowNum}</span>
                                    }
                                </div>
 
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                                        {problem.title}
                                    </span>
                                    <div className="hidden lg:flex gap-1 shrink-0">
                                        {problem.tags?.slice(0, 2).map(tag => (
                                            <span key={tag}
                                                className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-zinc-600 text-[10px]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
 
                                <div className="flex items-center">
                                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-medium ${diff.cls}`}>
                                        {diff.label}
                                    </span>
                                </div>
 
                                <div className="flex items-center">
                                    <span className="text-zinc-400 text-sm">{acceptanceRate(problem)}</span>
                                </div>
 
                                <div className="flex items-center">
                                    <span className="text-zinc-500 text-sm">{problem.totalSubmissions?.toLocaleString() ?? 0}</span>
                                </div>
 
                                <div className="flex items-center">
                                    <span className="text-zinc-500 text-sm">{problem.likes ?? 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
 
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-zinc-600 text-xs">
                            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(v => Math.max(1, v - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 text-sm
                                    hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed
                                    transition-all duration-200">
                                ← Prev
                            </button>
 
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let p;
                                    if (totalPages <= 5)             p = i + 1;
                                    else if (page <= 3)              p = i + 1;
                                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                    else                             p = page - 2 + i;
                                    return (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-9 h-9 rounded-xl text-sm border transition-all duration-200
                                                ${page === p
                                                    ? "bg-[#C9963A] border-[#C9963A] text-black font-semibold"
                                                    : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                                }`}>
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
 
                            <button
                                onClick={() => setPage(v => Math.min(totalPages, v + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 text-sm
                                    hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed
                                    transition-all duration-200">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
 
export default Problems;