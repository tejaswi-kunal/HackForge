import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const fetchChatHistory = createAsyncThunk(
    'chat/fetchHistory',
    async (problemId, thunkAPI) => {
        try {
            const response = await axiosClient.get(`/ai/history/${problemId}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Failed to fetch history");
        }
    }
);

export const sendChatMessage = createAsyncThunk(
    'chat/sendMessage',
    async (payload, thunkAPI) => {
        try {
            const response = await axiosClient.post('/ai/chat', payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Failed to send message");
        }
    }
);

const chatSlice = createSlice({
    name: 'chatSlice',
    initialState: {
        history: [],
        isLoadingHistory: false,
        isSending: false,
        error: null,
        remainingRequests: null,
    },
    reducers: {
        addOptimisticMessage: (state, action) => {
            state.history.push({ role: 'user', data: action.payload });
        },
        clearChatError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch History
            .addCase(fetchChatHistory.pending, (state) => {
                state.isLoadingHistory = true;
                state.error = null;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.isLoadingHistory = false;
                state.history = action.payload; 
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload?.message || "Failed to fetch history";
            })
            
            // Send Message
            .addCase(sendChatMessage.pending, (state) => {
                state.isSending = true;
                state.error = null;
            })
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.isSending = false;
                
                // 1. Append AI response WITH the isNew flag so ONLY this message streams
                state.history.push({ role: 'ai', data: action.payload.data, isNew: true });
                
                // 2. Update remaining requests from the payload
                if (action.payload.remainingAIRequests !== undefined) {
                    state.remainingRequests = action.payload.remainingAIRequests;
                }
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.isSending = false;
                // Capture the exact error message from your backend (e.g., Rate limit / Cooldown)
                state.error = action.payload?.message || action.payload?.error || "Failed to send message";
                
                // Remove the optimistic user message since it failed to send
                if (state.history.length > 0 && state.history[state.history.length - 1].role === 'user') {
                    state.history.pop();
                }
            });
    }
});

export const { addOptimisticMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;