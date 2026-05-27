const redis=require('redis');

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: Number(process.env.REDIS_SOCKET_PORT)
    },
    pingInterval: 1000 * 60 * 4 // Pings the server every 4 minutes
});

// Add this right after you initialize your redisClient in config/redis.js
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

module.exports=redisClient;
