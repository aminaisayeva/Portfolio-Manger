import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIChatButtonProps {
  onClick: () => void;
}

export function AIChatButton({ onClick }: AIChatButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full gradient-purple shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
        size="sm"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>
      <div className="absolute -top-2 -right-2 w-4 h-4 gradient-red rounded-full animate-pulse"></div>
    </div>
  );
}