import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Camera, Upload, CheckCircle, XCircle, AlertCircle,
  Loader2, Lightbulb, ArrowRightLeft, Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import Tesseract from "tesseract.js";

interface MenuDish {
  name: string;
  description: string;
  suitability: "safe" | "caution" | "avoid";
  reason: string;
}

interface MenuAnalysis {
  dishes: MenuDish[];
  ingredients: string[];
  substitutions: { original: string; substitute: string; reason: string }[];
  recommendations: { dish: string; modification: string }[];
}

const RestaurantMode = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [menuText, setMenuText] = useState("");
  const [menuAnalysis, setMenuAnalysis] = useState<MenuAnalysis | null>(null);
  const [isAnalyzingMenu, setIsAnalyzingMenu] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageOCR = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrProgress(0);

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      toast({
        title: "Processing Image",
        description: "Extracting text from menu image...",
      });

      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;

      if (extractedText.trim()) {
        setMenuText(extractedText);
        setShowTextInput(true);
        toast({
          title: "Text Extracted!",
          description: "Menu text has been extracted. You can edit it before analysis.",
        });
      } else {
        toast({
          title: "No Text Found",
          description: "Could not extract text from the image. Please try a clearer image or enter text manually.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("OCR Error:", err);
      toast({
        title: "OCR Failed",
        description: "Failed to process the image. Please try again or enter text manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      processImageOCR(file);
    }
  };

  const analyzeMenu = async () => {
    if (!menuText.trim()) return;

    setIsAnalyzingMenu(true);
    const token = getToken();

    try {
      const response = await fetch("http://localhost:5003/api/menu/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ menuText }),
      });

      const data = await response.json();
      if (data.success) {
        setMenuAnalysis(data.data);
      } else {
        throw new Error(data.message || "Failed to analyze menu");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to analyze menu",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingMenu(false);
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case "safe":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "caution":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "avoid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "safe":
        return "border-l-4 border-green-500 bg-green-50/50";
      case "caution":
        return "border-l-4 border-yellow-500 bg-yellow-50/50";
      case "avoid":
        return "border-l-4 border-red-500 bg-red-50/50";
      default:
        return "";
    }
  };

  const getBadgeColor = (suitability: string) => {
    switch (suitability) {
      case "safe":
        return "bg-green-100 text-green-800";
      case "caution":
        return "bg-yellow-100 text-yellow-800";
      case "avoid":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const resetScan = () => {
    setMenuAnalysis(null);
    setMenuText("");
    setShowTextInput(false);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen gradient-subtle">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!menuAnalysis ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Scan Restaurant Menu</h1>
              <p className="text-muted-foreground">
                Upload a photo or paste menu text to get personalized health recommendations
              </p>
            </div>

            <Card className="shadow-elegant">
              <CardContent className="pt-6 space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  {isProcessingOCR ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                      <p className="text-primary font-medium">Processing Image...</p>
                      <div className="max-w-xs mx-auto">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{ocrProgress}% complete</p>
                      </div>
                    </div>
                  ) : uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded menu"
                        className="max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Image processed successfully!
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetScan}
                      >
                        Upload Different Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Upload a menu image for OCR text extraction
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supports JPG, PNG, and other image formats
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="max-w-xs mx-auto"
                        onChange={handleFileUpload}
                      />
                    </>
                  )}
                </div>

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
                  onClick={() => setShowTextInput(true)}
                  disabled={isProcessingOCR}
                >
                  <Camera className="w-5 h-5" />
                  Enter Menu Text Manually
                </Button>
              </CardContent>
            </Card>

            {showTextInput && (
              <Card className="shadow-elegant animate-in fade-in-50">
                <CardHeader>
                  <CardTitle>Paste Menu Text</CardTitle>
                  <CardDescription>
                    Copy and paste the menu items from the restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full min-h-[250px] p-3 border rounded-md resize-y font-mono text-sm"
                    placeholder="Paste the restaurant menu text here...&#10;&#10;Example:&#10;APPETIZERS&#10;Chicken Wings - $12.99&#10;Caesar Salad with Croutons - $10.99&#10;&#10;MAIN COURSES&#10;Grilled Salmon with Vegetables - $24.99&#10;Pasta Carbonara - $18.99&#10;Beef Steak with Mushroom Sauce - $29.99"
                    value={menuText}
                    onChange={(e) => setMenuText(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={analyzeMenu}
                    disabled={!menuText.trim() || isAnalyzingMenu}
                  >
                    {isAnalyzingMenu ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Menu...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Analyze Menu
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <p className="text-sm text-center text-muted-foreground">
              We'll analyze the menu items based on your health profile and dietary restrictions
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Menu Analysis Complete</h1>
                <p className="text-muted-foreground text-sm">
                  Personalized recommendations based on your health profile
                </p>
              </div>
              <Button variant="outline" onClick={resetScan}>
                Scan New Menu
              </Button>
            </div>

            {/* Summary Stats */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Menu Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-3xl font-bold text-green-700">
                        {menuAnalysis.dishes.filter(d => d.suitability === "safe").length}
                      </p>
                    </div>
                    <p className="text-sm text-green-700 font-medium">Safe to Order</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-3xl font-bold text-yellow-700">
                        {menuAnalysis.dishes.filter(d => d.suitability === "caution").length}
                      </p>
                    </div>
                    <p className="text-sm text-yellow-700 font-medium">Use Caution</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <p className="text-3xl font-bold text-red-700">
                        {menuAnalysis.dishes.filter(d => d.suitability === "avoid").length}
                      </p>
                    </div>
                    <p className="text-sm text-red-700 font-medium">Avoid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dish Analysis */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Dish Analysis</CardTitle>
                <CardDescription>Each dish rated based on your dietary profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {menuAnalysis.dishes.map((dish, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${getSuitabilityColor(dish.suitability)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSuitabilityIcon(dish.suitability)}
                            <h3 className="font-semibold">{dish.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{dish.description}</p>
                          <p className="text-sm opacity-80">{dish.reason}</p>
                        </div>
                        <Badge className={getBadgeColor(dish.suitability)}>
                          {dish.suitability.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Ingredients */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Key Ingredients Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {menuAnalysis.ingredients.map((ing, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {ing}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Substitutions */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Ask for Substitutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {menuAnalysis.substitutions.map((sub, idx) => (
                      <div key={idx} className="text-sm">
                        <p>
                          <span className="line-through text-muted-foreground">{sub.original}</span>
                          {" → "}
                          <span className="font-medium text-primary">{sub.substitute}</span>
                        </p>
                        <p className="text-muted-foreground text-xs">{sub.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ordering Recommendations */}
            <Card className="shadow-elegant border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Ordering Recommendations
                </CardTitle>
                <CardDescription>
                  How to customize your order for better health outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="font-semibold text-primary">{rec.dish}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rec.modification}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </main>
      </div>
    </AppLayout>
  );
};

export default RestaurantMode;
