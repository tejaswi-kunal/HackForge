import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "../../components/Header";
import axiosClient from "../../utils/axiosClient";
import { checkUser } from "../../redux/authSlice";
import { motion } from "framer-motion";
import { User, Image as ImageIcon, Link as LinkIcon, BookOpen, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

// 1. Zod Schema strictly matching your Mongoose Schema limits
const profileSchema = z.object({
    firstName: z.string().min(3, "Min 3 characters").max(50, "Max 50 characters").optional().or(z.literal('')),
    lastName: z.string().min(3, "Min 3 characters").max(50, "Max 50 characters").optional().or(z.literal('')),
    age: z.coerce.number().min(5, "Minimum age is 5").optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
    profilePicture: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    bio: z.string().max(300, "Bio cannot exceed 300 characters").optional().or(z.literal('')),
    college: z.string().max(100, "College name cannot exceed 100 characters").optional().or(z.literal('')),
    github: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal(''))
});

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [accountLoading, setAccountLoading] = useState(true);
    
    // Read-only baseline state from the API fetch for username and email fields
    const [staticCredentials, setStaticCredentials] = useState({ userName: "", emailId: "" });

    const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting, isDirty, dirtyFields } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "", lastName: "", age: "", gender: "other", profilePicture: "", bio: "", college: "", github: "", linkedin: ""
        }
    });

    const profilePicUrl = watch("profilePicture");

    // NEW: Fetch completely fresh, authoritative pre-existing data right on component load
    useEffect(() => {
        const fetchCurrentProfileData = async () => {
            try {
                const res = await axiosClient.get("/auth/getAccount");
                const userData = res.data?.user;

                if (userData) {
                    // Update read-only displays
                    setStaticCredentials({
                        userName: userData.userName || "",
                        emailId: userData.emailId || ""
                    });

                    // React Hook Form reset to map everything cleanly into the fields
                    reset({
                        firstName: userData.firstName || "",
                        lastName: userData.lastName || "",
                        age: userData.age || "",
                        gender: userData.gender || "other",
                        profilePicture: userData.profilePicture || "",
                        bio: userData.bio || "",
                        college: userData.college || "",
                        github: userData.github || "",
                        linkedin: userData.linkedin || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch fresh account data for editing:", err);
                setStatus({ type: "error", msg: "Failed to load pre-existing profile details." });
            } finally {
                setAccountLoading(false);
            }
        };

        fetchCurrentProfileData();
    }, [reset]);

    const onSubmit = async (data) => {
        setStatus(null);

        // Only extract fields that the user actually changed (Partial Update)
        const partialData = Object.keys(dirtyFields).reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
        }, {});

        if (Object.keys(partialData).length === 0) {
            setStatus({ type: "error", msg: "No fields were modified." });
            return;
        }

        try {
            await axiosClient.put('/auth/updateProfile', partialData);
            setStatus({ type: "success", msg: "Profile updated successfully!" });
            
            dispatch(checkUser()); 
            setTimeout(() => navigate('/profile'), 1500);

        } catch (err) {
            const errorMessage = err.response?.data || "Update failed.";
            const lowerError = errorMessage.toLowerCase();

            if (lowerError.includes("first name")) {
                setError("firstName", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("last name")) {
                setError("lastName", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("bio")) {
                setError("bio", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else if (lowerError.includes("age")) {
                setError("age", { type: "server", message: errorMessage.replace("Error : ", "") });
            } 
            else {
                setStatus({ type: "error", msg: errorMessage.replace("Error : ", "") });
            }
        }
    };

    if (accountLoading) {
        return (
            <div className="min-h-screen bg-[#080808] text-zinc-300 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-zinc-300 pb-12 font-sans selection:bg-[#C9963A] selection:text-black">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
                
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
                    
                    {/* Header Section */}
                    <motion.div variants={sectionVariants}>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Edit Profile</h1>
                        <p className="text-zinc-500 text-sm mt-1">Customize your presence on HackForge.</p>
                        
                        {status?.msg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl text-sm flex items-center gap-3 font-medium border ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {status.msg}
                            </motion.div>
                        )}
                    </motion.div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        
                        {/* 1. Account Identity (Read-Only via direct fetched baseline state) */}
                        <motion.div variants={sectionVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
                            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={16} className="text-zinc-500" /> Account Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
                                    <input type="text" value={staticCredentials.userName} disabled className="w-full bg-black/40 border border-white/[0.02] rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" value={staticCredentials.emailId} disabled className="w-full bg-black/40 border border-white/[0.02] rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-medium" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-600 mt-4">Username and Email cannot be changed to preserve submission integrity.</p>
                        </motion.div>

                        {/* 2. Public Profile */}
                        <motion.div variants={sectionVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#C9963A]"></div>
                            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
                                <User size={16} className="text-[#C9963A]" /> Personal Information
                            </h3>
                            
                            {/* Profile Picture Row */}
                            <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                                <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <ImageIcon size={32} className="text-zinc-700" />
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Profile Picture URL</label>
                                    <input type="url" {...register("profilePicture")} placeholder="https://example.com/my-photo.jpg" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.04] transition-all" />
                                    {errors.profilePicture && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.profilePicture.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">First Name</label>
                                    <input type="text" {...register("firstName")} className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.firstName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#C9963A]/60'}`} />
                                    {errors.firstName && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.firstName.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Last Name</label>
                                    <input type="text" {...register("lastName")} className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.lastName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#C9963A]/60'}`} />
                                    {errors.lastName && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.lastName.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Age</label>
                                    <input type="number" {...register("age")} className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.age ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#C9963A]/60'}`} />
                                    {errors.age && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.age.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Gender</label>
                                    <select {...register("gender")} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9963A]/60 focus:bg-white/[0.04] transition-all appearance-none cursor-pointer">
                                        <option value="male" className="bg-[#111]">Male</option>
                                        <option value="female" className="bg-[#111]">Female</option>
                                        <option value="other" className="bg-[#111]">Other</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. About & Education */}
                        <motion.div variants={sectionVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={16} className="text-emerald-500" /> Background
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Bio</label>
                                    <textarea {...register("bio")} rows="3" placeholder="Tell the community about yourself..." className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all resize-none ${errors.bio ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'}`}></textarea>
                                    {errors.bio && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.bio.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">College / University</label>
                                    <input type="text" {...register("college")} className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.college ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'}`} />
                                    {errors.college && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.college.message}</span>}
                                </div>
                            </div>
                        </motion.div>

                        {/* 4. Social Links */}
                        <motion.div variants={sectionVariants} className="bg-[#111] border border-white/[0.04] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
                                <LinkIcon size={16} className="text-blue-500" /> Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">GitHub URL</label>
                                    <input type="url" {...register("github")} placeholder="https://github.com/..." className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.github ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'}`} />
                                    {errors.github && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.github.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">LinkedIn URL</label>
                                    <input type="url" {...register("linkedin")} placeholder="https://linkedin.com/in/..." className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-white focus:outline-none focus:bg-white/[0.04] transition-all ${errors.linkedin ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'}`} />
                                    {errors.linkedin && <span className="text-red-400 text-xs mt-1.5 block font-medium">{errors.linkedin.message}</span>}
                                </div>
                            </div>
                        </motion.div>

                        {/* Sticky Action Footer */}
                        <motion.div variants={sectionVariants} className="sticky bottom-6 z-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex justify-end gap-4 items-center">
                            {isDirty && <span className="text-xs text-zinc-400 font-medium mr-auto pl-4">Unsaved changes</span>}
                            <button type="button" onClick={() => navigate('/profile')} className="px-6 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-bold">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || !isDirty} className="px-8 py-2.5 rounded-xl bg-[#C9963A] hover:bg-[#E0B455] text-black font-bold shadow-[0_0_15px_rgba(201,150,58,0.2)] disabled:opacity-50 disabled:shadow-none transition-all text-sm flex items-center gap-2">
                                {isSubmitting ? <span className="loading loading-spinner loading-xs border-black"></span> : null}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </motion.div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default EditProfile;