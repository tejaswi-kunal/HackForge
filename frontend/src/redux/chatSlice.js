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
            // Returns { success: true, data: parsedResponse, remainingAIRequests... }
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
        // Optimistically add user message to UI before backend confirms
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
                state.history = action.payload; // expects array of {role, data}
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload;
            })
            
            // Send Message
            .addCase(sendChatMessage.pending, (state) => {
                state.isSending = true;
                state.error = null;
            })
            // --- FIX: Merged the two fulfilled cases into one ---
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.isSending = false;
                
                // 1. Append AI response
                state.history.push({ role: 'ai', data: action.payload.data });
                
                // 2. Update remaining requests from the payload
                if (action.payload.remainingAIRequests !== undefined) {
                    state.remainingRequests = action.payload.remainingAIRequests;
                }
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.isSending = false;
                state.error = action.payload;
                // Optionally remove the optimistic message if it failed
                state.history.pop();
            });
    }
});

export const { addOptimisticMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;