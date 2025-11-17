import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, User, Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  dietaryRestrictions: string[];
  healthConditions: string[];
  spicePreference: string;
  cuisineTypes: string[];
  timeAvailability: string;
}

const Settings = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    dietaryRestrictions: [],
    healthConditions: [],
    spicePreference: "medium",
    cuisineTypes: [],
    timeAvailability: "30-min",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Fetch current profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setIsFetching(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5003/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.data.profile) {
          setProfileData({
            dietaryRestrictions: data.data.profile.dietaryRestrictions || [],
            healthConditions: data.data.profile.healthConditions || [],
            spicePreference: data.data.profile.spicePreference || "medium",
            cuisineTypes: data.data.profile.cuisineTypes || [],
            timeAvailability: data.data.profile.timeAvailability || "30-min",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [getToken]);

  const toggleArrayItem = (array: string[], item: string) => {
    if (array === profileData.healthConditions) {
      if (item === "none") {
        return array.includes("none") ? [] : ["none"];
      } else if (array.includes("none") && item !== "none") {
        array = array.filter((i) => i !== "none");
      }
    }

    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = getToken();

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5003/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Failed to save settings",
          description: result.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile API Error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <div className="w-[80px]" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Update your dietary preferences and health conditions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dietary Restrictions */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl">Dietary Restrictions</CardTitle>
              <CardDescription>Select all that apply to your diet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "vegan", label: "Vegan" },
                  { id: "vegetarian", label: "Vegetarian" },
                  { id: "gluten-free", label: "Gluten-Free" },
                  { id: "keto", label: "Keto" },
                  { id: "paleo", label: "Paleo" },
                  { id: "dairy-free", label: "Dairy-Free" },
                  { id: "nut-free", label: "Nut-Free" },
                  { id: "halal", label: "Halal" },
                  { id: "kosher", label: "Kosher" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={profileData.dietaryRestrictions.includes(item.id)}
                      onCheckedChange={() =>
                        setProfileData({
                          ...profileData,
                          dietaryRestrictions: toggleArrayItem(profileData.dietaryRestrictions, item.id),
                        })
                      }
                    />
                    <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl">Health Conditions</CardTitle>
              <CardDescription>Help us personalize recipes for your health needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "diabetes", label: "Diabetes" },
                  { id: "hypertension", label: "Hypertension" },
                  { id: "heart-disease", label: "Heart Disease" },
                  { id: "high-cholesterol", label: "High Cholesterol" },
                  { id: "food-allergies", label: "Food Allergies" },
                  { id: "celiac", label: "Celiac Disease" },
                  { id: "ibs", label: "IBS" },
                  { id: "none", label: "None" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`health-${item.id}`}
                      checked={profileData.healthConditions.includes(item.id)}
                      onCheckedChange={() =>
                        setProfileData({
                          ...profileData,
                          healthConditions: toggleArrayItem(profileData.healthConditions, item.id),
                        })
                      }
                    />
                    <Label htmlFor={`health-${item.id}`} className="text-sm font-normal cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl">Cooking Preferences</CardTitle>
              <CardDescription>Customize your recipe recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Spice Preference */}
              <div className="space-y-2">
                <Label htmlFor="spice-preference">Spice Preference</Label>
                <Select
                  value={profileData.spicePreference}
                  onValueChange={(value) => setProfileData({ ...profileData, spicePreference: value })}
                >
                  <SelectTrigger id="spice-preference">
                    <SelectValue placeholder="Select spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild - No spice</SelectItem>
                    <SelectItem value="medium">Medium - Light spice</SelectItem>
                    <SelectItem value="spicy">Spicy - Moderate heat</SelectItem>
                    <SelectItem value="extra-spicy">Extra Spicy - Very hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cuisine Types */}
              <div className="space-y-3">
                <Label>Favorite Cuisines</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: "indian", label: "Indian" },
                    { id: "italian", label: "Italian" },
                    { id: "chinese", label: "Chinese" },
                    { id: "mexican", label: "Mexican" },
                    { id: "thai", label: "Thai" },
                    { id: "japanese", label: "Japanese" },
                    { id: "mediterranean", label: "Mediterranean" },
                    { id: "american", label: "American" },
                    { id: "french", label: "French" },
                    { id: "korean", label: "Korean" },
                    { id: "middle-eastern", label: "Middle Eastern" },
                    { id: "vietnamese", label: "Vietnamese" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${item.id}`}
                        checked={profileData.cuisineTypes.includes(item.id)}
                        onCheckedChange={() =>
                          setProfileData({
                            ...profileData,
                            cuisineTypes: toggleArrayItem(profileData.cuisineTypes, item.id),
                          })
                        }
                      />
                      <Label htmlFor={`cuisine-${item.id}`} className="text-sm font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Availability */}
              <div className="space-y-2">
                <Label htmlFor="time-availability">Cooking Time Available</Label>
                <Select
                  value={profileData.timeAvailability}
                  onValueChange={(value) => setProfileData({ ...profileData, timeAvailability: value })}
                >
                  <SelectTrigger id="time-availability">
                    <SelectValue placeholder="Select cooking time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-min">15 minutes or less (Quick meals)</SelectItem>
                    <SelectItem value="30-min">30 minutes (Standard)</SelectItem>
                    <SelectItem value="45-min">45 minutes (Moderate)</SelectItem>
                    <SelectItem value="60-min">1 hour (Full meals)</SelectItem>
                    <SelectItem value="60-plus">More than 1 hour (Elaborate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Settings;
