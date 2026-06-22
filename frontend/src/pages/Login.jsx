import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { loginUser } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Mail, Lock, LogIn } from "lucide-react";
import Header from "../components/Header";

const userSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Minimum 8 characters required")
});

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, isAuthenticated } = useSelector((state) => state.authSlice);

    useEffect(() => {
        if (isAuthenticated) {
            // SMART REDIRECT: Go back to where they came from, or default to homepage
            const origin = location.state?.from?.pathname || '/';
            navigate(origin, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
        mode: "onChange"
    });

    const submittedData = (data) => {
        dispatch(loginUser(data));
    };

    // Format Redux error string for Rate Limits (429)
    const displayError = error?.includes("429") || error?.toLowerCase().includes("too many") 
        ? "Too many requests. Please wait a moment before trying again." 
        : error;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-[#C9963A] selection:text-black flex flex-col">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#C9963A]/[0.02] blur-[100px]" />
            </div>

            <Header />
            
            <div className="relative z-10 max-w-xl mx-auto px-4 py-4 md:py-6 w-full flex-1 flex flex-col justify-center">
                
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    
                    {/* Top Gold Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#C9963A] to-zinc-800"></div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 mx-auto flex items-center justify-center mb-2 shadow-inner">
                            <LogIn size={18} className="text-[#C9963A]" />
                        </div>
                        <h2 className="font-display text-xl font-black text-white tracking-wide mb-1">Welcome Back</h2>
                        <p className="text-zinc-500 font-medium text-[12px]">Good to see you again. Let's get coding.</p>
                    </div>

                    <form onSubmit={handleSubmit(submittedData)} className="space-y-3">

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
                                    placeholder="Enter your password"
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

                        <div className="text-right">
                            <span 
                                onClick={() => navigate('/forgot-password')} 
                                className="text-zinc-500 text-[11px] cursor-pointer hover:text-[#C9963A] transition-colors duration-200 font-medium inline-block mt-0.5"
                            >
                                Forgot password?
                            </span>
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
                                        Signing in...
                                    </>
                                ) : "Sign In"}
                            </button>
                        </div>
    
                        <p className="text-center text-zinc-500 text-[11px] mt-1.5">
                            Don't have an account?{" "}
                            <span onClick={() => navigate('/signup')} className="text-[#C9963A] cursor-pointer hover:text-[#E0B455] transition-colors duration-200 font-bold">
                                Create one
                            </span>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
 
export default Login;