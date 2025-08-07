import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  DollarSign, 
  Activity,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Settings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User profile state
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    currency: "USD"
  });

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketAlerts: true,
    portfolioUpdates: true,
    tradingAlerts: false,
    weeklyReports: true
  });

  // App preferences
  const [appSettings, setAppSettings] = useState({
    theme: "dark",
    language: "en",
    defaultView: "dashboard",
    autoRefresh: true,
    refreshInterval: "30",
    compactMode: false
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest('POST', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const saveSecurityMutation = useMutation({
    mutationFn: async (data: typeof securityData) => {
      const response = await apiRequest('POST', '/api/user/security', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security settings updated successfully"
      });
      setSecurityData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    }
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: { notifications: typeof notificationSettings, app: typeof appSettings }) => {
      const response = await apiRequest('POST', '/api/user/preferences', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preferences updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  });

  const handleProfileSave = () => {
    saveProfileMutation.mutate(profileData);
  };

  const handleSecuritySave = () => {
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    saveSecurityMutation.mutate(securityData);
  };

  const handlePreferencesSave = () => {
    savePreferencesMutation.mutate({
      notifications: notificationSettings,
      app: appSettings
    });
  };

  const exportData = () => {
    // Mock data export
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
            <p className="text-xl text-muted-foreground mt-2">Manage your profile, security, and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Navigation Menu */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-24">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <a href="#profile" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </a>
                    <a href="#security" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Shield className="w-4 h-4" />
                      <span>Security</span>
                    </a>
                    <a href="#notifications" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </a>
                    <a href="#preferences" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Palette className="w-4 h-4" />
                      <span>Preferences</span>
                    </a>
                    <a href="#billing" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <DollarSign className="w-4 h-4" />
                      <span>Billing</span>
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card id="profile" className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 gradient-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">AJ</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">Alex Johnson</h3>
                      <p className="text-sm text-muted-foreground">Premium Member</p>
                      <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleProfileSave}
                    disabled={saveProfileMutation.isPending}
                    className="gradient-blue text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card id="security" className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-background border-border text-foreground pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="bg-background border-border text-foreground pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={securityData.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>

                  <Button 
                    onClick={handleSecuritySave}
                    disabled={saveSecurityMutation.isPending}
                    className="gradient-blue text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {saveSecurityMutation.isPending ? "Updating..." : "Update Security"}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card id="notifications" className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    emailNotifications: "Email Notifications",
                    pushNotifications: "Push Notifications",
                    marketAlerts: "Market Alerts",
                    portfolioUpdates: "Portfolio Updates",
                    tradingAlerts: "Trading Alerts",
                    weeklyReports: "Weekly Reports"
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {key === 'emailNotifications' && "Receive notifications via email"}
                          {key === 'pushNotifications' && "Receive push notifications on your device"}
                          {key === 'marketAlerts' && "Get notified about important market changes"}
                          {key === 'portfolioUpdates' && "Updates about your portfolio performance"}
                          {key === 'tradingAlerts' && "Alerts for executed trades and orders"}
                          {key === 'weeklyReports' && "Weekly summary of your portfolio"}
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings[key as keyof typeof notificationSettings]}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* App Preferences */}
              <Card id="preferences" className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>App Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={appSettings.theme} onValueChange={(value) => setAppSettings(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="defaultView">Default View</Label>
                      <Select value={appSettings.defaultView} onValueChange={(value) => setAppSettings(prev => ({ ...prev, defaultView: value }))}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="portfolio">Portfolio</SelectItem>
                          <SelectItem value="trading">Trading</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Auto Refresh</h4>
                      <p className="text-sm text-muted-foreground">Automatically refresh market data</p>
                    </div>
                    <Switch
                      checked={appSettings.autoRefresh}
                      onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, autoRefresh: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Compact Mode</h4>
                      <p className="text-sm text-muted-foreground">Show more data in less space</p>
                    </div>
                    <Switch
                      checked={appSettings.compactMode}
                      onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, compactMode: checked }))}
                    />
                  </div>

                  <Button 
                    onClick={handlePreferencesSave}
                    disabled={savePreferencesMutation.isPending}
                    className="gradient-blue text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>

              {/* Data & Privacy */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Data & Privacy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Export Your Data</h4>
                      <p className="text-sm text-muted-foreground">Download a copy of all your account data</p>
                    </div>
                    <Button onClick={exportData} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground text-red-400">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FloatingAIChat />
    </div>
  );
}