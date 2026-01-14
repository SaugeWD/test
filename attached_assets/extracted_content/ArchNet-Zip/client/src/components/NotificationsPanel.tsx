import { Bell, Heart, MessageSquare, UserPlus, Trophy, BookOpen, Briefcase, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import type { Notification as DBNotification } from "@shared/schema";

interface NotificationDisplay {
  id: string;
  type: "like" | "comment" | "follow" | "competition" | "message" | "job" | "book" | "system";
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
  link?: string;
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
  return `${diffDays}d ago`;
}

function transformNotification(n: DBNotification): NotificationDisplay {
  return {
    id: n.id,
    type: n.type as NotificationDisplay["type"],
    content: n.message || n.title,
    timestamp: formatTimeAgo(new Date(n.createdAt!)),
    read: n.isRead ?? false,
    link: n.link || undefined,
  };
}

export function NotificationsPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: notificationsData, isLoading } = useQuery<DBNotification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const notifications = notificationsData?.map(transformNotification) || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const filteredNotifications =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.read && activeTab === "unread");

  const getIcon = (type: NotificationDisplay["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-accent" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-accent" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-accent" />;
      case "competition":
        return <Trophy className="h-5 w-5 text-accent" />;
      case "job":
        return <Briefcase className="h-5 w-5 text-accent" />;
      case "book":
        return <BookOpen className="h-5 w-5 text-accent" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-accent" />;
      default:
        return <Bell className="h-5 w-5 text-accent" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={markAllReadMutation.isPending}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-14rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !user ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Sign in to see notifications</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>{activeTab === "unread" ? "No unread notifications" : "No notifications yet"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent/5 relative group ${
                        !notification.read ? "bg-accent/10" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {notification.user ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={notification.user.avatar} />
                              <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                              {getIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm line-clamp-2">
                            {notification.user && <span className="font-semibold">{notification.user.name} </span>}
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                        </div>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/notifications">View All Notifications</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
