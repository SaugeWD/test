import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  FileText,
  Bookmark,
  Heart,
  MessageCircle,
  Calendar,
  Book,
  Trophy,
  Briefcase,
  Folder,
  GraduationCap,
  Clock,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  userId: string;
  type: string;
  content: string;
  title?: string;
  image?: string;
  createdAt?: string;
}

interface SavedItem {
  id: string;
  userId: string;
  targetType: string;
  targetId: string;
  createdAt?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  image?: string;
  category?: string;
}

interface Competition {
  id: string;
  title: string;
  organizer?: string;
  deadline?: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

export default function ActivityPage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch user's posts
  const { data: allPosts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  // Filter posts by current user
  const userPosts = allPosts.filter((post) => post.userId === user?.id);

  // Fetch saved items
  const { data: savedItems = [], isLoading: isLoadingSaved } = useQuery<SavedItem[]>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  // Fetch books for saved items
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Fetch competitions for saved items
  const { data: competitions = [] } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  // Fetch projects for saved items
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Get saved item details
  const getSavedItemDetails = (item: SavedItem) => {
    switch (item.targetType) {
      case "book":
        const book = books.find((b) => b.id === item.targetId);
        return book ? { type: "Book", title: book.title, subtitle: book.author, image: book.image } : null;
      case "competition":
        const comp = competitions.find((c) => c.id === item.targetId);
        return comp ? { type: "Competition", title: comp.title, subtitle: comp.organizer, image: comp.image } : null;
      case "project":
        const proj = projects.find((p) => p.id === item.targetId);
        return proj ? { type: "Project", title: proj.title, subtitle: proj.description?.slice(0, 50), image: proj.image } : null;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book":
        return <Book className="h-4 w-4" />;
      case "competition":
        return <Trophy className="h-4 w-4" />;
      case "project":
        return <Folder className="h-4 w-4" />;
      case "job":
        return <Briefcase className="h-4 w-4" />;
      case "research":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <Activity className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your activity</h1>
          <p className="text-muted-foreground mb-6">
            Track your posts, saved items, and interactions
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold">My Activity</h1>
            <p className="text-muted-foreground">View your posts and saved items</p>
          </div>
        </div>

        {/* User Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold" data-testid="text-user-posts-count">
                    {userPosts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-user-saved-count">
                    {savedItems.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2" data-testid="tab-posts">
              <FileText className="h-4 w-4" />
              My Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2" data-testid="tab-saved">
              <Bookmark className="h-4 w-4" />
              Saved Items ({savedItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your thoughts and projects with the community
                  </p>
                  <Button asChild>
                    <Link href="/feed">Create Your First Post</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <Card key={post.id} data-testid={`card-post-${post.id}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={user?.avatar || ""} />
                          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{user?.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {post.type || "text"}
                            </Badge>
                            {post.createdAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          {post.title && (
                            <h3 className="font-medium mb-1">{post.title}</h3>
                          )}
                          <p className="text-sm text-muted-foreground">{post.content}</p>
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post image"
                              className="mt-3 rounded-lg max-h-64 object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Items Tab */}
          <TabsContent value="saved">
            {isLoadingSaved ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                  <p className="text-muted-foreground mb-4">
                    Bookmark books, competitions, and projects to find them here
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/books">Browse Books</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/competitions">View Competitions</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedItems.map((item) => {
                  const details = getSavedItemDetails(item);
                  if (!details) {
                    return (
                      <Card key={item.id} data-testid={`card-saved-${item.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
                              {getTypeIcon(item.targetType)}
                            </div>
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {item.targetType}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Item ID: {item.targetId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return (
                    <Card
                      key={item.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`card-saved-${item.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {details.image ? (
                            <img
                              src={details.image}
                              alt={details.title}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded bg-secondary">
                              {getTypeIcon(item.targetType)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="mb-1">
                              {details.type}
                            </Badge>
                            <h4 className="font-medium truncate">{details.title}</h4>
                            {details.subtitle && (
                              <p className="text-sm text-muted-foreground truncate">
                                {details.subtitle}
                              </p>
                            )}
                            {item.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Bookmark className="h-3 w-3" />
                                Saved {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
