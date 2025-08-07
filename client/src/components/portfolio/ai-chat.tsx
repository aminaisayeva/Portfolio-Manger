import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, TrendingUp, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AIChat() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['/api/chat/history'],
    queryFn: async () => {
      const response = await fetch('/api/chat/history?limit=10');
      return response.json();
    }
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
    <div className="bg-navy-800 rounded-xl p-6 card-glow-purple sticky top-24">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 gradient-purple rounded-lg flex items-center justify-center">
          <Bot className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Portfolio Advisor</h2>
          <p className="text-sm text-slate-400">Get insights and recommendations</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {chatHistory.length === 0 && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="bg-navy-900 rounded-lg p-3 flex-1">
              <p className="text-sm text-slate-200">
                Hello! I'm   AI portfolio advisor. Ask me anything about   investments, 
                market trends, or get personalized recommendations for   portfolio.
              </p>
            </div>
          </div>
        )}
        
        {chatHistory.map((chat: any) => (
          <div key={chat.id} className="space-y-3">
            <div className="flex space-x-3 justify-end">
              <div className="bg-purple-600 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-white">{chat.message}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-navy-900 rounded-lg p-3 flex-1">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{chat.response}</p>
              </div>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 gradient-purple rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="bg-navy-900 rounded-lg p-3 flex-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Ask about   portfolio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full bg-navy-900 border-navy-700 text-white placeholder-slate-400 pr-12"
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
          className="bg-navy-900 border-navy-700 text-slate-300 hover:bg-navy-700"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Analyze Portfolio
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => chatMutation.mutate("What are some good investment recommendations for my portfolio?")}
          disabled={chatMutation.isPending}
          className="bg-navy-900 border-navy-700 text-slate-300 hover:bg-navy-700"
        >
          <Lightbulb className="w-4 h-4 mr-1" />
          Get Recommendations
        </Button>
      </div>
    </div>
  );
}
