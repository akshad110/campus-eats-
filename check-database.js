// Database connectivity check script
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "campuseats",
  password: process.env.DB_PASSWORD || "campuseats123",
  database: process.env.DB_NAME || "campuseats",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function checkDatabase() {
  console.log("🔍 Checking database connection...");

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    console.log("✅ MySQL database is connected and ready!");
    console.log(`📊 Connected to: ${dbConfig.database} on ${dbConfig.host}`);
    await connection.end();
    return true;
  } catch (error) {
    console.log("❌ MySQL database connection failed:");
    console.log(`   Error: ${error.message}`);
    console.log("");
    console.log("🔄 The app will automatically use localStorage as fallback");
    console.log("📋 To fix this:");
    console.log("   1. Install MySQL: sudo apt install mysql-server");
    console.log("   2. Start MySQL: sudo systemctl start mysql");
    console.log("   3. Run setup: npm run setup:db");
    console.log("");
    return false;
  }
}

if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
