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
  Edit,
  Trash2,
  Reply,
  Paperclip,
  Check,
  CheckCheck,
  X,
  FileText,
  Image as ImageIcon,
  Heart,
  Pin,
} from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
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

function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [replyToMessage, setReplyToMessage] = useState<DBMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<DBMessage | null>(null);
  const [editText, setEditText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>(() => {
    const saved = localStorage.getItem("pinnedConversations");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pinnedConversations") {
        setPinnedConversations(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const togglePinConversation = (convId: string) => {
    setPinnedConversations(prev => {
      const newPinned = prev.includes(convId) 
        ? prev.filter(id => id !== convId)
        : [...prev, convId];
      localStorage.setItem("pinnedConversations", JSON.stringify(newPinned));
      window.dispatchEvent(new StorageEvent("storage", { key: "pinnedConversations", newValue: JSON.stringify(newPinned) }));
      return newPinned;
    });
  };

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setPendingAttachments((prev) => [...prev, response.objectPath]);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });

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

  useEffect(() => {
    if (selectedMessages && currentUser) {
      const unreadMessages = selectedMessages.filter(
        (msg) => msg.receiverId === currentUser.id && !msg.isRead
      );
      unreadMessages.forEach((msg) => {
        markReadMutation.mutate(msg.id);
      });
    }
  }, [selectedMessages, currentUser]);

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

  const filteredConversations = conversations
    .filter(
      (conv) =>
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aPinned = pinnedConversations.includes(a.id);
      const bPinned = pinnedConversations.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

  const sendMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string; replyToId?: string | null; attachments?: string[] }) => {
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
      setReplyToMessage(null);
      setPendingAttachments([]);
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
        queryClient.invalidateQueries({
          queryKey: ["/api/messages", selectedConversation.user.id],
        });
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
        queryClient.invalidateQueries({
          queryKey: ["/api/messages", selectedConversation.user.id],
        });
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
        queryClient.invalidateQueries({
          queryKey: ["/api/messages", selectedConversation.user.id],
        });
      }
    },
  });

  const handleLikeMessage = (messageId: string) => {
    likeMutation.mutate(messageId);
  };

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/messages/${id}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
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

  const deleteConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/messages/conversations/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setSelectedConversation(null);
    },
  });

  const handleSendMessage = () => {
    if ((!messageText.trim() && pendingAttachments.length === 0) || !selectedConversation || isBlocked) return;
    sendMutation.mutate({
      receiverId: selectedConversation.user.id,
      content: messageText,
      replyToId: replyToMessage?.id || null,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const getReplyToContent = (replyToId: string | null): DBMessage | undefined => {
    if (!replyToId || !selectedMessages) return undefined;
    return selectedMessages.find((m) => m.id === replyToId);
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
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 border-b transition-colors hover:bg-accent/10 text-left cursor-pointer group",
                          selectedConversation?.id === conv.id && "bg-accent/20"
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
                              {pinnedConversations.includes(conv.id) && (
                                <Pin className="h-3 w-3 text-accent flex-shrink-0" />
                              )}
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
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn("h-6 w-6", pinnedConversations.includes(conv.id) && "text-accent")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinConversation(conv.id);
                                  }}
                                  data-testid={`button-pin-conv-${conv.id}`}
                                >
                                  <Pin className={cn("h-3 w-3", pinnedConversations.includes(conv.id) && "fill-current")} />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => e.stopPropagation()}
                                      data-testid={`button-conv-menu-${conv.id}`}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePinConversation(conv.id);
                                      }}
                                      data-testid={`button-pin-menu-conv-${conv.id}`}
                                    >
                                      <Pin className={cn("mr-2 h-4 w-4", pinnedConversations.includes(conv.id) && "fill-current text-accent")} />
                                      {pinnedConversations.includes(conv.id) ? "Unpin conversation" : "Pin conversation"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversationMutation.mutate(conv.user.id);
                                      }}
                                      className="text-destructive"
                                      data-testid={`button-delete-conv-${conv.id}`}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete conversation
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {conv.unread > 0 && (
                                <Badge className="h-5 min-w-5 px-1.5">
                                  {conv.unread}
                                </Badge>
                              )}
                            </div>
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
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {conv.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
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
                          const isDeleted = message.isDeleted;
                          const isEdited = message.isEdited;
                          const replyTo = getReplyToContent(message.replyToId);
                          const attachments = message.attachments || [];
                          const likedBy = message.likedBy || [];
                          const isLiked = currentUser ? likedBy.includes(currentUser.id) : false;
                          const likeCount = likedBy.length;

                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex gap-3 group",
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
                                {replyTo && (
                                  <div className={cn(
                                    "text-xs px-3 py-1.5 rounded border-l-2 border-accent/50 bg-accent/5 mb-1 max-w-full",
                                    isOwn ? "text-right" : "text-left"
                                  )}>
                                    <span className="text-muted-foreground">
                                      Replying to: 
                                    </span>
                                    <p className="truncate text-muted-foreground italic">
                                      {replyTo.isDeleted ? "This message was deleted" : replyTo.content}
                                    </p>
                                  </div>
                                )}

                                {editingMessage?.id === message.id ? (
                                  <div className="flex flex-col gap-2 w-full min-w-[200px]">
                                    <Textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="min-h-[60px] resize-none text-sm"
                                      data-testid="input-edit-message"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingMessage(null);
                                          setEditText("");
                                        }}
                                        data-testid="button-cancel-edit"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleEditMessage}
                                        disabled={editMutation.isPending || !editText.trim()}
                                        data-testid="button-save-edit"
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
                                        "rounded-lg px-4 py-2",
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

                                      {attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                          {attachments.map((attachment, idx) => (
                                            <div key={idx}>
                                              {isImageUrl(attachment) ? (
                                                <a
                                                  href={attachment}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block"
                                                >
                                                  <img
                                                    src={attachment}
                                                    alt="Attachment"
                                                    className="max-w-[200px] max-h-[200px] rounded object-cover"
                                                  />
                                                </a>
                                              ) : (
                                                <a
                                                  href={attachment}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-2 text-xs underline"
                                                >
                                                  <FileText className="h-4 w-4" />
                                                  <span className="truncate max-w-[150px]">
                                                    {attachment.split('/').pop()}
                                                  </span>
                                                </a>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {!isDeleted && (
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-6 w-6",
                                            isLiked && "text-red-500"
                                          )}
                                          onClick={() => handleLikeMessage(message.id)}
                                          disabled={likeMutation.isPending}
                                          data-testid={`button-like-${message.id}`}
                                        >
                                          <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              data-testid={`button-message-menu-${message.id}`}
                                            >
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align={isOwn ? "end" : "start"}>
                                            <DropdownMenuItem
                                              onClick={() => setReplyToMessage(message)}
                                              data-testid={`button-reply-${message.id}`}
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
                                                  data-testid={`button-edit-${message.id}`}
                                                >
                                                  <Edit className="mr-2 h-4 w-4" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={() => handleDeleteMessage(message.id)}
                                                  className="text-destructive"
                                                  disabled={deleteMutation.isPending}
                                                  data-testid={`button-delete-${message.id}`}
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
                                  "flex items-center gap-2 px-2",
                                  isOwn ? "flex-row-reverse" : "flex-row"
                                )}>
                                  <span className="text-xs text-muted-foreground">
                                    {message.createdAt
                                      ? formatMessageTime(new Date(message.createdAt))
                                      : ""}
                                  </span>
                                  {isEdited && !isDeleted && (
                                    <span className="text-xs text-muted-foreground italic">
                                      (edited)
                                    </span>
                                  )}
                                  {isOwn && !isDeleted && (
                                    <span className="text-xs text-muted-foreground">
                                      {message.isRead ? (
                                        <span className="flex items-center gap-1">
                                          <CheckCheck className="h-3 w-3 text-accent" />
                                          {message.readAt && (
                                            <span className="text-[10px]">
                                              {formatMessageTime(new Date(message.readAt))}
                                            </span>
                                          )}
                                        </span>
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
                      <>
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
                              data-testid="button-cancel-reply"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {pendingAttachments.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {pendingAttachments.map((attachment, idx) => (
                              <div key={idx} className="relative group">
                                {isImageUrl(attachment) ? (
                                  <img
                                    src={attachment}
                                    alt="Pending attachment"
                                    className="h-16 w-16 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded bg-secondary flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setPendingAttachments((prev) =>
                                      prev.filter((_, i) => i !== idx)
                                    );
                                  }}
                                  data-testid={`button-remove-attachment-${idx}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            data-testid="input-file"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex-shrink-0"
                            data-testid="button-attach"
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Paperclip className="h-4 w-4" />
                            )}
                          </Button>
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
                              sendMutation.isPending || (!messageText.trim() && pendingAttachments.length === 0)
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
                      </>
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
