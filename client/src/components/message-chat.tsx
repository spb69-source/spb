import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";

export default function MessageChat() {
  const [messageInput, setMessageInput] = useState("");
  const { user } = useAuth();
  const { sendMessage: sendWebSocketMessage } = useWebSocket();
  const queryClient = useQueryClient();

  // Get messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", { content });
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-96 flex flex-col" data-testid="card-messages">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Messages</CardTitle>
          <span className="text-sm text-muted-foreground">Admin Support</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-64">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.isFromAdmin ? "" : "justify-end"
                }`}
              >
                {message.isFromAdmin && (
                  <div className="bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-xs">
                    <Shield className="h-3 w-3" />
                  </div>
                )}
                <div className={`max-w-sm p-3 rounded-lg ${
                  message.isFromAdmin 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground ml-auto"
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {!message.isFromAdmin && (
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                    {user?.firstName?.charAt(0)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !messageInput.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
