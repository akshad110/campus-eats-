import { useState } from "react";
import { Link } from "react-router-dom";
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

// Mock shop data
const mockShops = [
  {
    id: "1",
    name: "Campus Café",
    description: "Fresh coffee and pastries",
    image: "/placeholder.svg",
    category: "Café",
    rating: 4.5,
    estimatedWaitTime: 8,
    isOpen: true,
  },
  {
    id: "2",
    name: "Pizza Corner",
    description: "Authentic Italian pizza",
    image: "/placeholder.svg",
    category: "Italian",
    rating: 4.2,
    estimatedWaitTime: 15,
    isOpen: true,
  },
  {
    id: "3",
    name: "Healthy Eats",
    description: "Fresh salads and smoothies",
    image: "/placeholder.svg",
    category: "Healthy",
    rating: 4.7,
    estimatedWaitTime: 6,
    isOpen: false,
  },
];

const UserDashboard = () => {
  const { user, logout } = useSimpleAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Café", "Italian", "Healthy", "Fast Food"];

  const filteredShops =
    selectedCategory === "All"
      ? mockShops
      : mockShops.filter((shop) => shop.category === selectedCategory);

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
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                    <span className="font-medium">⭐ {shop.rating}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Wait time:</span>
                    <span className="font-medium">
                      {shop.estimatedWaitTime} min
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{shop.category}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={`/shop/${shop.id}`}>
                    <Button className="w-full" disabled={!shop.isOpen}>
                      {shop.isOpen ? "View Menu" : "Closed"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
