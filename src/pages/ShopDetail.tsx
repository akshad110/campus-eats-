import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import MenuItemCard from "@/components/MenuItemCard";
import ShoppingCartSidebar from "@/components/ShoppingCartSidebar";
import { ApiService } from "@/lib/api";
import { Shop, MenuItem } from "@/lib/types";

const ShopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal } =
    useCart();
  const { user } = useSimpleAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Real data state
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load shop and menu data
  useEffect(() => {
    const loadShopData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load shop details and menu items in parallel
        const [shopData, menuData] = await Promise.all([
          ApiService.getShopById(id),
          ApiService.getMenuItems(id)
        ]);

        if (!shopData) {
          setError("Shop not found");
          return;
        }

        setShop(shopData);
        setMenuItems(menuData);
        console.log("✅ Loaded shop and menu data:", shopData.name, menuData.length);
      } catch (error) {
        console.error("❌ Failed to load shop data:", error);
        setError("Failed to load shop data");
      } finally {
        setIsLoading(false);
      }
    };

    loadShopData();
  }, [id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading shop details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The shop you're looking for doesn't exist."}</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

// Mock menu data
const mockMenus = {
  "1": [
    {
      id: "item_1_1",
      shopId: "1",
      name: "Espresso",
      description: "Rich and bold Italian espresso shot",
      price: 2.5,
      image: "/placeholder.svg",
      category: "Coffee",
      preparationTime: 2,
      isAvailable: true,
    },
    {
      id: "item_1_2",
      shopId: "1",
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam art",
      price: 4.25,
      image: "/placeholder.svg",
      category: "Coffee",
      preparationTime: 3,
      isAvailable: true,
    },
    {
      id: "item_1_3",
      shopId: "1",
      name: "Iced Latte",
      description: "Smooth espresso with cold milk over ice",
      price: 4.75,
      image: "/placeholder.svg",
      category: "Coffee",
      preparationTime: 2,
      isAvailable: true,
    },
    {
      id: "item_1_4",
      shopId: "1",
      name: "Croissant",
      description: "Buttery, flaky French pastry",
      price: 3.75,
      image: "/placeholder.svg",
      category: "Pastries",
      preparationTime: 1,
      isAvailable: true,
    },
    {
      id: "item_1_5",
      shopId: "1",
      name: "Blueberry Muffin",
      description: "Fresh baked muffin with wild blueberries",
      price: 4.5,
      image: "/placeholder.svg",
      category: "Pastries",
      preparationTime: 1,
      isAvailable: true,
    },
    {
      id: "item_1_6",
      shopId: "1",
      name: "Avocado Toast",
      description: "Multigrain bread with fresh avocado and seasoning",
      price: 7.95,
      image: "/placeholder.svg",
      category: "Food",
      preparationTime: 5,
      isAvailable: true,
    },
  ],
  "2": [
    {
      id: "item_2_1",
      shopId: "2",
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella, and basil on thin crust",
      price: 12.99,
      image: "/placeholder.svg",
      category: "Pizza",
      preparationTime: 15,
      isAvailable: true,
    },
    {
      id: "item_2_2",
      shopId: "2",
      name: "Pepperoni Pizza",
      description: "Classic pepperoni with mozzarella cheese",
      price: 14.99,
      image: "/placeholder.svg",
      category: "Pizza",
      preparationTime: 15,
      isAvailable: true,
    },
    {
      id: "item_2_3",
      shopId: "2",
      name: "Supreme Pizza",
      description: "Pepperoni, sausage, peppers, onions, mushrooms",
      price: 17.99,
      image: "/placeholder.svg",
      category: "Pizza",
      preparationTime: 18,
      isAvailable: true,
    },
    {
      id: "item_2_4",
      shopId: "2",
      name: "Caesar Salad",
      description: "Crisp romaine, parmesan, croutons, caesar dressing",
      price: 8.99,
      image: "/placeholder.svg",
      category: "Salads",
      preparationTime: 5,
      isAvailable: true,
    },
    {
      id: "item_2_5",
      shopId: "2",
      name: "Garlic Bread",
      description: "Toasted bread with garlic butter and herbs",
      price: 5.99,
      image: "/placeholder.svg",
      category: "Appetizers",
      preparationTime: 8,
      isAvailable: true,
    },
  ],
  "3": [
    {
      id: "item_3_1",
      shopId: "3",
      name: "Green Smoothie",
      description: "Spinach, banana, apple, honey, and coconut water",
      price: 6.99,
      image: "/placeholder.svg",
      category: "Smoothies",
      preparationTime: 3,
      isAvailable: true,
    },
    {
      id: "item_3_2",
      shopId: "3",
      name: "Quinoa Bowl",
      description: "Quinoa with roasted vegetables and tahini dressing",
      price: 10.99,
      image: "/placeholder.svg",
      category: "Bowls",
      preparationTime: 8,
      isAvailable: true,
    },
    {
      id: "item_3_3",
      shopId: "3",
      name: "Acai Bowl",
      description: "Acai with granola, berries, and coconut flakes",
      price: 9.99,
      image: "/placeholder.svg",
      category: "Bowls",
      preparationTime: 5,
      isAvailable: true,
    },
  ],
};

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { user, logout } = useSimpleAuth();
  const { cartItemCount, setCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const shop = shopId ? mockShops[shopId as keyof typeof mockShops] : null;
  const menu = shopId ? mockMenus[shopId as keyof typeof mockMenus] || [] : [];

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Shop Not Found</h2>
            <p className="text-gray-600 mb-4">
              The restaurant you're looking for doesn't exist.
            </p>
            <Link to="/dashboard">
              <Button>Back to Restaurants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique categories
  const categories = ["All", ...new Set(menu.map((item) => item.category))];

  // Filter menu by category
  const filteredMenu =
    selectedCategory === "All"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🍕</span>
                </div>
                <h1 className="text-xl font-bold">CampusEats</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Shop Info Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Shop Image */}
            <div className="md:w-1/3">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-64 md:h-48 object-cover rounded-lg"
              />
            </div>

            {/* Shop Details */}
            <div className="md:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {shop.name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {shop.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📍 {shop.location}</span>
                    <span>📞 {shop.phone}</span>
                    <span>🕒 {shop.openingHours}</span>
                  </div>
                </div>
                <Badge className={shop.isOpen ? "bg-green-500" : "bg-red-500"}>
                  {shop.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ⭐ {shop.rating}
                  </div>
                  <p className="text-sm text-gray-600">
                    {shop.totalRatings} reviews
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {shop.estimatedWaitTime} min
                  </div>
                  <p className="text-sm text-gray-600">Est. wait time</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {shop.category}
                  </div>
                  <p className="text-sm text-gray-600">Cuisine type</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Menu Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Menu</h2>
            {!shop.isOpen && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Restaurant is currently closed
              </Badge>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {filteredMenu.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((menuItem) => (
                <MenuItemCard
                  key={menuItem.id}
                  menuItem={menuItem}
                  disabled={!shop.isOpen}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar />
    </div>
  );
};

export default ShopDetail;