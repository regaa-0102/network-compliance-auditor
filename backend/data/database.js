import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  existsSync,
  copyFileSync
} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel's writable temporary directory
const runtimeDbPath = "/tmp/network_auditor.db";
const bundledDbPath = path.join(__dirname, "network_auditor.db");

// Copy the bundled demo database into /tmp on first startup
if (!existsSync(runtimeDbPath)) {
  copyFileSync(bundledDbPath, runtimeDbPath);
}

const db = new DatabaseSync(runtimeDbPath);

// Enable foreign keys.
// WAL is intentionally avoided on the deployed copy because
// Vercel's serverless filesystem is ephemeral.
try {
  db.exec("PRAGMA foreign_keys = ON;");
} catch (e) {
  console.warn("Pragma warning:", e.message);
}

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export function exec(sql) {
  return db.exec(sql);
}

export default {
  query,
  get,
  run,
  exec,
  dbInstance: db
};
