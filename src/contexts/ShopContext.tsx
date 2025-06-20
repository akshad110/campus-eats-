import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Shop } from "@/lib/types";
import { ApiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ShopContextType {
  shops: Shop[];
  loading: boolean;
  refreshShops: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchShops = async () => {
    if (!user) {
      setShops([]);
      return;
    }
    setLoading(true);
    try {
      if (user.role === "shopkeeper") {
        const ownerShops = await ApiService.getShopsByOwner(user.id);
        setShops(ownerShops);
      } else {
        // For other roles, show all shops
        const allShops = await ApiService.getShops();
        setShops(allShops);
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simply fetch shops without cleanup to prevent infinite loops
    fetchShops();
  }, [user]);

  const refreshShops = async () => {
    await fetchShops();
  };

  const forceRefresh = async () => {
    await fetchShops();
  };

  return (
    <ShopContext.Provider
      value={{ shops, loading, refreshShops, forceRefresh }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
