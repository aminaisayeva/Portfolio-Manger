import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle } from "lucide-react";

interface MarketClockProps {
  className?: string;
}

export function MarketClock({ className = "" }: MarketClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('closed');
  const [timeUntilOpen, setTimeUntilOpen] = useState('');
  const [timeUntilClose, setTimeUntilClose] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateMarketStatus(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateMarketStatus = (now: Date) => {
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTimeInMinutes = hour * 60 + minute;

    // Market hours: 9:30 AM - 4:00 PM ET (Monday-Friday)
    const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
    const marketCloseMinutes = 16 * 60; // 4:00 PM
    const preMarketStart = 4 * 60; // 4:00 AM
    const afterHoursEnd = 20 * 60; // 8:00 PM

    // Check if it's a weekday
    const isWeekday = day >= 1 && day <= 5;

    if (!isWeekday) {
      setMarketStatus('closed');
      setTimeUntilOpen('');
      setTimeUntilClose('');
      return;
    }

    if (currentTimeInMinutes >= marketOpenMinutes && currentTimeInMinutes < marketCloseMinutes) {
      setMarketStatus('open');
      setTimeUntilOpen('');
      
      // Calculate time until close
      const minutesUntilClose = marketCloseMinutes - currentTimeInMinutes;
      const hours = Math.floor(minutesUntilClose / 60);
      const mins = minutesUntilClose % 60;
      setTimeUntilClose(`${hours}h ${mins}m`);
    } else if (currentTimeInMinutes >= preMarketStart && currentTimeInMinutes < marketOpenMinutes) {
      setMarketStatus('pre-market');
      
      // Calculate time until open
      const minutesUntilOpen = marketOpenMinutes - currentTimeInMinutes;
      const hours = Math.floor(minutesUntilOpen / 60);
      const mins = minutesUntilOpen % 60;
      setTimeUntilOpen(`${hours}h ${mins}m`);
      setTimeUntilClose('');
    } else if (currentTimeInMinutes >= marketCloseMinutes && currentTimeInMinutes < afterHoursEnd) {
      setMarketStatus('after-hours');
      setTimeUntilOpen('');
      setTimeUntilClose('');
    } else {
      setMarketStatus('closed');
      
      // Calculate time until next market open
      let minutesUntilOpen = 0;
      if (currentTimeInMinutes < preMarketStart) {
        // Before pre-market, calculate until today's open
        minutesUntilOpen = marketOpenMinutes - currentTimeInMinutes;
      } else {
        // After hours, calculate until tomorrow's open
        minutesUntilOpen = (24 * 60 - currentTimeInMinutes) + marketOpenMinutes;
      }
      
      const hours = Math.floor(minutesUntilOpen / 60);
      const mins = minutesUntilOpen % 60;
      setTimeUntilOpen(`${hours}h ${mins}m`);
      setTimeUntilClose('');
    }
  };

  const getStatusColor = () => {
    switch (marketStatus) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-400';
      case 'pre-market':
        return 'bg-blue-500/20 text-blue-400 border-blue-400';
      case 'after-hours':
        return 'bg-orange-500/20 text-orange-400 border-orange-400';
      case 'closed':
        return 'bg-red-500/20 text-red-400 border-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (marketStatus) {
      case 'open':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>;
      case 'pre-market':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
      case 'after-hours':
        return <div className="w-2 h-2 bg-orange-400 rounded-full"></div>;
      case 'closed':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/New_York'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  return (
    <Card className={`bg-gradient-to-br from-card to-card/80 border-border hover:border-blue-500/30 transition-all shadow-lg ${className}`}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Market Clock</h3>
              <p className="text-sm text-muted-foreground">Real-time market timing</p>
            </div>
          </div>
          <Badge variant="outline" className={`${getStatusColor()} flex items-center space-x-2 px-4 py-2 text-sm font-semibold`}>
            {getStatusIcon()}
            <span className="capitalize">{marketStatus.replace('-', ' ')}</span>
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Current Time */}
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground font-mono mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Market Status Details */}
          <div className="space-y-3">
            {marketStatus === 'open' && timeUntilClose && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <AlertCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-400">Market closes in</span>
                    <div className="text-xs text-green-400/70">Regular trading session</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-green-400 text-xl">{timeUntilClose}</span>
              </div>
            )}

            {(marketStatus === 'pre-market' || marketStatus === 'closed') && timeUntilOpen && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-400">Market opens in</span>
                    <div className="text-xs text-blue-400/70">
                      {marketStatus === 'pre-market' ? 'Pre-market trading active' : 'Next trading session'}
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-400 text-xl">{timeUntilOpen}</span>
              </div>
            )}

            {marketStatus === 'after-hours' && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-orange-400">After-hours trading</span>
                    <div className="text-xs text-orange-400/70">Limited liquidity • Extended hours</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-orange-400/70">4:00 PM - 8:00 PM ET</span>
                </div>
              </div>
            )}

            {marketStatus === 'closed' && !timeUntilOpen && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-red-400">Market closed</span>
                    <div className="text-xs text-red-400/70">Weekend • No trading</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-red-400/70">Next: Monday 9:30 AM ET</span>
                </div>
              </div>
            )}
          </div>

          {/* Market Hours Info */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="font-medium">Regular Hours:</span> 9:30 AM - 4:00 PM ET
              </div>
              <div>
                <span className="font-medium">Pre-market:</span> 4:00 AM - 9:30 AM ET
              </div>
              <div>
                <span className="font-medium">After-hours:</span> 4:00 PM - 8:00 PM ET
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 