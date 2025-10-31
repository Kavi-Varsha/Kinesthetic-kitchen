import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const RestaurantMode = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);

  const menuItems = [
    {
      name: "Grilled Salmon with Quinoa",
      description: "Fresh Atlantic salmon with quinoa and vegetables",
      price: "₹2,099",
      status: "recommended",
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      name: "Chicken Tikka Masala",
      description: "Tender chicken in creamy tomato curry sauce with basmati rice",
      price: "₹899",
      status: "recommended",
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      name: "Palak Paneer",
      description: "Fresh cottage cheese cubes in spinach gravy curry",
      price: "₹449",
      status: "caution",
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      name: "Dal Tadka",
      description: "Yellow lentils tempered with spices",
      price: "₹349",
      status: "recommended",
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!scanned ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">🍽️ Scan Restaurant Menu</h1>
              <p className="text-muted-foreground">
                Upload a photo of the menu to get personalized health recommendations
              </p>
            </div>

            <Card className="shadow-elegant">
              <CardContent className="pt-6 space-y-4">
                <Button className="w-full gap-2" size="lg">
                  <Camera className="w-5 h-5" />
                  Take Photo
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => setScanned(true)}
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </Button>

                <Button variant="outline" className="w-full">
                  Choose from Gallery
                </Button>
              </CardContent>
            </Card>

            <p className="text-sm text-center text-muted-foreground">
              We'll analyze the menu items based on your health profile
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">Spice Garden Indian & Mediterranean Restaurant</h1>
              <p className="text-muted-foreground text-sm">Health Analysis Complete</p>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">📊 Menu Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-2xl font-bold">14</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-2xl font-bold">9</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Caution</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <p className="text-2xl font-bold">6</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Avoid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">All</Badge>
              <Badge variant="outline" className="whitespace-nowrap">✓ Recommended</Badge>
              <Badge variant="outline" className="whitespace-nowrap">⚠ Caution</Badge>
              <Badge variant="outline" className="whitespace-nowrap">✗ Avoid</Badge>
            </div>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <Card 
                  key={index}
                  className={`shadow-soft cursor-pointer hover-scale ${
                    item.status === "recommended" 
                      ? "border-l-4 border-green-500" 
                      : item.status === "caution"
                      ? "border-l-4 border-yellow-500"
                      : "border-l-4 border-red-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.icon}
                          <h3 className="font-semibold">{item.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <p className="font-semibold text-primary">{item.price}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs whitespace-nowrap"
                      >
                        Recommended
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantMode;
