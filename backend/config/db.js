import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'agriexport_connect',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl:
    process.env.DB_SSL === 'true' ||
    (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
      ? { minVersion: 'TLSv1.2', rejectUnauthorized: false }
      : undefined,
});

// Helper for test connection
export const testConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    return rows[0].solution === 2;
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    return false;
  }
};

export default pool;
