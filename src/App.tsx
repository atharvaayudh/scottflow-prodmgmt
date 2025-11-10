import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configurations from "./pages/Configurations";
import Masters from "./pages/Masters";
import Factory from "./pages/Factory";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/orders/OrderDetails";
import Branding from "./pages/Branding";
import BrandingOrderDetails from "./pages/branding/BrandingOrderDetails";
import Team from "./pages/Team";
import Procurement from "./pages/Procurement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/branding" element={<ProtectedRoute><Branding /></ProtectedRoute>} />
              <Route path="/branding/:id" element={<ProtectedRoute><BrandingOrderDetails /></ProtectedRoute>} />
              <Route path="/factories" element={<ProtectedRoute><Factory /></ProtectedRoute>} />
              <Route path="/masters" element={<ProtectedRoute><Masters /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/procurement" element={<ProtectedRoute><Procurement /></ProtectedRoute>} />
              <Route path="/configurations" element={<ProtectedRoute><Configurations /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ConfigProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
