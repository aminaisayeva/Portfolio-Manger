import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { useTheme } from "@/contexts/theme-context";
import * as XLSX from 'xlsx';
import { 
  User, 
  Download,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Theme = 'light' | 'dark' | 'system';

export function Settings() {

  const [activeTab, setActiveTab] = useState("profile");
  const [exportLoading, setExportLoading] = useState({
    transactions: false,
    holdings: false,
    full: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // User profile state
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com"
  });

  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('user-profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
      }
    }
  }, []);



  const saveProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      // Simulate API call - in real app this would go to backend
      return new Promise((resolve) => {
        setTimeout(() => {
          // Save to localStorage
          localStorage.setItem('user-profile', JSON.stringify(data));
          resolve({ success: true, data });
        }, 1000);
      });
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



  const handleProfileSave = () => {
    // Basic validation
    if (!profileData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return;
    }

    if (!profileData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email address is required",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    saveProfileMutation.mutate(profileData);
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
                  <div className="w-16 h-16 gradient-blue rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">{getInitials(profileData.name)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">Premium Member</p>
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
                      placeholder="Enter your full name"
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
                      placeholder="Enter your email address"
                    />
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
                    <div className="bg-muted/50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shadow-sm">
                          <Download className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Transaction History</h5>
                          <p className="text-xs text-muted-foreground font-medium">Buy/sell records</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        Export all your trading transactions including dates, symbols, quantities, prices, and fees.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('transactions')} 
                        variant="outline" 
                        size="sm"
                        className="w-full border-2 hover:border-blue-300"
                        disabled={exportLoading.transactions}
                      >
                        {exportLoading.transactions ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Transactions
                      </Button>
                    </div>

                    {/* Holdings Export */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shadow-sm">
                          <Download className="w-5 h-5 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Portfolio Holdings</h5>
                          <p className="text-xs text-muted-foreground font-medium">Current positions</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        Export your current portfolio holdings with quantities, market values, and performance metrics.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('holdings')} 
                        variant="outline" 
                        size="sm"
                        className="w-full border-2 hover:border-green-300"
                        disabled={exportLoading.holdings}
                      >
                        {exportLoading.holdings ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Holdings
                      </Button>
                    </div>

                    {/* Full Export */}
                    <div className="bg-muted/50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shadow-sm">
                          <Download className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Full Portfolio Data</h5>
                          <p className="text-xs text-muted-foreground font-medium">Complete export</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        Comprehensive export with multiple Excel tabs including all portfolio data, transactions, and analytics.
                      </p>
                      <Button 
                        onClick={() => exportPortfolioData('full')} 
                        variant="outline"
                        size="sm"
                        className="w-full border-2 hover:border-purple-300"
                        disabled={exportLoading.full}
                      >
                        {exportLoading.full ? "Exporting..." : <Download className="w-4 h-4 mr-2" />}
                        Export Full Data
                      </Button>
                    </div>
                  </div>

                  {/* Full Export Details */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h5 className="font-semibold text-foreground mb-4 text-lg">Full Export Includes:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">General Portfolio Summary</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">Current Holdings & Positions</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-yellow-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">Transaction History</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-purple-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">Performance Analytics</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">Dividend History</span>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50 border border-border hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-sm"></div>
                        <span className="text-foreground font-medium">Risk Metrics & Analysis</span>
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
            <p className="text-xl text-muted-foreground mt-2">Manage your profile and preferences</p>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar - Navigation Tabs */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-3 space-y-1 shadow-sm">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm"
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

  
    </div>
  );
}