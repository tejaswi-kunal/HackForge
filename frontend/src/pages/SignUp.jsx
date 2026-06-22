import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { registerUser } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2, Lock, Mail, User, UserPlus } from "lucide-react";
import Header from "../components/Header";

// Upgraded schema with strong password requirements and confirm password check
const userSchema = z.object({
    userName: z.string().min(3, "At least 3 characters required"),
    emailId: z.string().email("Enter a valid email address"),
    password: z.string()
        .min(8, "Must be at least 8 characters long")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function SignUp() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { loading, error, isAuthenticated } = useSelector((state) => state.authSlice);

    // React Hook Form
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
        mode: "onChange"
    });

    const newPwd = watch("password", "");
    const confirmPwd = watch("confirmPassword", "");
    const isMatching = newPwd.length > 0 && newPwd === confirmPwd;

    useEffect(() => {
        if (isAuthenticated) {
            // SMART REDIRECT
            const origin = location.state?.from?.pathname || '/';
            navigate(origin, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const submittedData = (data) => {
        // Exclude confirmPassword before sending to backend
        const { confirmPassword, ...submitData } = data;
        dispatch(registerUser(submitData));
    };

    // Format Redux error string for Rate Limits (429)
    const displayError = error?.includes("429") || error?.toLowerCase().includes("too many") 
        ? "Too many requests. Please wait a moment before trying again." 
        : error;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black flex flex-col">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />

            {/* Tightened vertical padding to prevent scrolling (py-4 md:py-6 instead of py-8 md:py-10) */}
            <div className="relative z-10 max-w-xl mx-auto px-4 py-4 md:py-6 w-full flex-1 flex flex-col justify-center">
                
                {/* Tightened inner padding (p-5 sm:p-7 instead of p-6 sm:p-8) */}
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    
                    {/* Top Gold Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#C9963A] to-zinc-800"></div>

                    {/* Header - Reduced margins and icon size */}
                    <div className="text-center mb-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center mb-2 shadow-inner">
                            <UserPlus size={18} className="text-[#C9963A]" />
                        </div>
                        <h2 className="font-display text-xl font-black text-white tracking-wide mb-1">Create Account</h2>
                        <p className="text-zinc-500 font-medium text-[12px]">Join thousands of coders improving every day.</p>
                    </div>

                    {/* Security Disclaimer Box - Tightened padding */}
                    <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                        <ShieldCheck size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-display text-[9px] uppercase tracking-widest text-emerald-500 font-bold mb-0.5">Security Requirements</p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Password requires at least <strong className="text-zinc-200">8 chars</strong>, <strong className="text-zinc-200">one number</strong>, and <strong className="text-zinc-200">one symbol</strong>.</p>
                        </div>
                    </div>

                    {/* Tightened gap between form inputs (space-y-3 instead of space-y-4) */}
                    <form onSubmit={handleSubmit(submittedData)} className="space-y-3">

                        {/* Username */}
                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Username</label>
                            <div className="relative">
                                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                <input
                                    type="text"
                                    {...register("userName")}
                                    placeholder="Choose a username"
                                    // Reduced padding py-2 instead of py-2.5
                                    className={`w-full bg-zinc-950 border rounded-xl pl-9 pr-4 py-2 text-zinc-200 font-mono text-[13px] focus:outline-none transition-all shadow-sm ${errors.userName ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                />
                            </div>
                            {errors.userName && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.userName.message}</span>}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                <input
                                    type="email"
                                    {...register("emailId")}
                                    placeholder="name@example.com"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-9 pr-4 py-2 text-zinc-200 font-mono text-[13px] focus:outline-none transition-all shadow-sm ${errors.emailId ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                />
                            </div>
                            {errors.emailId && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.emailId.message}</span>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9963A]/70 pointer-events-none" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="e.g. 8+ chars, 1 num, 1 symbol"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-9 pr-10 py-2 text-zinc-200 font-mono text-[13px] focus:outline-none transition-all shadow-sm ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                            </div>
                            {errors.password && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.password.message}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1 relative">
                            <label className="font-display block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Confirm Password</label>
                            <div className="relative">
                                {isMatching ? (
                                    <CheckCircle2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] pointer-events-none transition-all duration-300 scale-110" />
                                ) : (
                                    <CheckCircle2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none transition-all duration-300" />
                                )}
                                
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    {...register("confirmPassword")}
                                    placeholder="Type your password again"
                                    className={`w-full bg-zinc-950 border rounded-xl pl-9 pr-10 py-2 text-zinc-200 font-mono text-[13px] focus:outline-none transition-all shadow-sm ${
                                        isMatching 
                                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 focus:border-emerald-500/50' 
                                            : errors.confirmPassword 
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10' 
                                                : 'border-zinc-800 focus:border-[#C9963A]/50 focus:ring-2 focus:ring-[#C9963A]/10'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="font-display text-red-400 text-[9px] uppercase tracking-wider mt-0.5 block font-bold">{errors.confirmPassword.message}</span>}
                        </div>

                        {/* Error Alert from Redux */}
                        <AnimatePresence>
                            {displayError && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-2 mt-1">
                                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                                    <p className="text-red-400 text-[11px] font-medium">{displayError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="pt-3 mt-1 border-t border-zinc-800/80">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl py-2.5 bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_20px_rgba(201,150,58,0.2)] disabled:opacity-50 disabled:shadow-none transition-all text-[13px] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs border-black" />
                                        Creating...
                                    </>
                                ) : "Create Account"}
                            </button>
                        </div>

                        <p className="text-center text-zinc-500 text-[11px] mt-1.5">
                            Already have an account?{" "}
                            <span onClick={() => navigate('/login')} className="text-[#C9963A] cursor-pointer hover:text-[#E0B455] transition-colors duration-200 font-bold">
                                Sign in
                            </span>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default SignUp;