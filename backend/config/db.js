import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Admin@1234',
  database: process.env.DB_NAME || 'agriexport_connect',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  charset: 'utf8mb4',
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
