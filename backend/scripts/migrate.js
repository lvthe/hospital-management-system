/**
 * ==================================================
 * Database Migration Script
 * ==================================================
 * File: scripts/migrate.js
 * Description: Chạy SQL migrations để tạo tables
 */

const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/database");
const logger = require("../src/config/logger");

/**
 * Chạy tất cả migration files theo thứ tự
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../../database/migrations");

  try {
    // Kiểm tra thư mục migrations tồn tại
    if (!fs.existsSync(migrationsDir)) {
      logger.error(`Thư mục migrations không tồn tại: ${migrationsDir}`);
      return;
    }

    // Lấy danh sách file migrations (sắp xếp theo tên)
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      logger.warn("Không tìm thấy file migration");
      return;
    }

    logger.info(`Tìm thấy ${files.length} file migration`);

    // Chạy từng migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      logger.info(`▶️  Chạy migration: ${file}`);

      try {
        await pool.query(sql);
        logger.info(`✅ Migration thành công: ${file}`);
      } catch (error) {
        logger.error(`❌ Migration thất bại: ${file}`);
        logger.error(`Error: ${error.message}`);
        throw error;
      }
    }

    logger.info("✅ Tất cả migrations chạy thành công!");
  } catch (error) {
    logger.error(`❌ Lỗi chạy migrations: ${error.message}`);
    process.exit(1);
  } finally {
    // Đóng pool
    await pool.end();
  }
}

// Chạy migrations
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
