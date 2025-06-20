import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, ChefHat, Bell, MapPin, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, logout } = useSimpleAuth();
  const { trackOrder, currentOrder } = useCart();
  const navigate = useNavigate();

  const [order, setOrder] = useState(
    orderId ? trackOrder(orderId) : currentOrder,
  );

  // Auto-update order status (simulation)
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      const currentOrder = orderId ? trackOrder(orderId) : null;
      if (currentOrder) {
        setOrder(currentOrder);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, trackOrder, order]);

  // Simulate order status progression
  useEffect(() => {
    if (!order || order.status === "completed") return;

    const statusProgression = [
      { status: "pending", delay: 0 },
      { status: "confirmed", delay: 2000 },
      { status: "preparing", delay: 8000 },
      { status: "ready", delay: 15000 },
    ];

    statusProgression.forEach(({ status, delay }) => {
      setTimeout(() => {
        if (order && orderId) {
          // This would normally update via API
          setOrder((prev) =>
            prev ? { ...prev, status: status as any } : null,
          );
        }
      }, delay);
    });
  }, [order?.id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-500",
      text: "Order Received",
      description: "We've received your order and are processing it",
      progress: 25,
    },
    confirmed: {
      icon: CheckCircle,
      color: "bg-blue-500",
      text: "Order Confirmed",
      description: "Your order has been confirmed by the restaurant",
      progress: 50,
    },
    preparing: {
      icon: ChefHat,
      color: "bg-orange-500",
      text: "Preparing",
      description: "The kitchen is preparing your delicious meal",
      progress: 75,
    },
    ready: {
      icon: Bell,
      color: "bg-green-500",
      text: "Ready for Pickup",
      description: "Your order is ready! Please come to pick it up",
      progress: 100,
    },
    completed: {
      icon: CheckCircle,
      color: "bg-green-600",
      text: "Completed",
      description: "Order completed successfully",
      progress: 100,
    },
  };

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  const estimatedTime = new Date(order.estimatedPickupTime).toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" },
  );

  // Shop contact info (mock)
  const shopInfo = {
    "1": {
      name: "Campus Café",
      phone: "+1 (555) 123-4567",
      location: "Building A, Ground Floor",
    },
    "2": {
      name: "Pizza Corner",
      phone: "+1 (555) 234-5678",
      location: "Food Court, Level 2",
    },
    "3": {
      name: "Healthy Eats",
      phone: "+1 (555) 345-6789",
      location: "Student Center, Main Floor",
    },
  };

  const shop = shopInfo[order.shopId as keyof typeof shopInfo] || {
    name: order.shopName,
    phone: "N/A",
    location: "N/A",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Order Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Order Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Order #{order.tokenNumber.toString().padStart(3, "0")}
                  </h2>
                  <p className="text-gray-600">
                    {shop.name} • Placed at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <Badge className={currentStatus.color}>
                    {currentStatus.text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <StatusIcon className="w-5 h-5" />
                    <span>{currentStatus.text}</span>
                  </CardTitle>
                  <CardDescription>{currentStatus.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress
                      value={currentStatus.progress}
                      className="w-full"
                    />

                    {/* Status Timeline */}
                    <div className="space-y-3">
                      {Object.entries(statusConfig).map(
                        ([status, config], index) => {
                          const isCompleted =
                            currentStatus.progress >= config.progress;
                          const isCurrent = order.status === status;

                          return (
                            <div
                              key={status}
                              className={`flex items-center space-x-3 ${
                                isCompleted || isCurrent
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? config.color + " text-white"
                                    : isCurrent
                                      ? "bg-gray-200 text-gray-600"
                                      : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <config.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium">{config.text}</p>
                                <p className="text-sm text-gray-500">
                                  {config.description}
                                </p>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Estimated Time */}
                    {order.status !== "completed" && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Estimated ready time: {estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          We'll send you a notification when your order is
                          ready!
                        </p>
                      </div>
                    )}

                    {/* Ready for Pickup Alert */}
                    {order.status === "ready" && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900">
                            Your order is ready for pickup!
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Please show this token number: #
                          {order.tokenNumber.toString().padStart(3, "0")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-sm text-gray-500">
                            ${item.menuItem.price.toFixed(2)} × {item.quantity}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-400">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-medium">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {order.customerNotes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="font-medium mb-1">
                          Special Instructions:
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customerNotes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pickup Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Pickup Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token Number */}
                  <div className="text-center p-6 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">Your Token</p>
                    <div className="text-4xl font-bold text-orange-600">
                      #{order.tokenNumber.toString().padStart(3, "0")}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Show this number at pickup
                    </p>
                  </div>

                  {/* Shop Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Restaurant Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-gray-600">
                            {shop.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a
                          href={`tel:${shop.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {shop.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/shop/${order.shopId}`}>Order Again</Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>💡 Tip: Save this page to track your order</p>
                    <p>🔔 We'll notify you when it's ready</p>
                    <p>📱 Call the restaurant if you have questions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
