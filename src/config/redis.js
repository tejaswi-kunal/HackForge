const redis=require('redis');

const redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: Number(process.env.REDIS_SOCKET_PORT)
    }
});

module.exports=redisClient;
