import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../redux/authSlice";
 
const userSchema = z.object({
    emailId: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Minimum 8 characters required")
});
 
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
);
 
const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
);
 
const EyeIcon = ({ open }) =>
    open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
 
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
 
    const { loading, error, isAuthenticated } = useSelector((state) => state.authSlice);
 
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated]);
 
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema)
    });
 
    // ✅ removed fake setTimeout — redux thunk handles async itself
    const submittedData = (data) => {
        dispatch(loginUser(data));
    };
 
    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
 
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C9963A]/8 blur-[100px]" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#C9963A]/5 blur-[80px]" />
            </div>
 
            {/* Card */}
            <div className="relative z-10 w-full max-w-md
                bg-white/[0.04] backdrop-blur-xl
                border border-white/10
                rounded-3xl p-8
                shadow-[0_24px_64px_rgba(0,0,0,0.5)]
                hover:border-[#C9963A]/25
                transition-colors duration-300"
            >
                {/* Header */}
                <div className="text-center mb-7">
                    <p className="text-[#C9963A] text-xs tracking-widest uppercase mb-3 font-medium">
                        Welcome Back
                    </p>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Sign In
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Good to see you again. Let's get coding.
                    </p>
                </div>
 
                <form onSubmit={handleSubmit(submittedData)} className="flex flex-col gap-4">
 
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            {...register("emailId")}
                            placeholder="Email Address"
                            className="input w-full bg-white/[0.06] border border-white/10 text-white placeholder:text-zinc-600
                                rounded-xl focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.08]
                                transition-all duration-200"
                        />
                        {errors.emailId && (
                            <span className="text-red-400 text-xs pl-1">{errors.emailId.message}</span>
                        )}
                    </div>
 
                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="Password"
                                className="input w-full bg-white/[0.06] border border-white/10 text-white placeholder:text-zinc-600
                                    rounded-xl focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.08]
                                    transition-all duration-200 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#C9963A] transition-colors duration-200"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-red-400 text-xs pl-1">{errors.password.message}</span>
                        )}
                    </div>
 
                    {/* Forgot password */}
                    <div className="text-right -mt-1">
                        <span className="text-zinc-600 text-xs cursor-pointer hover:text-[#C9963A] transition-colors duration-200">
                            Forgot password?
                        </span>
                    </div>
 
                    {/* ✅ Global API error shown here */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <p className="text-red-400 text-xs">{error}</p>
                        </div>
                    )}
 
                    {/* Submit — ✅ uses global loading */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-full rounded-xl border-none
                            bg-[#C9963A] hover:bg-[#E0B455] text-black font-semibold
                            hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,150,58,0.35)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-all duration-200"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-xs" />
                                Signing in...
                            </span>
                        ) : "Sign In"}
                    </button>
 
                    {/* Divider */}
                    <div className="divider text-zinc-700 text-[10px] tracking-widest uppercase my-0">
                        or continue with
                    </div>
 
                    {/* Social */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Google", Icon: GoogleIcon },
                            { label: "GitHub", Icon: GitHubIcon }
                        ].map(({ label, Icon }) => (
                            <button
                                key={label}
                                type="button"
                                className="btn rounded-xl bg-white/[0.05] border border-white/10 text-zinc-400
                                    hover:border-[#C9963A]/40 hover:text-white hover:bg-white/[0.08]
                                    transition-all duration-200 gap-2"
                            >
                                <Icon />
                                {label}
                            </button>
                        ))}
                    </div>
 
                    {/* ✅ Footer with working navigation */}
                    <p className="text-center text-zinc-600 text-xs mt-1">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate('/signup')}
                            className="text-[#C9963A] cursor-pointer hover:text-[#E0B455] transition-colors duration-200 font-medium"
                        >
                            Create one
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}
 
export default Login;