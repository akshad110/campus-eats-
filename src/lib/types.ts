export interface User {
  id: string;
  email: string;
  role: "student" | "shopkeeper" | "developer";
  name: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  ownerId: string;
  isActive: boolean;
  crowdLevel: "low" | "medium" | "high";
  estimatedWaitTime: number; // in minutes
  activeTokens: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  createdAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "fulfilled" | "cancelled";
  tokenNumber: number;
  estimatedPickupTime: string;
  actualPickupTime?: string;
  notes?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User["role"]) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: User["role"],
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ShopContextType {
  shops: Shop[];
  selectedShop: Shop | null;
  menuItems: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (notes?: string) => Promise<Order>;
  selectShop: (shop: Shop) => void;
  getShopById: (id: string) => Shop | undefined;
  getMenuItemsByShopId: (shopId: string) => MenuItem[];
  getSuggestedShops: () => Shop[];
  forceRefresh: () => Promise<void>;
  loading: boolean;
}
