const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'hrga_request_db';

  console.log(`Connecting to MySQL server at ${host}...`);

  try {
    const connection = await mysql.createConnection({ host, user, password, multipleStatements: true });
    
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log(`Executing schema SQL script...`);
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sqlContent);
    console.log(`Schema & tables created successfully!`);

    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await connection.query(
      `UPDATE users SET password_hash = ? WHERE id IN (1, 2, 3, 4)`,
      [hashedPassword]
    );

    console.log(`Updated default user passwords (admin123) with BCrypt hash.`);
    console.log(`Database initialization completed successfully!`);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error(`Failed to initialize database:`, error.message);
    process.exit(1);
  }
}

initDb();
