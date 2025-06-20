import { MockDatabase } from "./database";
import { DatabaseShop, DatabaseMenuItem, DatabaseUser } from "./database";

export const manuallyCreateMenuItems = async () => {
  console.log("Starting manual menu creation...");

  // Get all shops
  const shops = await MockDatabase.findMany<DatabaseShop>("shops");
  console.log("Found shops:", shops);

  if (shops.length === 0) {
    console.log("No shops found, creating shops first...");

    // Create a mock owner first
    const mockOwner = await MockDatabase.create<DatabaseUser>("users", {
      email: "owner@example.com",
      password: "hashed_password",
      name: "Mock Owner",
      role: "shopkeeper",
      isActive: true,
      phone: "+1-555-0100",
    });

    // Create Healthy Bites shop
    const healthyBites = await MockDatabase.create<DatabaseShop>("shops", {
      name: "Healthy Bites",
      description: "Fresh salads, smoothies, and healthy options",
      category: "Healthy Food",
      location: "Building A, Floor 1",
      phone: "+1-555-0101",
      ownerId: mockOwner.id,
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
      crowdLevel: "low",
      estimatedWaitTime: 5,
      activeTokens: 3,
      rating: 4.8,
      totalRatings: 120,
    });

    console.log("Created Healthy Bites shop:", healthyBites);

    // Create menu items for Healthy Bites
    const healthyBitesMenuItems = [
      {
        name: "Caesar Salad",
        description:
          "Crisp romaine lettuce, parmesan cheese, croutons, and caesar dressing",
        price: 9.99,
        category: "Salads",
        preparationTime: 5,
        ingredients: [
          "romaine lettuce",
          "parmesan cheese",
          "croutons",
          "caesar dressing",
        ],
        stockQuantity: 25,
      },
      {
        name: "Green Smoothie",
        description:
          "Fresh spinach, banana, apple, and honey blended to perfection",
        price: 6.99,
        category: "Beverages",
        preparationTime: 3,
        ingredients: ["spinach", "banana", "apple", "honey"],
        stockQuantity: 30,
      },
      {
        name: "Quinoa Bowl",
        description: "Quinoa with avocado, cherry tomatoes, and feta cheese",
        price: 12.99,
        category: "Bowls",
        preparationTime: 8,
        ingredients: ["quinoa", "avocado", "cherry tomatoes", "feta cheese"],
        stockQuantity: 20,
      },
      {
        name: "Greek Salad",
        description: "Fresh tomatoes, cucumber, olives, and feta cheese",
        price: 8.99,
        category: "Salads",
        preparationTime: 5,
        ingredients: ["tomatoes", "cucumber", "olives", "feta cheese"],
        stockQuantity: 22,
      },
      {
        name: "Protein Smoothie",
        description: "Protein powder, berries, and almond milk",
        price: 7.99,
        category: "Beverages",
        preparationTime: 3,
        ingredients: ["protein powder", "berries", "almond milk"],
        stockQuantity: 25,
      },
    ];

    for (const itemData of healthyBitesMenuItems) {
      const menuItem = await MockDatabase.create<DatabaseMenuItem>(
        "menu_items",
        {
          ...itemData,
          shopId: healthyBites.id,
          isAvailable: true,
        },
      );
      console.log("Created menu item:", menuItem);
    }

    // Create Pizza Corner
    const pizzaCorner = await MockDatabase.create<DatabaseShop>("shops", {
      name: "Pizza Corner",
      description: "Authentic Italian pizzas made fresh",
      category: "Italian",
      location: "Food Court, Section B",
      phone: "+1-555-0102",
      ownerId: mockOwner.id,
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
      crowdLevel: "medium",
      estimatedWaitTime: 12,
      activeTokens: 8,
      rating: 4.6,
      totalRatings: 95,
    });

    const pizzaMenuItems = [
      {
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella cheese, and basil",
        price: 12.99,
        category: "Pizzas",
        preparationTime: 12,
        ingredients: ["tomatoes", "mozzarella", "basil", "pizza dough"],
        stockQuantity: 15,
      },
      {
        name: "Pepperoni Pizza",
        description: "Pepperoni slices with mozzarella cheese and tomato sauce",
        price: 14.99,
        category: "Pizzas",
        preparationTime: 12,
        ingredients: ["pepperoni", "mozzarella", "tomato sauce", "pizza dough"],
        stockQuantity: 18,
      },
      {
        name: "Garlic Bread",
        description: "Fresh baked bread with garlic butter",
        price: 4.99,
        category: "Sides",
        preparationTime: 5,
        ingredients: ["bread", "garlic", "butter"],
        stockQuantity: 30,
      },
    ];

    for (const itemData of pizzaMenuItems) {
      const menuItem = await MockDatabase.create<DatabaseMenuItem>(
        "menu_items",
        {
          ...itemData,
          shopId: pizzaCorner.id,
          isAvailable: true,
        },
      );
      console.log("Created pizza menu item:", menuItem);
    }

    console.log("Manual menu creation completed!");
    return true;
  }

  // Check if menu items already exist
  const existingMenuItems =
    await MockDatabase.findMany<DatabaseMenuItem>("menu_items");
  console.log("Existing menu items:", existingMenuItems.length);

  if (existingMenuItems.length === 0) {
    console.log("No menu items found, creating them...");

    // Create menu items for each shop
    for (const shop of shops) {
      console.log(`Creating menu items for shop: ${shop.name}`);

      let menuItems: any[] = [];

      if (shop.name === "Healthy Bites") {
        menuItems = [
          {
            name: "Caesar Salad",
            description:
              "Crisp romaine lettuce, parmesan cheese, croutons, and caesar dressing",
            price: 9.99,
            category: "Salads",
            preparationTime: 5,
            ingredients: [
              "romaine lettuce",
              "parmesan cheese",
              "croutons",
              "caesar dressing",
            ],
            stockQuantity: 25,
          },
          {
            name: "Green Smoothie",
            description:
              "Fresh spinach, banana, apple, and honey blended to perfection",
            price: 6.99,
            category: "Beverages",
            preparationTime: 3,
            ingredients: ["spinach", "banana", "apple", "honey"],
            stockQuantity: 30,
          },
          {
            name: "Quinoa Bowl",
            description:
              "Quinoa with avocado, cherry tomatoes, and feta cheese",
            price: 12.99,
            category: "Bowls",
            preparationTime: 8,
            ingredients: [
              "quinoa",
              "avocado",
              "cherry tomatoes",
              "feta cheese",
            ],
            stockQuantity: 20,
          },
          {
            name: "Greek Salad",
            description: "Fresh tomatoes, cucumber, olives, and feta cheese",
            price: 8.99,
            category: "Salads",
            preparationTime: 5,
            ingredients: ["tomatoes", "cucumber", "olives", "feta cheese"],
            stockQuantity: 22,
          },
        ];
      } else if (shop.name === "Pizza Corner") {
        menuItems = [
          {
            name: "Margherita Pizza",
            description: "Fresh tomatoes, mozzarella cheese, and basil",
            price: 12.99,
            category: "Pizzas",
            preparationTime: 12,
            ingredients: ["tomatoes", "mozzarella", "basil", "pizza dough"],
            stockQuantity: 15,
          },
          {
            name: "Pepperoni Pizza",
            description:
              "Pepperoni slices with mozzarella cheese and tomato sauce",
            price: 14.99,
            category: "Pizzas",
            preparationTime: 12,
            ingredients: [
              "pepperoni",
              "mozzarella",
              "tomato sauce",
              "pizza dough",
            ],
            stockQuantity: 18,
          },
          {
            name: "Garlic Bread",
            description: "Fresh baked bread with garlic butter",
            price: 4.99,
            category: "Sides",
            preparationTime: 5,
            ingredients: ["bread", "garlic", "butter"],
            stockQuantity: 30,
          },
        ];
      } else {
        // Generic menu items for other shops
        menuItems = [
          {
            name: "House Special",
            description: "Chef's recommended dish",
            price: 11.99,
            category: "Main Course",
            preparationTime: 10,
            ingredients: ["special ingredients"],
            stockQuantity: 20,
          },
          {
            name: "Fresh Drink",
            description: "Refreshing beverage",
            price: 3.99,
            category: "Beverages",
            preparationTime: 2,
            ingredients: ["fresh ingredients"],
            stockQuantity: 25,
          },
        ];
      }

      for (const itemData of menuItems) {
        const menuItem = await MockDatabase.create<DatabaseMenuItem>(
          "menu_items",
          {
            ...itemData,
            shopId: shop.id,
            isAvailable: true,
          },
        );
        console.log(`Created menu item for ${shop.name}:`, menuItem);
      }
    }
  }

  console.log("Manual menu initialization completed!");
  return true;
};
