import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatHistory, sendChatMessage, addOptimisticMessage, clearChatError } from '../redux/chatSlice';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Sparkles, AlertTriangle, Lightbulb,
    BookOpen, Bug, Zap, ListChecks, ArrowRight, Plus, Clock
} from 'lucide-react';

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { id: 'complexity',  label: 'Analyze Complexity', icon: Zap,           prompt: 'Can you analyze the time and space complexity of my current code?' },
    { id: 'debug',       label: 'Find the Bug',        icon: Bug,           prompt: 'My code is failing. Can you help me debug it?' },
    { id: 'hint',        label: 'Give a Hint',         icon: Lightbulb,     prompt: 'Can you give me a progressive hint for this problem?' },
    { id: 'problem',     label: 'Explain Problem',     icon: BookOpen,      prompt: 'Can you break down the problem statement and constraints?' },
    { id: 'solution',    label: 'Explain Solution',    icon: ListChecks,    prompt: 'Can you explain the optimal approach and intuition for this?' },
    { id: 'edge_cases',  label: 'Edge Cases',          icon: AlertTriangle, prompt: 'What are the critical edge cases I should consider?' },
];

// ─── Typewriter Text ──────────────────────────────────────────────────────────
const AnimatedText = ({ text, isNew }) => {
    const [displayedText, setDisplayedText] = useState(isNew ? '' : text);

    useEffect(() => {
        if (!isNew) return;
        let i = 0;
        setDisplayedText('');
        const iv = setInterval(() => {
            if (i < text.length) { setDisplayedText(p => p + text.charAt(i)); i++; }
            else clearInterval(iv);
        }, 10);
        return () => clearInterval(iv);
    }, [text, isNew]);

    return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

// ─── Staggered Typing Dots ────────────────────────────────────────────────────
const TypingDots = () => (
    <div className="flex gap-[5px] items-center px-0.5 py-1">
        {[0, 1, 2].map(i => (
            <motion.span
                key={i}
                className="block w-[5px] h-[5px] rounded-full bg-[#C9963A]/50"
                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

// ─── AI Response Renderer ─────────────────────────────────────────────────────
const AIResponseRenderer = ({ data, isNew }) => {
    if (!data) return <span className="text-red-400 text-xs">Error: Empty response.</span>;
    if (typeof data === 'string') return <AnimatedText text={data} isNew={isNew} />;

    const mode = data.type;

    if (mode === 'complexity_analysis') {
        return (
            <div className="space-y-3 w-full">
                <div className="flex gap-2.5">
                    {[
                        { label: 'Time',  value: data.timeComplexity  },
                        { label: 'Space', value: data.spaceComplexity },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex-1 bg-[#141414] border border-white/[0.05] rounded-xl p-3.5">
                            <span className="text-[9px] font-mono text-[#C9963A]/70 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-2">
                                <Zap size={9} /> {label}
                            </span>
                            <code className="font-mono text-zinc-100 text-sm font-semibold">{value}</code>
                        </div>
                    ))}
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-3.5 border border-white/[0.04]">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        <AnimatedText text={data.explanation} isNew={isNew} />
                    </p>
                </div>
            </div>
        );
    }

    if (mode === 'debugging') {
        return (
            <div className="space-y-3 w-full border border-rose-500/[0.14] bg-[#0a0a0a] rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-400/75 border-b border-rose-500/[0.10] pb-2.5">
                    <Bug size={13} />
                    <span className="font-mono font-bold uppercase tracking-[0.12em] text-[9px]">{data.category}</span>
                </div>
                <p className="text-xs text-zinc-200 font-medium leading-relaxed">{data.issue}</p>
                <div className="bg-black/70 p-3.5 rounded-lg border border-rose-500/[0.07]">
                    <code className="font-mono text-[9px] text-rose-400/50 block mb-2 uppercase tracking-widest">Suspicious Code</code>
                    <code className="font-mono text-xs text-zinc-300 leading-relaxed">{data.suspiciousSection}</code>
                </div>
                <div className="bg-rose-500/[0.04] p-3.5 rounded-lg">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        <strong className="font-mono tracking-wide text-[9px] text-rose-300/70 uppercase block mb-1.5">Why it fails</strong>
                        <AnimatedText text={data.whyItFails} isNew={isNew} />
                    </p>
                </div>
                <div className="flex flex-col gap-2 pt-1 border-t border-rose-500/[0.10] mt-2">
                    <div className="flex gap-2 mt-2">
                        <ArrowRight size={13} className="shrink-0 mt-0.5 text-[#C9963A]/60" />
                        <span className="text-xs text-[#C9963A] leading-relaxed italic">"{data.guidingQuestion}"</span>
                    </div>
                    {data.suggestedDirection && (
                         <div className="flex gap-2">
                             <Lightbulb size={13} className="shrink-0 mt-0.5 text-emerald-400/60" />
                             <span className="text-xs text-emerald-400/90 leading-relaxed"><AnimatedText text={data.suggestedDirection} isNew={isNew} /></span>
                         </div>
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'hint') {
        return (
            <div className="w-full flex gap-3.5 border border-sky-500/[0.14] bg-[#0a0a0a] rounded-xl p-4">
                <div className="shrink-0 mt-0.5 bg-sky-500/[0.07] p-2 rounded-lg text-sky-400/75">
                    <Lightbulb size={15} />
                </div>
                <div className="min-w-0">
                    <span className="text-[9px] font-mono text-sky-400/65 uppercase tracking-[0.12em] mb-2 block">
                        Level {data.level} Hint
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        <AnimatedText text={data.hint} isNew={isNew} />
                    </p>
                </div>
            </div>
        );
    }

    if (mode === 'problem_explanation') {
        const accent = 'text-violet-400/70';
        const border = 'border-violet-500/[0.12]';
        const keys   = [
            { key: 'problemSummary',     label: 'Summary' },
            { key: 'inputFormat',        label: 'Input Format' },
            { key: 'outputFormat',       label: 'Output Format' },
            { key: 'constraintAnalysis', label: 'Constraints' },
            { key: 'exampleWalkthrough', label: 'Walkthrough' },
            { key: 'actualTask',         label: 'The Actual Task' },
        ];
        return (
            <div className={`space-y-3 w-full bg-[#0f0f0f] border ${border} rounded-xl p-4`}>
                <div className={`flex items-center gap-2 border-b ${border} pb-2.5 mb-1 ${accent}`}>
                    <BookOpen size={13} />
                    <span className="font-mono font-bold uppercase tracking-[0.12em] text-[9px]">Problem Breakdown</span>
                </div>
                {keys.map(({ key, label }) => data[key] && (
                    <div key={key} className="bg-[#0a0a0a] rounded-lg p-3.5 border border-white/[0.04]">
                        <h4 className={`text-[9px] font-mono uppercase tracking-[0.12em] mb-2 ${accent}`}>{label}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            <AnimatedText text={data[key]} isNew={isNew} />
                        </p>
                    </div>
                ))}
                {data.commonMisunderstandings && data.commonMisunderstandings.length > 0 && (
                    <div className="bg-[#0a0a0a] p-3.5 rounded-lg border border-white/[0.04]">
                        <h4 className={`text-[9px] font-mono uppercase tracking-[0.12em] mb-3 ${accent}`}>Common Misunderstandings</h4>
                        <ul className="space-y-2.5 list-disc pl-4">
                            {data.commonMisunderstandings.map((mistake, idx) => (
                                <li key={idx} className="text-xs text-zinc-400 leading-relaxed">
                                    <AnimatedText text={mistake} isNew={isNew} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'solution_explanation') {
        const accent = 'text-emerald-400/70';
        const border = 'border-emerald-500/[0.12]';
        const keys   = [
            { key: 'coreIdea',   label: 'Core Idea'    },
            { key: 'intuition',  label: 'Intuition'    },
            { key: 'whyItWorks', label: 'Why it Works' },
            { key: 'dryRun',     label: 'Dry Run'      },
            { key: 'complexityAnalysis', label: 'Complexity' }
        ];
        return (
            <div className={`space-y-3 w-full bg-[#0f0f0f] border ${border} rounded-xl p-4`}>
                <div className={`flex items-center gap-2 border-b ${border} pb-2.5 mb-1 ${accent}`}>
                    <BookOpen size={13} />
                    <span className="font-mono font-bold uppercase tracking-[0.12em] text-[9px]">Solution Breakdown</span>
                </div>
                {keys.map(({ key, label }) => data[key] && (
                    <div key={key} className="bg-[#0a0a0a] rounded-lg p-3.5 border border-white/[0.04]">
                        <h4 className={`text-[9px] font-mono uppercase tracking-[0.12em] mb-2 ${accent}`}>{label}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            <AnimatedText text={data[key]} isNew={isNew} />
                        </p>
                    </div>
                ))}
                {data.algorithmSteps && (
                    <div className="bg-[#0a0a0a] p-3.5 rounded-lg border border-white/[0.04]">
                        <h4 className={`text-[9px] font-mono uppercase tracking-[0.12em] mb-3 ${accent}`}>Algorithm Steps</h4>
                        <ul className="space-y-2.5">
                            {data.algorithmSteps.map((step, idx) => (
                                <li key={idx} className="flex gap-3 text-xs text-zinc-400">
                                    <span className={`font-mono bg-black/80 px-1.5 py-0.5 rounded text-[9px] shrink-0 h-fit ${accent}`}>
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {data.commonMistakes && data.commonMistakes.length > 0 && (
                    <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-500/[0.08]">
                        <h4 className="text-[9px] font-mono uppercase tracking-[0.12em] mb-3 text-rose-400/70">Common Mistakes</h4>
                        <ul className="space-y-2 list-disc pl-4">
                            {data.commonMistakes.map((mistake, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 leading-relaxed">
                                    <AnimatedText text={mistake} isNew={isNew} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'edge_case_analysis') {
        return (
            <div className="w-full bg-[#0a0a0a] border border-amber-500/[0.14] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3.5 text-amber-400/70 border-b border-amber-500/[0.10] pb-2.5">
                    <AlertTriangle size={13} />
                    <span className="font-mono font-bold uppercase tracking-[0.12em] text-[9px]">Critical Edge Cases</span>
                </div>
                <div className="space-y-2.5">
                    {data.importantEdgeCases?.map((ec, idx) => (
                        <div key={idx} className="bg-black/60 border border-amber-500/[0.07] rounded-lg p-3.5 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent rounded-full" />
                            <div className="pl-3 mb-2">
                                <code className="font-mono text-xs text-amber-300/65 block mb-1">Input: {ec.case}</code>
                                <code className="font-mono text-[10px] text-zinc-500 block">Ex: {ec.example}</code>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed pl-3 border-t border-white/[0.02] pt-2">
                                <AnimatedText text={ec.whyItMatters} isNew={false} />
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Default / Fallback ───────────────────────────────────────────────────
    const content = data.content || data.explanation || JSON.stringify(data);
    
    // Safety Net: Detect if the content looks like unparsed JSON or markdown
    const isRawJson = typeof content === 'string' && 
                     (content.trim().startsWith('{') || content.trim().startsWith('```'));

    if (isRawJson) {
        // Strip any remaining markdown and render in a clean code block
        const cleanJsonText = content.replace(/```json|```/gi, '').trim();
        return (
            <div className="bg-[#0a0a0a] p-3.5 rounded-lg border border-red-500/20 overflow-x-auto">
                <span className="text-[9px] font-mono text-red-400/70 uppercase tracking-widest mb-2 block">Incomplete Response</span>
                <code className="text-[11px] text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
                    <AnimatedText text={cleanJsonText} isNew={isNew} />
                </code>
            </div>
        );
    }

    return (
        <div className="text-xs text-zinc-300 leading-relaxed">
            <AnimatedText text={content} isNew={isNew} />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ChatAITab = ({ problemId, currentCode, language }) => {
    const dispatch = useDispatch();
    // Added 'error' to useSelector to display rate limit banners
    const { history, isLoadingHistory, isSending, remainingRequests, error } = useSelector(s => s.chatSlice);
    const scrollRef   = useRef(null);
    const textareaRef = useRef(null);
    const { register, handleSubmit, reset, watch, setValue } = useForm();

    const [loadingIndex, setLoadingIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentInput = watch('userMessage');
    const isInputEmpty = !currentInput || currentInput.trim() === '';

    useEffect(() => { dispatch(fetchChatHistory(problemId)); }, [dispatch, problemId]);

    useEffect(() => {
        let iv;
        if (isSending) iv = setInterval(() => setLoadingIndex(p => (p + 1) % 4), 2000);
        return () => clearInterval(iv);
    }, [isSending]);

    const scrollToBottom = () => {
        if (scrollRef.current)
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
        const t = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(t);
    }, [history, isSending, error]); // Added error dependency to scroll down when banner appears

    const handleInputResize = e => {
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };
    
    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(onSubmit)(); }
    };
    
    const onSubmit = formData => {
        if (!formData.userMessage.trim()) return;
        
        setIsMenuOpen(false);
        dispatch(clearChatError()); // Clear any existing rate limit errors before sending
        dispatch(addOptimisticMessage(formData.userMessage));
        dispatch(sendChatMessage({ problemId, userMessage: formData.userMessage, currentCode, language }));
        
        reset();
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };
    
    const handleQuickAction = promptText => {
        setValue('userMessage', promptText);
        setIsMenuOpen(false);
        handleSubmit(onSubmit)();
    };

    if (isLoadingHistory) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#111] border border-[#C9963A]/20 flex items-center justify-center shadow-[0_0_16px_rgba(201,150,58,0.12)]">
                        <Loader2 className="animate-spin text-[#C9963A]" size={16} />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.14em]">Initializing</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full font-sans bg-[#0a0a0a] overflow-hidden">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="relative flex items-center justify-between bg-[#0d0d0d] border-b border-white/[0.04] px-4 py-3 shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#C9963A]/[0.08] border border-[#C9963A]/20 flex items-center justify-center shadow-[0_0_10px_rgba(201,150,58,0.10)]">
                        <Sparkles size={12} className="text-[#C9963A]" />
                    </div>
                    <span
                        className="text-[11px] font-mono tracking-[0.16em] uppercase font-bold"
                        style={{ background: 'linear-gradient(90deg,#C9963A,#E2B254,#C9963A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        HackForge AI
                    </span>
                </div>

                {remainingRequests !== null && remainingRequests !== undefined && (
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                        remainingRequests === 0
                            ? 'bg-red-950/25 border-red-500/25 text-red-400/75'
                            : remainingRequests < 5
                                ? 'bg-orange-950/20 border-orange-500/20 text-orange-400/70'
                                : 'bg-[#C9963A]/[0.05] border-[#C9963A]/20 text-[#C9963A]/65'
                    }`}>
                        {remainingRequests === 0 ? '0 left' : `${remainingRequests} left`}
                    </span>
                )}

                <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#C9963A]/12 to-transparent pointer-events-none" />
            </div>

            {/* ── Chat Area ────────────────────────────────────────────────── */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent relative"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_55%,rgba(201,150,58,0.025),transparent_70%)]" />

                {history.length === 0 && (
                    <div className="relative h-full flex flex-col items-center justify-center gap-0">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 blur-2xl rounded-full bg-[#C9963A]/10" />
                            <div className="relative w-14 h-14 rounded-2xl bg-[#111] border border-[#C9963A]/15 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                                <Sparkles size={24} className="text-[#C9963A]/55" />
                            </div>
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">System Ready</p>
                        <p className="font-mono text-[9px] text-zinc-700 mt-1.5">Ask anything · or use Quick Actions</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {history.map((msg, index) => {
                        const isAi  = msg.role === 'ai';
                        // Using the isNew flag appended in Redux slice directly
                        const isNew = isAi && msg.isNew === true; 

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className={`flex ${isAi ? 'justify-start' : 'justify-end'} w-full`}
                            >
                                {isAi && (
                                    <div className="shrink-0 mr-2.5 mt-0.5">
                                        <div className="w-7 h-7 rounded-lg bg-[#111] border border-[#C9963A]/15 flex items-center justify-center shadow-[0_0_10px_rgba(201,150,58,0.08)]">
                                            <Sparkles size={12} className="text-[#C9963A]/75" />
                                        </div>
                                    </div>
                                )}

                                {isAi && (
                                    <div className="max-w-[86%] bg-[#111] border border-white/[0.05] text-zinc-300 shadow-[0_2px_20px_rgba(0,0,0,0.45)] rounded-2xl rounded-tl-sm p-4 text-sm font-sans">
                                        <AIResponseRenderer data={msg.data} isNew={isNew} />
                                    </div>
                                )}

                                {!isAi && (
                                    <div className="max-w-[82%] relative">
                                        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#C9963A]/22 to-transparent rounded-full z-10" />
                                        <div
                                            className="relative bg-[#161616] text-zinc-100 rounded-2xl rounded-tr-sm py-3 px-4 text-sm font-sans leading-relaxed"
                                            style={{
                                                boxShadow: '0 0 0 1px rgba(201,150,58,0.13), 0 4px_22px_rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-[#C9963A]/30 via-[#C9963A]/15 to-transparent" />
                                            <span className="whitespace-pre-wrap pl-1">{msg.data}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                <AnimatePresence>
                    {isSending && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.22 }}
                            className="flex justify-start w-full"
                        >
                            <div className="shrink-0 mr-2.5 mt-0.5">
                                <div className="w-7 h-7 rounded-lg bg-[#111] border border-[#C9963A]/15 flex items-center justify-center">
                                    <Loader2 size={11} className="animate-spin text-[#C9963A]/55" />
                                </div>
                            </div>
                            <div className="bg-[#111] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.45)]">
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Input Area ────────────────────────────────────── */}
            <div className="shrink-0 bg-[#0d0d0d] border-t border-white/[0.04] p-3.5 relative z-30">
                
                {/* ── Error Banner for Rate Limits ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 10 }}
                            className="mb-3 bg-rose-500/[0.08] border border-rose-500/[0.15] rounded-xl p-3 flex items-center gap-2.5 text-rose-400"
                        >
                            <AlertTriangle size={15} />
                            <span className="text-xs font-medium tracking-wide">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 6 }}
                            animate={{ opacity: 1, scale: 1,    y: 0 }}
                            exit={{ opacity: 0, scale: 0.96,    y: 6 }}
                            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="absolute bottom-full left-3.5 mb-2.5 bg-[#0f0f0f] border border-white/[0.07] rounded-xl shadow-[0_-12px_40px_rgba(0,0,0,0.65)] overflow-hidden origin-bottom-left"
                            style={{ width: '228px' }}
                        >
                            <div className="px-3.5 py-2.5 border-b border-white/[0.05] bg-[#0c0c0c]">
                                <h3 className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-600">Quick Actions</h3>
                            </div>
                            <div className="p-1.5 max-h-56 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
                                {QUICK_ACTIONS.map(action => {
                                    const Icon = action.icon;
                                    return (
                                        <motion.button
                                            key={action.id}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            whileHover={{ backgroundColor: 'rgba(201,150,58,0.055)' }}
                                            className="flex items-center gap-2.5 w-full text-left p-2.5 rounded-lg text-zinc-500 hover:text-[#C9963A] transition-colors group"
                                        >
                                            <div className="p-1.5 rounded-md bg-white/[0.03] group-hover:bg-[#C9963A]/[0.07] transition-colors shrink-0">
                                                <Icon size={12} />
                                            </div>
                                            <span className="text-[11px] font-medium">{action.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
                    <motion.button
                        type="button"
                        onClick={() => setIsMenuOpen(o => !o)}
                        whileTap={{ scale: 0.93 }}
                        className={`shrink-0 h-[42px] w-[42px] flex items-center justify-center rounded-xl border transition-colors duration-200 ${
                            isMenuOpen
                                ? 'bg-[#1a1a1a] border-white/[0.10] text-zinc-300'
                                : 'bg-[#141414] border-white/[0.06] text-[#C9963A]/65 hover:text-[#C9963A] hover:border-[#C9963A]/22 hover:bg-[#161616]'
                        }`}
                    >
                        <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                            <Plus size={18} strokeWidth={2.5} />
                        </motion.div>
                    </motion.button>

                    <div className="flex-1 bg-[#141414] border border-white/[0.06] rounded-xl flex items-end transition-all duration-200 focus-within:border-[#C9963A]/28 focus-within:shadow-[0_0_0_1px_rgba(201,150,58,0.07),0_0_14px_rgba(201,150,58,0.06)]">
                        <textarea
                            {...register('userMessage')}
                            ref={e => { register('userMessage').ref(e); textareaRef.current = e; }}
                            onInput={handleInputResize}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            placeholder="Message HackForge AI…"
                            className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none disabled:opacity-40 font-sans resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-[42px] max-h-[150px] leading-relaxed"
                            rows={1}
                        />
                        <motion.button
                            type="submit"
                            disabled={isSending || isInputEmpty}
                            whileTap={{ scale: 0.90 }}
                            className="p-1.5 mb-1.5 mr-1.5 shrink-0 bg-[#C9963A] text-black hover:bg-[#D4A545] rounded-lg transition-colors duration-150 disabled:opacity-25 disabled:bg-[#1a1a1a] disabled:text-zinc-600 h-[32px] w-[32px] flex items-center justify-center"
                        >
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatAITab;