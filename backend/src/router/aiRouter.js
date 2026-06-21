const express = require('express');
const aiRouter = express.Router();
const { getChatHistory, sendMessage } = require('../controller/aiController');
const userMiddleware = require('../middleware/userMiddleware');
const {aiChatRateLimiter}=require('../utils/rateLimiter');

// Fetch history for a specific problem
aiRouter.get('/history/:problemId', userMiddleware, getChatHistory);

// Send a new message to the AI
aiRouter.post('/chat', userMiddleware,aiChatRateLimiter,sendMessage);

module.exports = aiRouter;