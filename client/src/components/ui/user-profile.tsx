import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserProfile() {
  // In a real app, this would come from a user context or API
  const user = {
    name: "Alex Johnson",
    initials: "AJ",
    email: "alex.johnson@example.com"
  };

  return (
    <Link href="/settings" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="gradient-blue text-white font-semibold">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div className="hidden lg:block">
        <p className="text-sm font-medium text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </Link>
  );
}
