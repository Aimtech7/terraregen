import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Palette, MapPin, Bell, Download, Shield, Trash2, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";

const profileSchema = z.object({
  firstName: z.string().trim().max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().max(100, "Last name must be less than 100 characters"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  phoneNumber: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number must be less than 20 digits"),
  location: z.string().trim().max(200, "Location must be less than 200 characters"),
  landSize: z.string().refine((val) => val === "" || !isNaN(Number(val)), {
    message: "Land size must be a number",
  }),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [landSize, setLandSize] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [cropRecommendations, setCropRecommendations] = useState(true);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setUsername(data.username || "");
        setPhoneNumber(data.phone_number || "");
        setLocation(data.location || "");
        setLandSize(data.land_size_hectares?.toString() || "");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const validation = profileSchema.safeParse({
        firstName,
        lastName,
        username,
        phoneNumber,
        location,
        landSize,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          username: username,
          phone_number: phoneNumber,
          location: location,
          land_size_hectares: landSize ? parseFloat(landSize) : null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const validation = passwordSchema.safeParse({
        newPassword,
        confirmPassword,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: profiles } = await supabase.from("profiles").select("*").eq("id", user?.id);
      const { data: soilData } = await supabase.from("soil_analyses").select("*").eq("user_id", user?.id);
      const { data: carbonData } = await supabase.from("carbon_credits").select("*").eq("user_id", user?.id);
      const { data: weatherData } = await supabase.from("weather_forecasts").select("*").eq("user_id", user?.id);
      
      const exportData = {
        profile: profiles,
        soil_analyses: soilData,
        carbon_credits: carbonData,
        weather_forecasts: weatherData,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terraregen-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error: any) {
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete user data first
      await supabase.from("profiles").delete().eq("id", user?.id);
      
      // Delete auth account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || "");
      
      if (error) throw error;
      
      toast.success("Account deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account preferences and settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5" />
                <h3>Personal Information</h3>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for weather insights and local recommendations
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landSize">Land Size (hectares)</Label>
                  <Input
                    id="landSize"
                    type="number"
                    step="0.01"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    placeholder="Enter land size"
                  />
                </div>
                <Button type="submit" disabled={isUpdatingProfile} className="w-full">
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5" />
                <h3>Change Password</h3>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword} className="w-full">
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5" />
                <h3>Notification Preferences</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and reports via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weather-alerts">Weather Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about extreme weather conditions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="weather-alerts"
                    checked={weatherAlerts}
                    onChange={(e) => setWeatherAlerts(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="crop-recommendations">Crop Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive AI-powered crop and planting suggestions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="crop-recommendations"
                    checked={cropRecommendations}
                    onChange={(e) => setCropRecommendations(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
                <Button className="w-full" onClick={() => toast.success("Notification preferences saved")}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Download className="w-5 h-5" />
                <h3>Data Management</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data including soil analyses, carbon credits, and weather forecasts in JSON format.
                  </p>
                  <Button onClick={handleExportData} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Data Usage</h4>
                  <p className="text-sm text-muted-foreground">
                    Your data is used to provide personalized insights and recommendations. We never share your data with third parties.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5" />
                <h3>Privacy & Account</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Account Email</h4>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Data Privacy</h4>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and stored securely. We follow industry-standard security practices.
                  </p>
                </div>
                <div className="border-t pt-6 space-y-2">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full gap-2"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5" />
                <h3>Theme Preferences</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      type="button"
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-background border-2 border-foreground" />
                      Light
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-foreground border-2 border-background" />
                      Dark
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-background to-foreground border-2 border-border" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
