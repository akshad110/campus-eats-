import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext";
import { CartProvider } from "./contexts/CartContext";
import SimpleLanding from "./pages/SimpleLanding";
import SimpleAuth from "./pages/SimpleAuth";
import SimpleSuccess from "./pages/SimpleSuccess";
import UserDashboard from "./pages/UserDashboard";
import ShopOwnerDashboard from "./pages/ShopOwnerDashboard";
import CreateShop from "./pages/CreateShop";
import ShopDetail from "./pages/ShopDetail";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import MenuManagement from "./pages/MenuManagement";
import OrderManagement from "./pages/OrderManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SimpleApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SimpleAuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<SimpleLanding />} />
                <Route path="/auth" element={<SimpleAuth />} />
                <Route path="/success" element={<SimpleSuccess />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route
                  path="/shop-dashboard"
                  element={<ShopOwnerDashboard />}
                />
                <Route path="/create-shop" element={<CreateShop />} />
                <Route path="/shop/:shopId" element={<ShopDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />
                <Route path="/menu-management" element={<MenuManagement />} />
                <Route path="/order-management" element={<OrderManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </SimpleAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default SimpleApp;
