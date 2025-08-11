import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, TrendingUp, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['/api/chat/history'],
    queryFn: async () => {
      const response = await fetch('/api/chat/history?limit=10');
      return response.json();
    },
    enabled: isOpen
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/ai/analyze', {});
      return response.json();
    },
    onSuccess: (data) => {
      // Add analysis to chat
      chatMutation.mutate("Analyze my portfolio");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze portfolio. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    chatMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-purple rounded-lg flex items-center justify-center">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Portfolio Advisor</h2>
              <p className="text-sm text-muted-foreground">Get insights and recommendations</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chat with AI for portfolio insights and investment recommendations
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
          {chatHistory.length === 0 && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-card rounded-lg p-3 flex-1 border border-border">
                <p className="text-sm text-foreground">
                  Hello! I'm   AI portfolio advisor. Ask me anything about   investments, 
                  market trends, or get personalized recommendations for   portfolio.
                </p>
              </div>
            </div>
          )}
          
          {chatHistory.map((chat: any) => (
            <div key={chat.id} className="space-y-3">
              <div className="flex space-x-3 justify-end">
                <div className="bg-primary rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-primary-foreground">{chat.message}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div className="bg-card rounded-lg p-3 flex-1 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{chat.response}</p>
                </div>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-card rounded-lg p-3 flex-1 border border-border">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex-shrink-0 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ask about   portfolio..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-background border-border text-foreground placeholder-muted-foreground pr-12"
              disabled={chatMutation.isPending}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!message.trim() || chatMutation.isPending}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 h-auto"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="bg-background border-border text-muted-foreground hover:bg-muted"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Analyze Portfolio
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => chatMutation.mutate("What are some good investment recommendations for my portfolio?")}
              disabled={chatMutation.isPending}
              className="bg-background border-border text-muted-foreground hover:bg-muted"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Get Recommendations
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}