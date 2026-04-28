const { Pool } = require("pg");
require("dotenv").config();

// ─── PostgreSQL ───────────────────────────────────────────────────────────────

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "hospital_db",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

const query = (text, params) => pool.query(text, params);

const connectDB = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    return false;
  }
};

const closeDB = async () => {
  try {
    await pool.end();
    console.log("✅ PostgreSQL pool closed");
  } catch (error) {
    console.error("❌ Error closing PostgreSQL pool:", error.message);
  }
};

// ─── Redis (optional — in-memory fallback khi không có Redis) ─────────────────

class MemoryStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  async set(key, value, options = {}) {
    this.store.set(key, String(value));
    if (options.EX) {
      if (this.timers.has(key)) clearTimeout(this.timers.get(key));
      const t = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, options.EX * 1000);
      this.timers.set(key, t);
    }
    return "OK";
  }

  async get(key) {
    return this.store.get(key) ?? null;
  }

  async del(key) {
    if (this.timers.has(key)) clearTimeout(this.timers.get(key));
    this.timers.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }
}

let redisClient = new MemoryStore();
redisClient._type = "memory";

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl && !process.env.REDIS_HOST) {
    console.warn("⚠️  Redis không được cấu hình — dùng in-memory store (không phù hợp production)");
    return;
  }

  try {
    const redis = require("redis");
    const client = redis.createClient({
      url: redisUrl || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
    });

    client.on("error", (err) => console.error("Redis error:", err.message));

    await client.connect();
    redisClient = client;
    redisClient._type = "redis";
    console.log("✅ Redis connected");
  } catch (err) {
    console.warn("⚠️  Không kết nối được Redis, dùng in-memory fallback:", err.message);
  }
};

// Kết nối Redis khi module load (non-blocking)
connectRedis();

const getRedisClient = () => redisClient;

module.exports = { pool, query, connectDB, closeDB, getRedisClient };

// Getter để các module import `redisClient` như cũ vẫn hoạt động
Object.defineProperty(module.exports, "redisClient", {
  get: () => redisClient,
  enumerable: true,
});
