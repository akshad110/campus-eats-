import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  preparationTime: number;
  isAvailable: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  tokenNumber: number;
  estimatedPickupTime: string;
  customerNotes?: string;
  createdAt: string;
}

interface CartContextType {
  // Cart state
  cartItems: CartItem[];
  isCartOpen: boolean;
  cartTotal: number;
  cartItemCount: number;
  currentShopId: string | null;

  // Cart actions
  addToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Order management
  currentOrder: Order | null;
  orderHistory: Order[];
  placeOrder: (customerNotes?: string) => Promise<Order>;
  trackOrder: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Load cart and orders from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("campuseats_cart");
    const savedShopId = localStorage.getItem("campuseats_current_shop");
    const savedOrders = localStorage.getItem("campuseats_orders");
    const savedCurrentOrder = localStorage.getItem("campuseats_current_order");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }

    if (savedShopId) {
      setCurrentShopId(savedShopId);
    }

    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Error loading orders:", e);
      }
    }

    if (savedCurrentOrder) {
      try {
        setCurrentOrder(JSON.parse(savedCurrentOrder));
      } catch (e) {
        console.error("Error loading current order:", e);
      }
    }
  }, []);

  // Save to localStorage whenever cart or orders change
  useEffect(() => {
    localStorage.setItem("campuseats_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (currentShopId) {
      localStorage.setItem("campuseats_current_shop", currentShopId);
    }
  }, [currentShopId]);

  useEffect(() => {
    localStorage.setItem("campuseats_orders", JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    if (currentOrder) {
      localStorage.setItem(
        "campuseats_current_order",
        JSON.stringify(currentOrder),
      );
    } else {
      localStorage.removeItem("campuseats_current_order");
    }
  }, [currentOrder]);

  // Calculated values
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0,
  );

  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0,
  );

  // Cart actions
  const addToCart = (menuItem: MenuItem, quantity = 1, notes?: string) => {
    // Check if adding from different shop
    if (currentShopId && currentShopId !== menuItem.shopId) {
      const confirmSwitch = window.confirm(
        "Adding items from a different restaurant will clear your current cart. Continue?",
      );
      if (!confirmSwitch) return;
      setCartItems([]);
    }

    setCurrentShopId(menuItem.shopId);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.menuItem.id === menuItem.id,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                notes: notes || item.notes,
              }
            : item,
        );
      } else {
        return [...prevItems, { menuItem, quantity, notes }];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.menuItem.id !== menuItemId),
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentShopId(null);
    setIsCartOpen(false);
  };

  const setCartOpen = (open: boolean) => {
    setIsCartOpen(open);
  };

  // Order management
  const placeOrder = async (customerNotes?: string): Promise<Order> => {
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    if (!currentShopId) {
      throw new Error("No shop selected");
    }

    // Generate order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenNumber = Math.floor(Math.random() * 999) + 1;

    // Calculate estimated pickup time (current time + preparation time + queue time)
    const avgPrepTime =
      cartItems.reduce(
        (total, item) => total + item.menuItem.preparationTime * item.quantity,
        0,
      ) / cartItemCount;
    const queueTime = Math.floor(Math.random() * 10) + 5; // 5-15 min queue
    const estimatedMinutes = Math.ceil(avgPrepTime + queueTime);
    const estimatedPickupTime = new Date(
      Date.now() + estimatedMinutes * 60000,
    ).toISOString();

    // Get shop name (mock for now)
    const shopNames: Record<string, string> = {
      "1": "Campus Café",
      "2": "Pizza Corner",
      "3": "Healthy Eats",
    };

    const order: Order = {
      id: orderId,
      shopId: currentShopId,
      shopName: shopNames[currentShopId] || "Unknown Shop",
      items: [...cartItems],
      totalAmount: cartTotal,
      status: "pending",
      tokenNumber,
      estimatedPickupTime,
      customerNotes,
      createdAt: new Date().toISOString(),
    };

    // Save order
    setCurrentOrder(order);
    setOrderHistory((prev) => [order, ...prev]);

    // Clear cart
    clearCart();

    // Simulate order confirmation after 2 seconds
    setTimeout(() => {
      updateOrderStatus(orderId, "confirmed");
    }, 2000);

    return order;
  };

  const trackOrder = (orderId: string): Order | null => {
    if (currentOrder?.id === orderId) return currentOrder;
    return orderHistory.find((order) => order.id === orderId) || null;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    // Update current order
    if (currentOrder?.id === orderId) {
      const updatedOrder = { ...currentOrder, status };
      setCurrentOrder(updatedOrder);

      // Also update in history
      setOrderHistory((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
    } else {
      // Update in history
      setOrderHistory((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    }

    // If order is completed, clear current order
    if (status === "completed" || status === "cancelled") {
      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
      }
    }
  };

  const value: CartContextType = {
    // Cart state
    cartItems,
    isCartOpen,
    cartTotal,
    cartItemCount,
    currentShopId,

    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartOpen,

    // Order management
    currentOrder,
    orderHistory,
    placeOrder,
    trackOrder,
    updateOrderStatus,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
