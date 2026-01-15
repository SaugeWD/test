import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Send,
  MoreVertical,
  UserX,
  Plus,
  MessageCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Message as DBMessage, User } from "@shared/schema";

interface ConversationFromAPI {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    isVerified?: boolean;
    verificationType?: string;
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
    username: string;
    avatar: string | null;
    isVerified: boolean;
    verificationType?: "architect" | "educator" | "firm";
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function NewConversationDialog({
  onSelectUser,
  isOpen,
  onOpenChange,
}: {
  onSelectUser: (user: User) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });

  const filteredUsers = (users || []).filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onOpenChange(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate transition-colors"
                    data-testid={`user-select-${user.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.isVerified && (
                          <VerificationBadge
                            type={user.verificationType as any}
                            size="sm"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-start">
        <Skeleton className="h-16 w-48 rounded-lg" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-20 w-56 rounded-lg" />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/messages/:userId");
  const targetUserId = params?.userId;
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialUserLoaded, setInitialUserLoaded] = useState(false);

  const { data: targetUser } = useQuery<User>({
    queryKey: ["/api/users", targetUserId],
    enabled: !!targetUserId && !!currentUser && !initialUserLoaded,
  });

  const {
    data: conversationsData,
    isLoading: loadingConversations,
  } = useQuery<ConversationFromAPI[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (targetUser && !initialUserLoaded && currentUser) {
      const existingConv = (conversationsData || []).find((c) => c.user.id === targetUser.id);
      if (existingConv) {
        setSelectedConversation({
          id: existingConv.id,
          user: {
            id: existingConv.user.id,
            name: existingConv.user.name,
            username: existingConv.user.username || existingConv.user.name.toLowerCase().replace(/\s/g, "-"),
            avatar: existingConv.user.avatar,
            isVerified: existingConv.user.isVerified || false,
            verificationType: existingConv.user.verificationType as any,
          },
          lastMessage: existingConv.lastMessage,
          timestamp: existingConv.lastMessageAt ? formatTimeAgo(new Date(existingConv.lastMessageAt)) : "",
          unread: existingConv.unread,
        });
      } else {
        setSelectedConversation({
          id: `new-${targetUser.id}`,
          user: {
            id: targetUser.id,
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
            isVerified: targetUser.isVerified || false,
            verificationType: targetUser.verificationType as any,
          },
          lastMessage: "",
          timestamp: "",
          unread: 0,
        });
      }
      setInitialUserLoaded(true);
    }
  }, [targetUser, conversationsData, initialUserLoaded, currentUser]);

  const { data: selectedMessages, isLoading: loadingMessages } = useQuery<
    DBMessage[]
  >({
    queryKey: ["/api/messages", selectedConversation?.user.id],
    enabled: !!currentUser && !!selectedConversation,
  });

  const { data: blockedUsers } = useQuery<{ blockedId: string }[]>({
    queryKey: ["/api/blocked"],
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (selectedConversation && blockedUsers) {
      const blocked = blockedUsers.some(
        (b) => b.blockedId === selectedConversation.user.id
      );
      setIsBlocked(blocked);
    } else {
      setIsBlocked(false);
    }
  }, [selectedConversation, blockedUsers]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMessages]);

  const conversations: Conversation[] = (conversationsData || []).map((c) => ({
    id: c.id,
    user: {
      id: c.user.id,
      name: c.user.name,
      username: c.user.username || c.user.name.toLowerCase().replace(/\s/g, "-"),
      avatar: c.user.avatar,
      isVerified: c.user.isVerified || false,
      verificationType: c.user.verificationType as any,
    },
    lastMessage: c.lastMessage,
    timestamp: c.lastMessageAt ? formatTimeAgo(new Date(c.lastMessageAt)) : "",
    unread: c.unread,
  }));

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({
          queryKey: ["/api/messages", selectedConversation.user.id],
        });
      }
      setMessageText("");
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (blockedId: string) => {
      const response = await apiRequest("POST", "/api/block", { blockedId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked"] });
      setIsBlocked(true);
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || isBlocked) return;
    sendMutation.mutate({
      receiverId: selectedConversation.user.id,
      content: messageText,
    });
  };

  const handleNewConversation = (user: User) => {
    const existingConv = conversations.find((c) => c.user.id === user.id);
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      setSelectedConversation({
        id: `new-${user.id}`,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          isVerified: user.isVerified || false,
          verificationType: user.verificationType as any,
        },
        lastMessage: "",
        timestamp: "",
        unread: 0,
      });
    }
  };

  const handleBlockUser = () => {
    if (!selectedConversation) return;
    blockMutation.mutate(selectedConversation.user.id);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="font-serif text-xl font-bold mb-2">
              Sign in to view messages
            </h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to access your messages.
            </p>
            <Button onClick={() => navigate("/login")} data-testid="button-login">
              Sign In
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Connect with architects and students
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card
              className={cn(
                "lg:col-span-1 flex flex-col overflow-hidden h-[calc(100vh-280px)]",
                selectedConversation && "hidden lg:flex"
              )}
            >
              <div className="p-4 border-b space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search messages..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-conversations"
                    />
                  </div>
                  <Button
                    size="icon"
                    onClick={() => setNewConversationOpen(true)}
                    data-testid="button-new-conversation"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                {loadingConversations ? (
                  <div>
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm mt-1">
                      Start a new conversation to connect
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setNewConversationOpen(true)}
                      data-testid="button-start-conversation"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 border-b transition-colors hover:bg-accent/5 text-left",
                          selectedConversation?.id === conv.id && "bg-accent/10"
                        )}
                        data-testid={`conversation-item-${conv.id}`}
                      >
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={conv.user.avatar || undefined} />
                          <AvatarFallback>
                            {conv.user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={cn(
                                  "font-semibold text-sm truncate",
                                  conv.unread > 0 && "text-foreground"
                                )}
                              >
                                {conv.user.name}
                              </span>
                              {conv.user.isVerified && (
                                <VerificationBadge
                                  type={conv.user.verificationType}
                                  size="sm"
                                />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {conv.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm truncate",
                                conv.unread > 0
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {conv.lastMessage}
                            </p>
                            {conv.unread > 0 && (
                              <Badge className="flex-shrink-0 h-5 min-w-5 px-1.5">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            <Card
              className={cn(
                "lg:col-span-2 flex flex-col overflow-hidden h-[calc(100vh-280px)]",
                !selectedConversation && "hidden lg:flex"
              )}
            >
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSelectedConversation(null)}
                        data-testid="button-back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Link href={`/profile/${selectedConversation.user.username}`}>
                        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                          <AvatarImage
                            src={selectedConversation.user.avatar || undefined}
                          />
                          <AvatarFallback>
                            {selectedConversation.user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link href={`/profile/${selectedConversation.user.username}`}>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold hover:text-accent transition-colors cursor-pointer">
                              {selectedConversation.user.name}
                            </h3>
                            {selectedConversation.user.isVerified && (
                              <VerificationBadge
                                type={selectedConversation.user.verificationType}
                                size="sm"
                              />
                            )}
                          </div>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          @{selectedConversation.user.username}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid="button-conversation-menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/profile/${selectedConversation.user.username}`}
                          >
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleBlockUser}
                          className="text-destructive"
                          disabled={isBlocked || blockMutation.isPending}
                          data-testid="button-block-user"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          {isBlocked ? "User Blocked" : "Block User"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <MessageSkeleton />
                    ) : (selectedMessages || []).length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center">
                        <div>
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                          <p className="text-muted-foreground">
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(selectedMessages || []).map((message) => {
                          const isOwn = message.senderId === currentUser?.id;
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex gap-3",
                                isOwn && "flex-row-reverse"
                              )}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                  src={
                                    isOwn
                                      ? currentUser?.avatar || undefined
                                      : selectedConversation.user.avatar ||
                                        undefined
                                  }
                                />
                                <AvatarFallback>
                                  {isOwn
                                    ? currentUser?.name?.[0] || "Y"
                                    : selectedConversation.user.name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={cn(
                                  "flex flex-col gap-1 max-w-[70%]",
                                  isOwn && "items-end"
                                )}
                              >
                                <div
                                  className={cn(
                                    "rounded-lg px-4 py-2",
                                    isOwn
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-secondary"
                                  )}
                                >
                                  <p className="text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground px-2">
                                  {message.createdAt
                                    ? formatMessageTime(new Date(message.createdAt))
                                    : ""}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t">
                    {isBlocked ? (
                      <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-center">
                        <UserX className="h-5 w-5 mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          You have blocked this user
                        </p>
                        <p className="text-xs mt-1">
                          You cannot send messages to blocked users
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="min-h-[60px] max-h-[120px] resize-none"
                          data-testid="input-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="icon"
                          className="flex-shrink-0 h-[60px] w-[60px]"
                          disabled={
                            sendMutation.isPending || !messageText.trim()
                          }
                          data-testid="button-send-message"
                        >
                          {sendMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    {!isBlocked && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-4">
                      <Send className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a conversation from the list or start a new one
                    </p>
                    <Button
                      onClick={() => setNewConversationOpen(true)}
                      data-testid="button-new-conversation-empty"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <NewConversationDialog
        isOpen={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        onSelectUser={handleNewConversation}
      />

      <Footer />
    </div>
  );
}
