import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Smartphone, Banknote } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    placeOrder,
    clearCart,
    currentShopId,
  } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // If cart is empty, redirect to dashboard
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Cart is Empty</h2>
            <p className="text-gray-600 mb-4">
              Add some items to your cart before checking out.
            </p>
            <Link to="/dashboard">
              <Button>Browse Restaurants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shopName = cartItems[0]?.menuItem?.shopId
    ? { "1": "Campus Café", "2": "Pizza Corner", "3": "Healthy Eats" }[
        cartItems[0].menuItem.shopId
      ] || "Unknown Shop"
    : "Unknown Shop";

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);

      // Validate customer info
      if (!customerInfo.name.trim()) {
        alert("Please enter your name");
        return;
      }

      if (!customerInfo.phone.trim()) {
        alert("Please enter your phone number");
        return;
      }

      // Place the order
      const order = await placeOrder(customerNotes);

      // Navigate to order tracking
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const estimatedPrepTime = Math.max(
    ...cartItems.map((item) => item.menuItem.preparationTime),
  );
  const estimatedPickupTime = new Date(
    Date.now() + (estimatedPrepTime + 10) * 60000,
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/shop/${currentShopId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Please provide your contact details for order updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter your email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose how you'd like to pay for your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="flex items-center space-x-2"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Cash on Pickup</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital" id="digital" />
                    <Label
                      htmlFor="digital"
                      className="flex items-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Digital Wallet</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod !== "cash" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💳 Card and digital payments will be processed at pickup
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
                <CardDescription>
                  Any special requests or dietary requirements?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g., Extra spicy, no onions, allergies, etc."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {shopName} • {cartItemCount} items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
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

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (8%):</span>
                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ${(cartTotal * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Order Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated ready:</span>
                    <span className="font-medium">{estimatedPickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prep time:</span>
                    <span className="font-medium">
                      ~{estimatedPrepTime} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <Badge variant="outline" className="text-xs">
                      {paymentMethod === "cash"
                        ? "Cash on Pickup"
                        : paymentMethod === "card"
                          ? "Card at Pickup"
                          : "Digital Wallet"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full"
                  size="lg"
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms of service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
