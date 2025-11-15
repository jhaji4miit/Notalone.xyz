const redis = require('redis');
const logger = require('./logger');

let client = null;

const getRedisClient = () => {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    client = redis.createClient({ url: redisUrl });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    client.connect().catch(err => {
      logger.error('Redis connection failed:', err);
    });
  }
  return client;
};

const setOTP = async (email, otp, expirySeconds = 600) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.setEx(`otp:${email}`, expirySeconds, otp);
    return true;
  } catch (error) {
    logger.error('Redis setOTP error:', error);
    return false;
  }
};

const getOTP = async (email) => {
  try {
    const redisClient = getRedisClient();
    return await redisClient.get(`otp:${email}`);
  } catch (error) {
    logger.error('Redis getOTP error:', error);
    return null;
  }
};

const deleteOTP = async (email) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.del(`otp:${email}`);
    return true;
  } catch (error) {
    logger.error('Redis deleteOTP error:', error);
    return false;
  }
};

const setToken = async (key, token, expirySeconds = 3600) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.setEx(`token:${key}`, expirySeconds, token);
    return true;
  } catch (error) {
    logger.error('Redis setToken error:', error);
    return false;
  }
};

const getToken = async (key) => {
  try {
    const redisClient = getRedisClient();
    return await redisClient.get(`token:${key}`);
  } catch (error) {
    logger.error('Redis getToken error:', error);
    return null;
  }
};

const deleteToken = async (key) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.del(`token:${key}`);
    return true;
  } catch (error) {
    logger.error('Redis deleteToken error:', error);
    return false;
  }
};

module.exports = {
  getRedisClient,
  setOTP,
  getOTP,
  deleteOTP,
  setToken,
  getToken,
  deleteToken
};

