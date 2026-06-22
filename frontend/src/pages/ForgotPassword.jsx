import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Mail, ArrowLeft, Send } from "lucide-react";
import Header from "../components/Header";

const forgotPasswordSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
});

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function ForgotPassword() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '...' }

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange"
    });

    const onSubmit = async (data) => {
        setStatus(null);
        try {
            const res = await axiosClient.post("/auth/forgot-password", data);
            setStatus({ type: "success", msg: res.data.message || "Reset link sent successfully!" });
        } catch (err) {
            if (err.response?.status === 429) {
                setStatus({ type: "error", msg: "Too many requests. Please wait a while before trying again." });
            } else {
                setStatus({ type: "error", msg: err.response?.data?.message || err.response?.data || "Failed to send reset link." });
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black flex flex-col">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-xl mx-auto px-4 py-8 md:py-10 w-full flex-1 flex flex-col justify-center">
                
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    
                    {/* Top Gold Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#C9963A] to-zinc-800"></div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center mb-3 shadow-inner">
                            <Mail size={22} className="text-[#C9963A]" />
                        </div>
                        <h2 className="font-display text-2xl font-black text-white tracking-wide mb-1">Reset Password</h2>
                        <p className="text-zinc-500 font-medium text-[13px] max-w-sm mx-auto leading-relaxed">
                            Enter the email address associated with your account, and we'll send you a secure link to reset your password.
                        </p>
                    </div>

                    {/* Success State */}
                    {status?.type === 'success' ? (
                        <div className="mt-8">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3 shadow-inner mb-6">
                                <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                                <h3 className="text-emerald-400 font-bold text-sm leading-relaxed">{status.msg}</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/login')} 
                                className="w-full px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors text-[13px] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Return to Login
                            </button>
                        </div>
                    ) : (
                        // Form State
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            
                            {/* Animated Error Banner */}
                            {status?.type === 'error' && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl mb-2 text-xs font-bold flex items-center gap-2 shadow-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {status.msg}
                                </motion.div>
                            )}

                            <div className="flex flex-col gap-1 relative">
                                <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                    <input 
                                        type="email" 
                                        {...register("emailId")}
                                        placeholder="name@example.com"
                                        className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${errors.emailId ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                    />
                                </div>
                                {errors.emailId && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.emailId.message}</span>}
                            </div>

                            {/* Action Area */}
                            <div className="pt-6 mt-2 border-t border-zinc-800/80 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/login')} 
                                    className="px-5 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-[13px] font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-6 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_20px_rgba(201,150,58,0.2)] disabled:opacity-50 disabled:shadow-none transition-all text-[13px] flex items-center gap-2"
                                >
                                    {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : <Send size={14} className="mt-0.5" />}
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default ForgotPassword;