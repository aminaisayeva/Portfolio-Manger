import { ChartLine, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/ui/user-profile";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title - Clickable to Settings */}
          <Link href="/settings" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center">
              <ChartLine className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-foreground">ThemisTrends</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium py-2 px-1 relative transition-colors ${
              location === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
              Dashboard
              {location === "/" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </Link>
            <Link href="/portfolio" className={`font-medium py-2 px-1 relative transition-colors ${
              location === "/portfolio" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
              Portfolio
              {location === "/portfolio" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </Link>
            <Link href="/trading" className={`font-medium py-2 px-1 relative transition-colors ${
              location === "/trading" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
              Trading
              {location === "/trading" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </Link>
            <Link href="/analytics" className={`font-medium py-2 px-1 relative transition-colors ${
              location === "/analytics" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
              Analytics
              {location === "/analytics" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </Link>
            <Link href="/market" className={`font-medium py-2 px-1 relative transition-colors ${
              location === "/market" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
              Market
              {location === "/market" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </Link>
          </div>
          
          {/* User Profile and Mobile menu button */}
          <div className="flex items-center space-x-2">
            {/* User Profile - Visible on all screen sizes */}
            <UserProfile />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/portfolio" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/portfolio" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                href="/trading" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/trading" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trading
              </Link>
              <Link 
                href="/analytics" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/analytics" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                href="/market" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/market" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Market
              </Link>
              <Link 
                href="/settings" 
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
