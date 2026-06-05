import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "../../components/Header";
import axiosClient from "../../utils/axiosClient";

// 1. Define the Zod Schema
const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long")
});

function ChangePassword() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null); // For backend success/error messages

    // 2. Initialize React Hook Form
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(passwordSchema)
    });

    // 3. Handle Form Submission
    const onSubmit = async (data) => {
        setStatus(null);
        try {
            await axiosClient.put('/auth/changePassword', data);
            setStatus({ type: "success", msg: "Password changed successfully!" });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setStatus({ type: "error", msg: err.response?.data || "Failed to change password." });
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] text-zinc-300">
            <Header />
            <div className="max-w-xl mx-auto px-4 py-10">
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                    
                    {/* Backend Error/Success Message */}
                    {status?.msg && (
                        <div className={`p-3 rounded-xl mb-6 text-sm flex items-center gap-2 ${status.type === 'error' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'}`}>
                            {status.msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Old Password */}
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Current Password</label>
                            <input 
                                type="password" 
                                {...register("oldPassword")}
                                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9963A]/60 transition-colors"
                            />
                            {errors.oldPassword && <span className="text-red-400 text-xs pl-1">{errors.oldPassword.message}</span>}
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-1">
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">New Password</label>
                            <input 
                                type="password" 
                                {...register("newPassword")}
                                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9963A]/60 transition-colors"
                            />
                            {errors.newPassword && <span className="text-red-400 text-xs pl-1">{errors.newPassword.message}</span>}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-white/[0.06] flex justify-end gap-3">
                            <button type="button" onClick={() => navigate('/profile')} className="px-5 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-semibold shadow-[0_0_15px_rgba(201,150,58,0.2)] disabled:opacity-50 transition-all text-sm flex items-center gap-2">
                                {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : null}
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;