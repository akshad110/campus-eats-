import { User, Shop, MenuItem, Order, CartItem } from "./types";
import {
  MockDatabase,
  DatabaseShop,
  DatabaseMenuItem,
  DatabaseUser,
  DatabaseOrder,
} from "./database";

// Use MySQL database for production - localStorage only as fallback
const FORCE_LOCALSTORAGE_MODE = false;
const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  // ==============================================================================
  // AUTHENTICATION API
  // ==============================================================================

  static async login(
    email: string,
    password: string,
    role: User["role"],
  ): Promise<{ user: User; token: string }> {
    console.log("🔄 Using localStorage authentication");
    await this.ensureLocalStorageData();

    // Find or create user in localStorage
    let users = await MockDatabase.findMany<DatabaseUser>("users", {
      email,
      role,
    });

    let user: DatabaseUser;
    if (users.length === 0) {
      // Create new user
      user = await MockDatabase.create<DatabaseUser>("users", {
        email,
        password: "hashed_password", // Mock password
        name: email.split("@")[0],
        role,
        isActive: true,
        phone: "",
      });
    } else {
      user = users[0];
    }

    const token = `token_${user.id}_${Date.now()}`;
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Store user data for easy access
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("auth_token", token);

    return { user: userData, token };
  }

  static async register(
    email: string,
    password: string,
    name: string,
    role: User["role"],
  ): Promise<{ user: User; token: string }> {
    console.log("🔄 Using localStorage registration");
    await this.ensureLocalStorageData();

    // Check if user already exists
    const existingUsers = await MockDatabase.findMany<DatabaseUser>("users", {
      email,
    });

    if (existingUsers.length > 0) {
      throw new Error("User already exists");
    }

    // Create new user
    const user = await MockDatabase.create<DatabaseUser>("users", {
      email,
      password: "hashed_password", // Mock password
      name,
      role,
      isActive: true,
      phone: "",
    });

    const token = `token_${user.id}_${Date.now()}`;
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Store user data for easy access
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("auth_token", token);

    return { user: userData, token };
  }

  // ==============================================================================
  // SHOP API
  // ==============================================================================

  static async getShops(): Promise<Shop[]> {
    if (FORCE_LOCALSTORAGE_MODE) {
      console.log("🏪 Loading shops from localStorage...");
      await this.ensureLocalStorageData();
      const dbShops = await MockDatabase.findMany<DatabaseShop>("shops", {
        isActive: true,
      });
      const shops = dbShops.map(this.convertLocalShopToFrontend);
      console.log(`✅ Loaded ${shops.length} shops from localStorage`);
      return shops;
    } else {
      console.log("🏪 Loading shops from backend API");
      try {
        const response = await fetch(`${API_BASE_URL}/shops`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch shops");
        }
        const dbShops = result.data;
        const shops = dbShops.map((dbShop: any) => ({
          id: dbShop.id,
          name: dbShop.name,
          description: dbShop.description,
          image: dbShop.image || "/placeholder.svg",
          category: dbShop.category,
          ownerId: dbShop.owner_id,
          isActive: dbShop.is_active,
          crowdLevel: dbShop.crowd_level || "low",
          estimatedWaitTime: dbShop.estimated_wait_time || 10,
          activeTokens: dbShop.active_tokens || 0,
          createdAt: dbShop.created_at,
        }));
        console.log(`✅ Loaded ${shops.length} shops from backend API`);
        return shops;
      } catch (error) {
        console.error("❌ Failed to fetch shops from backend:", error);
        return [];
      }
    }
  }

  static async deleteShop(id: string): Promise<boolean> {
    if (FORCE_LOCALSTORAGE_MODE) {
      await this.ensureLocalStorageData();
      return await MockDatabase.delete("shops", id);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/shops/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to delete shop");
        }
        console.log("✅ Shop deleted successfully from backend");
        return true;
      } catch (error) {
        console.error("❌ Failed to delete shop from backend:", error);
        return false;
      }
    }
  }

  static async getShopById(id: string): Promise<Shop | null> {
    if (FORCE_LOCALSTORAGE_MODE) {
      console.log(`🔍 Looking for shop with ID: ${id} in localStorage`);
      await this.ensureLocalStorageData();
      const dbShop = await MockDatabase.findById<DatabaseShop>("shops", id);
      return dbShop ? this.convertLocalShopToFrontend(dbShop) : null;
    } else {
      console.log(`🔍 Fetching shop with ID: ${id} from backend API`);
      try {
        const response = await fetch(`${API_BASE_URL}/shops/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch shop");
        }
        const dbShop = result.data;
        const shop: Shop = {
          id: dbShop.id,
          name: dbShop.name,
          description: dbShop.description,
          image: dbShop.image || "/placeholder.svg",
          category: dbShop.category,
          ownerId: dbShop.owner_id,
          isActive: dbShop.is_active,
          crowdLevel: dbShop.crowd_level || "low",
          estimatedWaitTime: dbShop.estimated_wait_time || 10,
          activeTokens: dbShop.active_tokens || 0,
          createdAt: dbShop.created_at,
        };
        return shop;
      } catch (error) {
        console.error("❌ Failed to fetch shop from backend:", error);
        return null;
      }
    }
  }

  static async createShop(shopData: {
    name: string;
    description: string;
    category: string;
    location: string;
    phone?: string;
    image?: string;
  }): Promise<Shop> {
    if (FORCE_LOCALSTORAGE_MODE) {
      console.log("🏗️ Creating shop in localStorage");
      await this.ensureLocalStorageData();

      // Get user data for owner ID
      const userData = localStorage.getItem("user_data");
      if (!userData) {
        throw new Error("User not logged in");
      }

      const user = JSON.parse(userData);
      const shopId = `shop_${shopData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

      const dbShop = await MockDatabase.create<DatabaseShop>("shops", {
        id: shopId,
        ...shopData,
        location: shopData.location || "Unknown Location",
        ownerId: user.id,
        isActive: true,
        openingHours: {
          monday: { open: "09:00", close: "22:00", isOpen: true },
          tuesday: { open: "09:00", close: "22:00", isOpen: true },
          wednesday: { open: "09:00", close: "22:00", isOpen: true },
          thursday: { open: "09:00", close: "22:00", isOpen: true },
          friday: { open: "09:00", close: "22:00", isOpen: true },
          saturday: { open: "10:00", close: "23:00", isOpen: true },
          sunday: { open: "10:00", close: "21:00", isOpen: true },
        },
        crowdLevel: "low" as const,
        estimatedWaitTime: Math.floor(Math.random() * 15) + 5,
        activeTokens: Math.floor(Math.random() * 5),
        rating: 4 + Math.random() * 1,
        totalRatings: Math.floor(Math.random() * 100) + 50,
      });

      console.log("✅ Shop created successfully:", dbShop.name);

      // Automatically create starter menu items for the new shop
      await this.createStarterMenuItems(shopId, shopData.category);

      return this.convertLocalShopToFrontend(dbShop);
    } else {
      console.log("🏗️ Creating shop in MySQL database");

      // Get user data for owner ID
      const userData = localStorage.getItem("user_data");
      if (!userData) {
        throw new Error("User not logged in");
      }

      const user = JSON.parse(userData);

      try {
        const response = await fetch(`${API_BASE_URL}/shops`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: shopData.name,
            description: shopData.description,
            category: shopData.category,
            location: shopData.location || "Unknown Location",
            phone: shopData.phone || "",
            image: shopData.image || "/placeholder.svg",
            ownerId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to create shop");
        }

        const dbShop = result.data;
        console.log("✅ Shop created successfully in MySQL:", dbShop.name);

        // Convert database format to frontend format
        const shop: Shop = {
          id: dbShop.id,
          name: dbShop.name,
          description: dbShop.description,
          image: dbShop.image || "/placeholder.svg",
          category: dbShop.category,
          ownerId: dbShop.owner_id,
          isActive: dbShop.is_active,
          crowdLevel: dbShop.crowd_level || "low",
          estimatedWaitTime: dbShop.estimated_wait_time || 10,
          activeTokens: dbShop.active_tokens || 0,
          createdAt: dbShop.created_at,
        };

        // Automatically create starter menu items for the new shop
        await this.createStarterMenuItems(dbShop.id, shopData.category);

        return shop;
      } catch (error) {
        console.error("❌ Failed to create shop in MySQL:", error);
        console.log("🔄 Falling back to localStorage...");

        // Fallback to localStorage if MySQL fails
        await this.ensureLocalStorageData();

        // Get user data for owner ID
        const userData = localStorage.getItem("user_data");
        if (!userData) {
          throw new Error("User not logged in");
        }

        const user = JSON.parse(userData);
        const shopId = `shop_${shopData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

        const dbShop = await MockDatabase.create<DatabaseShop>("shops", {
          id: shopId,
          ...shopData,
          location: shopData.location || "Unknown Location",
          ownerId: user.id,
          isActive: true,
          openingHours: {
            monday: { open: "09:00", close: "22:00", isOpen: true },
            tuesday: { open: "09:00", close: "22:00", isOpen: true },
            wednesday: { open: "09:00", close: "22:00", isOpen: true },
            thursday: { open: "09:00", close: "22:00", isOpen: true },
            friday: { open: "09:00", close: "22:00", isOpen: true },
            saturday: { open: "10:00", close: "23:00", isOpen: true },
            sunday: { open: "10:00", close: "21:00", isOpen: true },
          },
          crowdLevel: "low" as const,
          estimatedWaitTime: Math.floor(Math.random() * 15) + 5,
          activeTokens: Math.floor(Math.random() * 5),
          rating: 4 + Math.random() * 1,
          totalRatings: Math.floor(Math.random() * 100) + 50,
        });

        console.log(
          "✅ Shop created successfully in localStorage fallback:",
          dbShop.name,
        );

        // Automatically create starter menu items for the new shop
        await this.createStarterMenuItems(shopId, shopData.category);

        return this.convertLocalShopToFrontend(dbShop);
      }
    }
  }

  static async updateShop(
    id: string,
    shopData: Partial<DatabaseShop>,
  ): Promise<Shop | null> {
    await this.ensureLocalStorageData();
    const dbShop = await MockDatabase.update<DatabaseShop>(
      "shops",
      id,
      shopData,
    );
    return dbShop ? this.convertLocalShopToFrontend(dbShop) : null;
  }

  static async getShopsByOwner(ownerId: string): Promise<Shop[]> {
    if (FORCE_LOCALSTORAGE_MODE) {
      console.log("👤 Loading shops for owner from localStorage:", ownerId);
      await this.ensureLocalStorageData();
      const dbShops = await MockDatabase.findMany<DatabaseShop>("shops", {
        ownerId,
        isActive: true,
      });
      const shops = dbShops.map(this.convertLocalShopToFrontend);
      console.log(`✅ Found ${shops.length} shops for owner`);
      return shops;
    } else {
      console.log("👤 Loading shops for owner from backend API:", ownerId);
      try {
        const response = await fetch(`${API_BASE_URL}/shops/owner/${ownerId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch shops for owner");
        }
        const dbShops = result.data;
        const shops = dbShops.map((dbShop: any) => ({
          id: dbShop.id,
          name: dbShop.name,
          description: dbShop.description,
          image: dbShop.image || "/placeholder.svg",
          category: dbShop.category,
          ownerId: dbShop.owner_id,
          isActive: dbShop.is_active,
          crowdLevel: dbShop.crowd_level || "low",
          estimatedWaitTime: dbShop.estimated_wait_time || 10,
          activeTokens: dbShop.active_tokens || 0,
          createdAt: dbShop.created_at,
        }));
        console.log(`✅ Found ${shops.length} shops for owner`);
        return shops;
      } catch (error) {
        console.error(
          "❌ Failed to fetch shops for owner from backend:",
          error,
        );
        return [];
      }
    }
  }

  // ==============================================================================
  // MENU ITEM API
  // ==============================================================================

  static async getMenuItems(shopId: string): Promise<MenuItem[]> {
    if (FORCE_LOCALSTORAGE_MODE) {
      console.log("🍽️ Loading menu items for shop from localStorage:", shopId);
      await this.ensureLocalStorageData();
      const dbMenuItems = await MockDatabase.findMany<DatabaseMenuItem>(
        "menu_items",
        { shopId },
      );
      const convertedItems = dbMenuItems.map(
        this.convertLocalMenuItemToFrontend,
      );
      console.log(
        `✅ Loaded ${convertedItems.length} menu items from localStorage`,
      );
      return convertedItems;
    } else {
      console.log("🍽️ Loading menu items for shop from backend API:", shopId);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/shops/${shopId}/menu`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch menu items");
        }
        const dbMenuItems = result.data;
        const menuItems = dbMenuItems.map((dbItem: any) => ({
          id: dbItem.id,
          shopId: dbItem.shop_id,
          name: dbItem.name,
          description: dbItem.description,
          price: dbItem.price,
          image: dbItem.image || "/placeholder.svg",
          category: dbItem.category,
          isAvailable: dbItem.is_available,
          preparationTime: dbItem.preparation_time,
          createdAt: dbItem.created_at,
        }));
        console.log(
          `✅ Loaded ${menuItems.length} menu items from backend API`,
        );
        return menuItems;
      } catch (error) {
        console.error("❌ Failed to fetch menu items from backend:", error);
        console.log("🔄 Falling back to localStorage...");
        await this.ensureLocalStorageData();
        const dbMenuItems = await MockDatabase.findMany<DatabaseMenuItem>(
          "menu_items",
          { shopId },
        );
        const convertedItems = dbMenuItems.map(
          this.convertLocalMenuItemToFrontend,
        );
        console.log(
          `✅ Loaded ${convertedItems.length} menu items from localStorage fallback`,
        );
        return convertedItems;
      }
    }
  }

  static async createMenuItem(menuItemData: {
    shopId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    preparationTime: number;
    stockQuantity: number;
    image?: string;
    ingredients?: string[];
    allergens?: string[];
  }): Promise<MenuItem> {
    if (FORCE_LOCALSTORAGE_MODE) {
      await this.ensureLocalStorageData();
      const dbMenuItem = await MockDatabase.create<DatabaseMenuItem>(
        "menu_items",
        {
          ...menuItemData,
          isAvailable: true,
          nutritionalInfo: {},
        },
      );

      console.log("✅ Menu item created:", dbMenuItem.name);
      return this.convertLocalMenuItemToFrontend(dbMenuItem);
    } else {
      console.log("🍽️ Creating menu item in MySQL database");

      try {
        const response = await fetch(`${API_BASE_URL}/menu-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop_id: menuItemData.shopId,
            name: menuItemData.name,
            description: menuItemData.description,
            price: menuItemData.price,
            category: menuItemData.category,
            preparation_time: menuItemData.preparationTime,
            stock_quantity: menuItemData.stockQuantity,
            image: menuItemData.image || "/placeholder.svg",
            ingredients: menuItemData.ingredients || [],
            allergens: menuItemData.allergens || [],
            is_available: true,
            nutritional_info: {},
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to create menu item");
        }

        const dbMenuItem = result.data;
        console.log("✅ Menu item created in MySQL:", dbMenuItem.name);

        // Convert database format to frontend format
        const menuItem: MenuItem = {
          id: dbMenuItem.id,
          shopId: dbMenuItem.shop_id,
          name: dbMenuItem.name,
          description: dbMenuItem.description,
          price: dbMenuItem.price,
          image: dbMenuItem.image || "/placeholder.svg",
          category: dbMenuItem.category,
          isAvailable: dbMenuItem.is_available,
          preparationTime: dbMenuItem.preparation_time,
          createdAt: dbMenuItem.created_at,
        };

        return menuItem;
      } catch (error) {
        console.error("❌ Failed to create menu item in MySQL:", error);
        console.log("🔄 Falling back to localStorage...");

        // Fallback to localStorage if MySQL fails
        await this.ensureLocalStorageData();
        const dbMenuItem = await MockDatabase.create<DatabaseMenuItem>(
          "menu_items",
          {
            ...menuItemData,
            isAvailable: true,
            nutritionalInfo: {},
          },
        );

        console.log(
          "✅ Menu item created in localStorage fallback:",
          dbMenuItem.name,
        );
        return this.convertLocalMenuItemToFrontend(dbMenuItem);
      }
    }
  }

  static async updateMenuItem(
    id: string,
    data: Partial<MenuItem>,
  ): Promise<MenuItem | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update menu item");
      }

      const result = await response.json();
      return {
        id: result.data.id,
        shopId: result.data.shop_id,
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        image: result.data.image,
        category: result.data.category,
        isAvailable: result.data.is_available,
        preparationTime: result.data.preparation_time,
        createdAt: result.data.created_at,
      };
    } catch (error) {
      console.error("❌ Backend update failed, fallback to localStorage");
      await this.ensureLocalStorageData();
      const dbMenuItem = await MockDatabase.update<DatabaseMenuItem>(
        "menu_items",
        id,
        data,
      );
      return dbMenuItem
        ? this.convertLocalMenuItemToFrontend(dbMenuItem)
        : null;
    }
  }

  static async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      return true;
    } catch (error) {
      console.error("❌ Delete failed on backend, fallback to localStorage");
      await this.ensureLocalStorageData();
      return await MockDatabase.delete("menu_items", id);
    }
  }

  // ==============================================================================
  // ORDER API
  // ==============================================================================

  static async createOrder(orderData: {
    shopId: string;
    items: CartItem[];
    notes?: string;
  }): Promise<Order> {
    await this.ensureLocalStorageData();
    const userData = localStorage.getItem("user_data");
    if (!userData) {
      throw new Error("User not logged in");
    }

    const user = JSON.parse(userData);
    const totalAmount = orderData.items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0,
    );

    const tokenNumber = Math.floor(Math.random() * 999) + 1;
    const estimatedPickupTime = new Date(Date.now() + 15 * 60000).toISOString();

    const dbOrder = await MockDatabase.create<DatabaseOrder>("orders", {
      userId: user.id,
      shopId: orderData.shopId,
      items: orderData.items.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
        notes: item.notes,
      })),
      totalAmount,
      status: "pending",
      tokenNumber,
      estimatedPickupTime,
      paymentStatus: "pending",
      notes: orderData.notes,
    });

    console.log("✅ Order created:", dbOrder.tokenNumber);
    return this.convertLocalOrderToFrontend(dbOrder);
  }

  static async getOrdersByUser(userId: string): Promise<Order[]> {
    await this.ensureLocalStorageData();
    const dbOrders = await MockDatabase.findMany<DatabaseOrder>("orders", {
      userId,
    });
    return dbOrders.map(this.convertLocalOrderToFrontend);
  }

  static async getOrdersByShop(shopId: string): Promise<Order[]> {
    await this.ensureLocalStorageData();
    const dbOrders = await MockDatabase.findMany<DatabaseOrder>("orders", {
      shopId,
    });
    return dbOrders.map(this.convertLocalOrderToFrontend);
  }

  static async getOrderById(id: string): Promise<Order | null> {
    console.log("🔍 Getting order by ID:", id);
    await this.ensureLocalStorageData();
    const dbOrder = await MockDatabase.findById<DatabaseOrder>("orders", id);
    return dbOrder ? this.convertLocalOrderToFrontend(dbOrder) : null;
  }

  static async updateOrderStatus(
    id: string,
    status: string,
    additionalData?: any,
  ): Promise<Order | null> {
    await this.ensureLocalStorageData();
    const updateData: any = { status };

    if (additionalData?.estimatedPreparationTime) {
      const pickupTime = new Date(
        Date.now() + additionalData.estimatedPreparationTime * 60000,
      );
      updateData.estimatedPickupTime = pickupTime.toISOString();
    }

    const dbOrder = await MockDatabase.update<DatabaseOrder>(
      "orders",
      id,
      updateData,
    );
    return dbOrder ? this.convertLocalOrderToFrontend(dbOrder) : null;
  }

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  static async initializeMockData(forceReset: boolean = false): Promise<void> {
    console.log("🔄 Initializing localStorage data...");
    await this.ensureLocalStorageData();
    console.log("✅ LocalStorage initialized successfully");
  }

  static async createFallbackShops(): Promise<void> {
    console.log(
      "ℹ️ Fallback shops are created automatically by ensureLocalStorageData",
    );
  }

  static async resetAllData(): Promise<void> {
    const tables = ["shops", "menu_items", "users", "orders"];
    for (const table of tables) {
      localStorage.removeItem(`campuseats_${table}`);
    }
    console.log("✅ All localStorage data cleared");
  }

  private static async createStarterMenuItems(
    shopId: string,
    category: string,
  ): Promise<void> {
    console.log(`🍽️ Creating starter menu items for ${shopId} (${category})`);

    // Define starter menu items based on shop category
    const starterMenus: Record<string, any[]> = {
      "Fast Food": [
        {
          name: "Classic Burger",
          description:
            "Juicy beef patty with lettuce, tomato, and special sauce",
          price: 8.99,
          category: "Burgers",
          preparationTime: 10,
          stockQuantity: 50,
        },
        {
          name: "Crispy Fries",
          description: "Golden crispy potato fries",
          price: 3.99,
          category: "Sides",
          preparationTime: 5,
          stockQuantity: 100,
        },
        {
          name: "Soft Drink",
          description: "Refreshing cold beverage",
          price: 1.99,
          category: "Beverages",
          preparationTime: 1,
          stockQuantity: 200,
        },
      ],
      Italian: [
        {
          name: "Margherita Pizza",
          description: "Fresh tomatoes, mozzarella, and basil",
          price: 12.99,
          category: "Pizzas",
          preparationTime: 15,
          stockQuantity: 30,
        },
        {
          name: "Caesar Salad",
          description: "Crisp romaine lettuce with parmesan and croutons",
          price: 7.99,
          category: "Salads",
          preparationTime: 5,
          stockQuantity: 40,
        },
        {
          name: "Garlic Bread",
          description: "Toasted bread with garlic and herbs",
          price: 4.99,
          category: "Appetizers",
          preparationTime: 8,
          stockQuantity: 60,
        },
      ],
      "Healthy Food": [
        {
          name: "Green Smoothie",
          description: "Spinach, banana, apple, and honey blend",
          price: 5.99,
          category: "Beverages",
          preparationTime: 3,
          stockQuantity: 50,
        },
        {
          name: "Quinoa Bowl",
          description: "Nutritious quinoa with fresh vegetables",
          price: 9.99,
          category: "Bowls",
          preparationTime: 8,
          stockQuantity: 30,
        },
        {
          name: "Protein Bar",
          description: "High-protein energy bar",
          price: 3.49,
          category: "Snacks",
          preparationTime: 1,
          stockQuantity: 100,
        },
      ],
    };

    // Default menu items for any category not specifically defined
    const defaultItems = [
      {
        name: "Signature Dish",
        description: "Our chef's special recommendation",
        price: 10.99,
        category: "Specialties",
        preparationTime: 12,
        stockQuantity: 25,
      },
      {
        name: "House Beverage",
        description: "Refreshing drink of the house",
        price: 2.99,
        category: "Beverages",
        preparationTime: 2,
        stockQuantity: 75,
      },
    ];

    const menuItems = starterMenus[category] || defaultItems;

    // Create each menu item
    for (const item of menuItems) {
      try {
        await this.createMenuItem({
          shopId,
          ...item,
          ingredients: [],
          allergens: [],
        });
        console.log(`✅ Created menu item: ${item.name}`);
      } catch (error) {
        console.error(`❌ Failed to create menu item ${item.name}:`, error);
      }
    }

    console.log(`✅ Starter menu created for shop ${shopId}`);
  }

  // ==============================================================================
  // DATA CONVERSION HELPERS
  // ==============================================================================

  private static convertLocalShopToFrontend(dbShop: DatabaseShop): Shop {
    return {
      id: dbShop.id,
      name: dbShop.name,
      description: dbShop.description,
      image: dbShop.image || "/placeholder.svg",
      category: dbShop.category,
      ownerId: dbShop.ownerId,
      isActive: dbShop.isActive,
      crowdLevel: dbShop.crowdLevel || "low",
      estimatedWaitTime: dbShop.estimatedWaitTime || 10,
      activeTokens: dbShop.activeTokens || 0,
      createdAt: dbShop.createdAt,
    };
  }

  private static convertLocalMenuItemToFrontend(
    dbMenuItem: DatabaseMenuItem,
  ): MenuItem {
    return {
      id: dbMenuItem.id,
      shopId: dbMenuItem.shopId,
      name: dbMenuItem.name,
      description: dbMenuItem.description,
      price: dbMenuItem.price,
      image: dbMenuItem.image || "/placeholder.svg",
      category: dbMenuItem.category,
      isAvailable: dbMenuItem.isAvailable,
      preparationTime: dbMenuItem.preparationTime || 10,
      createdAt: dbMenuItem.createdAt,
    };
  }

  private static convertLocalOrderToFrontend(dbOrder: DatabaseOrder): Order {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId,
      shopId: dbOrder.shopId,
      items: dbOrder.items.map((item: any) => ({
        menuItem: {
          id: item.menuItemId,
          shopId: dbOrder.shopId,
          name: "Item",
          description: "",
          price: item.price,
          image: "/placeholder.svg",
          category: "",
          isAvailable: true,
          preparationTime: 10,
          createdAt: "",
        },
        quantity: item.quantity,
        notes: item.notes,
      })),
      totalAmount: dbOrder.totalAmount,
      status: dbOrder.status,
      tokenNumber: dbOrder.tokenNumber,
      estimatedPickupTime: dbOrder.estimatedPickupTime,
      actualPickupTime: dbOrder.actualPickupTime,
      notes: dbOrder.notes,
      createdAt: dbOrder.createdAt,
    };
  }

  private static async ensureLocalStorageData(): Promise<void> {
    // Do not create any fallback data - let the app start with empty shops
    console.log("✅ LocalStorage initialized without fallback data");
    return;
  }

  private static async createLocalStorageFallbackData(): Promise<void> {
    try {
      // Create fallback owner
      const ownerId = `user_${Date.now()}_fallback`;
      await MockDatabase.create<DatabaseUser>("users", {
        email: "fallback@campuseats.com",
        password: "hashed_password",
        name: "Fallback Owner",
        role: "shopkeeper",
        isActive: true,
        phone: "+1-555-FALLBACK",
      });

      // Create fallback shops - empty array means no mock shops will be created
      const fallbackShops = [];

      for (const shopData of fallbackShops) {
        await MockDatabase.create<DatabaseShop>("shops", {
          ...shopData,
          ownerId,
          isActive: true,
          openingHours: {
            monday: { open: "09:00", close: "22:00", isOpen: true },
            tuesday: { open: "09:00", close: "22:00", isOpen: true },
            wednesday: { open: "09:00", close: "22:00", isOpen: true },
            thursday: { open: "09:00", close: "22:00", isOpen: true },
            friday: { open: "09:00", close: "22:00", isOpen: true },
            saturday: { open: "10:00", close: "23:00", isOpen: true },
            sunday: { open: "10:00", close: "21:00", isOpen: true },
          },
          crowdLevel: "low" as const,
          estimatedWaitTime: Math.floor(Math.random() * 15) + 5,
          activeTokens: Math.floor(Math.random() * 5),
          rating: 4 + Math.random() * 1,
          totalRatings: Math.floor(Math.random() * 100) + 50,
        });

        // Create sample menu items
        await this.createLocalStorageMenuItems(shopData.id);
      }

      console.log("✅ LocalStorage fallback data created");
    } catch (error) {
      console.error("❌ Failed to create localStorage fallback data:", error);
    }
  }

  private static async createLocalStorageMenuItems(
    shopId: string,
  ): Promise<void> {
    const menuItemsMap: Record<string, any[]> = {
      shop_healthy_bites: [
        {
          name: "Caesar Salad",
          description: "Crisp romaine, parmesan, croutons",
          price: 9.99,
          category: "Salads",
          preparationTime: 5,
        },
        {
          name: "Green Smoothie",
          description: "Spinach, banana, apple, honey",
          price: 6.99,
          category: "Beverages",
          preparationTime: 3,
        },
      ],
      shop_pizza_corner: [
        {
          name: "Margherita Pizza",
          description: "Fresh tomatoes, mozzarella, basil",
          price: 12.99,
          category: "Pizzas",
          preparationTime: 15,
        },
        {
          name: "Pepperoni Pizza",
          description: "Pepperoni, mozzarella, tomato sauce",
          price: 14.99,
          category: "Pizzas",
          preparationTime: 15,
        },
      ],
      shop_burger_palace: [
        {
          name: "Classic Burger",
          description: "Beef patty, lettuce, tomato, cheese",
          price: 11.99,
          category: "Burgers",
          preparationTime: 12,
        },
        {
          name: "Crispy Fries",
          description: "Golden crispy potato fries",
          price: 4.99,
          category: "Sides",
          preparationTime: 8,
        },
      ],
    };

    const items = menuItemsMap[shopId] || [];
    for (const item of items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await MockDatabase.create<DatabaseMenuItem>("menu_items", {
        ...item,
        shopId,
        isAvailable: true,
        nutritionalInfo: {},
      });
    }
  }
}

export { ApiService };
