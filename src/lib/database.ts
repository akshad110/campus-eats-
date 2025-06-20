// Database models and interfaces for the CampusEats application

export interface DatabaseUser {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: "student" | "shopkeeper" | "developer";
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DatabaseShop {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  ownerId: string; // references User.id
  isActive: boolean;
  location: string;
  phone?: string;
  openingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  crowdLevel: "low" | "medium" | "high";
  estimatedWaitTime: number;
  activeTokens: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseMenuItem {
  id: string;
  shopId: string; // references Shop.id
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseOrder {
  id: string;
  userId: string; // references User.id
  shopId: string; // references Shop.id
  items: {
    menuItemId: string;
    quantity: number;
    price: number; // price at time of order
    notes?: string;
  }[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "fulfilled"
    | "cancelled";
  tokenNumber: number;
  estimatedPickupTime: string;
  actualPickupTime?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: "cash" | "card" | "digital_wallet";
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseToken {
  id: string;
  shopId: string;
  orderId: string;
  tokenNumber: number;
  status: "active" | "called" | "fulfilled" | "expired";
  estimatedTime: string;
  actualTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order_update" | "token_ready" | "promotional" | "system";
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DatabaseShopAnalytics {
  id: string;
  shopId: string;
  date: string; // YYYY-MM-DD
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averagePreparationTime: number;
  customerRating: number;
  peakHours: string[];
  popularItems: {
    itemId: string;
    quantity: number;
  }[];
  createdAt: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database connection and utility functions
export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      // In a real application, this would connect to MongoDB or your preferred database
      console.log("Connecting to database...");

      // Initialize database tables/collections if they don't exist
      await this.initializeTables();

      this.isConnected = true;
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw new Error("Failed to connect to database");
    }
  }

  private async initializeTables(): Promise<void> {
    // Initialize database schemas/tables
    // In a real app, this would create database tables or MongoDB collections

    const tables = [
      "users",
      "shops",
      "menu_items",
      "orders",
      "tokens",
      "notifications",
      "shop_analytics",
    ];

    for (const table of tables) {
      console.log(`Initializing table: ${table}`);
      // Create table schema here
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log("Database disconnected");
  }
}

// Mock localStorage-based database for development
export class MockDatabase {
  private static getStorageKey(table: string): string {
    return `campuseats_${table}`;
  }

  static async findMany<T>(
    table: string,
    filter: Record<string, any> = {},
  ): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      if (!data) return [];

      const records: T[] = JSON.parse(data);

      if (Object.keys(filter).length === 0) {
        return records;
      }

      return records.filter((record) => {
        return Object.entries(filter).every(
          ([key, value]) => (record as any)[key] === value,
        );
      });
    } catch (error) {
      console.error(`Error finding records in table ${table}:`, error);
      return [];
    }
  }

  static async findById<T>(table: string, id: string): Promise<T | null> {
    const records = await this.findMany<T>(table);
    return records.find((record: any) => record.id === id) || null;
  }

  static async create<T>(
    table: string,
    data:
      | Omit<T, "createdAt" | "updatedAt">
      | Omit<T, "id" | "createdAt" | "updatedAt">,
  ): Promise<T> {
    try {
      const records = await this.findMany<T>(table);

      // Generate ID if not provided
      let recordId =
        "id" in data
          ? (data as any).id
          : `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // For shops with custom IDs, ensure uniqueness
      if (table === "shops" && "id" in data) {
        const existingRecord = records.find(
          (record: any) => record.id === recordId,
        );
        if (existingRecord) {
          console.log(
            `Shop with ID ${recordId} already exists, skipping creation`,
          );
          return existingRecord as T;
        }
      }

      const newRecord = {
        ...data,
        id: recordId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;

      records.push(newRecord);

      // Save to localStorage with better error handling
      try {
        localStorage.setItem(
          this.getStorageKey(table),
          JSON.stringify(records, null, 2),
        );
      } catch (storageError) {
        console.error(
          `Failed to save to localStorage for table ${table}:`,
          storageError,
        );
        throw new Error(`Storage quota exceeded or localStorage unavailable`);
      }

      console.log(`✅ Created new record in ${table}:`, newRecord);
      console.log(`📊 Total records in ${table}:`, records.length);

      // Verify the record was saved correctly
      const verification = await this.findById<T>(table, recordId);
      if (!verification) {
        throw new Error(
          `Failed to verify creation of record ${recordId} in ${table}`,
        );
      }

      return newRecord;
    } catch (error) {
      console.error(`❌ Error creating record in table ${table}:`, error);
      throw error;
    }
  }

  static async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> {
    const records = await this.findMany<T>(table);
    const index = records.findIndex((record: any) => record.id === id);

    if (index === -1) return null;

    const updatedRecord = {
      ...records[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    records[index] = updatedRecord;
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(records));

    return updatedRecord;
  }

  static async delete(table: string, id: string): Promise<boolean> {
    const records = await this.findMany(table);
    const index = records.findIndex((record: any) => record.id === id);

    if (index === -1) return false;

    records.splice(index, 1);
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(records));

    return true;
  }

  static async deleteMany(
    table: string,
    filter: Record<string, any>,
  ): Promise<number> {
    const records = await this.findMany(table);
    const toDelete = records.filter((record) => {
      return Object.entries(filter).every(
        ([key, value]) => (record as any)[key] === value,
      );
    });

    const remaining = records.filter((record) => {
      return !Object.entries(filter).every(
        ([key, value]) => (record as any)[key] === value,
      );
    });

    localStorage.setItem(this.getStorageKey(table), JSON.stringify(remaining));

    return toDelete.length;
  }
}
