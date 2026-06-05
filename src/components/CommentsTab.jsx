import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, Send, Trash2, Edit2, Check, X } from "lucide-react";
import axiosClient from "../utils/axiosClient";

function CommentsTab({ problemId }) {
    const { user } = useSelector((state) => state.authSlice);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Edit States
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const fetchComments = async () => {
        try {
            const res = await axiosClient.get(`/comment/getComments/${problemId}`);
            setComments(res.data.comments);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [problemId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axiosClient.post(`/comment/addComment/${problemId}`, { text: newComment });
            setNewComment("");
            fetchComments(); // Refresh list to get the new comment with proper ID and User details
        } catch (err) {
            console.error("Failed to add comment", err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await axiosClient.delete(`/comment/deleteComment/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const startEditing = (comment) => {
        setEditingId(comment._id);
        setEditText(comment.text);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editText.trim()) return;
        try {
            await axiosClient.put(`/comment/editComment/${commentId}`, { text: editText });
            setComments(prev => prev.map(c => c._id === commentId ? { ...c, text: editText } : c));
            setEditingId(null);
        } catch (err) {
            console.error("Failed to edit comment", err);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-10"><span className="loading loading-spinner text-[#C9963A]"></span></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-[#C9963A]" />
                <h3 className="text-xl font-bold">Discussion</h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="mb-8 relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your approach, ask a question, or leave a hint..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#C9963A]/50 resize-none min-h-[100px] transition-colors"
                ></textarea>
                <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute bottom-4 right-4 bg-[#C9963A] hover:bg-[#E0B455] text-black p-2 rounded-lg disabled:opacity-50 transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                        <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                        <p>No comments yet. Be the first to start the discussion!</p>
                    </div>
                ) : (
                    comments.map(comment => {
                        const isOwner = comment.user?._id === user?._id;
                        const isEditing = editingId === comment._id;

                        return (
                            <div key={comment._id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-[#C9963A]/20 flex items-center justify-center text-[#C9963A] text-[10px] font-bold uppercase">
                                            {comment.user?.userName?.slice(0, 2) || "?"}
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-200">{comment.user?.userName || "Unknown User"}</span>
                                        <span className="text-[10px] text-zinc-500">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {/* Action Buttons for Owner */}
                                    {isOwner && !isEditing && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEditing(comment)} className="text-zinc-500 hover:text-blue-400 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(comment._id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                {isEditing ? (
                                    <div className="mt-2 relative">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-[#C9963A]/30 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                                                <X size={12} /> Cancel
                                            </button>
                                            <button onClick={() => handleSaveEdit(comment._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-[#C9963A] text-black hover:bg-[#E0B455] transition-colors">
                                                <Check size={12} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-400 whitespace-pre-wrap">{comment.text}</p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CommentsTab;