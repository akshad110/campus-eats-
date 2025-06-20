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

// Mock data for shop owner
const mockShopData = {
  shop: {
    id: "1",
    name: "My Campus Café",
    description: "Fresh coffee and pastries",
    isActive: true,
    todayOrders: 23,
    totalRevenue: 425.5,
    avgRating: 4.5,
  },
  recentOrders: [
    {
      id: "1",
      customerName: "John Doe",
      items: ["Cappuccino", "Croissant"],
      total: 8.25,
      status: "preparing",
      tokenNumber: 15,
      timeOrdered: "10:30 AM",
    },
    {
      id: "2",
      customerName: "Jane Smith",
      items: ["Latte", "Muffin"],
      total: 9.5,
      status: "ready",
      tokenNumber: 14,
      timeOrdered: "10:25 AM",
    },
    {
      id: "3",
      customerName: "Mike Johnson",
      items: ["Espresso"],
      total: 3.5,
      status: "completed",
      tokenNumber: 13,
      timeOrdered: "10:15 AM",
    },
  ],
};

const ShopOwnerDashboard = () => {
  const { user, logout } = useSimpleAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const userShops = await ShopService.getShopsByOwner(user.id);
        setShops(userShops);
      } catch (error) {
        console.error("Error fetching shops by owner:", error);
        // Set empty array as fallback to prevent further errors
        setShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we haven't already done so
    if (user?.id && shops.length === 0 && !isLoading) {
      fetchShops();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-500";
      case "ready":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? mockShopData.recentOrders
      : mockShopData.recentOrders.filter(
          (order) => order.status === selectedStatus,
        );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🏪</span>
              </div>
              <h1 className="text-xl font-bold">Shop Owner Portal</h1>
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
        {/* Shop Status */}
        <div className="mb-8">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : shops.length > 0 ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {shops[0].name}
                </h2>
                <p className="text-gray-600">{shops[0].description}</p>
              </div>
              <Badge
                className={shops[0].isActive ? "bg-green-500" : "bg-red-500"}
              >
                {shops[0].isActive ? "Open" : "Closed"}
              </Badge>
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to CampusEats!
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have any shops yet. Create your first shop to start
                selling food on campus.
              </p>
              <Link to="/create-shop">
                <Button size="lg">Create Your First Shop</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {shops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <p className="text-sm text-gray-600">Orders Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">$0.00</div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-yellow-600">
                  ⭐ {shops[0].rating?.toFixed(1) || "4.0"}
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {shops.length}
                </div>
                <p className="text-sm text-gray-600">Your Shops</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/menu-management">
            <Button className="h-16 flex flex-col items-center justify-center w-full">
              <span className="text-lg mb-1">🍽️</span>
              <span className="text-sm">Manage Menu</span>
            </Button>
          </Link>

          <Link to="/order-management">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center w-full"
            >
              <span className="text-lg mb-1">📋</span>
              <span className="text-sm">Manage Orders</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-lg mb-1">⚙️</span>
            <span className="text-sm">Shop Settings</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center"
          >
            <span className="text-lg mb-1">💬</span>
            <span className="text-sm">Customer Reviews</span>
          </Button>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <div className="flex space-x-2">
              {["all", "preparing", "ready", "completed"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">
                          #{order.tokenNumber}
                        </span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.join(", ")} • ${order.total}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.timeOrdered}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {order.status === "preparing" && (
                        <Button size="sm">Mark Ready</Button>
                      )}
                      {order.status === "ready" && (
                        <Button size="sm" variant="outline">
                          Mark Completed
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopOwnerDashboard;
