// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your pages (no .tsx extension needed with proper setup, but keep if it works for you)
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import KitchenMode from "./pages/KitchenMode";
import RestaurantMode from "./pages/RestaurantMode";
import RecipeGenerator from "./pages/RecipeGenerator";
import VRTraining from "./pages/VRTraining";
import Skills from "./pages/Skills";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";

// --- IMPORT THE PROTECTED ROUTE COMPONENT ---
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} /> 

          {/* --- PROTECTED ROUTES --- */}
          {/* All routes inside here will be protected by the guard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/kitchen-mode" element={<KitchenMode />} />
            <Route path="/restaurant-mode" element={<RestaurantMode />} />
            <Route path="/recipe-generator" element={<RecipeGenerator />} />
            <Route path="/vr-training" element={<VRTraining />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* --- CATCH-ALL 404 ROUTE --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;