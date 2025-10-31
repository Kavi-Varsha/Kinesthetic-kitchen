

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// FIX: Added .tsx extension to all page imports to resolve "Could not resolve" errors
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import ProfileSetup from "./pages/ProfileSetup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import KitchenMode from "./pages/KitchenMode.tsx";
import RestaurantMode from "./pages/RestaurantMode.tsx";
import RecipeGenerator from "./pages/RecipeGenerator.tsx";
import VRTraining from "./pages/VRTraining.tsx";
import Skills from "./pages/Skills.tsx";
import NotFound from "./pages/NotFound.tsx";
import ResetPassword from "./pages/ResetPassword.tsx"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* This route is for the token received via email */}
          <Route path="/resetpassword/:token" element={<ResetPassword />} /> 
          <Route path="/kitchen-mode" element={<KitchenMode />} />
          <Route path="/restaurant-mode" element={<RestaurantMode />} />
          <Route path="/recipe-generator" element={<RecipeGenerator />} />
          <Route path="/vr-training" element={<VRTraining />} />
          <Route path="/skills" element={<Skills />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;