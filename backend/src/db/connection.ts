import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (3 levels up: db/ → src/ → backend/ → root)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_HOST } = process.env;

export const pool = new pg.Pool({
  user: DB_USER || 'korean_app',
  password: DB_PASSWORD || 'changeme',
  host: DB_HOST || 'localhost',
  port: Number(DB_PORT) || 5432,
  database: DB_NAME || 'korean_app',
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}