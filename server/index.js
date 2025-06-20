import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "campuseats",
  password: process.env.DB_PASSWORD || "campuseats123",
  database: process.env.DB_NAME || "campuseats",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

async function createTables(connection) {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('student', 'shopkeeper', 'developer') NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shops (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        owner_id VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        location VARCHAR(255),
        phone VARCHAR(20),
        crowd_level ENUM('low', 'medium', 'high') DEFAULT 'low',
        estimated_wait_time INT DEFAULT 10,
        active_tokens INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 4.0,
        total_ratings INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(255) PRIMARY KEY,
        shop_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        preparation_time INT DEFAULT 10,
        ingredients JSON,
        allergens JSON,
        nutritional_info JSON,
        stock_quantity INT DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        shop_id VARCHAR(255) NOT NULL,
        items JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending_approval', 'approved', 'rejected', 'payment_pending', 'payment_completed', 'payment_failed', 'preparing', 'ready', 'fulfilled', 'cancelled') DEFAULT 'pending_approval',
        token_number INT NOT NULL,
        estimated_pickup_time TIMESTAMP NULL,
        actual_pickup_time TIMESTAMP NULL,
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        payment_method ENUM('cash', 'card', 'digital_wallet') NULL,
        notes TEXT,
        rating INT NULL,
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_status_updates (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        message TEXT,
        updated_by VARCHAR(255),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('order_update', 'token_ready', 'promotional', 'system') NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("📋 All tables created successfully");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    throw err;
  }
}

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.execute("CREATE DATABASE IF NOT EXISTS campuseats");
    await connection.changeUser({ database: "campuseats" });
    await createTables(connection);
    connection.release();
    console.log("🗄️ Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    console.log(
      "⚠️ Server will continue without MySQL - API calls will return errors",
    );
    return false;
  }
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusEats API is running",
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.log("🔄 Starting server without MySQL database...");
    }
    app.listen(PORT, () => {
      console.log(
        `🚀 CampusEats API Server running on http://localhost:${PORT}`,
      );
      if (!dbInitialized) {
        console.log(
          "⚠️ MySQL not available - frontend will use localStorage fallback",
        );
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Helper to generate unique IDs
function generateId(prefix = "") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}_${random}`;
}

// ======================== AUTH ROUTES =========================

// Register User or Shopkeeper
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const id = generateId("user_");

    await pool.execute(
      "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
      [id, email, password, name, role],
    );

    const [users] = await pool.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: `token_${id}_${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login (email + role based)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, role } = req.body;

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND role = ?",
      [email, role],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: `token_${user.id}_${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/shops", async (req, res) => {
  try {
    const { name, description, category, location, phone, image, ownerId } =
      req.body;

    const id = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    await pool.execute(
      `
      INSERT INTO shops (id, name, description, category, location, phone, image, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [id, name, description, category, location, phone, image, ownerId],
    );

    const [shops] = await pool.execute("SELECT * FROM shops WHERE id = ?", [
      id,
    ]);

    res.json({ success: true, data: shops[0] });
  } catch (error) {
    console.error("Create shop error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/api/shops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [shops] = await pool.execute("SELECT * FROM shops WHERE id = ?", [
      id,
    ]);
    if (shops.length === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    res.json({ success: true, data: shops[0] });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/shops/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const [shops] = await pool.execute(
      "SELECT * FROM shops WHERE owner_id = ? AND is_active = TRUE",
      [ownerId],
    );
    res.json({ success: true, data: shops });
  } catch (error) {
    console.error("Get shops by owner error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/shops", async (req, res) => {
  try {
    const [shops] = await pool.execute(
      "SELECT * FROM shops WHERE is_active = TRUE",
    );
    res.json({ success: true, data: shops });
  } catch (error) {
    console.error("Get all shops error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/shops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: set is_active to false
    const [result] = await pool.execute(
      "UPDATE shops SET is_active = FALSE WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }
    res.json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Delete shop error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/menu-items", async (req, res) => {
  try {
    const {
      shop_id,
      name,
      description,
      price,
      image,
      category,
      is_available,
      preparation_time,
      ingredients,
      allergens,
      nutritional_info,
      stock_quantity,
    } = req.body;

    const id = `menu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    await pool.execute(
      `
      INSERT INTO menu_items (
        id, shop_id, name, description, price, image, category,
        is_available, preparation_time, ingredients, allergens,
        nutritional_info, stock_quantity
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        shop_id,
        name,
        description,
        price,
        image,
        category,
        is_available ?? true,
        preparation_time ?? 10,
        JSON.stringify(ingredients || []),
        JSON.stringify(allergens || []),
        JSON.stringify(nutritional_info || {}),
        stock_quantity ?? 50,
      ],
    );

    const [items] = await pool.execute(
      "SELECT * FROM menu_items WHERE id = ?",
      [id],
    );

    res.json({ success: true, data: items[0] });
  } catch (err) {
    console.error("Add menu item error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { user_id, shop_id, items, total_amount, notes } = req.body;

    // Get current max token
    const [rows] = await pool.execute(
      "SELECT MAX(token_number) as max_token FROM orders WHERE shop_id = ? AND DATE(created_at) = CURDATE()",
      [shop_id],
    );
    const token_number = (rows[0].max_token || 0) + 1;

    // Estimate pickup time: now + token_number * 5 min
    const prepMinutes = token_number * 5;
    const pickupTime = new Date(Date.now() + prepMinutes * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.execute(
      `
      INSERT INTO orders (id, user_id, shop_id, items, total_amount, token_number, estimated_pickup_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        user_id,
        shop_id,
        JSON.stringify(items),
        total_amount,
        token_number,
        pickupTime,
        notes,
      ],
    );

    const [result] = await pool.execute("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id],
    );

    const [updated] = await pool.execute("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get("/api/shops/:shopId/orders/pending", async (req, res) => {
  try {
    const { shopId } = req.params;

    const [orders] = await pool.execute(
      `
      SELECT * FROM orders
      WHERE shop_id = ? AND status = 'pending_approval'
      ORDER BY created_at ASC
    `,
      [shopId],
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get pending orders error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    await pool.execute(
      `
      UPDATE orders
      SET status = ?, updated_at = NOW(), notes = IFNULL(?, notes)
      WHERE id = ?
    `,
      [status, rejection_reason || null, id],
    );

    const [result] = await pool.execute("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// View orders for a specific user (student)
app.get("/api/orders", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: "Missing user_id" });
    }

    const [orders] = await pool.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [user_id],
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/shops/:shopId/orders/active", async (req, res) => {
  try {
    const { shopId } = req.params;

    const [orders] = await pool.execute(
      `
      SELECT *
      FROM orders
      WHERE shop_id = ? AND status NOT IN ('fulfilled', 'cancelled')
      ORDER BY token_number ASC
    `,
      [shopId],
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Get active orders error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/shops/:shopId/menu", async (req, res) => {
  try {
    const { shopId } = req.params;
    const [items] = await pool.execute(
      "SELECT * FROM menu_items WHERE shop_id = ? AND is_available = TRUE",
      [shopId],
    );
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/shops/:shopId/menu", async (req, res) => {
  try {
    const { shopId } = req.params;
    const [items] = await pool.execute(
      "SELECT * FROM menu_items WHERE shop_id = ? AND is_available = TRUE",
      [shopId],
    );
    res.json({ success: true, data: items });
  } catch (err) {
    console.error("Fetch menu items error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

startServer();

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await pool.end();
  process.exit(0);
});
