import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Filter,
  Eye,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

// Mock orders data
const mockOrders = [
  {
    id: "order_1",
    customerName: "John Doe",
    customerPhone: "+1 (555) 123-4567",
    items: [
      { name: "Cappuccino", quantity: 2, price: 4.25 },
      { name: "Croissant", quantity: 1, price: 3.75 },
    ],
    totalAmount: 12.25,
    status: "preparing",
    tokenNumber: 15,
    timeOrdered: "10:30 AM",
    estimatedTime: "10:45 AM",
    customerNotes: "Extra hot, no sugar",
    orderTime: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "order_2",
    customerName: "Jane Smith",
    customerPhone: "+1 (555) 234-5678",
    items: [
      { name: "Latte", quantity: 1, price: 4.75 },
      { name: "Blueberry Muffin", quantity: 2, price: 4.5 },
    ],
    totalAmount: 13.75,
    status: "ready",
    tokenNumber: 14,
    timeOrdered: "10:25 AM",
    estimatedTime: "10:40 AM",
    customerNotes: "",
    orderTime: new Date("2024-01-15T10:25:00"),
  },
  {
    id: "order_3",
    customerName: "Mike Johnson",
    customerPhone: "+1 (555) 345-6789",
    items: [{ name: "Espresso", quantity: 1, price: 2.5 }],
    totalAmount: 2.5,
    status: "confirmed",
    tokenNumber: 16,
    timeOrdered: "10:35 AM",
    estimatedTime: "10:50 AM",
    customerNotes: "",
    orderTime: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "order_4",
    customerName: "Sarah Wilson",
    customerPhone: "+1 (555) 456-7890",
    items: [
      { name: "Green Tea", quantity: 1, price: 3.25 },
      { name: "Avocado Toast", quantity: 1, price: 7.95 },
    ],
    totalAmount: 11.2,
    status: "completed",
    tokenNumber: 13,
    timeOrdered: "10:15 AM",
    estimatedTime: "10:30 AM",
    customerNotes: "No onions on toast",
    orderTime: new Date("2024-01-15T10:15:00"),
  },
];

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed";
  tokenNumber: number;
  timeOrdered: string;
  estimatedTime: string;
  customerNotes: string;
  orderTime: Date;
}

const OrderManagement = () => {
  const { user, logout } = useSimpleAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, this would fetch from API
      console.log("Refreshing orders...");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    confirmed: {
      icon: CheckCircle,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    preparing: {
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    ready: {
      icon: Bell,
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    completed: {
      icon: CheckCircle,
      color: "bg-gray-500",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tokenNumber.toString().includes(searchTerm);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Sort by status priority, then by time
      const statusPriority = {
        pending: 1,
        confirmed: 2,
        preparing: 3,
        ready: 4,
        completed: 5,
      };
      return (
        statusPriority[a.status] - statusPriority[b.status] ||
        b.orderTime.getTime() - a.orderTime.getTime()
      );
    });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const getOrderStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (order) => order.orderTime.toDateString() === today,
    );

    return {
      total: todayOrders.length,
      pending: todayOrders.filter((o) => o.status === "pending").length,
      preparing: todayOrders.filter((o) => o.status === "preparing").length,
      ready: todayOrders.filter((o) => o.status === "ready").length,
      completed: todayOrders.filter((o) => o.status === "completed").length,
      revenue: todayOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, order) => sum + order.totalAmount, 0),
    };
  };

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/shop-dashboard">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Order Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50">
                {stats.total} orders today
              </Badge>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <p className="text-xs text-gray-600">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {stats.preparing}
              </div>
              <p className="text-xs text-gray-600">Preparing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.ready}
              </div>
              <p className="text-xs text-gray-600">Ready</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {stats.completed}
              </div>
              <p className="text-xs text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${stats.revenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by customer name or token number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <Card
                  key={order.id}
                  className={`${config.bgColor} ${config.borderColor} border-l-4`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Token Number */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-200">
                            #{order.tokenNumber.toString().padStart(2, "0")}
                          </div>
                          <Badge className={`${config.color} text-white mt-2`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status}
                          </Badge>
                        </div>

                        {/* Order Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {order.customerName}
                            </h3>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.timeOrdered}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Order Items:
                              </p>
                              <ul className="text-sm">
                                {order.items.map((item, index) => (
                                  <li
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span>
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span>
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span>📞 {order.customerPhone}</span>
                                <span>🕒 Est: {order.estimatedTime}</span>
                              </div>
                              {order.customerNotes && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    Special Notes:
                                  </p>
                                  <p className="text-sm bg-yellow-100 p-2 rounded">
                                    {order.customerNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {order.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "confirmed")
                                  }
                                >
                                  Accept Order
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Reject Order
                                </Button>
                              </>
                            )}

                            {order.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "preparing")
                                }
                              >
                                Start Preparing
                              </Button>
                            )}

                            {order.status === "preparing" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "ready")
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Ready
                              </Button>
                            )}

                            {order.status === "ready" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(order.id, "completed")
                                  }
                                  variant="outline"
                                >
                                  Mark Picked Up
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call Customer
                                </Button>
                              </>
                            )}

                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  {selectedStatus === "all"
                    ? "No orders yet today. They'll appear here when customers place orders."
                    : `No ${selectedStatus} orders found.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reject Order Dialog */}
        <Dialog
          open={selectedOrder !== null}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Order</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this order. The customer
                will be notified.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedOrder && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    Order #{selectedOrder.tokenNumber} -{" "}
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${selectedOrder.totalAmount.toFixed(2)} •{" "}
                    {selectedOrder.items.length} items
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for rejection:
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Out of ingredients, kitchen closing, etc."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (selectedOrder) {
                      updateOrderStatus(selectedOrder.id, "completed"); // Mark as rejected
                      setSelectedOrder(null);
                      setRejectionReason("");
                    }
                  }}
                  variant="destructive"
                  className="flex-1"
                  disabled={!rejectionReason.trim()}
                >
                  Reject Order
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrder(null);
                    setRejectionReason("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderManagement;
