import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat/history'],
    enabled: isOpen,
    staleTime: 0
  });

  // Load portfolio context for AI
  const { data: portfolioData } = useQuery({
    queryKey: ['/api/portfolio'],
    enabled: isOpen
  });

  useEffect(() => {
    if (chatHistory && Array.isArray(chatHistory)) {
      const formattedMessages: Message[] = chatHistory.map((msg: any) => ({
        id: msg.id || Math.random().toString(),
        content: msg.content || msg.message || '',
        isAI: msg.isAI || msg.type === 'ai',
        timestamp: new Date(msg.timestamp || Date.now())
      }));
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const portfolioContext = portfolioData ? {
        totalValue: (portfolioData as any).summary?.totalValue,
        totalGain: (portfolioData as any).summary?.totalGain,
        totalGainPercent: (portfolioData as any).summary?.totalGainPercent,
        holdings: (portfolioData as any).holdings?.length || 0,
        cashBalance: (portfolioData as any).summary?.cashBalance
      } : null;

      const response = await apiRequest('POST', '/api/ai/chat', {
        message: userMessage,
        portfolioContext
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.response) {
        const aiMessage: Message = {
          id: Date.now().toString() + '-ai',
          content: data.response,
          isAI: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message to AI advisor",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      content: message.trim(),
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message.trim());
    setMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:from-teal-400 hover:to-cyan-500"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`bg-slate-800 border-teal-500/30 shadow-2xl transition-all duration-300 shadow-teal-500/20 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[32rem]'
      }`}>
        <CardHeader className="p-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center ring-2 ring-white/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Investment Advisor</CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-95 font-medium">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex-1">
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-900">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Hi! I'm your AI investment advisor. Ask me about your portfolio, market trends, or investment strategies.
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} space-x-2`}
                  >
                    {msg.isAI && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.isAI
                          ? 'bg-slate-700 text-slate-100 border border-slate-600'
                          : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isAI ? 'text-slate-400' : 'text-teal-100'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                    {!msg.isAI && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {chatMutation.isPending && (
                  <div className="flex justify-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your portfolio..."
                  disabled={chatMutation.isPending}
                  className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || chatMutation.isPending}
                  className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-3 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}