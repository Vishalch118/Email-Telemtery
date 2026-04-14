const redisClient = require("../redisClient");

const getOrSetCache = async (key, cb, ttl = 60) => {
  try {
    const cache = await redisClient.get(key);

    if (cache) {
      console.log(`Cache HIT: ${key}`);

      const parsed = JSON.parse(cache);

      // ✅ background refresh (non-blocking)
      cb()
        .then((freshData) => {
          redisClient.setEx(key, ttl, JSON.stringify(freshData));
          console.log(`🔄 Cache refreshed: ${key}`);
        })
        .catch((err) => {
          console.error(`Cache refresh error (${key}):`, err.message);
        });

      return parsed;
    }

    console.log(`Cache MISS: ${key}`);

    const data = await cb();

    await redisClient.setEx(key, ttl, JSON.stringify(data));

    return data;

  } catch (err) {
    console.error("Cache error:", err);

    // fallback without cache
    return await cb();
  }
};

module.exports = getOrSetCache;