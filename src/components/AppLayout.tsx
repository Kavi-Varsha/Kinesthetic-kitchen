import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu, Home, ChefHat, Camera, Settings, LogOut,
  User, BookOpen, X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: ChefHat, label: "Kitchen Mode", path: "/kitchen-mode" },
    { icon: BookOpen, label: "Recipe Generator", path: "/recipe-generator" },
    { icon: Camera, label: "Menu Scanner", path: "/restaurant-mode" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-bold">HealthChef</h2>
                        <p className="text-xs text-muted-foreground">AI Recipe Assistant</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 py-4">
                    <div className="space-y-1 px-2">
                      {navItems.map((item) => (
                        <Button
                          key={item.path}
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => handleNavigation(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="font-bold">HealthChef</span>
            </div>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content with padding for fixed nav */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
