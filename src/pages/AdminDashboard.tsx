import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { OrderApproval } from "@/components/OrderApproval";
import { TestOrderGenerator } from "@/components/TestOrderGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/lib/api";
import { OrderManagement } from "@/lib/orderManagement";
import {
  Store,
  Menu,
  ShoppingBag,
  TrendingUp,
  Clock,
  Users,
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LocalStorageDBViewer } from "@/components/LocalStorageDBViewer";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [userShops, setUserShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (user?.role === "shopkeeper") {
      loadUserShops();
    }
  }, [user]);

  useEffect(() => {
    if (selectedShop) {
      loadPendingOrdersCount();
    }
  }, [selectedShop]);

  const loadUserShops = async () => {
    if (!user) return;

    try {
      // Load user shops directly without creating fallback data to preserve user shops
      const shops = await ApiService.getShopsByOwner(user.id);
      console.log("Loaded shops for user:", user.id, shops);
      setUserShops(shops);
      if (shops.length > 0) {
        setSelectedShop(shops[0]);
      }

      // Only create fallback data if absolutely no shops exist anywhere
      if (shops.length === 0) {
        const allShops = await ApiService.getShops();
        if (allShops.length === 0) {
          console.log("No shops exist at all, creating fallback shops...");
          await ApiService.createFallbackShops();
        }
      }
    } catch (error) {
      console.error("Failed to load shops:", error);
    }
  };

  const loadPendingOrdersCount = async () => {
    if (!selectedShop) return;

    try {
      console.log("Loading pending orders for shop:", selectedShop.id);
      const pendingOrders = await OrderManagement.getPendingApprovalOrders(
        selectedShop.id,
      );
      console.log("Loaded pending orders:", pendingOrders.length);
      setPendingOrdersCount(pendingOrders.length);
    } catch (error) {
      console.error("Failed to load pending orders:", error);
      setPendingOrdersCount(0);
    }
  };

  const stats = [
    {
      title: "Pending Approvals",
      value: pendingOrdersCount.toString(),
      change: "Needs attention",
      icon: AlertTriangle,
      color: pendingOrdersCount > 0 ? "text-red-600" : "text-green-600",
    },
    {
      title: "Today's Orders",
      value: "23",
      change: "+12%",
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      title: "Active Tokens",
      value: "8",
      change: "Current queue",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Revenue Today",
      value: "$456",
      change: "+8%",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      token: "A12",
      customer: "John D.",
      items: "2x Burger, 1x Fries",
      amount: "$18.50",
      status: "preparing",
      time: "2 min ago",
    },
    {
      id: "ORD002",
      token: "A11",
      customer: "Sarah M.",
      items: "1x Pizza, 1x Coke",
      amount: "$15.00",
      status: "ready",
      time: "5 min ago",
    },
    {
      id: "ORD003",
      token: "A10",
      customer: "Mike R.",
      items: "1x Sandwich",
      amount: "$8.50",
      status: "fulfilled",
      time: "8 min ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "preparing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Preparing
          </Badge>
        );
      case "ready":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Ready
          </Badge>
        );
      case "fulfilled":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Fulfilled
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
            Welcome back, {user?.name}! 👨‍🍳
          </h1>
          <p className="text-gray-600">
            Manage your shop and track orders in real-time
          </p>
        </div>

        {/* No Shops Warning */}
        {userShops.length === 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="text-center">
                <Store className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-orange-800 mb-2">
                  No Shops Setup Yet
                </h3>
                <p className="text-orange-700 mb-6">
                  You haven't created any shops yet. Set up your first shop to
                  start selling!
                </p>
                <Link to="/admin/shop-setup">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Shop
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shops List */}
        {userShops.length > 0 && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Store className="h-5 w-5 mr-2 text-orange-600" />
                  Your Shops ({userShops.length})
                </span>
                <Link to="/admin/shop-setup">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Shop
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userShops.map((shop) => (
                  <Card
                    key={shop.id}
                    className={`cursor-pointer transition-all ${
                      selectedShop?.id === shop.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => setSelectedShop(shop)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {shop.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {shop.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          className={
                            shop.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {shop.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ID: {shop.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/shop-setup">
            <Button className="w-full h-16 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex-col">
              <Store className="h-6 w-6 mb-1" />
              Shop Setup
            </Button>
          </Link>
          <Link to="/admin/menu">
            <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex-col">
              <Menu className="h-6 w-6 mb-1" />
              Manage Menu
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex-col">
              <ShoppingBag className="h-6 w-6 mb-1" />
              View Orders
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-col">
              <BarChart3 className="h-6 w-6 mb-1" />
              Analytics
            </Button>
          </Link>
        </div>

        {/* Database Viewer */}
        <div className="mb-8 flex justify-center">
          <LocalStorageDBViewer />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Approval Section - Always visible when shop is selected */}
        {selectedShop && (
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Order Approvals for {selectedShop.name}
                  </span>
                  {pendingOrdersCount > 0 && (
                    <Badge className="bg-red-100 text-red-800 animate-pulse">
                      {pendingOrdersCount} Pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <OrderApproval
                  shopId={selectedShop.id}
                  onOrderUpdate={loadPendingOrdersCount}
                />

                {/* Test Order Generator for Demo */}
                <TestOrderGenerator
                  shopId={selectedShop.id}
                  onOrderGenerated={loadPendingOrdersCount}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Orders */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-orange-600" />
                Recent Orders
              </span>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {order.token}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customer}
                      </p>
                      <p className="text-sm text-gray-600">{order.items}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">
                      {order.amount}
                    </span>
                    {getStatusBadge(order.status)}
                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Fulfilled
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shop Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2 text-orange-600" />
                Shop Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shop Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Open
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Queue</span>
                  <span className="font-medium">8 orders</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Prep Time</span>
                  <span className="font-medium">12 minutes</span>
                </div>
                <Button className="w-full bg-gray-600 hover:bg-gray-700">
                  Close Shop Temporarily
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Today's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orders Completed</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer Rating</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">4.8</span>
                    <div className="flex text-yellow-500">{"★".repeat(5)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Peak Hours</span>
                  <span className="font-medium">12:00 - 2:00 PM</span>
                </div>
                <Link to="/admin/analytics">
                  <Button variant="outline" className="w-full">
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MinimalFooter />
    </div>
  );
};

export default AdminDashboard;
