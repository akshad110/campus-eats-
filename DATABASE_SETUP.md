# CampusEats Database Setup Guide

## Why Use Database Instead of localStorage?

**Problems with localStorage:**

- ❌ Data doesn't persist across different machines/browsers
- ❌ No real data sharing between users
- ❌ Not suitable for production
- ❌ Fresh installs show empty data

**Benefits of MySQL Database:**

- ✅ Data persists across all users and machines
- ✅ Real multi-user support
- ✅ Production-ready
- ✅ Proper data relationships and integrity

## Quick Setup (Ubuntu/Debian)

### 1. Run the Setup Script

```bash
chmod +x setup-mysql.sh
./setup-mysql.sh
```

### 2. Start the Full Application

```bash
npm run dev:full
```

## Manual Setup

### 1. Install MySQL

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database and User

```bash
sudo mysql
```

```sql
CREATE DATABASE campuseats;
CREATE USER 'campuseats'@'localhost' IDENTIFIED BY 'campuseats123';
GRANT ALL PRIVILEGES ON campuseats.* TO 'campuseats'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

### 4. Start the Application

```bash
# Start backend server
npm run dev:server

# In another terminal, start frontend
npm run dev

# Or start both together
npm run dev:full
```

## Troubleshooting

### "Failed to fetch" errors:

- **Check if MySQL is running**: `sudo systemctl status mysql`
- **Check if backend is running**: `curl http://localhost:3001/`
- **Check database connection**: Look at server logs for MySQL errors

### Fresh install shows no data:

- This is normal! The database starts empty
- Create shops and menu items through the UI
- Data will persist across sessions and machines

### Cannot connect to database:

1. Verify MySQL is running: `sudo systemctl start mysql`
2. Check credentials in `.env` file
3. Test connection: `mysql -u campuseats -p campuseats`

## Development vs Production

### Development Mode:

- Uses `FORCE_LOCALSTORAGE_MODE=false` (database)
- Backend server runs on localhost:3001
- MySQL database for data persistence

### Fallback Mode:

- If database fails, app automatically falls back to localStorage
- Useful for development when database is not set up
- Set `FORCE_LOCALSTORAGE_MODE=true` in `src/lib/api.ts`

## Database Schema

The application creates these tables automatically:

- `users` - User accounts (students, shopkeepers, developers)
- `shops` - Restaurant/shop information
- `menu_items` - Items available in each shop
- `orders` - Customer orders with status tracking
- `order_status_updates` - Order status change history
- `notifications` - User notifications

## API Endpoints

### Authentication:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Shops:

- `GET /api/shops` - Get all active shops
- `POST /api/shops` - Create new shop
- `GET /api/shops/:id` - Get shop by ID
- `GET /api/shops/owner/:ownerId` - Get shops by owner
- `DELETE /api/shops/:id` - Delete shop

### Menu Items:

- `GET /api/shops/:shopId/menu` - Get menu items for shop
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item

### Orders:

- `POST /api/orders` - Create new order
- `GET /api/orders?user_id=:userId` - Get user orders
- `GET /api/shops/:shopId/orders/pending` - Get pending orders for shop
- `PUT /api/orders/:id/status` - Update order status
