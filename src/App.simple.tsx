import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext";
import SimpleLanding from "./pages/SimpleLanding";
import SimpleAuth from "./pages/SimpleAuth";
import SimpleSuccess from "./pages/SimpleSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SimpleApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SimpleAuthProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<SimpleLanding />} />
              <Route path="/auth" element={<SimpleAuth />} />
              <Route path="/success" element={<SimpleSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SimpleAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default SimpleApp;
