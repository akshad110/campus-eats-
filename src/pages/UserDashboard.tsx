import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/ui/navigation";
import { ModernFooter } from "@/components/ui/modern-footer";
import { useAuth } from "@/contexts/AuthContext";
import { useShop } from "@/contexts/ShopContext";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import {
  Clock,
  MapPin,
  Star,
  TrendingDown,
  Users,
  ShoppingCart,
  Bell,
  Search,
  Filter,
  Sparkles,
  Zap,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const { shops, loading, refreshShops } = useShop();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  useEffect(() => {
    if (user) {
      refreshShops();
    }
  }, [user, refreshShops]);

  console.log("All shops from context:", shops);
  const filteredShops = shops
    .filter((shop) => {
      if (!user) return false;
      // Show all shops for non-shopkeeper users
      if (user.role !== "shopkeeper") return true;
      // For shopkeepers, show only shops owned by them
      return shop.ownerId === user.id;
    })
    .filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || shop.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  console.log("Filtered shops:", filteredShops);

  const categories = [
    "all",
    ...Array.from(new Set(shops.map((shop) => shop.category))),
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            Low Crowd
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Users className="h-3 w-3 mr-1" />
            Medium Crowd
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Users className="h-3 w-3 mr-1" />
            High Crowd
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to order from your favorite campus shops?
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for shops, food items..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-3 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {shops.length === 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      No Shops Available
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Shops are being loaded or none have been created yet. Try
                      refreshing to see newly created shops.
                    </p>
                  </div>
                </div>
        <Button
          onClick={refreshShops}
          variant="outline"
          size="sm"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          Refresh Shops
        </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggested Shops */}

        {/* All Shops */}
        {shops.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                🍽️ All Campus Shops
                <Badge className="ml-3 bg-gray-100 text-gray-600">
                  {filteredShops.length} shops
                </Badge>
              </h2>
              <Button
                onClick={refreshShops}
                variant="outline"
                size="sm"
                className="hover:bg-orange-50 hover:border-orange-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Refresh Shops
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop, index) => (
                <Link key={`all-${shop.id}`} to={`/shops/${shop.id}`}>
                  <Card
                    className={`border-0 shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 bg-white/80 backdrop-blur-sm cursor-pointer group transform hover:scale-105 hover:-translate-y-2 ${
                      animateCards ? "animate-slide-up" : ""
                    }`}
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <CardHeader className="pb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center">
                            {shop.name}
                            <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {shop.category}
                          </p>
                        </div>
                        {getCrowdBadge(shop.crowdLevel)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1 group-hover:animate-pulse" />
                            {shop.estimatedWaitTime} min wait
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Star className="h-4 w-4 mr-1 text-yellow-500 group-hover:animate-bounce" />
                            4.{Math.floor(Math.random() * 4) + 5}
                          </div>
                        </div>
                        <Button
                          className={`w-full transform group-hover:scale-105 transition-all duration-300 ${
                            shop.crowdLevel === "high"
                              ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 group-hover:shadow-lg group-hover:shadow-orange-500/50"
                          }`}
                          disabled={shop.crowdLevel === "high"}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                          {shop.crowdLevel === "high"
                            ? "Very Busy"
                            : "View Menu"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredShops.length === 0 && shops.length > 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No shops found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Orders (if any) */}
        <div className="mt-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-orange-600" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No active orders</p>
                <p>
                  When you place an order, it will appear here with your token
                  number and pickup time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ModernFooter />
    </div>
  );
};

export default UserDashboard;
