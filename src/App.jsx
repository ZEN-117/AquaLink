//import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/userDashboard";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import {Toaster} from "react-hot-toast";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center"/>
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/userdashboard/*" element={<UserDashboard />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admindashboard/*" element={<AdminDashboard />} />
        <Route path="/staffdashboard/*" element={<StaffDashboard />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
