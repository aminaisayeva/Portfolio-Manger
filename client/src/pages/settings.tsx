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
import * as XLSX from 'xlsx';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  DollarSign, 
  Activity,
  Download,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Settings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [exportLoading, setExportLoading] = useState({
    transactions: false,
    holdings: false,
    full: false
  });
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





  const exportPortfolioData = async (type: 'transactions' | 'holdings' | 'full') => {
    try {
      // Set loading state
      setExportLoading(prev => ({ ...prev, [type]: true }));
      
      // Show loading toast
      toast({
        title: "Export Started",
        description: `Fetching ${type} data from database...`
      });
      
      let message = "";
      let data: any;
      
      // Fetch real data from backend based on export type
      switch (type) {
        case 'transactions':
          message = "Fetching transaction history...";
          const transactionsResponse = await apiRequest('GET', '/api/export/transactions');
          data = await transactionsResponse.json();
          break;
          
        case 'holdings':
          message = "Fetching portfolio holdings...";
          const holdingsResponse = await apiRequest('GET', '/api/export/holdings');
          data = await holdingsResponse.json();
          break;
          
        case 'full':
          message = "Fetching full portfolio data...";
          const fullResponse = await apiRequest('GET', '/api/export/full-portfolio');
          data = await fullResponse.json();
          break;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data');
      }
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      switch (type) {
        case 'transactions':
          if (data.data && data.data.length > 0) {
            const transactionsSheet = XLSX.utils.json_to_sheet(data.data);
            XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
          }
          break;
          
        case 'holdings':
          if (data.data && data.data.length > 0) {
            const holdingsSheet = XLSX.utils.json_to_sheet(data.data);
            XLSX.utils.book_append_sheet(workbook, holdingsSheet, 'Holdings');
          }
          break;
          
        case 'full':
          if (data.portfolioSummary) {
            // Summary sheet
            const summaryData = [
              { metric: 'Total Portfolio Value', value: `$${data.portfolioSummary.totalPortfolioValue.toLocaleString()}` },
              { metric: 'Total Stock Value', value: `$${data.portfolioSummary.totalStockValue.toLocaleString()}` },
              { metric: 'Cash Balance', value: `$${data.portfolioSummary.cashBalance.toLocaleString()}` },
              { metric: 'Total Cost Basis', value: `$${data.portfolioSummary.totalCost.toLocaleString()}` },
              { metric: 'Total Gain/Loss', value: `$${data.portfolioSummary.totalGainLoss.toLocaleString()}` },
              { metric: 'Total Gain/Loss %', value: `${data.portfolioSummary.totalGainLossPercent.toFixed(2)}%` },
              { metric: 'Number of Positions', value: data.portfolioSummary.numberOfPositions },
              { metric: 'Export Date', value: new Date(data.exportDate).toLocaleDateString() }
            ];
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Portfolio Summary');
          }
          
          if (data.holdings && data.holdings.length > 0) {
            // Holdings sheet
            const holdingsSheet = XLSX.utils.json_to_sheet(data.holdings);
            XLSX.utils.book_append_sheet(workbook, holdingsSheet, 'Current Holdings');
          }
          
          if (data.transactions && data.transactions.length > 0) {
            // Transactions sheet
            const transactionsSheet = XLSX.utils.json_to_sheet(data.transactions);
            XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transaction History');
          }
          
          if (data.sectorAllocation && data.sectorAllocation.length > 0) {
            // Sector Allocation sheet
            const sectorSheet = XLSX.utils.json_to_sheet(data.sectorAllocation);
            XLSX.utils.book_append_sheet(workbook, sectorSheet, 'Sector Allocation');
          }
          
          if (data.performanceAnalytics && data.performanceAnalytics.length > 0) {
            // Performance Analytics sheet
            const performanceSheet = XLSX.utils.json_to_sheet(data.performanceAnalytics);
            XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Performance Analytics');
          }
          
          if (data.riskMetrics && data.riskMetrics.length > 0) {
            // Risk Metrics sheet
            const riskSheet = XLSX.utils.json_to_sheet(data.riskMetrics);
            XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Metrics');
          }
          break;
      }
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `portfolio_${type}_${timestamp}.xlsx`;
      
      // Download the file
      XLSX.writeFile(workbook, filename);
      
      toast({
        title: "Export Complete",
        description: `Your ${type} data has been downloaded as ${filename}`
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive"
      });
    } finally {
      // Reset loading state
      setExportLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const tabItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "data", label: "Data", icon: Download },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
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
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
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
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
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
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
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
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Portfolio Data Export Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground text-lg mb-2">Portfolio Data Export</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export your portfolio information in various formats. Choose what data you want to export.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Transactions Export */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground">Transaction History</h5>
                          <p className="text-xs text-muted-foreground">Buy/sell records</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Export all your trading transactions including dates, symbols, quantities, prices, and fees.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('transactions')} 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        disabled={exportLoading.transactions}
                      >
                        {exportLoading.transactions ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Transactions
                      </Button>
                    </div>

                    {/* Holdings Export */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground">Portfolio Holdings</h5>
                          <p className="text-xs text-muted-foreground">Current positions</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Export your current portfolio holdings with quantities, market values, and performance metrics.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('holdings')} 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        disabled={exportLoading.holdings}
                      >
                        {exportLoading.holdings ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Holdings
                      </Button>
                    </div>

                    {/* Full Export */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground">Full Portfolio Data</h5>
                          <p className="text-xs text-muted-foreground">Complete export</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Comprehensive export with multiple Excel tabs including all portfolio data, transactions, and analytics.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('full')} 
                        className="w-full"
                        size="sm"
                        disabled={exportLoading.full}
                      >
                        {exportLoading.full ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Full Data
                      </Button>
                    </div>
                  </div>

                  {/* Full Export Details */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h5 className="font-medium text-foreground mb-3">Full Export Includes:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-muted-foreground">General Portfolio Summary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">Current Holdings & Positions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-muted-foreground">Transaction History</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-muted-foreground">Performance Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-muted-foreground">Dividend History</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-muted-foreground">Risk Metrics & Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>


              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
            <p className="text-xl text-muted-foreground mt-2">Manage your profile, security, and preferences</p>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar - Navigation Tabs */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <FloatingAIChat />
    </div>
  );
}