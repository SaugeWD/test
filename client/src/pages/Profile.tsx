import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Briefcase, Users, BookOpen, Folder, Settings, UserPlus, MessageSquare, Loader2, Heart, MessageCircle, FileText, Check, X, Clock, Bookmark, ExternalLink, Trash2, Trophy, MoreHorizontal, Newspaper, Edit, Building2, GraduationCap, Camera, Globe, Phone, Award } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Project, Post, Follow, SavedItem, Like, Comment, Book, Competition, Research, News } from "@shared/schema";
import { SocialInteractions } from "@/components/SocialInteractions";
import { NewsEditDialog } from "@/pages/News";

function SavedItemCard({ item }: { item: SavedItem }) {
  const { toast } = useToast();

  const { data: bookData } = useQuery<Book>({
    queryKey: ["/api/books", item.targetId],
    enabled: item.targetType === "book",
  });

  const { data: competitionData } = useQuery<Competition>({
    queryKey: ["/api/competitions", item.targetId],
    enabled: item.targetType === "competition",
  });

  const { data: projectData } = useQuery<Project>({
    queryKey: ["/api/projects", item.targetId],
    enabled: item.targetType === "project",
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved", {
        targetType: item.targetType,
        targetId: item.targetId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({ description: "Removed from saved items" });
    },
  });

  const getItemData = () => {
    switch (item.targetType) {
      case "book":
        return { title: bookData?.title || "Loading...", image: bookData?.image || null };
      case "competition":
        return { title: competitionData?.title || "Loading...", image: competitionData?.image || null };
      case "project":
        return { title: projectData?.title || "Loading...", image: projectData?.image || null };
      default:
        return { title: "Unknown item", image: null };
    }
  };

  const { title, image } = getItemData();
  const linkPath = item.targetType === "project" ? `/projects/${item.targetId}` : `/${item.targetType}s/${item.targetId}`;

  const getIcon = () => {
    switch (item.targetType) {
      case "book":
        return <BookOpen className="h-5 w-5 text-muted-foreground" />;
      case "competition":
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
      case "project":
        return <Folder className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bookmark className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-saved-${item.id}`}>
      <div className="flex">
        <Link href={linkPath} className="shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-muted flex items-center justify-center overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover" />
            ) : (
              getIcon()
            )}
          </div>
        </Link>
        <CardContent className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs capitalize">{item.targetType}</Badge>
              <span className="text-xs text-muted-foreground">
                {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Link href={linkPath}>
              <h3 className="font-medium text-sm line-clamp-2 hover:text-accent transition-colors">{title}</h3>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={linkPath}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => unsaveMutation.mutate()}
              disabled={unsaveMutation.isPending}
              className="text-destructive hover:text-destructive"
              data-testid={`button-unsave-${item.id}`}
            >
              {unsaveMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function LikedItemCard({ item, onUnlike }: { item: Like; onUnlike: () => void }) {
  const { toast } = useToast();

  const { data: postData } = useQuery<Post>({
    queryKey: ["/api/posts", item.targetId],
    enabled: item.targetType === "post",
  });

  const { data: projectData } = useQuery<Project>({
    queryKey: ["/api/projects", item.targetId],
    enabled: item.targetType === "project",
  });

  const { data: bookData } = useQuery<Book>({
    queryKey: ["/api/books", item.targetId],
    enabled: item.targetType === "book",
  });

  const { data: competitionData } = useQuery<Competition>({
    queryKey: ["/api/competitions", item.targetId],
    enabled: item.targetType === "competition",
  });

  const { data: commentData } = useQuery<Comment>({
    queryKey: ["/api/comments", item.targetId],
    enabled: item.targetType === "comment",
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/like", {
        targetType: item.targetType,
        targetId: item.targetId,
      });
    },
    onSuccess: () => {
      onUnlike();
      toast({ description: "Like removed" });
    },
  });

  const getItemData = () => {
    switch (item.targetType) {
      case "post":
        return { title: postData?.content?.slice(0, 100) || "Loading post...", image: null, hasLink: true };
      case "project":
        return { title: projectData?.title || "Loading project...", image: projectData?.image || null, hasLink: true };
      case "book":
        return { title: bookData?.title || "Loading book...", image: bookData?.image || null, hasLink: true };
      case "competition":
        return { title: competitionData?.title || "Loading competition...", image: competitionData?.image || null, hasLink: true };
      case "comment":
        return { title: commentData?.content?.slice(0, 100) || "Loading comment...", image: null, hasLink: false };
      default:
        return { title: `${item.targetType}`, image: null, hasLink: false };
    }
  };

  const getIcon = () => {
    switch (item.targetType) {
      case "post":
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      case "project":
        return <Folder className="h-5 w-5 text-muted-foreground" />;
      case "book":
        return <BookOpen className="h-5 w-5 text-muted-foreground" />;
      case "competition":
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Heart className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getLinkPath = () => {
    switch (item.targetType) {
      case "post":
        return `/feed`;
      case "project":
        return `/projects/${item.targetId}`;
      case "book":
        return `/books`;
      case "competition":
        return `/competitions`;
      default:
        return null;
    }
  };

  const { title, image, hasLink } = getItemData();
  const linkPath = getLinkPath();

  return (
    <div className="flex items-center justify-between gap-3 p-3 border rounded-lg hover-elevate" data-testid={`liked-item-${item.id}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            getIcon()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="outline" className="text-xs capitalize">{item.targetType}</Badge>
            <span className="text-xs text-muted-foreground">
              {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          {hasLink && linkPath ? (
            <Link href={linkPath}>
              <p className="text-sm font-medium line-clamp-1 hover:text-accent transition-colors cursor-pointer">{title}</p>
            </Link>
          ) : (
            <p className="text-sm font-medium line-clamp-1">{title}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {hasLink && linkPath && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            data-testid={`button-view-${item.id}`}
          >
            <Link href={linkPath}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => unlikeMutation.mutate()}
          disabled={unlikeMutation.isPending}
          className="text-destructive hover:text-destructive"
          data-testid={`button-unlike-${item.id}`}
        >
          {unlikeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4 fill-current" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const params = useParams();
  const username = params.username;

  const isOwnProfile = !username || (currentUser && currentUser.username === username);
  const targetUsername = username || currentUser?.username;

  const { data: profileUser, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ["/api/users", targetUsername],
    enabled: !!targetUsername,
  });

  const displayUser = isOwnProfile ? currentUser : profileUser;
  const userId = displayUser?.id;

  const { data: userPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/users", userId, "posts"],
    enabled: !!userId,
  });

  const { data: userProjects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/users", userId, "projects"],
    enabled: !!userId,
  });

  const { data: userResearch, isLoading: researchLoading } = useQuery<Research[]>({
    queryKey: ["/api/users", userId, "research"],
    enabled: !!userId,
  });

  const { data: userNews = [], isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: [`/api/users/${userId}/news`],
    enabled: !!userId,
  });

  const { data: userStats } = useQuery<{ savedBooks: number; projects: number; followers: number }>({
    queryKey: ["/api/users", userId, "stats"],
    enabled: !!userId,
  });

  const { data: followerCount } = useQuery<{ count: number }>({
    queryKey: ["/api/followers", userId],
    enabled: !!userId,
  });

  const { data: followingCount } = useQuery<{ count: number }>({
    queryKey: ["/api/following", userId],
    enabled: !!userId,
  });

  const { data: savedItems } = useQuery<SavedItem[]>({
    queryKey: ["/api/saved"],
    enabled: !!(isOwnProfile && isAuthenticated),
  });

  const { data: userLikes } = useQuery<Like[]>({
    queryKey: ["/api/users", userId, "likes"],
    enabled: !!userId,
  });

  const { data: userComments } = useQuery<Comment[]>({
    queryKey: ["/api/users", userId, "comments"],
    enabled: !!userId,
  });

  const { data: followStatus } = useQuery<{ status: string | null; follow: Follow | null }>({
    queryKey: ["/api/follow-status", userId],
    enabled: !!(userId && !isOwnProfile && isAuthenticated),
  });

  const { data: pendingRequests } = useQuery<Follow[]>({
    queryKey: ["/api/follow-requests"],
    enabled: !!(isOwnProfile && isAuthenticated),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/follow", { followingId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-status", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/followers", userId] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (followerId: string) => {
      return apiRequest("POST", `/api/follow-requests/${followerId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/followers", userId] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (followerId: string) => {
      return apiRequest("POST", `/api/follow-requests/${followerId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-requests"] });
    },
  });

  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const { data: followersList = [] } = useQuery<User[]>({
    queryKey: ["/api/followers", userId, "list"],
    enabled: !!userId && showFollowers,
  });

  const { data: followingList = [] } = useQuery<User[]>({
    queryKey: ["/api/following", userId, "list"],
    enabled: !!userId && showFollowing,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      setDeleteProjectId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (newsId: string) => {
      await apiRequest("DELETE", `/api/news/${newsId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/news`] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "News deleted",
        description: "Your news has been deleted successfully.",
      });
      setDeletingNewsId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete news.",
        variant: "destructive",
      });
    },
  });

  const formatJoinDate = (date: Date | string | null) => {
    if (!date) return "Recently";
    return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getFollowButtonContent = () => {
    if (followMutation.isPending) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (followStatus?.status === "accepted") {
      return (
        <>
          <Users className="mr-2 h-4 w-4" />
          Following
        </>
      );
    }
    if (followStatus?.status === "pending") {
      return (
        <>
          <Clock className="mr-2 h-4 w-4" />
          Pending
        </>
      );
    }
    return (
      <>
        <UserPlus className="mr-2 h-4 w-4" />
        Follow
      </>
    );
  };

  if (userLoading && !isOwnProfile) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="relative border-b bg-secondary/30">
        <div className="relative h-48 md:h-56 overflow-hidden">
          {displayUser?.coverImage ? (
            <img 
              src={displayUser.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
              data-testid="img-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-accent/20 to-primary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {isOwnProfile && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
              asChild
              data-testid="button-edit-cover"
            >
              <Link href="/settings">
                <Camera className="mr-2 h-4 w-4" />
                Edit Cover
              </Link>
            </Button>
          )}
        </div>
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 flex flex-col items-center pb-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={displayUser?.avatar || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-3xl">{displayUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background"
                    asChild
                    data-testid="button-edit-avatar"
                  >
                    <Link href="/settings">
                      <Camera className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              <div className="mt-4 text-center md:mt-0 md:text-left">
                <div className="flex items-center justify-center gap-2 md:justify-start flex-wrap">
                  <h1 className="font-serif text-3xl font-bold">{displayUser?.name || "Guest User"}</h1>
                  {displayUser?.isVerified && <VerificationBadge type="architect" size="lg" />}
                  {displayUser?.role && (
                    <Badge 
                      variant={displayUser.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                      data-testid="badge-role"
                    >
                      {displayUser.role === "firm" && <Building2 className="mr-1 h-3 w-3" />}
                      {displayUser.role === "student" && <GraduationCap className="mr-1 h-3 w-3" />}
                      {displayUser.role === "engineer" && <Briefcase className="mr-1 h-3 w-3" />}
                      {displayUser.role}
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{displayUser?.title || "Architecture Enthusiast"}</p>
                
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground md:justify-start">
                  {displayUser?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {displayUser.location}
                    </span>
                  )}
                  
                  {displayUser?.role === "engineer" && displayUser?.workplace && (
                    <span className="flex items-center gap-1" data-testid="text-workplace">
                      <Building2 className="h-4 w-4" />
                      {displayUser.workplace}
                    </span>
                  )}
                  
                  {displayUser?.role === "engineer" && displayUser?.yearsOfExperience && (
                    <span className="flex items-center gap-1" data-testid="text-experience">
                      <Award className="h-4 w-4" />
                      {displayUser.yearsOfExperience} years experience
                    </span>
                  )}
                  
                  {displayUser?.role === "student" && displayUser?.university && (
                    <span className="flex items-center gap-1" data-testid="text-university">
                      <GraduationCap className="h-4 w-4" />
                      {displayUser.university}
                    </span>
                  )}
                  
                  {displayUser?.role === "student" && displayUser?.yearOfStudy && (
                    <span className="flex items-center gap-1" data-testid="text-year-of-study">
                      Year {displayUser.yearOfStudy}
                    </span>
                  )}
                  
                  {displayUser?.role === "firm" && displayUser?.companySize && (
                    <span className="flex items-center gap-1" data-testid="text-company-size">
                      <Users className="h-4 w-4" />
                      {displayUser.companySize} employees
                    </span>
                  )}
                  
                  {displayUser?.role === "firm" && displayUser?.foundedYear && (
                    <span className="flex items-center gap-1" data-testid="text-founded">
                      Est. {displayUser.foundedYear}
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatJoinDate(displayUser?.createdAt || null)}
                  </span>
                </div>

                {(displayUser?.website || displayUser?.phone || displayUser?.portfolioUrl) && (
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm md:justify-start">
                    {displayUser?.website && (
                      <a 
                        href={displayUser.website.startsWith('http') ? displayUser.website : `https://${displayUser.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                        data-testid="link-website"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {displayUser?.portfolioUrl && (
                      <a 
                        href={displayUser.portfolioUrl.startsWith('http') ? displayUser.portfolioUrl : `https://${displayUser.portfolioUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                        data-testid="link-portfolio"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                    {displayUser?.phone && (
                      <span className="flex items-center gap-1 text-muted-foreground" data-testid="text-phone">
                        <Phone className="h-4 w-4" />
                        {displayUser.phone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2 md:mt-0">
              {isOwnProfile ? (
                <Button variant="outline" asChild data-testid="button-edit-profile">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    variant={followStatus?.status === "accepted" ? "secondary" : "outline"} 
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    data-testid="button-follow"
                  >
                    {getFollowButtonContent()}
                  </Button>
                  <Button data-testid="button-message">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {displayUser?.bio || "No bio yet."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Posts
                    </span>
                    <span className="font-semibold" data-testid="text-posts-count">{userPosts?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Folder className="h-4 w-4" />
                      Projects
                    </span>
                    <span className="font-semibold" data-testid="text-projects-count">{userProjects?.length || userStats?.projects || 0}</span>
                  </div>
                  <button 
                    onClick={() => setShowFollowers(true)}
                    className="flex w-full items-center justify-between hover:bg-muted/50 rounded-md -mx-2 px-2 py-1 transition-colors"
                    data-testid="button-show-followers"
                  >
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Followers
                    </span>
                    <span className="font-semibold" data-testid="text-followers-count">{followerCount?.count || 0}</span>
                  </button>
                  <button 
                    onClick={() => setShowFollowing(true)}
                    className="flex w-full items-center justify-between hover:bg-muted/50 rounded-md -mx-2 px-2 py-1 transition-colors"
                    data-testid="button-show-following"
                  >
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Following
                    </span>
                    <span className="font-semibold" data-testid="text-following-count">{followingCount?.count || 0}</span>
                  </button>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      Likes Given
                    </span>
                    <span className="font-semibold" data-testid="text-likes-count">{userLikes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      Comments
                    </span>
                    <span className="font-semibold" data-testid="text-comments-count">{userComments?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {isOwnProfile && isAuthenticated && pendingRequests && pendingRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Follow Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingRequests.map((request) => (
                      <FollowRequestItem
                        key={request.id}
                        request={request}
                        onAccept={() => acceptRequestMutation.mutate(request.followerId)}
                        onReject={() => rejectRequestMutation.mutate(request.followerId)}
                        isAccepting={acceptRequestMutation.isPending}
                        isRejecting={rejectRequestMutation.isPending}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-3">
              <Tabs defaultValue="posts">
                <TabsList className="mb-6">
                  <TabsTrigger value="posts" data-testid="tab-posts">
                    <FileText className="mr-2 h-4 w-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="projects" data-testid="tab-projects">
                    <Folder className="mr-2 h-4 w-4" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="saved" data-testid="tab-saved">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Saved
                  </TabsTrigger>
                  <TabsTrigger value="research" data-testid="tab-research">
                    <FileText className="mr-2 h-4 w-4" />
                    Research
                  </TabsTrigger>
                  <TabsTrigger value="news" data-testid="tab-news">
                    <Newspaper className="mr-2 h-4 w-4" />
                    News
                  </TabsTrigger>
                  {(isOwnProfile || profileUser?.isActivityPublic) && (
                    <TabsTrigger value="activity" data-testid="tab-activity">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="posts">
                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !userPosts || userPosts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No posts yet.</p>
                        {isOwnProfile && (
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/feed">Create Your First Post</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
                          <CardContent className="p-4">
                            {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                            <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                            {post.image && (
                              <img src={post.image} alt="" className="mt-3 rounded-md max-h-48 object-cover" />
                            )}
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary">{post.type}</Badge>
                              {post.tags?.map((tag) => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="projects">
                  {projectsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !userProjects || userProjects.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No projects yet.</p>
                        {isOwnProfile && (
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/projects/new">Add Your First Project</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {userProjects.map((project) => (
                        <Card key={project.id} className="overflow-hidden hover-elevate group relative" data-testid={`card-project-${project.id}`}>
                          {isOwnProfile && (
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
                                    onClick={(e) => e.preventDefault()}
                                    data-testid={`button-project-menu-${project.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setDeleteProjectId(project.id);
                                    }}
                                    className="text-destructive"
                                    data-testid={`button-delete-project-${project.id}`}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Project
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                          <Link href={`/projects/${project.id}`}>
                            <div className="aspect-video bg-muted relative overflow-hidden">
                              {project.image ? (
                                <img src={project.image} alt={project.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Folder className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                                {project.projectType && (
                                  <Badge variant={project.projectType === "academic" ? "secondary" : "default"} className="text-xs">
                                    {project.projectType === "academic" ? "Academic" : "Professional"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Link>
                          <CardContent className="p-4 space-y-3">
                            <Link href={`/projects/${project.id}`}>
                              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              {project.category && <Badge variant="outline" className="capitalize">{project.category}</Badge>}
                              {project.year && <span>{project.year}</span>}
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <SocialInteractions
                                contentId={project.id}
                                contentType="project"
                                shareUrl={`${window.location.origin}/projects/${project.id}`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved">
                  {!isOwnProfile ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Saved items are private.</p>
                      </CardContent>
                    </Card>
                  ) : !savedItems || savedItems.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No saved items yet.</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Save books, competitions, and more to find them here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {savedItems.map((item) => (
                        <SavedItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="research">
                  {researchLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !userResearch || userResearch.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No research papers yet.</p>
                        {isOwnProfile && (
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/research">Submit Research</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {userResearch.map((paper) => (
                        <Link key={paper.id} href={`/research/${paper.id}`} className="block">
                          <Card className="overflow-hidden hover-elevate cursor-pointer" data-testid={`card-research-${paper.id}`}>
                            <div className="flex">
                              <div className="shrink-0 w-24 h-24 bg-muted overflow-hidden flex items-center justify-center">
                                {paper.image ? (
                                  <img src={paper.image} alt={paper.title} className="h-full w-full object-cover" />
                                ) : (
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                )}
                              </div>
                              <CardContent className="p-4 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">{paper.category}</Badge>
                                  <Badge variant={paper.status === "approved" ? "default" : "secondary"} className="text-xs">
                                    {paper.status}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-sm line-clamp-1">{paper.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{paper.abstract}</p>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  <div className="space-y-6">
                    {userLikes && userLikes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Recent Likes ({userLikes.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {userLikes.slice(0, 10).map((like) => (
                              <LikedItemCard 
                                key={like.id} 
                                item={like} 
                                onUnlike={() => queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "likes"] })}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {userComments && userComments.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Recent Comments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {userComments.slice(0, 5).map((comment) => (
                              <div key={comment.id} className="border-b pb-2 last:border-0" data-testid={`activity-comment-${comment.id}`}>
                                <p className="text-sm line-clamp-2">{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  On a {comment.targetType} · {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(!userLikes || userLikes.length === 0) && (!userComments || userComments.length === 0) && (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">No recent activity.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="news">
                  {isLoadingNews ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : !userNews || userNews.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No news or events submitted yet.</p>
                        {isOwnProfile && (
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/news">Submit News or Event</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {userNews.map((newsItem) => (
                        <Card 
                          key={newsItem.id}
                          className="group relative overflow-visible hover-elevate cursor-pointer" 
                          data-testid={`card-news-${newsItem.id}`}
                          onClick={() => navigate(`/news/${newsItem.id}`)}
                        >
                          {isOwnProfile && (
                            <div 
                              className="absolute top-2 right-2 z-10"
                              style={{ visibility: "hidden" }}
                              data-testid={`menu-container-news-${newsItem.id}`}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                    data-testid={`button-menu-news-${newsItem.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNews(newsItem);
                                    }}
                                    data-testid={`menu-edit-news-${newsItem.id}`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingNewsId(newsItem.id);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                    data-testid={`menu-delete-news-${newsItem.id}`}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                          <div className="flex">
                            <div className="shrink-0 w-24 h-24 bg-muted overflow-hidden flex items-center justify-center">
                              {newsItem.images && newsItem.images.length > 0 ? (
                                <img src={newsItem.images[0]} alt={newsItem.title} className="h-full w-full object-cover" />
                              ) : (
                                <Newspaper className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <CardContent className="p-4 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {newsItem.category && (
                                  <Badge variant="outline" className="text-xs">{newsItem.category}</Badge>
                                )}
                                <Badge 
                                  variant={newsItem.status === "approved" ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {newsItem.status === "approved" ? (
                                    <><Check className="h-3 w-3 mr-1" />Approved</>
                                  ) : newsItem.status === "rejected" ? (
                                    <><X className="h-3 w-3 mr-1" />Rejected</>
                                  ) : (
                                    <><Clock className="h-3 w-3 mr-1" />Pending</>
                                  )}
                                </Badge>
                                {newsItem.isEvent && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Event
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-sm line-clamp-1">{newsItem.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {newsItem.createdAt && new Date(newsItem.createdAt).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </div>
                          <style>{`
                            [data-testid="card-news-${newsItem.id}"]:hover [data-testid="menu-container-news-${newsItem.id}"] {
                              visibility: visible !important;
                            }
                          `}</style>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && deleteProjectMutation.mutate(deleteProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingNewsId} onOpenChange={(open) => !open && setDeletingNewsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this news? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingNewsId && deleteNewsMutation.mutate(deletingNewsId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteNewsMutation.isPending}
            >
              {deleteNewsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingNews && (
        <NewsEditDialog
          newsItem={editingNews}
          isOpen={!!editingNews}
          onOpenChange={(open) => !open && setEditingNews(null)}
        />
      )}

      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Followers ({followerCount?.count || 0})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {followersList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No followers yet</p>
            ) : (
              <div className="space-y-3">
                {followersList.map((follower) => (
                  <Link 
                    key={follower.id} 
                    href={`/profile/${follower.username}`}
                    onClick={() => setShowFollowers(false)}
                  >
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors" data-testid={`follower-${follower.id}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{follower.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{follower.name}</p>
                          {follower.isVerified && <VerificationBadge type="architect" size="sm" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{follower.username}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {follower.role}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Following ({followingCount?.count || 0})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {followingList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              <div className="space-y-3">
                {followingList.map((following) => (
                  <Link 
                    key={following.id} 
                    href={`/profile/${following.username}`}
                    onClick={() => setShowFollowing(false)}
                  >
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors" data-testid={`following-${following.id}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={following.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{following.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{following.name}</p>
                          {following.isVerified && <VerificationBadge type="architect" size="sm" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{following.username}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {following.role}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function FollowRequestItem({ 
  request, 
  onAccept, 
  onReject, 
  isAccepting, 
  isRejecting 
}: { 
  request: Follow; 
  onAccept: () => void; 
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  const { data: requester } = useQuery<User>({
    queryKey: ["/api/users", request.followerId],
    enabled: !!request.followerId,
  });

  return (
    <div className="flex items-center justify-between gap-2" data-testid={`follow-request-${request.id}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={requester?.avatar || "/placeholder-user.jpg"} />
          <AvatarFallback>{requester?.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{requester?.name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">@{requester?.username || "unknown"}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button 
          size="icon" 
          variant="ghost"
          onClick={onAccept}
          disabled={isAccepting || isRejecting}
          data-testid={`button-accept-${request.followerId}`}
        >
          {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost"
          onClick={onReject}
          disabled={isAccepting || isRejecting}
          data-testid={`button-reject-${request.followerId}`}
        >
          {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-destructive" />}
        </Button>
      </div>
    </div>
  );
}
