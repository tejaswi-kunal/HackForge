import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "../components/Header";
import axiosClient from "../utils/axiosClient";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, KeyRound, XCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Must be at least 8 characters long")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    // Page States
    const [isValidating, setIsValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    
    // Form States
    const [status, setStatus] = useState(null); 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange" 
    });

    const newPwd = watch("password", "");
    const confirmPwd = watch("confirmPassword", "");
    
    const isMatching = newPwd.length > 0 && newPwd === confirmPwd;

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                await axiosClient.get(`/auth/reset-password/${token}`);
                setIsTokenValid(true);
            } catch (err) {
                setIsTokenValid(false);
            } finally {
                setIsValidating(false);
            }
        };
        validateToken();
    }, [token]);

    const onSubmit = async (data) => {
        setStatus(null);
        try {
            await axiosClient.post(`/auth/reset-password/${token}`, {
                password: data.password
            });
            setStatus({ type: "success", msg: "Password reset successfully! Redirecting..." });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response?.status === 429) {
                setStatus({ type: "error", msg: "Too many requests. Please try again later." });
            } else {
                setStatus({ type: "error", msg: err.response?.data?.message || err.response?.data || "Failed to reset password." });
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black flex flex-col">
            
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-xl mx-auto px-4 py-8 md:py-10 w-full flex-1 flex flex-col justify-center">
                
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#C9963A] to-zinc-800"></div>

                    {/* STATE 1: Validating Token */}
                    {isValidating && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <span className="loading loading-spinner loading-lg text-[#C9963A]" />
                            <p className="font-display text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Verifying Secure Link...</p>
                        </div>
                    )}

                    {/* STATE 2: Invalid/Expired Token */}
                    {!isValidating && !isTokenValid && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <XCircle size={32} className="text-red-500" />
                            </div>
                            <h2 className="font-display text-2xl font-black text-white tracking-wide mb-2">Link Expired</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                                This password reset link is invalid or has expired. For your security, links expire after 10 minutes.
                            </p>
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="w-full rounded-xl py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all duration-200 text-sm flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Request New Link
                            </button>
                        </div>
                    )}

                    {/* STATE 3: Valid Token - Show Form */}
                    {!isValidating && isTokenValid && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center mb-3 shadow-inner">
                                    <KeyRound size={22} className="text-[#C9963A]" />
                                </div>
                                <h2 className="font-display text-2xl font-black text-white tracking-wide mb-1">Create New Password</h2>
                                <p className="text-zinc-500 font-medium text-[13px]">Enter your new secure password below.</p>
                            </div>

                            {status?.type === 'success' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3 shadow-inner my-8">
                                    <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                                    <h3 className="text-emerald-400 font-bold text-lg">{status.msg}</h3>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-3.5 mb-6 flex items-start gap-3">
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-display text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">Security Requirements</p>
                                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">At least <strong className="text-zinc-200">8 characters</strong>, <strong className="text-zinc-200">one number</strong>, and <strong className="text-zinc-200">one special character</strong> (e.g., !@#$%^&*).</p>
                                        </div>
                                    </div>
                                    
                                    {status?.type === 'error' && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl mb-5 text-xs font-bold flex items-center gap-2 shadow-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                            <AlertCircle size={16} />
                                            {status.msg}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        
                                        <div className="flex flex-col gap-1 relative">
                                            <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
                                            <div className="relative">
                                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9963A]/70 pointer-events-none" />
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    {...register("password")}
                                                    placeholder="e.g. 8+ chars, 1 number, 1 symbol"
                                                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-12 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            {errors.password && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.password.message}</span>}
                                        </div>

                                        <div className="flex flex-col gap-1 relative">
                                            <label className="font-display block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confirm New Password</label>
                                            <div className="relative">
                                                {isMatching ? (
                                                    <CheckCircle2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] pointer-events-none transition-all duration-300 scale-110" />
                                                ) : (
                                                    <CheckCircle2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none transition-all duration-300" />
                                                )}
                                                
                                                <input 
                                                    type={showConfirm ? "text" : "password"} 
                                                    {...register("confirmPassword")}
                                                    placeholder="Type your new password again"
                                                    className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-12 py-2.5 text-zinc-200 font-mono text-sm focus:outline-none transition-all shadow-sm ${
                                                        isMatching 
                                                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 focus:border-emerald-500/50' 
                                                            : errors.confirmPassword 
                                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' 
                                                                : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'
                                                    }`}
                                                />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.confirmPassword.message}</span>}
                                        </div>

                                        <div className="pt-6 mt-2 border-t border-zinc-800/80 flex justify-end gap-3">
                                            <button type="button" onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-[13px] font-bold">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_20px_rgba(201,150,58,0.2)] disabled:opacity-50 disabled:shadow-none transition-all text-[13px] flex items-center gap-2">
                                                {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : null}
                                                {isSubmitting ? 'Securing...' : 'Reset Password'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default ResetPassword;