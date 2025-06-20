import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShopProvider } from "@/contexts/ShopContext";
import { ShopMenuProvider } from "@/contexts/ShopMenuContext";
// Removed DemoModeBanner import as it is no longer used
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiService } from "@/lib/api";
// import { StorageDebugger } from "@/lib/debugStorage";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import ShopDetail from "./pages/ShopDetail";
import ShopSetup from "./pages/ShopSetup";
import MenuManagement from "./pages/MenuManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Removed complex useEffect to prevent infinite loops

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<UserDashboard />} />
        <Route path="/shops/:shopId" element={<ShopDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/shop-setup" element={<ShopSetup />} />
        <Route path="/admin/orders" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/analytics" element={<AdminDashboard />} />
        <Route path="/developer" element={<DeveloperDashboard />} />
        <Route path="/orders" element={<UserDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ShopProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ShopMenuProvider>
                <AppContent />
              </ShopMenuProvider>
            </BrowserRouter>
          </ShopProvider>
        </AuthProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
