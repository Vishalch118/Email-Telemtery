const redisClient = require("../redisClient");

const getOrSetCache = async (key, cb, ttl = 600) => {
  try {
    const cache = await redisClient.get(key);

    if (cache) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(cache);
    }

    console.log(`Cache MISS: ${key}`);

    const data = await cb();

    await redisClient.setEx(key, ttl, JSON.stringify(data));

    return data;

  } catch (err) {
    console.error("Cache error:", err);
    return await cb(); // fallback
  }
};

module.exports = getOrSetCache;