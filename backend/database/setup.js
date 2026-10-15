import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSetup() {
  console.log('🚀 Running database setup...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Execute statements in schema.sql
    // Split by semicolons
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const connection = await pool.getConnection();
    console.log(`Executing ${statements.length} schema statements...`);
    
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    connection.release();
    console.log('✅ Schema created successfully!');

    // Seed database
    await seedDatabase();
    console.log('🎉 Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

runSetup();
