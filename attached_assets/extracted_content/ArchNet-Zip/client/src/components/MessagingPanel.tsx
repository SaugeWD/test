import { useState } from "react";
import { MessageCircle, Send, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import type { Message as DBMessage } from "@shared/schema";

interface ConversationFromAPI {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    online: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface DisplayMessage {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessagingPanel() {
  const { user: currentUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: conversationsData, isLoading: loadingConversations } = useQuery<ConversationFromAPI[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!currentUser,
  });

  const { data: selectedMessages, isLoading: loadingSelectedMessages } = useQuery<DBMessage[]>({
    queryKey: ["/api/messages", selectedConversation?.user.id],
    enabled: !!currentUser && !!selectedConversation,
  });

  const conversations: Conversation[] = (conversationsData || []).map((c) => ({
    id: c.id,
    user: {
      id: c.user.id,
      name: c.user.name,
      avatar: c.user.avatar,
      online: false,
    },
    lastMessage: c.lastMessage,
    timestamp: c.lastMessageAt ? formatTimeAgo(new Date(c.lastMessageAt)) : "",
    unread: c.unread,
  }));

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const displayMessages: DisplayMessage[] = (selectedMessages || []).map((msg) => ({
    id: msg.id,
    sender: msg.senderId === currentUser?.id ? "me" : "them",
    content: msg.content,
    timestamp: msg.createdAt ? formatMessageTime(new Date(msg.createdAt)) : "",
  }));

  const sendMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation.user.id] });
      }
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMutation.mutate({ 
      receiverId: selectedConversation.user.id, 
      content: newMessage 
    });
    setNewMessage("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-messages">
          <MessageCircle className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        {!selectedConversation ? (
          <>
            <SheetHeader className="p-6 pb-4">
              <SheetTitle>Messages</SheetTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-9" />
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !currentUser ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Sign in to see messages</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from someone's profile</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="w-full rounded-lg p-4 text-left transition-colors hover:bg-accent/5"
                      data-testid={`conversation-${conversation.id}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.user.avatar || undefined} />
                            <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                          </Avatar>
                          {conversation.user.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{conversation.user.name}</span>
                            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b p-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                Back
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.user.avatar || undefined} />
                <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{selectedConversation.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.user.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loadingSelectedMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "me" ? "bg-accent text-accent-foreground" : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="mt-1 text-xs opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="h-[60px] w-[60px]" 
                  data-testid="button-send-message"
                  disabled={sendMutation.isPending || !newMessage.trim()}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
