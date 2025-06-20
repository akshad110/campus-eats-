import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import ShopService, { Shop } from "@/lib/shopService";
import { ConnectionStatusBanner } from "@/components/ConnectionStatusBanner";

const UserDashboard = () => {
  const { user, logout } = useSimpleAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const allShops = await ShopService.getShops();
        setShops(allShops);
      } catch (error) {
        console.error("Error fetching shops:", error);
        // Set empty array as fallback to prevent further errors
        setShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  const categories = ["All", ...new Set(shops.map((shop) => shop.category))];

  const filteredShops =
    selectedCategory === "All"
      ? shops
      : shops.filter((shop) => shop.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🍕</span>
              </div>
              <h1 className="text-xl font-bold">CampusEats</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}!
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Connection Status Banner */}
      <ConnectionStatusBanner />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Order Your Favorite Food
          </h2>
          <p className="text-gray-600">
            Browse restaurants, place orders, and track your food delivery
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
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

        {/* Shops Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{shop.name}</span>
                        {shop.isOpen ? (
                          <Badge variant="default" className="bg-green-500">
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{shop.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">
                        ⭐ {shop.rating?.toFixed(1) || "4.0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wait time:</span>
                      <span className="font-medium">
                        {shop.estimatedWaitTime || 10} min
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {shop.location || "Campus"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={`/shop/${shop.id}`}>
                      <Button className="w-full" disabled={!shop.isActive}>
                        {shop.isActive ? "View Menu" : "Closed"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No shops found
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory === "All"
                ? "No restaurants are available yet. Check back later!"
                : `No ${selectedCategory} restaurants found. Try a different category.`}
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory("All")}
            >
              View All Categories
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-medium mb-1">My Orders</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Track your current and past orders
                </p>
                <Button variant="outline" size="sm">
                  View Orders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="font-medium mb-1">Favorites</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your favorite restaurants and dishes
                </p>
                <Button variant="outline" size="sm">
                  View Favorites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🎫</div>
                <h4 className="font-medium mb-1">Offers</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Special deals and discounts
                </p>
                <Button variant="outline" size="sm">
                  View Offers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
