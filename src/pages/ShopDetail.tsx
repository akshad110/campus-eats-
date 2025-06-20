import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { ModernFooter } from "@/components/ui/modern-footer";
import { PaymentGatewayComponent } from "@/components/PaymentGateway";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/lib/api";
import { OrderManagement } from "@/lib/orderManagement";
import { manuallyCreateMenuItems } from "@/lib/manualInit";
import { Shop, MenuItem } from "@/lib/types";
import {
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Clock,
  Users,
  MapPin,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Heart,
  Bell,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

const ShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectShop } = useShop();
  const { toast } = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [localCart, setLocalCart] = useState<Record<string, number>>({});
  const [orderStatus, setOrderStatus] = useState<
    | "cart"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "payment"
    | "completed"
  >("cart");
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!shopId) {
      navigate("/home");
      return;
    }

    loadShopData();
  }, [shopId, navigate]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      console.log("=== SHOP LOADING DEBUG ===");
      console.log("Requested shopId:", shopId);
      console.log("Current URL path:", window.location.pathname);

      // First, try to load the shop directly without creating fallback data
      console.log("Attempting to load shop directly...");
      let shopData = await ApiService.getShopById(shopId!);

      if (shopData) {
        console.log("✅ Shop found directly:", shopData.name);
        const menuData = await ApiService.getMenuItems(shopId!);
        setShop(shopData);
        setMenuItems(menuData);
        setLoading(false);
        return;
      }

      // If shop not found, check available shops for debugging
      console.log("Shop not found, checking what shops exist...");
      const allShops = await ApiService.getShops();
      console.log(
        "Available shops:",
        allShops.map((s) => ({ id: s.id, name: s.name })),
      );

      // Only create fallback shops if there are NO shops at all
      if (allShops.length === 0) {
        console.log("No shops in database, creating fallback shops...");
        await ApiService.createFallbackShops();

        // Try again after creating fallback shops
        shopData = await ApiService.getShopById(shopId!);
      }

      if (!shopData) {
        console.error("=== SHOP NOT FOUND AFTER ALL ATTEMPTS ===");
        console.error("Requested shop ID:", shopId);
        console.error(
          "Available shop IDs:",
          allShops.map((s) => s.id),
        );
        console.error(
          "This might be a recently created shop that was cleaned up.",
        );

        // Check if this looks like a user-created shop that got deleted
        if (shopId?.includes("_") && shopId.match(/\d{13}/)) {
          console.error(
            "⚠️  This appears to be a user-created shop that may have been accidentally deleted.",
          );
          toast({
            variant: "destructive",
            title: "Shop Not Found",
            description:
              "This shop may have been recently created but isn't available yet. Please try refreshing or go back to the shop list.",
          });
        }

        // Instead of trying to redirect, show user-friendly error
        toast({
          variant: "destructive",
          title: "Shop Not Found",
          description:
            "This shop might have been recently created. Please check the shop list and try again.",
        });
        navigate("/home");
        return;
      }

      // Success - load the shop and menu data
      const menuData = await ApiService.getMenuItems(shopId!);
      console.log("✅ Successfully loaded shop and menu data");

      setShop(shopData);
      setMenuItems(menuData);
      selectShop(shopData);
    } catch (error) {
      console.error("Failed to load shop data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shop data. Redirecting to home...",
      });
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalCart = (itemId: string, change: number) => {
    setLocalCart((prev) => {
      const newQuantity = (prev[itemId] || 0) + change;
      if (newQuantity <= 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const getTotalItems = () => {
    return Object.values(localCart).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
  };

  const getTotalPrice = () => {
    return menuItems
      .reduce((total, item) => {
        const quantity = localCart[item.id] || 0;
        return total + item.price * quantity;
      }, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order.",
      });
      navigate("/auth");
      return;
    }

    if (getTotalItems() === 0) {
      toast({
        variant: "destructive",
        title: "Empty cart",
        description: "Please add items to your cart before placing an order.",
      });
      return;
    }

    if (!shop) {
      toast({
        variant: "destructive",
        title: "Shop not found",
        description: "Unable to place order. Please try again.",
      });
      return;
    }

    try {
      setOrderStatus("pending_approval");

      const orderItems = Object.entries(localCart)
        .filter(([itemId, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => {
          const menuItem = menuItems.find((item) => item.id === itemId);
          if (!menuItem) {
            throw new Error(`Menu item not found: ${itemId}`);
          }
          return {
            menuItemId: itemId,
            quantity,
            price: menuItem.price,
            notes: "",
          };
        });

      if (orderItems.length === 0) {
        throw new Error("No valid items in cart");
      }

      const order = await OrderManagement.submitOrderForApproval({
        shopId: shop.id,
        items: orderItems,
        userId: user.id,
        totalAmount: parseFloat(getTotalPrice()),
        notes: "",
      });

      setCurrentOrder(order);

      toast({
        title: "Order submitted for approval",
        description: `Your order #${order.tokenNumber} has been sent to the shopkeeper for approval.`,
      });

      pollOrderStatus(order.id);
    } catch (error) {
      console.error("Failed to place order:", error);
      setOrderStatus("cart");
      toast({
        variant: "destructive",
        title: "Order failed",
        description: "Failed to submit your order. Please try again.",
      });
    }
  };

  const pollOrderStatus = async (orderId: string) => {
    const maxPolls = 60;
    let pollCount = 0;

    const poll = async () => {
      try {
        const order = await ApiService.getOrderById(orderId);

        if (order?.status === "approved") {
          setOrderStatus("approved");
          setCurrentOrder(order);

          toast({
            title: "Order approved! 🎉",
            description:
              "Your order has been approved. Please proceed with payment.",
          });

          setTimeout(() => {
            setShowPaymentGateway(true);
          }, 1000);

          return;
        } else if (order?.status === "rejected") {
          setOrderStatus("rejected");
          setRejectionReason("Items not available");

          toast({
            variant: "destructive",
            title: "Order rejected",
            description: "The shopkeeper couldn't fulfill this order.",
          });

          return;
        }

        if (order?.status === "pending_approval" && pollCount < maxPolls) {
          pollCount++;
          setTimeout(poll, 5000);
        } else if (pollCount >= maxPolls) {
          setOrderStatus("cart");
          toast({
            variant: "destructive",
            title: "Order approval timeout",
            description:
              "The shopkeeper hasn't responded yet. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Failed to check order status:", error);
      }
    };

    setTimeout(poll, 2000);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setOrderStatus("completed");
    setShowPaymentGateway(false);
    setLocalCart({});

    toast({
      title: "Payment successful! 🎉",
      description: "Your order is confirmed and being prepared.",
    });

    setTimeout(() => {
      navigate("/orders");
    }, 3000);
  };

  const handlePaymentFailed = (error: string) => {
    setShowPaymentGateway(false);

    toast({
      variant: "destructive",
      title: "Payment failed",
      description: error,
    });
  };

  const resetOrder = () => {
    setOrderStatus("cart");
    setCurrentOrder(null);
    setRejectionReason("");
    setLocalCart({});
  };

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low Crowd
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium Crowd
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            High Crowd
          </Badge>
        );
      default:
        return null;
    }
  };

  // Group menu items by category
  const menuCategories = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-orange-500 mb-4" />
          <p className="text-gray-600">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Shop Not Found
          </h2>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/home"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shops
        </Link>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {shop.name}
                </h1>
                <p className="text-gray-600 mb-4">{shop.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    4.8 rating
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {shop.estimatedWaitTime} min wait
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Campus location
                  </div>
                </div>
              </div>
              <div className="ml-6">{getCrowdBadge(shop.crowdLevel)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Debug info */}
            {menuItems.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-yellow-800">
                          No Menu Items
                        </h3>
                        <p className="text-sm text-yellow-700">
                          This shop doesn't have any menu items yet. Menu items
                          found: {menuItems.length}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        toast({
                          title: "Creating menu items...",
                          description:
                            "Please wait while we create the menu items.",
                        });
                        try {
                          await manuallyCreateMenuItems();
                          await loadShopData();
                          toast({
                            title: "Menu items created!",
                            description: "The menu should now be available.",
                          });
                        } catch (error) {
                          console.error("Failed to create menu items:", error);
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to create menu items.",
                          });
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Create Menu Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Menu Categories */}
            {Object.entries(menuCategories).map(([categoryName, items]) => (
              <Card
                key={categoryName}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
                    {categoryName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`group flex items-center justify-between p-4 border border-gray-100 rounded-lg transition-all duration-300 hover:shadow-md hover:border-orange-200 ${
                          !item.isAvailable ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                {item.name}
                                {!item.isAvailable && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Unavailable
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="font-semibold text-orange-600 text-base">
                                  ${item.price.toFixed(2)}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.preparationTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {item.isAvailable ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLocalCart(item.id, -1)}
                                disabled={!localCart[item.id]}
                                className="hover:bg-red-50 hover:border-red-200 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium bg-gray-50 py-1 rounded">
                                {localCart[item.id] || 0}
                              </span>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200"
                                onClick={() => updateLocalCart(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" disabled>
                              Not Available
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {Object.keys(menuCategories).length === 0 &&
              menuItems.length === 0 && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No menu items available
                    </h3>
                    <p className="text-gray-500">
                      This shop hasn't added any menu items yet.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                  Your Order
                  {getTotalItems() > 0 && (
                    <Badge className="ml-2 bg-orange-100 text-orange-800">
                      {getTotalItems()} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderStatus === "cart" && getTotalItems() === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      Your cart is empty
                    </p>
                    <p>Add items to get started</p>
                  </div>
                ) : orderStatus === "pending_approval" ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-orange-700">
                      Waiting for Approval
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Your order #{currentOrder?.tokenNumber} has been sent to
                      the shopkeeper for approval.
                    </p>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-orange-700">
                        This usually takes 1-3 minutes
                      </p>
                    </div>
                  </div>
                ) : orderStatus === "approved" ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium mb-2 text-green-700">
                      Order Approved! 🎉
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Your order #{currentOrder?.tokenNumber} has been approved.
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-green-700">
                        Total: ${currentOrder?.totalAmount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600">
                        Estimated pickup:{" "}
                        {currentOrder?.estimatedPickupTime
                          ? new Date(
                              currentOrder.estimatedPickupTime,
                            ).toLocaleTimeString()
                          : "TBD"}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowPaymentGateway(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                ) : orderStatus === "rejected" ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                    <p className="text-lg font-medium mb-2 text-red-700">
                      Order Rejected
                    </p>
                    <div className="bg-red-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-red-700">
                        Reason: {rejectionReason}
                      </p>
                    </div>
                    <Button
                      onClick={resetOrder}
                      variant="outline"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : orderStatus === "completed" ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium mb-2 text-green-700">
                      Order Confirmed! 🎉
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Your payment was successful. Your food is being prepared!
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700">
                        Token #{currentOrder?.tokenNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {menuItems
                      .filter((item) => localCart[item.id])
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-gray-100"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} × {localCart[item.id]}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">
                              ${(item.price * localCart[item.id]).toFixed(2)}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateLocalCart(item.id, -localCart[item.id])
                              }
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          ${getTotalPrice()}
                        </span>
                      </div>
                      <Button
                        onClick={handlePlaceOrder}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-lg py-3 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        disabled={getTotalItems() === 0}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Submit for Approval
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Order will be reviewed by the shopkeeper first
                      </p>
                      {!user && (
                        <p className="text-xs text-orange-600 text-center mt-1">
                          Please sign in to place an order
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      {showPaymentGateway && currentOrder && user && (
        <PaymentGatewayComponent
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          orderDetails={{
            orderId: currentOrder.id,
            amount: currentOrder.totalAmount,
            items: currentOrder.items.map((item: any) => ({
              name:
                menuItems.find((m) => m.id === item.menuItemId)?.name ||
                "Unknown Item",
              quantity: item.quantity,
              price: item.price,
            })),
            shopName: shop?.name || "Unknown Shop",
            tokenNumber: currentOrder.tokenNumber,
          }}
          customerDetails={{
            email: user.email,
            name: user.name,
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
        />
      )}

      <ModernFooter />
    </div>
  );
};

export default ShopDetail;
