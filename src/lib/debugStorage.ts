// Debug utility to inspect localStorage data

export class StorageDebugger {
  static inspectStorage() {
    console.log("=== LOCALSTORAGE INSPECTION ===");

    const campusEatsKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("campuseats_")) {
        campusEatsKeys.push(key);
      }
    }

    console.log("CampusEats keys found:", campusEatsKeys);

    campusEatsKeys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log(`${key}:`, parsed);
          if (Array.isArray(parsed)) {
            console.log(`${key} count:`, parsed.length);
          }
        }
      } catch (error) {
        console.error(`Error parsing ${key}:`, error);
      }
    });

    console.log("=== END STORAGE INSPECTION ===");
  }

  static clearCampusEatsData() {
    console.log("=== CLEARING CAMPUSEATS DATA ===");

    const campusEatsKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("campuseats_")) {
        campusEatsKeys.push(key);
      }
    }

    campusEatsKeys.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });

    console.log("=== DATA CLEARED ===");
  }

  static createTestShops() {
    console.log("=== CREATING TEST SHOPS ===");

    // Clear existing data first
    this.clearCampusEatsData();

    // Create test shops
    const testShops = [
      {
        id: "test_shop_1",
        name: "Test Burger Place",
        description: "A test burger shop",
        category: "Fast Food",
        ownerId: "test_owner_1",
        isActive: true,
        location: "Test Location",
        phone: "+1-555-TEST",
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
        estimatedWaitTime: 10,
        activeTokens: 3,
        rating: 4.5,
        totalRatings: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "test_shop_2",
        name: "Test Pizza Corner",
        description: "A test pizza shop",
        category: "Italian",
        ownerId: "test_owner_1",
        isActive: true,
        location: "Test Location 2",
        phone: "+1-555-TEST2",
        openingHours: {
          monday: { open: "09:00", close: "22:00", isOpen: true },
          tuesday: { open: "09:00", close: "22:00", isOpen: true },
          wednesday: { open: "09:00", close: "22:00", isOpen: true },
          thursday: { open: "09:00", close: "22:00", isOpen: true },
          friday: { open: "09:00", close: "22:00", isOpen: true },
          saturday: { open: "10:00", close: "23:00", isOpen: true },
          sunday: { open: "10:00", close: "21:00", isOpen: true },
        },
        crowdLevel: "medium" as const,
        estimatedWaitTime: 15,
        activeTokens: 8,
        rating: 4.3,
        totalRatings: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(
      "campuseats_shops",
      JSON.stringify(testShops, null, 2),
    );
    console.log("Test shops created:", testShops);

    // Create test menu items
    const testMenuItems = [
      {
        id: "test_item_1",
        shopId: "test_shop_1",
        name: "Test Burger",
        description: "A delicious test burger",
        price: 9.99,
        category: "Burgers",
        isAvailable: true,
        preparationTime: 12,
        stockQuantity: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "test_item_2",
        shopId: "test_shop_2",
        name: "Test Pizza",
        description: "A delicious test pizza",
        price: 12.99,
        category: "Pizza",
        isAvailable: true,
        preparationTime: 15,
        stockQuantity: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(
      "campuseats_menu_items",
      JSON.stringify(testMenuItems, null, 2),
    );
    console.log("Test menu items created:", testMenuItems);

    console.log("=== TEST DATA CREATED ===");
  }
}

// Make it available globally for easy debugging
(window as any).StorageDebugger = StorageDebugger;
