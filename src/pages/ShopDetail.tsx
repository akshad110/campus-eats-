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
          ApiService.getMenuItems(id),
        ]);

        if (!shopData) {
          setError("Shop not found");
          return;
        }

        setShop(shopData);
        setMenuItems(menuData);
        console.log(
          "✅ Loaded shop and menu data:",
          shopData.name,
          menuData.length,
        );
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shop Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The shop you're looking for doesn't exist."}
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const filteredItems = menuItems.filter((item) => {
    return selectedCategory === "All" || item.category === selectedCategory;
  });

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← Back to Shops
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">
                  Hello, {user.name}!
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Shop Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full md:w-32 h-32 object-cover rounded-lg"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {shop.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{shop.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">Category:</span>
                      <Badge variant="secondary" className="ml-2">
                        {shop.category}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Wait Time:</span>
                      <span className="ml-2">{shop.estimatedWaitTime} min</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Active Orders:</span>
                      <span className="ml-2">{shop.activeTokens}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    className={
                      shop.isActive
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {shop.isActive ? "Open" : "Closed"}
                  </Badge>

                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">4.5 (128 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
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
        </div>

        {/* Menu Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={(item, quantity) => addToCart(item, quantity)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              {selectedCategory === "All"
                ? "This shop doesn't have any menu items yet."
                : `No items found in the "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        cartTotal={cartTotal}
        shopId={id || ""}
      />
    </div>
  );
};

export default ShopDetail;
