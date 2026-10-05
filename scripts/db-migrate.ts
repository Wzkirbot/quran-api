import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/database/connection.js';

async function migrate() {
  console.log('⏳ Running PostgreSQL Database Schema Migrations...');

  const schemaPath = path.resolve(process.cwd(), 'src/database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    const isUp = await db.testConnection();
    if (!isUp) {
      console.warn('⚠️ Could not connect to PostgreSQL. Please ensure PostgreSQL is running.');
      console.warn('   Command: docker compose up -d');
      process.exit(1);
    }

    await db.query(sql);
    console.log('✅ PostgreSQL Schema and Indexes created successfully.');
  } catch (err: any) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

migrate();
