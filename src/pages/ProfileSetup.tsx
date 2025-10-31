import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  dietaryRestrictions: string[];
  healthConditions: string[];
  spicePreference: string;
  cuisineTypes: string[];
  timeAvailability: string;
}

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    dietaryRestrictions: [],
    healthConditions: [],
    spicePreference: "",
    cuisineTypes: [],
    timeAvailability: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to save profile
    setTimeout(() => {
      toast({
        title: "Profile saved!",
        description: "Your preferences have been saved successfully",
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 gradient-subtle">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Profile</h1>
          <p className="text-muted-foreground">Help us personalize your cooking experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dietary Restrictions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl">Dietary Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "vegan", label: "Vegan" },
                  { id: "vegetarian", label: "Vegetarian" },
                  { id: "gluten-free", label: "Gluten-Free" },
                  { id: "keto", label: "Keto" },
                  { id: "paleo", label: "Paleo" },
                  { id: "dairy-free", label: "Dairy-Free" },
                  { id: "nut-free", label: "Nut-Free" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={profileData.dietaryRestrictions.includes(item.id)}
                      onCheckedChange={() =>
                        setProfileData({
                          ...profileData,
                          dietaryRestrictions: toggleArrayItem(
                            profileData.dietaryRestrictions,
                            item.id
                          ),
                        })
                      }
                    />
                    <Label
                      htmlFor={item.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl">Health Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "diabetes", label: "Diabetes" },
                  { id: "hypertension", label: "Hypertension" },
                  { id: "heart-disease", label: "Heart Disease" },
                  { id: "food-allergies", label: "Food Allergies" },
                  { id: "none", label: "None" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={profileData.healthConditions.includes(item.id)}
                      onCheckedChange={() =>
                        setProfileData({
                          ...profileData,
                          healthConditions: toggleArrayItem(
                            profileData.healthConditions,
                            item.id
                          ),
                        })
                      }
                    />
                    <Label
                      htmlFor={item.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Spice Preference */}
              <div className="space-y-2">
                <Label htmlFor="spice-preference">Spice Preference</Label>
                <Select
                  value={profileData.spicePreference}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, spicePreference: value })
                  }
                >
                  <SelectTrigger id="spice-preference">
                    <SelectValue placeholder="Select spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="spicy">Spicy</SelectItem>
                    <SelectItem value="extra-spicy">Extra Spicy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cuisine Types */}
              <div className="space-y-3">
                <Label>Cuisine Types</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "italian", label: "Italian" },
                    { id: "asian", label: "Asian" },
                    { id: "mexican", label: "Mexican" },
                    { id: "mediterranean", label: "Mediterranean" },
                    { id: "indian", label: "Indian" },
                    { id: "american", label: "American" },
                    { id: "french", label: "French" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={profileData.cuisineTypes.includes(item.id)}
                        onCheckedChange={() =>
                          setProfileData({
                            ...profileData,
                            cuisineTypes: toggleArrayItem(
                              profileData.cuisineTypes,
                              item.id
                            ),
                          })
                        }
                      />
                      <Label
                        htmlFor={item.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Availability */}
              <div className="space-y-2">
                <Label htmlFor="time-availability">Time Availability</Label>
                <Select
                  value={profileData.timeAvailability}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, timeAvailability: value })
                  }
                >
                  <SelectTrigger id="time-availability">
                    <SelectValue placeholder="Select cooking time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-min">15 minutes or less</SelectItem>
                    <SelectItem value="30-min">30 minutes</SelectItem>
                    <SelectItem value="45-min">45 minutes</SelectItem>
                    <SelectItem value="60-min">1 hour</SelectItem>
                    <SelectItem value="60-plus">More than 1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
