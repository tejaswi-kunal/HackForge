import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatHistory, sendChatMessage, addOptimisticMessage } from '../redux/chatSlice';
import { useForm } from 'react-hook-form';
import { 
    Loader2, Sparkles, AlertTriangle, Lightbulb, 
    BookOpen, Bug, Zap, ListChecks, ArrowRight, Plus 
} from 'lucide-react';

// --- Quick Action Definitions ---
const QUICK_ACTIONS = [
    { id: 'complexity', label: 'Analyze Complexity', icon: Zap, prompt: 'Can you analyze the time and space complexity of my current code?' },
    { id: 'debug', label: 'Find the Bug', icon: Bug, prompt: 'My code is failing. Can you help me debug it?' },
    { id: 'hint', label: 'Give a Hint', icon: Lightbulb, prompt: 'Can you give me a progressive hint for this problem?' },
    { id: 'problem', label: 'Explain Problem', icon: BookOpen, prompt: 'Can you break down the problem statement and constraints?' },
    { id: 'solution', label: 'Explain Solution', icon: ListChecks, prompt: 'Can you explain the optimal approach and intuition for this?' },
    { id: 'edge_cases', label: 'Edge Cases', icon: AlertTriangle, prompt: 'What are the critical edge cases I should consider?' }
];

// --- Helper: Only Types out text if 'isNew' is true ---
const AnimatedText = ({ text, isNew }) => {
    const [displayedText, setDisplayedText] = useState(isNew ? "" : text);

    useEffect(() => {
        if (!isNew) return;
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 10);
        return () => clearInterval(interval);
    }, [text, isNew]);

    return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

// --- Core Renderer ---
const AIResponseRenderer = ({ data, isNew }) => {
    if (!data) return <span className="text-red-400">Error: Empty response.</span>;
    if (typeof data === 'string') return <AnimatedText text={data} isNew={isNew} />;

    const mode = data.type;
    switch (mode) {
        case "complexity_analysis":
            return (
                <div className="space-y-4 w-full">
                    <div className="flex gap-3">
                        <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 shadow-inner">
                            <span className="text-[10px] font-display text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Zap size={12}/> Time</span>
                            <code className="font-mono text-zinc-100 text-base">{data.timeComplexity}</code>
                        </div>
                        <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 shadow-inner">
                            <span className="text-[10px] font-display text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Zap size={12}/> Space</span>
                            <code className="font-mono text-zinc-100 text-base">{data.spaceComplexity}</code>
                        </div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-white/[0.03]">
                        <p className="text-sm text-zinc-300 leading-relaxed"><AnimatedText text={data.explanation} isNew={isNew} /></p>
                    </div>
                </div>
            );

        case "debugging":
            return (
                <div className="space-y-4 w-full border border-rose-500/20 bg-rose-950/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-rose-400 border-b border-rose-500/20 pb-3">
                        <Bug size={18} />
                        <span className="font-display font-bold uppercase tracking-wider text-xs">{data.category}</span>
                    </div>
                    <p className="text-sm text-zinc-100 font-medium leading-relaxed">{data.issue}</p>
                    <div className="bg-black/50 p-4 rounded-xl border border-rose-500/10">
                        <code className="font-mono text-[11px] text-rose-500/80 block mb-2 uppercase tracking-widest">Suspicious Code</code>
                        <code className="font-mono text-sm text-zinc-300">{data.suspiciousSection}</code>
                    </div>
                    <div className="bg-rose-500/5 p-4 rounded-xl">
                        <p className="text-sm text-zinc-300"><strong className="text-rose-300 font-display tracking-wide">WHY IT FAILS:</strong> <br/><span className="inline-block mt-1"><AnimatedText text={data.whyItFails} isNew={isNew}/></span></p>
                    </div>
                    <div className="mt-2 pt-2 text-[#C9963A] text-sm flex gap-2">
                        <ArrowRight size={16} className="shrink-0 mt-0.5"/> <span>{data.guidingQuestion}</span>
                    </div>
                </div>
            );

        case "hint":
            return (
                <div className="w-full flex gap-4 border border-sky-500/20 bg-sky-950/10 rounded-2xl p-5">
                    <div className="shrink-0 mt-0.5 bg-sky-500/10 p-2 rounded-lg text-sky-400">
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <span className="text-[11px] font-display text-sky-400 uppercase tracking-widest mb-2 block font-bold">Level {data.level} Hint</span>
                        <p className="text-sm text-zinc-200 leading-relaxed"><AnimatedText text={data.hint} isNew={isNew}/></p>
                    </div>
                </div>
            );

        case "problem_explanation":
        case "solution_explanation":
            const isSolution = mode === "solution_explanation";
            const iconColor = isSolution ? "text-emerald-400" : "text-violet-400";
            const keys = isSolution 
                ? [ { key: 'coreIdea', label: 'Core Idea' }, { key: 'intuition', label: 'Intuition' }, { key: 'whyItWorks', label: 'Why it Works' } ]
                : [ { key: 'problemSummary', label: 'Summary' }, { key: 'actualTask', label: 'The Actual Task' }, { key: 'constraintAnalysis', label: 'Constraints' } ];
            
            return (
                <div className="space-y-4 w-full bg-slate-900/30 border border-slate-700/50 rounded-2xl p-5">
                    <div className={`flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4 ${iconColor}`}>
                        <BookOpen size={18} />
                        <span className="font-display font-bold uppercase tracking-wider text-xs">
                            {isSolution ? "Solution Breakdown" : "Problem Breakdown"}
                        </span>
                    </div>
                    {keys.map(({key, label}) => (
                        data[key] && (
                            <div key={key} className="bg-black/30 rounded-xl p-4 border border-white/[0.03]">
                                <h4 className={`text-[10px] font-display uppercase tracking-widest mb-2 ${iconColor}`}>{label}</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed"><AnimatedText text={data[key]} isNew={isNew}/></p>
                            </div>
                        )
                    ))}
                    {data.algorithmSteps && (
                        <div className="mt-5 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                            <h4 className={`text-[10px] font-display uppercase tracking-widest mb-3 ${iconColor}`}>Algorithm Steps</h4>
                            <ul className="space-y-3 text-sm text-zinc-300">
                                {data.algorithmSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3"><span className="text-zinc-500 font-mono bg-black/50 px-2 py-0.5 rounded text-xs shrink-0 h-fit">{idx + 1}</span> <span>{step}</span></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );

        case "edge_case_analysis":
            return (
                <div className="w-full bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4 text-amber-400 border-b border-amber-500/20 pb-3">
                        <AlertTriangle size={18} />
                        <span className="font-display font-bold uppercase tracking-wider text-xs">Critical Edge Cases</span>
                    </div>
                    <div className="space-y-3">
                        {data.importantEdgeCases?.map((ec, idx) => (
                            <div key={idx} className="bg-black/40 border border-amber-500/10 rounded-xl p-4 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/40"></div>
                                <code className="font-mono text-sm text-amber-200 block mb-1">Input: {ec.case}</code>
                                <p className="text-sm text-zinc-300 leading-relaxed"><AnimatedText text={ec.whyItMatters} isNew={false}/></p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            const content = data.content || data.explanation || JSON.stringify(data);
            return <div className="text-zinc-200 leading-relaxed"><AnimatedText text={content} isNew={isNew} /></div>;
    }
};

// --- Main Component ---
const ChatAITab = ({ problemId, currentCode, language }) => {
    const dispatch = useDispatch();
    const { history, isLoadingHistory, isSending, remainingRequests } = useSelector(state => state.chatSlice);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [sessionStartIndex, setSessionStartIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    
    const currentInput = watch('userMessage');
    const isInputEmpty = !currentInput || currentInput.trim() === '';

    useEffect(() => {
        if (!isLoadingHistory && sessionStartIndex === null) setSessionStartIndex(history.length);
    }, [isLoadingHistory, history.length, sessionStartIndex]);

    useEffect(() => {
        dispatch(fetchChatHistory(problemId));
    }, [dispatch, problemId]);

    useEffect(() => {
        let interval;
        if (isSending) interval = setInterval(() => setLoadingIndex((prev) => (prev + 1) % 4), 2000);
        return () => clearInterval(interval);
    }, [isSending]);

    const scrollToBottom = () => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, [history, isSending]);

    const handleInputResize = (e) => {
        e.target.style.height = 'auto'; 
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`; 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    const onSubmit = (formData) => {
        if (!formData.userMessage.trim()) return;
        setIsMenuOpen(false);

        dispatch(addOptimisticMessage(formData.userMessage));
        dispatch(sendChatMessage({ problemId, userMessage: formData.userMessage, currentCode, language }));
        
        reset();
        if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    };

    const handleQuickAction = (promptText) => {
        setValue('userMessage', promptText);
        setIsMenuOpen(false);
        handleSubmit(onSubmit)();
    };

    if (isLoadingHistory) {
        return <div className="flex h-[calc(100vh-220px)] w-full items-center justify-center text-[#C9963A]"><Loader2 className="animate-spin" size={32} /></div>;
    }

    return (
        // Changed from `absolute inset-0` to `flex-col h-[calc(100vh-220px)]` to prevent covering the tabs
        <div className="flex flex-col h-full font-sans bg-gradient-to-br from-[#0b1121] via-[#050505] to-[#000000] overflow-hidden">
            
            {/* Top Header */}
            <div className="flex items-center justify-between bg-[#0b1121]/80 backdrop-blur-md border-b border-white/[0.04] p-3.5 shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C9963A]" />
                    <span className="text-[11px] text-slate-200 font-display tracking-widest uppercase font-bold">HackForge AI</span>
                </div>
                {remainingRequests !== null && remainingRequests !== undefined && (
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${remainingRequests < 5 ? 'bg-red-950/30 border-red-500/30 text-red-400' : 'bg-green-950/30 border-green-500/30 text-green-400'}`}>
                        {remainingRequests} Remaining
                    </span>
                )}
            </div>

            {/* Scrollable Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {history.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="w-16 h-16 rounded-2xl bg-[#0b1121] border border-white/5 flex items-center justify-center mb-4 shadow-lg">
                            <Sparkles size={32} className="text-[#C9963A]" />
                        </div>
                        <p className="font-display tracking-widest text-xs uppercase font-bold text-slate-400">System Ready</p>
                    </div>
                )}

                {history.map((msg, index) => {
                    const isAi = msg.role === 'ai';
                    const isNew = sessionStartIndex !== null && index >= sessionStartIndex && index === history.length - 1;

                    return (
                        <div key={index} className={`flex ${isAi ? 'justify-start' : 'justify-end'} w-full`}>
                            {isAi && (
                                <div className="shrink-0 mr-3 mt-1">
                                    <div className="w-8 h-8 rounded-full border border-slate-700 bg-[#0b1121] flex items-center justify-center shadow-md">
                                        <Sparkles size={14} className="text-[#C9963A]" />
                                    </div>
                                </div>
                            )}
                            
                            <div className={`max-w-[85%] text-sm font-sans relative ${
                                isAi 
                                ? 'bg-[#0f1629] border border-slate-700/60 text-slate-200 shadow-xl rounded-2xl rounded-tl-none p-4' 
                                : 'bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#C9963A]/30 text-zinc-100 font-medium shadow-[0_4px_15px_rgba(201,150,58,0.05)] rounded-2xl rounded-tr-none py-3 px-5'
                            }`}>
                                {isAi ? <AIResponseRenderer data={msg.data} isNew={isNew && isAi} /> : <span className="whitespace-pre-wrap">{msg.data}</span>}
                            </div>
                        </div>
                    );
                })}

                {isSending && (
                    <div className="flex justify-start w-full">
                         <div className="shrink-0 mr-3 mt-1">
                            <div className="w-8 h-8 rounded-full border border-slate-700 bg-[#0b1121] flex items-center justify-center"><Loader2 size={14} className="animate-spin text-[#C9963A]" /></div>
                        </div>
                        <div className="bg-[#0f1629] border border-slate-700/60 rounded-2xl rounded-tl-none p-4 flex items-center shadow-lg"><span className="text-slate-400 text-xs font-mono">Analyzing context...</span></div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 bg-[#0b1121]/90 backdrop-blur-xl border-t border-white/[0.04] p-4 relative z-30">
                
                {/* Quadrant 2 Popover (Top-Left of input) */}
                {isMenuOpen && (
                    <div className="absolute bottom-full left-4 mb-3 w-64 bg-[#0f1629] border border-slate-700/60 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-3 border-b border-slate-700/50 bg-[#151c33]">
                            <h3 className="text-[10px] font-display uppercase tracking-widest text-slate-400 font-bold">Quick Actions</h3>
                        </div>
                        <div className="p-2 max-h-60 overflow-y-auto no-scrollbar flex flex-col gap-1">
                            {QUICK_ACTIONS.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action.prompt)}
                                        className="flex items-center gap-3 w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 hover:text-[#C9963A] text-slate-300 transition-colors group"
                                    >
                                        <div className="p-1.5 rounded-lg bg-black/30 group-hover:bg-[#C9963A]/10 transition-colors"><Icon size={14} /></div>
                                        <span className="text-xs font-medium">{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Input Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2 relative">
                    <button 
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`shrink-0 h-[44px] w-[44px] flex items-center justify-center rounded-xl border transition-all duration-200 ${
                            isMenuOpen 
                            ? 'bg-slate-800 border-slate-600 text-slate-200 rotate-45' 
                            : 'bg-[#151c33] border-slate-700/60 text-[#C9963A] hover:bg-[#1a2340] hover:border-[#C9963A]/50'
                        }`}
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>

                    <div className="flex-1 bg-[#151c33] border border-slate-700/60 rounded-2xl flex items-end focus-within:border-[#C9963A]/50 focus-within:shadow-[0_0_15px_rgba(201,150,58,0.1)] transition-all">
                        <textarea 
                            {...register('userMessage')}
                            ref={(e) => { register('userMessage').ref(e); textareaRef.current = e; }}
                            onInput={handleInputResize}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            placeholder="Message HackForge AI..."
                            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50 font-sans resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent min-h-[44px] max-h-[150px]"
                            rows={1}
                        />
                        <button 
                            type="submit" 
                            disabled={isSending || isInputEmpty}
                            className="p-2 mb-1 mr-1 shrink-0 bg-[#C9963A] text-black hover:bg-[#E3AA42] rounded-xl transition-colors disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 h-[36px] w-[36px] flex items-center justify-center"
                        >
                            <ArrowRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatAITab;