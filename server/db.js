import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建数据库连接
const dbPath = path.join(__dirname, 'abtest.db');
const db = new sqlite3.Database(dbPath);

// 将回调式方法转换为Promise
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbGet = promisify(db.get.bind(db));

// 初始化数据库表
export async function initDatabase() {
  // 创建测试会话表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      test_config TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // 创建Phase1结果表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS phase1_results (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      image_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      keyword TEXT NOT NULL,
      is_match INTEGER NOT NULL,
      reaction_time_ms REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id)
    )
  `);

  // 创建Phase2结果表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS phase2_results (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      selected_keywords TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id)
    )
  `);

  console.log('Database initialized successfully');
}

// 导出数据库操作方法
export { db, dbRun, dbAll, dbGet };

