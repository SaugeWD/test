import { useState } from "react";
import { MessageCircle, Send, Search, Loader2, ExternalLink, Heart, Edit, Trash2, Reply, MoreVertical, Check, CheckCheck, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
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
  const [replyToMessage, setReplyToMessage] = useState<DBMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<DBMessage | null>(null);
  const [editText, setEditText] = useState("");

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

  const sendMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string; replyToId?: string | null }) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation.user.id] });
      }
      setNewMessage("");
      setReplyToMessage(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: { id: string; content: string }) => {
      const response = await apiRequest("PATCH", `/api/messages/${data.id}`, { content: data.content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation.user.id] });
      }
      setEditingMessage(null);
      setEditText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/messages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation.user.id] });
      }
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/messages/${id}/like`);
      return response.json();
    },
    onSuccess: () => {
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation.user.id] });
      }
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMutation.mutate({ 
      receiverId: selectedConversation.user.id, 
      content: newMessage,
      replyToId: replyToMessage?.id || null,
    });
  };

  const handleEditMessage = () => {
    if (!editText.trim() || !editingMessage) return;
    editMutation.mutate({
      id: editingMessage.id,
      content: editText,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMutation.mutate(messageId);
  };

  const handleLikeMessage = (messageId: string) => {
    likeMutation.mutate(messageId);
  };

  const getReplyToContent = (replyToId: string | null): DBMessage | undefined => {
    if (!replyToId || !selectedMessages) return undefined;
    return selectedMessages.find((m) => m.id === replyToId);
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
              <div className="flex items-center justify-between">
                <SheetTitle>Messages</SheetTitle>
                <Button variant="ghost" size="sm" asChild data-testid="link-full-messages">
                  <Link href="/messages">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Full
                  </Link>
                </Button>
              </div>
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
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedConversation(null);
                setReplyToMessage(null);
                setEditingMessage(null);
                setEditText("");
              }}>
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
              ) : (selectedMessages || []).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(selectedMessages || []).map((message) => {
                    const isOwn = message.senderId === currentUser?.id;
                    const isDeleted = message.isDeleted;
                    const isEdited = message.isEdited;
                    const replyTo = getReplyToContent(message.replyToId);
                    const likedBy = message.likedBy || [];
                    const isLiked = currentUser ? likedBy.includes(currentUser.id) : false;
                    const likeCount = likedBy.length;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 group",
                          isOwn && "flex-row-reverse"
                        )}
                      >
                        <div
                          className={cn(
                            "flex flex-col gap-1 max-w-[80%]",
                            isOwn && "items-end"
                          )}
                        >
                          {replyTo && (
                            <div className={cn(
                              "text-xs px-2 py-1 rounded border-l-2 border-accent/50 bg-accent/5 mb-1 max-w-full",
                              isOwn ? "text-right" : "text-left"
                            )}>
                              <span className="text-muted-foreground text-[10px]">
                                Replying to: 
                              </span>
                              <p className="truncate text-muted-foreground italic text-[10px]">
                                {replyTo.isDeleted ? "This message was deleted" : replyTo.content}
                              </p>
                            </div>
                          )}

                          {editingMessage?.id === message.id ? (
                            <div className="flex flex-col gap-2 w-full min-w-[180px]">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-[50px] resize-none text-sm"
                                data-testid="input-edit-message-panel"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingMessage(null);
                                    setEditText("");
                                  }}
                                  data-testid="button-cancel-edit-panel"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleEditMessage}
                                  disabled={editMutation.isPending || !editText.trim()}
                                  data-testid="button-save-edit-panel"
                                >
                                  {editMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Check className="h-3 w-3 mr-1" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1 relative">
                              <div
                                className={cn(
                                  "rounded-lg px-3 py-2",
                                  isOwn
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-secondary",
                                  isDeleted && "opacity-60",
                                  likeCount > 0 && "mb-3"
                                )}
                              >
                                <p className={cn(
                                  "text-sm leading-relaxed",
                                  isDeleted && "italic"
                                )}>
                                  {message.content}
                                </p>
                              </div>

                              {!isDeleted && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-5 w-5",
                                      isLiked && "text-red-500"
                                    )}
                                    onClick={() => handleLikeMessage(message.id)}
                                    disabled={likeMutation.isPending}
                                    data-testid={`button-like-panel-${message.id}`}
                                  >
                                    <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        data-testid={`button-message-menu-panel-${message.id}`}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isOwn ? "end" : "start"}>
                                      <DropdownMenuItem
                                        onClick={() => setReplyToMessage(message)}
                                        data-testid={`button-reply-panel-${message.id}`}
                                      >
                                        <Reply className="mr-2 h-4 w-4" />
                                        Reply
                                      </DropdownMenuItem>
                                      {isOwn && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingMessage(message);
                                              setEditText(message.content);
                                            }}
                                            data-testid={`button-edit-panel-${message.id}`}
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteMessage(message.id)}
                                            className="text-destructive"
                                            disabled={deleteMutation.isPending}
                                            data-testid={`button-delete-panel-${message.id}`}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                              {likeCount > 0 && (
                                <div className={cn(
                                  "absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-[10px] flex items-center gap-0.5",
                                  isOwn ? "left-0" : "right-0"
                                )}>
                                  <Heart className="h-2.5 w-2.5 fill-current" />
                                  {likeCount}
                                </div>
                              )}
                            </div>
                          )}

                          <div className={cn(
                            "flex items-center gap-1 px-1",
                            isOwn ? "flex-row-reverse" : "flex-row"
                          )}>
                            <span className="text-[10px] text-muted-foreground">
                              {message.createdAt
                                ? formatMessageTime(new Date(message.createdAt))
                                : ""}
                            </span>
                            {isEdited && !isDeleted && (
                              <span className="text-[10px] text-muted-foreground italic">
                                (edited)
                              </span>
                            )}
                            {isOwn && !isDeleted && (
                              <span className="text-[10px] text-muted-foreground">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-accent" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4">
              {replyToMessage && (
                <div className="mb-2 p-2 bg-accent/10 rounded-lg flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Replying to:
                    </p>
                    <p className="text-sm truncate">
                      {replyToMessage.content}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => setReplyToMessage(null)}
                    data-testid="button-cancel-reply-panel"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
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
