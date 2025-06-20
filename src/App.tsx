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
  useEffect(() => {
    // Suppress fetch errors globally to prevent console spam
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === "string" &&
        (message.includes("Failed to fetch") ||
          message.includes("NetworkError") ||
          message.includes("ERR_NETWORK"))
      ) {
        // Silently ignore network errors - they're handled by fallback logic
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Handle unhandled promise rejections for fetch errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason === "object" &&
        (event.reason.message?.includes("Failed to fetch") ||
          event.reason.message?.includes("NetworkError") ||
          event.reason.name === "TypeError")
      ) {
        // Prevent the error from being logged
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Initialization removed to prevent infinite loops

    // Make debug functions available globally
    (window as any).debugApp = {
      // inspectStorage: StorageDebugger.inspectStorage,
      // clearData: StorageDebugger.clearCampusEatsData,
      // createTestShops: StorageDebugger.createTestShops,
      reinitialize: () => ApiService.initializeMockData(true),
    };

    console.log("🔧 Debug functions available at window.debugApp");
    console.log("Available methods:");
    console.log("- window.debugApp.inspectStorage()");
    console.log("- window.debugApp.clearData()");
    console.log("- window.debugApp.createTestShops()");
    console.log("- window.debugApp.reinitialize()");

    // Cleanup
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

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
