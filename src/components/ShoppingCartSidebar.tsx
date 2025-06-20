import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const ShoppingCartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    cartTotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Your Cart</span>
            </SheetTitle>
            <SheetDescription>
              Add items to your cart to get started
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Browse our menu and add some delicious items to your cart.
            </p>
            <Button onClick={() => setCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Your Cart</span>
              <Badge>{cartItemCount} items</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </SheetTitle>
          <SheetDescription>Review your order before checkout</SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.menuItem.id}
                className="flex items-start space-x-3 p-3 bg-white rounded-lg border"
              >
                {/* Item Image */}
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-16 h-16 object-cover rounded-md"
                />

                {/* Item Details */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.menuItem.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ${item.menuItem.price.toFixed(2)} each
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-400 mt-1">
                      Note: {item.notes}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-green-600">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="text-red-600 hover:text-red-700 w-8 h-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-base font-medium">Subtotal:</span>
            <span className="text-lg font-bold text-green-600">
              ${cartTotal.toFixed(2)}
            </span>
          </div>

          {/* Estimated prep time */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Estimated prep time:</span>
            <span>
              {Math.max(
                ...cartItems.map((item) => item.menuItem.preparationTime),
              )}{" "}
              min
            </span>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCartOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>

          {/* Order Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>🕒 Orders are typically ready in 10-20 minutes</p>
            <p>📱 You'll receive a token number after placing your order</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartSidebar;
