import React, { useRef, useState, useEffect } from "react";
import DescriptionTab from "./DescriptionTab";
import EditorialTab from "./EditorialTab";
import SolutionsTab from "./SolutionsTab";
import SubmissionsTab from "./SubmissionsTab";
import CommentsTab from "./CommentsTab"; 
import { FileText, BookOpen, Code2, History, MessageSquare, Sparkles, ChevronsRight, ChevronsLeft } from "lucide-react";
import ChatAITab from "./ChatAITab";

function LeftWorkspace({ problem, submissions, activeTab, setActiveTab ,currentCode,language }) {
    const tabsRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    const tabs = [
        { id: "description", label: "Description", icon: FileText },
        { id: "ai", label: "HackForge AI", icon: Sparkles },
        { id: "editorial", label: "Editorial", icon: BookOpen },
        { id: "solutions", label: "Solutions", icon: Code2 },
        { id: "submissions", label: "Submissions", icon: History },
        { id: "discuss", label: "Discuss", icon: MessageSquare },
    ];

    // Function to check if scrolling is needed
    const checkScroll = () => {
        if (tabsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    // Smooth scroll handler
    const scrollTabs = (direction) => {
        if (tabsRef.current) {
            tabsRef.current.scrollBy({ 
                left: direction === "right" ? 150 : -150, 
                behavior: "smooth" 
            });
        }
    };

    return (
        <div className="w-1/2 flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl relative z-10">
            
            {/* Premium Tabs Navigation with Interactive Scroll */}
            <div className="relative shrink-0 bg-[#111] border-b border-white/[0.06] flex items-center">
                
                {/* Left Scroll Button */}
                {showLeftScroll && (
                    <button 
                        onClick={() => scrollTabs("left")}
                        className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#111] via-[#111]/90 to-transparent flex items-center justify-start pl-3 z-20"
                    >
                        <ChevronsLeft size={16} className="text-[#C9963A] hover:text-white transition-colors" />
                    </button>
                )}

                <div 
                    ref={tabsRef}
                    onScroll={checkScroll}
                    className="flex overflow-x-auto no-scrollbar scroll-smooth w-full"
                >
                    {tabs.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-display font-bold uppercase tracking-widest border-b-2 transition-all duration-300 whitespace-nowrap shrink-0
                                    ${isActive 
                                        ? "border-[#C9963A] text-[#C9963A] bg-[#C9963A]/[0.03]" 
                                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                                    }`}
                            >
                                <Icon size={14} className={isActive ? "text-[#C9963A]" : "text-zinc-600"} />
                                {label}
                            </button>
                        );
                    })}
                </div>
                
                {/* Right Scroll Button */}
                {showRightScroll && (
                    <button 
                        onClick={() => scrollTabs("right")}
                        className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#111] via-[#111]/90 to-transparent flex items-center justify-end pr-3 z-20"
                    >
                        <ChevronsRight size={16} className="text-[#C9963A] hover:text-white transition-colors animate-pulse" />
                    </button>
                )}
            </div>

            {/* Tab Content Rendering */}
            <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${activeTab === 'ai' ? 'p-0' : 'p-6'}`}>
                {activeTab === "description" && <DescriptionTab problem={problem} />}
                {activeTab === "editorial" && <EditorialTab problem={problem}/>}
                {activeTab === "solutions" && <SolutionsTab problem={problem} />}
                {activeTab === "submissions" && <SubmissionsTab submissions={submissions} />}
                {activeTab === "discuss" && <CommentsTab problemId={problem._id} />}
                {activeTab === "ai" && (
                    <ChatAITab 
                        problemId={problem._id} 
                        currentCode={currentCode} 
                        language={language} 
                    />
                )}
            </div>
        </div>
    );
}

export default LeftWorkspace;