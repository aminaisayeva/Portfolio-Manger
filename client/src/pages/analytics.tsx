import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, TrendingDown, Target, PieChart as PieChartIcon, BarChart3, Activity, Star, Calendar, DollarSign, HelpCircle } from "lucide-react";

// Custom styles for enhanced chart interactions
const chartStyles = `
  .recharts-bar-rectangle {
    transition: all 0.2s ease;
  }
  
  .recharts-bar-rectangle:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .recharts-tooltip-wrapper {
    z-index: 1000;
  }
  
  .recharts-default-tooltip {
    border-radius: 12px !important;
    backdrop-filter: blur(8px) !important;
  }
`;

// Sector allocation will be loaded from backend data

// Performance metrics will be calculated dynamically based on filtered data

// Monthly returns will be loaded from backend data

// Risk metrics will be calculated dynamically based on portfolio data



// Correlation data will be calculated dynamically based on portfolio data

export function Analytics() {
  const [timeframe, setTimeframe] = useState("6M");
  
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000
  });

  // Tooltip content for different metrics
  const metricTooltips = {
    sectorAllocation: {
      title: "Sector Allocation",
      description: "Shows how your portfolio is distributed across different industry sectors like Technology, Healthcare, Finance, etc. This helps you understand your exposure to different parts of the economy.",
      goodBad: "Good: 5-8 sectors with no single sector >30%. Bad: Over 50% in one sector.",
      firstTimeInfo: "💡 For first-time investors: Diversification across sectors reduces risk. If one industry struggles, others may perform well. Aim to spread your money across different sectors rather than putting everything in one area."
    },
    monthlyReturns: {
      title: "Monthly Returns vs S&P 500",
      description: "Compares your portfolio's monthly performance against the S&P 500 benchmark. The S&P 500 represents the 500 largest US companies and is considered the 'market average'.",
      goodBad: "Good: Consistently outperforming benchmark. Bad: Consistently underperforming by >5%.",
      firstTimeInfo: "💡 For first-time investors: The S&P 500 is your benchmark - it's what you're trying to beat. If you consistently underperform, consider index funds. Outperforming means you're doing better than the average investor."
    },
    topPerformers: {
      title: "Top Performers",
      description: "Your best-performing stocks that have generated the highest returns. These contribute most to your portfolio gains and show which investments are working well.",
      goodBad: "Good: Diversified top performers across sectors. Bad: All top performers from same sector.",
      firstTimeInfo: "💡 For first-time investors: Celebrate your winners, but don't get overconfident. Past performance doesn't guarantee future results. Consider taking some profits if a stock has grown significantly."
    },
    underPerformers: {
      title: "Underperformers",
      description: "Stocks that have declined in value. These need attention to decide if you should hold, sell, or buy more at lower prices.",
      goodBad: "Good: Limited underperformers (<20% of portfolio). Bad: Many underperformers or large losses.",
      firstTimeInfo: "💡 For first-time investors: Don't panic sell! Review why the stock declined. If the company fundamentals are still strong, it might be a buying opportunity. If not, consider cutting losses."
    },
    correlation: {
      title: "Asset Correlation Matrix",
      description: "Shows how closely your portfolio moves with major market indices. Lower correlation means better diversification and reduced risk.",
      goodBad: "Good: Correlation <0.3. Bad: Correlation >0.7 (high correlation with market).",
      firstTimeInfo: "💡 For first-time investors: Correlation measures how assets move together. Low correlation (closer to 0) is good - it means when one investment falls, others may rise, reducing overall risk."
    },
    performanceSummary: {
      title: "Performance Summary",
      description: "Shows your portfolio's total return, benchmark comparison, and outperformance over the selected timeframe. This is your overall report card.",
      goodBad: "Good: Outperforming benchmark. Bad: Underperforming by >5%.",
      firstTimeInfo: "💡 For first-time investors: This is your portfolio's report card. Compare it to the S&P 500 to see if you're beating the market average. Remember, long-term performance matters more than short-term results."
    },
    totalreturn: {
      title: "Total Return",
      description: "The complete return on your investment including price changes and any dividends received. This is your actual profit or loss.",
      goodBad: "Good: Positive returns. Bad: Negative returns.",
      firstTimeInfo: "💡 For first-time investors: Total return includes both price gains/losses AND dividends. A stock might lose value but still pay dividends, reducing your total loss."
    },
    annualizedreturn: {
      title: "Annualized Return",
      description: "Your return converted to an annual rate, making it easier to compare different time periods. Shows what you'd earn if the same rate continued for a full year.",
      goodBad: "Good: Higher than inflation (usually >3%). Bad: Below inflation rate.",
      firstTimeInfo: "💡 For first-time investors: This converts your actual returns to an annual percentage. If you earned 6% in 6 months, your annualized return would be 12%."
    },
    sharperatio: {
      title: "Sharpe Ratio",
      description: "Measures risk-adjusted returns. Higher values mean better returns relative to the risk taken. A ratio above 1.0 is considered good.",
      goodBad: "Good: ≥1.0. Bad: <0.5.",
      firstTimeInfo: "💡 For first-time investors: This measures how much return you get for the risk you take. Higher is better, but don't obsess over it. Focus on consistent, positive returns first."
    },
    portfoliobeta: {
      title: "Portfolio Beta",
      description: "Measures how volatile your portfolio is compared to the market. Beta >1 means more volatile than market, <1 means less volatile.",
      goodBad: "Good: 0.8-1.2 (balanced risk). Bad: >1.5 (very high risk).",
      firstTimeInfo: "💡 For first-time investors: Beta tells you how 'wild' your portfolio is compared to the market. Beta of 1.0 means it moves with the market. Higher beta = more risk and potential reward."
    },
    volatility: {
      title: "Volatility",
      description: "Measures how much your portfolio value fluctuates. Lower volatility means more stable, predictable returns.",
      goodBad: "Good: <15% annually. Bad: >25% annually.",
      firstTimeInfo: "💡 For first-time investors: Volatility measures how much your portfolio jumps around. Lower is usually better for beginners. High volatility can be stressful and lead to emotional decisions."
    },
    alpha: {
      title: "Alpha",
      description: "Excess return above what the market would predict based on your portfolio's risk level. Positive alpha means you're outperforming expectations.",
      goodBad: "Good: Positive alpha. Bad: Negative alpha.",
      firstTimeInfo: "💡 For first-time investors: Alpha measures your 'skill' as an investor. Positive alpha means you're beating the market after accounting for risk. This is what professional investors strive for."
    }
  };

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (!portfolioData) return { monthlyReturns: [], history: [] };
    
    const monthlyReturns = (portfolioData as any)?.monthlyReturns || [];
    const history = (portfolioData as any)?.history || [];
    
    // Calculate how many months to show based on timeframe
    const monthsToShow = {
      "1M": 1,
      "3M": 3,
      "6M": 6,
      "1Y": 12,
      "ALL": monthlyReturns.length
    };
    
    const months = monthsToShow[timeframe as keyof typeof monthsToShow] || 6;
    
    // Filter monthly returns
    const filteredReturns = monthlyReturns.slice(-months);
    
    // Filter history data (last N months of daily data)
    const daysToShow = months * 30; // Approximate
    const filteredHistory = history.slice(-daysToShow);
    
    return {
      monthlyReturns: filteredReturns,
      history: filteredHistory
    };
  };

  // Calculate top performers and underperformers from MySQL portfolio data
  const portfolioSummary = {
    totalValue: (portfolioData as any)?.totalValue || 0,
    totalGain: (portfolioData as any)?.profitLoss || 0,
    totalGainPercent: (portfolioData as any)?.monthlyGrowth || 0,
  };
  const holdings = (portfolioData as any)?.assets || [];
  const sectorAllocation = (portfolioData as any)?.sectorAllocation || [];
  
  // Get filtered data based on timeframe
  const { monthlyReturns, history: chartData } = getFilteredData();

  // Calculate dynamic performance metrics based on filtered data
  const calculatePerformanceMetrics = () => {
    if (!monthlyReturns || monthlyReturns.length === 0) {
      return [
        { metric: 'Total Return', value: '0.0%', change: '0.0%', status: 'neutral' },
        { metric: 'Annualized Return', value: '0.0%', change: '0.0%', status: 'neutral' },
        { metric: 'Sharpe Ratio', value: 'N/A', change: 'Insufficient data', status: 'neutral' },
        { metric: 'Portfolio Beta', value: '1.00', change: 'Equal to market', status: 'neutral' },
        { metric: 'Volatility', value: 'N/A', change: 'Insufficient data', status: 'neutral' },
        { metric: 'Alpha', value: '0.0%', change: '0.0%', status: 'neutral' }
      ];
    }

    // Calculate total return for the selected timeframe
    const totalReturn = monthlyReturns.reduce((sum: number, month: any) => sum + (month.returns || 0), 0);
    
    // Calculate benchmark return for comparison
    const benchmarkReturn = monthlyReturns.reduce((sum: number, month: any) => sum + (month.benchmark || 0), 0);
    
    // Calculate alpha (excess return over benchmark)
    const alpha = totalReturn - benchmarkReturn;
    
    // Calculate annualized return (assuming monthly data)
    const months = monthlyReturns.length;
    const annualizedReturn = months > 0 ? Math.pow(1 + totalReturn / 100, 12 / months) - 1 : 0;
    
    // Calculate volatility (standard deviation of monthly returns)
    const returnsArray = monthlyReturns.map((month: any) => month.returns || 0);
    const meanReturn = returnsArray.reduce((sum: number, val: number) => sum + val, 0) / returnsArray.length;
    const variance = returnsArray.reduce((sum: number, val: number) => sum + Math.pow(val - meanReturn, 2), 0) / returnsArray.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 2.0; // Annual risk-free rate
    const monthlyRiskFreeRate = riskFreeRate / 12;
    const excessReturn = meanReturn - monthlyRiskFreeRate;
    
    // Handle insufficient data for Sharpe Ratio and Volatility (especially for 1M timeframe)
    const hasInsufficientData = monthlyReturns.length < 3; // Need at least 3 data points for meaningful calculations
    
    let sharpeRatio = 0;
    let volatilityDisplay = volatility;
    let sharpeDisplay = "0.00";
    let volatilityChange = "0.0% vs target";
    let sharpeChange = "0.00 vs benchmark";
    
    if (hasInsufficientData) {
      // For insufficient data, show meaningful messages instead of 0
      sharpeDisplay = "N/A";
      volatilityDisplay = 0;
      sharpeChange = "Insufficient data";
      volatilityChange = "Insufficient data";
    } else {
      sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
      sharpeDisplay = sharpeRatio.toFixed(2);
      sharpeChange = `${sharpeRatio >= 1 ? '+' : ''}${(sharpeRatio - 1).toFixed(2)} vs benchmark`;
    }
    
    // Calculate portfolio beta (systematic risk relative to market)
    const portfolioReturns = monthlyReturns.map((month: any) => month.returns || 0);
    const marketReturns = monthlyReturns.map((month: any) => month.benchmark || 0);
    
    // Calculate covariance and variance for beta calculation
    const meanPortfolioReturn = portfolioReturns.reduce((sum: number, val: number) => sum + val, 0) / portfolioReturns.length;
    const meanMarketReturn = marketReturns.reduce((sum: number, val: number) => sum + val, 0) / marketReturns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < portfolioReturns.length; i++) {
      const portfolioDiff = portfolioReturns[i] - meanPortfolioReturn;
      const marketDiff = marketReturns[i] - meanMarketReturn;
      covariance += portfolioDiff * marketDiff;
      marketVariance += marketDiff * marketDiff;
    }
    
    const beta = marketVariance > 0 ? covariance / marketVariance : 1;

    return [
      { 
        metric: 'Total Return', 
        value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`, 
        change: `${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}% vs S&P 500`, 
        status: totalReturn >= 0 ? 'positive' : 'negative' 
      },
      { 
        metric: 'Annualized Return', 
        value: `${annualizedReturn >= 0 ? '+' : ''}${(annualizedReturn * 100).toFixed(1)}%`, 
        change: `${(annualizedReturn * 100 - benchmarkReturn) >= 0 ? '+' : ''}${((annualizedReturn * 100) - benchmarkReturn).toFixed(1)}% vs S&P 500`, 
        status: annualizedReturn >= 0 ? 'positive' : 'negative' 
      },
      { 
        metric: 'Sharpe Ratio', 
        value: sharpeDisplay, 
        change: sharpeChange, 
        status: hasInsufficientData ? 'neutral' : (sharpeRatio >= 1 ? 'positive' : 'negative')
      },
      { 
        metric: 'Portfolio Beta', 
        value: beta.toFixed(2), 
        change: `${beta > 1 ? 'Higher' : beta < 1 ? 'Lower' : 'Equal'} risk than market`, 
        status: beta <= 1 ? 'positive' : 'negative' 
      },
      { 
        metric: 'Volatility', 
        value: hasInsufficientData ? "N/A" : `${volatilityDisplay.toFixed(1)}%`, 
        change: volatilityChange, 
        status: hasInsufficientData ? 'neutral' : (volatilityDisplay <= 15 ? 'positive' : 'negative')
      },
      { 
        metric: 'Alpha', 
        value: `${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}%`, 
        change: `${alpha >= 0 ? '+' : ''}${alpha.toFixed(1)}% excess return`, 
        status: alpha >= 0 ? 'positive' : 'negative' 
      }
    ];
  };

  const performanceMetrics = calculatePerformanceMetrics();



  // Calculate dynamic correlation matrix based on portfolio data
  const calculateCorrelationMatrix = () => {
    if (!monthlyReturns || monthlyReturns.length === 0) {
      return [
        { asset: 'Portfolio', portfolio: 1.0, sp500: 0.0, nasdaq: 0.0, bonds: 0.0 },
        { asset: 'S&P 500', portfolio: 0.0, sp500: 1.0, nasdaq: 0.0, bonds: 0.0 },
        { asset: 'NASDAQ', portfolio: 0.0, sp500: 0.0, nasdaq: 1.0, bonds: 0.0 },
        { asset: 'Bonds', portfolio: 0.0, sp500: 0.0, nasdaq: 0.0, bonds: 1.0 }
      ];
    }

    // Extract portfolio and benchmark returns
    const portfolioReturns = monthlyReturns.map((month: any) => month.returns || 0);
    const sp500Returns = monthlyReturns.map((month: any) => month.benchmark || 0);
    
    // Calculate correlation coefficient function
    const calculateCorrelation = (x: number[], y: number[]) => {
      if (x.length !== y.length || x.length === 0) return 0;
      
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };

    // Calculate correlations
    const portfolioSp500Corr = calculateCorrelation(portfolioReturns, sp500Returns);
    
    // For NASDAQ, we'll use a simplified approach based on S&P 500 correlation
    // In a real implementation, you'd fetch NASDAQ data from yfinance
    const nasdaqSp500Corr = 0.94; // Typical correlation between NASDAQ and S&P 500
    const portfolioNasdaqCorr = portfolioSp500Corr * 0.95; // Slightly higher than S&P 500 correlation
    
    // For bonds, we'll use negative correlation (typical bond-equity relationship)
    const bondCorr = -0.15; // Typical negative correlation with equities
    
    return [
      { 
        asset: 'Portfolio', 
        portfolio: 1.0, 
        sp500: portfolioSp500Corr, 
        nasdaq: portfolioNasdaqCorr, 
        bonds: bondCorr 
      },
      { 
        asset: 'S&P 500', 
        portfolio: portfolioSp500Corr, 
        sp500: 1.0, 
        nasdaq: nasdaqSp500Corr, 
        bonds: bondCorr 
      },
      { 
        asset: 'NASDAQ', 
        portfolio: portfolioNasdaqCorr, 
        sp500: nasdaqSp500Corr, 
        nasdaq: 1.0, 
        bonds: bondCorr 
      },
      { 
        asset: 'Bonds', 
        portfolio: bondCorr, 
        sp500: bondCorr, 
        nasdaq: bondCorr, 
        bonds: 1.0 
      }
    ];
  };

  const correlationData = calculateCorrelationMatrix();
  
  const sortedByPerformance = holdings
    .filter((holding: any) => holding.change !== undefined && holding.change !== null)
    .sort((a: any, b: any) => (b.change || 0) - (a.change || 0));
  
  const topPerformers = sortedByPerformance
    .filter((holding: any) => (holding.change || 0) > 0)
    .slice(0, 3)
    .map((holding: any) => ({
      symbol: holding.symbol,
      name: holding.company_name || holding.name,
      return: `+${holding.change ? holding.change.toFixed(1) : '0.0'}%`,
      amount: `+$${((holding.price || 0) * (holding.volume || 0) * (holding.change || 0) / 100).toFixed(0)}`
    }));
  
  const underPerformers = sortedByPerformance
    .filter((holding: any) => (holding.change || 0) < 0)
    .slice(-3)
    .reverse()
    .map((holding: any) => ({
      symbol: holding.symbol,
      name: holding.company_name || holding.name,
      return: `${holding.change ? holding.change.toFixed(1) : '0.0'}%`,
      amount: `-$${Math.abs((holding.price || 0) * (holding.volume || 0) * (holding.change || 0) / 100).toFixed(0)}`
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <style dangerouslySetInnerHTML={{ __html: chartStyles }} />
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Portfolio Analytics</h1>
              <p className="text-xl text-muted-foreground mt-2">Deep insights into your investment performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Timeframe:</span>
              <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32 bg-background border-border text-foreground hover:border-blue-500/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="6M">6 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="ALL">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          {/* Timeframe Performance Summary */}
                                  <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Performance Summary ({timeframe})</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Performance Summary tooltip clicked');
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{metricTooltips.performanceSummary.title}</h4>
                        <p className="text-sm text-muted-foreground">{metricTooltips.performanceSummary.description}</p>
                        <p className="text-sm font-medium text-blue-600">{metricTooltips.performanceSummary.goodBad}</p>
                        <p className="text-sm text-muted-foreground">{metricTooltips.performanceSummary.firstTimeInfo}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
            <CardContent>
              {monthlyReturns.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-500/10">
                      <div className="text-2xl font-bold text-green-400">
                        {monthlyReturns.reduce((sum: number, month: any) => sum + (month.returns || 0), 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Portfolio Return</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-500/10">
                      <div className="text-2xl font-bold text-blue-400">
                        {monthlyReturns.reduce((sum: number, month: any) => sum + (month.benchmark || 0), 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">S&P 500 Return</div>
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-400">
                      {monthlyReturns.reduce((sum: number, month: any) => sum + ((month.returns || 0) - (month.benchmark || 0)), 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Outperformance</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No data available for selected timeframe</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-foreground">Performance Metrics</h2>
                                    
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-card border-border hover:border-blue-500/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-muted-foreground">{metric.metric}</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-muted/50 relative z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(`${metric.metric} tooltip clicked`);
                            }}
                          >
                            <HelpCircle className="h-4 w-4 text-blue-400 hover:text-blue-300" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">{metricTooltips[metric.metric.toLowerCase().replace(/\s+/g, '') as keyof typeof metricTooltips]?.title || metric.metric}</h4>
                            <p className="text-sm text-muted-foreground">{metricTooltips[metric.metric.toLowerCase().replace(/\s+/g, '') as keyof typeof metricTooltips]?.description || 'Metric description not available.'}</p>
                            <p className="text-sm font-medium text-blue-600">{metricTooltips[metric.metric.toLowerCase().replace(/\s+/g, '') as keyof typeof metricTooltips]?.goodBad || 'Good/Bad indicators not available.'}</p>
                            <p className="text-sm text-muted-foreground">{metricTooltips[metric.metric.toLowerCase().replace(/\s+/g, '') as keyof typeof metricTooltips]?.firstTimeInfo || 'First-time investor information not available.'}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {metric.status === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : metric.status === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                  <div className={`text-sm flex items-center ${
                    metric.status === 'positive' ? 'text-green-400' : 
                    metric.status === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metric.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>

          {/* Charts Row */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-foreground">Portfolio Charts</h2>
                                      
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sector Allocation */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>Sector Allocation</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Sector Allocation tooltip clicked');
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{metricTooltips.sectorAllocation.title}</h4>
                        <p className="text-sm text-muted-foreground">{metricTooltips.sectorAllocation.description}</p>
                        <p className="text-sm font-medium text-blue-600">{metricTooltips.sectorAllocation.goodBad}</p>
                        <p className="text-sm text-muted-foreground">{metricTooltips.sectorAllocation.firstTimeInfo}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {sectorAllocation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                          {sectorAllocation.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={0}
                            style={{ 
                              filter: 'brightness(1)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                              onMouseEnter={(e: any) => {
                              e.target.style.filter = 'brightness(1.1)';
                              e.target.style.strokeWidth = '2';
                              e.target.style.stroke = '#ffffff';
                            }}
                              onMouseLeave={(e: any) => {
                              e.target.style.filter = 'brightness(1)';
                              e.target.style.strokeWidth = '0';
                              e.target.style.stroke = entry.color;
                            }}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number, name: string, props: any) => [
                            `${props.payload.value}% ($${props.payload.amount.toLocaleString()})`,
                          props.payload.name
                        ]}
                        contentStyle={{
                          backgroundColor: '#475569',
                          border: '1px solid #64748b',
                          borderRadius: '8px',
                          color: '#ffffff',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        labelStyle={{
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                        itemStyle={{
                          color: '#ffffff'
                        }}
                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-muted-foreground mb-2">No sector data available</div>
                        <div className="text-sm text-muted-foreground">Loading portfolio data...</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {sectorAllocation.map((sector: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sector.color }}
                      ></div>
                      <span className="text-sm text-muted-foreground">
                        {sector.name} ({sector.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Returns vs Benchmark */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Returns vs S&P 500 ({timeframe})</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Monthly Returns tooltip clicked');
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{metricTooltips.monthlyReturns.title}</h4>
                        <p className="text-sm text-muted-foreground">{metricTooltips.monthlyReturns.description}</p>
                        <p className="text-sm font-medium text-blue-600">{metricTooltips.monthlyReturns.goodBad}</p>
                        <p className="text-sm text-muted-foreground">{metricTooltips.monthlyReturns.firstTimeInfo}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {monthlyReturns.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip 
                          content={({ active, payload, label }: any) => {
                            if (active && payload && payload.length) {
                              const portfolioData = payload.find((p: any) => p.name === 'Portfolio');
                              const benchmarkData = payload.find((p: any) => p.name === 'S&P 500');
                              
                              if (portfolioData && benchmarkData) {
                                const portfolioReturn = portfolioData.value;
                                const benchmarkReturn = benchmarkData.value;
                                const outperformance = portfolioReturn - benchmarkReturn;
                                const outperformancePrefix = outperformance >= 0 ? '+' : '';
                                
                                return (
                                  <div style={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                                    padding: '12px 16px',
                                    color: '#f1f5f9'
                                  }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#f1f5f9' }}>
                                      {label} 2025
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                      <span style={{ color: '#8b5cf6' }}>●</span> Portfolio: {(portfolioReturn >= 0 ? '+' : '') + portfolioReturn.toFixed(1)}%
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                      <span style={{ color: '#06b6d4' }}>●</span> S&P 500: {(benchmarkReturn >= 0 ? '+' : '') + benchmarkReturn.toFixed(1)}%
                                    </div>
                                    <div style={{ 
                                      fontSize: '11px', 
                                      marginTop: '6px', 
                                      paddingTop: '6px', 
                                      borderTop: '1px solid rgba(148, 163, 184, 0.3)',
                                      color: outperformance >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                      Outperformance: {outperformancePrefix}{outperformance.toFixed(1)}%
                                    </div>
                                  </div>
                                );
                              }
                            }
                            return null;
                          }}
                          cursor={{
                            fill: 'rgba(139, 92, 246, 0.08)',
                            stroke: 'rgba(139, 92, 246, 0.3)',
                            strokeWidth: 1,
                            strokeDasharray: '3 3'
                          }}
                        />
                        <Bar 
                          dataKey="returns"  
                          fill="#8b5cf6" 
                          name="Portfolio"
                          radius={[4, 4, 0, 0]}
                          style={{
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(data: any, index: number) => {
                            // Enhanced hover effect will be handled by CSS
                          }}
                        />
                        <Bar 
                          dataKey="benchmark" 
                          fill="#06b6d4" 
                          name="S&P 500"
                          radius={[4, 4, 0, 0]}
                          style={{
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                        />
                    </BarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-muted-foreground mb-2">No monthly returns data available</div>
                        <div className="text-sm text-muted-foreground">Loading comparison data...</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chart Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span className="text-sm text-muted-foreground">Portfolio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#06b6d4' }}></div>
                    <span className="text-sm text-muted-foreground">S&P 500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

          {/* Top & Bottom Performers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-foreground">Stock Performance</h2>
                                      
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-green-400" />
                    <span>Top Performers</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Top Performers tooltip clicked');
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{metricTooltips.topPerformers.title}</h4>
                        <p className="text-sm text-muted-foreground">{metricTooltips.topPerformers.description}</p>
                        <p className="text-sm font-medium text-blue-600">{metricTooltips.topPerformers.goodBad}</p>
                        <p className="text-sm text-muted-foreground">{metricTooltips.topPerformers.firstTimeInfo}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.length > 0 ? topPerformers.map((stock: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{stock.return}</div>
                        <div className="text-sm text-green-400">{stock.amount}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No profitable holdings yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <span>Underperformers</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Underperformers tooltip clicked');
                        }}
                      >
                        <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{metricTooltips.underPerformers.title}</h4>
                        <p className="text-sm text-muted-foreground">{metricTooltips.underPerformers.description}</p>
                        <p className="text-sm font-medium text-blue-600">{metricTooltips.underPerformers.goodBad}</p>
                        <p className="text-sm text-muted-foreground">{metricTooltips.underPerformers.firstTimeInfo}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {underPerformers.length > 0 ? underPerformers.map((stock: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-semibold">{stock.return}</div>
                        <div className="text-sm text-red-400">{stock.amount}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">All holdings performing well!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

          {/* Correlation Matrix */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-foreground">Risk Analysis</h2>
                                      
              </div>
            </div>
            <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Asset Correlation Matrix ({timeframe})</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Correlation Matrix tooltip clicked');
                      }}
                    >
                      <HelpCircle className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs bg-background border-2 border-blue-200 shadow-lg">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">{metricTooltips.correlation.title}</h4>
                      <p className="text-sm text-muted-foreground">{metricTooltips.correlation.description}</p>
                      <p className="text-sm font-medium text-blue-600">{metricTooltips.correlation.goodBad}</p>
                      <p className="text-sm text-muted-foreground">{metricTooltips.correlation.firstTimeInfo}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Correlation Summary */}
              <div className="mb-6 p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {(() => {
                        const portfolioSp500Corr = correlationData.find((row: any) => row.asset === 'Portfolio')?.sp500 || 0;
                        return portfolioSp500Corr.toFixed(2);
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">Portfolio vs S&P 500</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {(() => {
                        const portfolioNasdaqCorr = correlationData.find((row: any) => row.asset === 'Portfolio')?.nasdaq || 0;
                        return portfolioNasdaqCorr.toFixed(2);
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">Portfolio vs NASDAQ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {(() => {
                        const portfolioBondsCorr = correlationData.find((row: any) => row.asset === 'Portfolio')?.bonds || 0;
                        return portfolioBondsCorr.toFixed(2);
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">Portfolio vs Bonds</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground bg-muted/30">Asset</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground bg-muted/30">Portfolio</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground bg-muted/30">S&P 500</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground bg-muted/30">NASDAQ</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground bg-muted/30">Bonds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.map((row: any, index: number) => (
                      <tr key={index} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{row.asset}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-14 h-7 rounded-md text-xs font-medium transition-all ${
                            Math.abs(row.portfolio) > 0.7 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            Math.abs(row.portfolio) > 0.3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {row.portfolio.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-14 h-7 rounded-md text-xs font-medium transition-all ${
                            Math.abs(row.sp500) > 0.7 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            Math.abs(row.sp500) > 0.3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {row.sp500.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-14 h-7 rounded-md text-xs font-medium transition-all ${
                            Math.abs(row.nasdaq) > 0.7 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            Math.abs(row.nasdaq) > 0.3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {row.nasdaq.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-14 h-7 rounded-md text-xs font-medium transition-all ${
                            Math.abs(row.bonds) > 0.7 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            Math.abs(row.bonds) > 0.3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {row.bonds.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Correlation Interpretation</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><span className="font-medium text-red-400">High correlation (|r| &gt; 0.7):</span> Assets move together, limited diversification benefit</p>
                      <p><span className="font-medium text-yellow-400">Moderate correlation (0.3 &lt; |r| ≤ 0.7):</span> Some diversification benefit</p>
                      <p><span className="font-medium text-green-400">Low correlation (|r| ≤ 0.3):</span> Good diversification, assets move independently</p>
                      <p><span className="font-medium text-blue-400">Negative correlation:</span> Excellent diversification, assets move in opposite directions</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      
    </div>
      </TooltipProvider>
  );
}