import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Search, 
  Users, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  GraduationCap, 
  HelpCircle,
  Radio,
  MapPin,
  Clock,
  Send,
  Filter,
  Loader2,
  Building2,
  Trophy,
  Briefcase,
  BookOpen,
  Newspaper,
  FileText,
  Calendar,
  DollarSign,
  Reply,
  Pencil,
  Trash2,
  X,
  Check,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface UnifiedFeedItem {
  id: string;
  feedType: "post" | "project" | "research" | "news" | "job" | "competition";
  type: string;
  title?: string;
  content: string;
  images?: string[];
  tags?: string[];
  category?: string;
  createdAt: string;
  author: { id?: string; name: string; username?: string; avatar?: string; isVerified?: boolean; verificationType?: string } | null;
  likesCount: number;
  commentsCount: number;
  location?: string;
  company?: string;
  deadline?: string;
  prize?: string;
  university?: string;
  isEvent?: boolean;
  eventDate?: string;
  eventLocation?: string;
  year?: string;
  language?: string;
  projectType?: string;
}

const categories = ["All Topics", "Sustainability", "Software", "Regulations", "Competitions", "Career", "Design"];

// Jordanian universities with Architecture programs
const JORDANIAN_UNIVERSITIES = [
  { id: "uj", name: "University of Jordan", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Public", founded: 1962 },
  { id: "just", name: "Jordan University of Science and Technology", city: "Irbid", programs: ["Architecture", "Urban Planning"], type: "Public", founded: 1986 },
  { id: "gju", name: "German Jordanian University", city: "Amman", programs: ["Architecture", "Interior Architecture"], type: "Public", founded: 2005 },
  { id: "asu", name: "Applied Science Private University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1991 },
  { id: "petra", name: "Petra University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1991 },
  { id: "philadelphia", name: "Philadelphia University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1989 },
  { id: "aau", name: "Al-Ahliyya Amman University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1990 },
  { id: "hu", name: "Hashemite University", city: "Zarqa", programs: ["Architecture"], type: "Public", founded: 1995 },
  { id: "zu", name: "Zarqa University", city: "Zarqa", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1994 },
  { id: "bau", name: "Al-Balqa Applied University", city: "Salt", programs: ["Architectural Engineering"], type: "Public", founded: 1997 },
  { id: "yu", name: "Yarmouk University", city: "Irbid", programs: ["Architecture"], type: "Public", founded: 1976 },
  { id: "isra", name: "Isra University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1991 },
  { id: "meu", name: "Middle East University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 2005 },
  { id: "psut", name: "Princess Sumaya University for Technology", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1991 },
  { id: "aum", name: "American University of Madaba", city: "Madaba", programs: ["Architecture", "Interior Design"], type: "Private", founded: 2011 },
  { id: "jadara", name: "Jadara University", city: "Irbid", programs: ["Architecture"], type: "Private", founded: 2005 },
];

export default function CommunityPage() {
  const urlSearchQuery = useSearch();
  const urlParams = new URLSearchParams(urlSearchQuery);
  const urlCategory = urlParams.get("category");
  
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "All Topics");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [questionTags, setQuestionTags] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<UnifiedFeedItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  // Fetch users from API
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/users']
  });

  // Fetch discussions/posts from unified feed API
  const { data: feedItems = [], isLoading: isLoadingDiscussions } = useQuery<UnifiedFeedItem[]>({
    queryKey: ['/api/feed']
  });

  // Fetch user's likes
  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: [`/api/users/${user?.id}/likes`],
    enabled: !!user?.id,
  });

  // Fetch user's saved items
  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: !!user,
  });

  const discussions = feedItems;

  // Helper to check if item is liked
  const isItemLiked = (item: UnifiedFeedItem) => {
    return userLikes.some(
      (like) => like.targetType === item.feedType && like.targetId === item.id
    );
  };

  // Helper to check if item is saved
  const isItemSaved = (item: UnifiedFeedItem) => {
    return savedItems.some(
      (saved) => saved.targetType === item.feedType && saved.targetId === item.id
    );
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format relative time
  const getTimeAgo = (date: string | Date | null) => {
    if (!date) return "Recently";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const filteredDiscussions = discussions.filter((discussion: UnifiedFeedItem) => {
    const matchesSearch =
      (discussion.title || discussion.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discussion.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Topics" || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFeedTypeIcon = (feedType: string) => {
    switch (feedType) {
      case "project": return <Building2 className="h-3 w-3 mr-1" />;
      case "research": return <BookOpen className="h-3 w-3 mr-1" />;
      case "news": return <Newspaper className="h-3 w-3 mr-1" />;
      case "job": return <Briefcase className="h-3 w-3 mr-1" />;
      case "competition": return <Trophy className="h-3 w-3 mr-1" />;
      default: return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  const getFeedTypeLabel = (item: UnifiedFeedItem) => {
    switch (item.feedType) {
      case "project": return "Project";
      case "research": return "Research";
      case "news": return item.isEvent ? "Event" : "News";
      case "job": return "Job";
      case "competition": return "Competition";
      default: return item.type || "Post";
    }
  };

  const getFeedTypeVariant = (feedType: string): "default" | "secondary" | "outline" => {
    switch (feedType) {
      case "competition": return "default";
      case "job": return "default";
      case "research": return "secondary";
      case "project": return "secondary";
      default: return "outline";
    }
  };

  const getDetailLink = (item: UnifiedFeedItem) => {
    switch (item.feedType) {
      case "project": return `/projects/${item.id}`;
      case "research": return `/research/${item.id}`;
      case "news": return `/news/${item.id}`;
      case "job": return `/jobs/${item.id}`;
      case "competition": return `/competitions/${item.id}`;
      default: return null;
    }
  };

  const getFeedTypePageLink = (item: UnifiedFeedItem) => {
    switch (item.feedType) {
      case "project": return "/projects";
      case "research": return "/research";
      case "news": return "/news";
      case "job": return "/jobs";
      case "competition": return "/competitions";
      default: return "/feed";
    }
  };

  const likeMutation = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
      const res = await apiRequest("POST", "/api/likes", { targetType, targetId });
      return res.json();
    },
    onSuccess: (_, { targetType, targetId }) => {
      // Invalidate all related queries for cross-page sync
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/likes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/likes", targetType, targetId] });
      queryClient.invalidateQueries({ predicate: (query) => 
        Array.isArray(query.queryKey) && query.queryKey[0] === "/api/users" && query.queryKey[2] === "posts"
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
      const res = await apiRequest("POST", "/api/saved", { targetType, targetId });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate all related queries for cross-page sync
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (data?.action === "saved") {
        toast({ description: "Saved to your library" });
      } else {
        toast({ description: "Removed from saved items" });
      }
    },
  });

  // Fetch comments for selected discussion
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string; avatar?: string };
  }>>({
    queryKey: ["/api/comments", selectedDiscussion?.feedType, selectedDiscussion?.id],
    enabled: !!selectedDiscussion,
  });

  const commentMutation = useMutation({
    mutationFn: async ({ targetType, targetId, content }: { targetType: string; targetId: string; content: string }) => {
      const res = await apiRequest("POST", "/api/comments", { targetType, targetId, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", selectedDiscussion?.feedType, selectedDiscussion?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      setNewComment("");
      setReplyingToId(null);
      setReplyContent("");
      toast({ description: "Comment added" });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest("POST", "/api/likes", { targetType: "comment", targetId: commentId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", selectedDiscussion?.feedType, selectedDiscussion?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/likes`] });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await apiRequest("PATCH", `/api/comments/${commentId}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", selectedDiscussion?.feedType, selectedDiscussion?.id] });
      setEditingCommentId(null);
      setEditingContent("");
      toast({ description: "Comment updated" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", selectedDiscussion?.feedType, selectedDiscussion?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      toast({ description: "Comment deleted" });
    },
  });

  const handleOpenComments = (item: UnifiedFeedItem) => {
    setSelectedDiscussion(item);
    setCommentsOpen(true);
  };

  const handlePostComment = () => {
    if (!user) {
      toast({ description: "Please sign in to comment", variant: "destructive" });
      return;
    }
    if (!newComment.trim() || !selectedDiscussion) return;
    commentMutation.mutate({
      targetType: selectedDiscussion.feedType,
      targetId: selectedDiscussion.id,
      content: newComment.trim(),
    });
  };

  const handleLike = (item: UnifiedFeedItem) => {
    if (!user) return;
    likeMutation.mutate({ targetType: item.feedType, targetId: item.id });
  };

  const handleSave = (item: UnifiedFeedItem) => {
    if (!user) return;
    saveMutation.mutate({ targetType: item.feedType, targetId: item.id });
  };

  const handlePostQuestion = () => {
    if (!questionTitle.trim()) {
      toast({ description: "Please enter a question title", variant: "destructive" });
      return;
    }
    toast({ description: "Question posted successfully!" });
    setQuestionTitle("");
    setQuestionDescription("");
    setQuestionCategory("");
    setQuestionTags("");
  };

  return (
    <div className="min-h-screen" data-testid="page-community">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12" data-testid="section-hero">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 px-4 py-2">
              <Users className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Community</span>
            </div>
            <h1 className="font-serif text-4xl font-bold md:text-5xl">Community</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join discussions, ask questions, and connect with architects and students across Jordan
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="discussions" className="w-full" data-testid="tabs-community">
                <TabsList className="mb-6 grid w-full grid-cols-3">
                  <TabsTrigger value="discussions" data-testid="tab-discussions">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Discussions
                    <Badge variant="secondary" className="ml-2">{discussions.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="universities" data-testid="tab-universities">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Universities
                    <Badge variant="secondary" className="ml-2">{JORDANIAN_UNIVERSITIES.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="ask" data-testid="tab-ask-question">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ask a Question
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discussions" data-testid="content-discussions">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search discussions..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-discussions"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40" data-testid="select-category-filter">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} data-testid={`option-category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        data-testid={`button-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {isLoadingDiscussions ? (
                      <div className="flex items-center justify-center py-12" data-testid="loading-discussions">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading discussions...</span>
                      </div>
                    ) : filteredDiscussions.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground" data-testid="text-no-discussions">
                            No discussions found. Be the first to start a discussion!
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredDiscussions.map((discussion: UnifiedFeedItem) => {
                        const detailLink = getDetailLink(discussion);
                        const hasImage = discussion.images && discussion.images.length > 0;
                        const featuredImage = hasImage ? discussion.images![0] : null;
                        
                        return (
                        <Card 
                          key={discussion.id} 
                          className="hover-elevate overflow-hidden"
                          data-testid={`card-discussion-${discussion.id}`}
                        >
                          {featuredImage && (
                            <div className="relative">
                              {detailLink ? (
                                <Link href={detailLink}>
                                  <div className="aspect-video w-full overflow-hidden bg-muted">
                                    <img 
                                      src={featuredImage} 
                                      alt={discussion.title || ""}
                                      className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                  </div>
                                </Link>
                              ) : (
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                  <img 
                                    src={featuredImage} 
                                    alt={discussion.title || ""}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                <Link href={getFeedTypePageLink(discussion)} onClick={(e) => e.stopPropagation()} data-testid={`link-feedtype-${discussion.id}`}>
                                  <Badge variant={getFeedTypeVariant(discussion.feedType)} className="capitalize cursor-pointer hover:opacity-80 transition-opacity shadow-sm" data-testid={`badge-feedtype-${discussion.id}`}>
                                    {getFeedTypeIcon(discussion.feedType)}
                                    {getFeedTypeLabel(discussion)}
                                  </Badge>
                                </Link>
                                {discussion.category && (
                                  <Link href={`/community?category=${encodeURIComponent(discussion.category)}`} onClick={(e) => e.stopPropagation()}>
                                    <Badge variant="secondary" className="cursor-pointer hover:opacity-80 transition-opacity shadow-sm" data-testid={`badge-tag-${discussion.id}`}>{discussion.category}</Badge>
                                  </Link>
                                )}
                              </div>
                              {discussion.images && discussion.images.length > 1 && (
                                <div className="absolute bottom-3 right-3">
                                  <Badge variant="secondary" className="shadow-sm">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {discussion.images.length} images
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <CardHeader className={featuredImage ? "pt-4" : ""}>
                            {!featuredImage && (
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <Link href={getFeedTypePageLink(discussion)} onClick={(e) => e.stopPropagation()} data-testid={`link-feedtype-${discussion.id}`}>
                                  <Badge variant={getFeedTypeVariant(discussion.feedType)} className="capitalize cursor-pointer hover:opacity-80 transition-opacity" data-testid={`badge-feedtype-${discussion.id}`}>
                                    {getFeedTypeIcon(discussion.feedType)}
                                    {getFeedTypeLabel(discussion)}
                                  </Badge>
                                </Link>
                                {discussion.category && (
                                  <Link href={`/community?category=${encodeURIComponent(discussion.category)}`} onClick={(e) => e.stopPropagation()}>
                                    <Badge variant="outline" className="cursor-pointer hover:opacity-80 transition-opacity" data-testid={`badge-tag-${discussion.id}`}>{discussion.category}</Badge>
                                  </Link>
                                )}
                              </div>
                            )}
                            
                            <CardTitle className="text-lg leading-tight" data-testid={`text-title-${discussion.id}`}>
                              {detailLink ? (
                                <Link href={detailLink} className="text-left hover:text-accent transition-colors line-clamp-2">
                                  {discussion.title || discussion.content?.substring(0, 100)}
                                </Link>
                              ) : (
                                <span className="text-left line-clamp-2">
                                  {discussion.title || discussion.content?.substring(0, 100)}
                                </span>
                              )}
                            </CardTitle>
                            
                            <div className="flex items-center gap-3 mt-3">
                              {discussion.author?.username ? (
                                <Link href={`/profile/${discussion.author.username}`}>
                                  <Avatar className="h-8 w-8 cursor-pointer" data-testid={`avatar-${discussion.author.username || discussion.id}`}>
                                    {discussion.author?.avatar && <AvatarImage src={discussion.author.avatar} />}
                                    <AvatarFallback className="text-xs">{getInitials(discussion.author?.name || 'U')}</AvatarFallback>
                                  </Avatar>
                                </Link>
                              ) : (
                                <Avatar className="h-8 w-8" data-testid={`avatar-${discussion.id}`}>
                                  <AvatarFallback className="text-xs">{getInitials(discussion.author?.name || 'U')}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {discussion.author?.username ? (
                                    <Link
                                      href={`/profile/${discussion.author.username}`}
                                      className="text-sm font-medium hover:text-accent transition-colors truncate"
                                      data-testid={`link-author-${discussion.id}`}
                                    >
                                      {discussion.author?.name || 'Unknown'}
                                    </Link>
                                  ) : (
                                    <span className="text-sm font-medium truncate" data-testid={`link-author-${discussion.id}`}>
                                      {discussion.author?.name || 'Unknown'}
                                    </span>
                                  )}
                                  {discussion.author?.isVerified && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">Verified</Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-time-${discussion.id}`}>
                                  <Clock className="h-3 w-3" />
                                  {getTimeAgo(discussion.createdAt)}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {(discussion.location || discussion.company || discussion.deadline || discussion.prize || discussion.university || discussion.eventLocation || discussion.eventDate || discussion.year) && (
                              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3 pb-3 border-b">
                                {discussion.year && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-accent" />
                                    {discussion.year}
                                  </span>
                                )}
                                {discussion.company && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4 text-accent" />
                                    {discussion.company}
                                  </span>
                                )}
                                {discussion.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-accent" />
                                    {discussion.location}
                                  </span>
                                )}
                                {discussion.university && (
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4 text-accent" />
                                    {discussion.university}
                                  </span>
                                )}
                                {discussion.deadline && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-accent" />
                                    Deadline: {new Date(discussion.deadline).toLocaleDateString()}
                                  </span>
                                )}
                                {discussion.prize && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-accent" />
                                    {discussion.prize}
                                  </span>
                                )}
                                {discussion.eventDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-accent" />
                                    {new Date(discussion.eventDate).toLocaleDateString()}
                                  </span>
                                )}
                                {discussion.eventLocation && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-accent" />
                                    {discussion.eventLocation}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3" data-testid={`text-excerpt-${discussion.id}`}>
                              {discussion.content?.substring(0, 250)}{discussion.content && discussion.content.length > 250 ? '...' : ''}
                            </p>
                            
                            {Array.isArray(discussion.tags) && discussion.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {discussion.tags.slice(0, 4).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {discussion.tags.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{discussion.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between border-t pt-4 mt-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLike(discussion)}
                                  className={isItemLiked(discussion) ? "text-accent" : ""}
                                  data-testid={`button-like-${discussion.id}`}
                                  disabled={likeMutation.isPending}
                                >
                                  <Heart className={`h-4 w-4 mr-1.5 ${isItemLiked(discussion) ? "fill-current" : ""}`} />
                                  <span>{discussion.likesCount || 0}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenComments(discussion)}
                                  data-testid={`button-comments-${discussion.id}`}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1.5" />
                                  <span>{discussion.commentsCount || 0}</span>
                                </Button>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSave(discussion)}
                                  className={isItemSaved(discussion) ? "text-accent" : ""}
                                  data-testid={`button-save-${discussion.id}`}
                                  disabled={saveMutation.isPending}
                                >
                                  <Bookmark className={`h-4 w-4 ${isItemSaved(discussion) ? "fill-current" : ""}`} />
                                </Button>
                                {detailLink && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={detailLink}>
                                      View Details
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );})
                      
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="universities" data-testid="content-universities">
                  <div className="mb-6">
                    <p className="text-muted-foreground">
                      Explore architecture programs at Jordanian universities. Click on a university to see students and members.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {JORDANIAN_UNIVERSITIES.map((uni) => {
                      const studentCount = users.filter((u: any) => u.university === uni.name).length;
                      return (
                        <Link key={uni.id} href={`/community/university/${uni.id}`}>
                          <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-university-${uni.id}`}>
                            <CardHeader>
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                  <GraduationCap className="h-6 w-6 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg" data-testid={`text-uni-name-${uni.id}`}>
                                    {uni.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1 flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {uni.city}
                                    <Badge variant="outline" className="text-xs ml-2">{uni.type}</Badge>
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Programs:</p>
                                <div className="flex flex-wrap gap-1">
                                  {uni.programs.map((program) => (
                                    <Badge key={program} variant="secondary" className="text-xs">
                                      {program}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{studentCount} members</span>
                                </div>
                                <span>Est. {uni.founded}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="ask" data-testid="content-ask-question">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ask the Community</CardTitle>
                      <CardDescription>
                        Get help from fellow architects and students. Be specific and provide context.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Question Title</label>
                          <Input 
                            placeholder="What's your question?" 
                            value={questionTitle}
                            onChange={(e) => setQuestionTitle(e.target.value)}
                            data-testid="input-question-title"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Description</label>
                          <Textarea
                            placeholder="Provide more context about your question..."
                            className="min-h-[120px]"
                            value={questionDescription}
                            onChange={(e) => setQuestionDescription(e.target.value)}
                            data-testid="textarea-question-description"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Category</label>
                          <Select value={questionCategory} onValueChange={setQuestionCategory}>
                            <SelectTrigger data-testid="select-question-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">Tags</label>
                          <Input 
                            placeholder="Add tags separated by commas (e.g., design, sustainability, tips)" 
                            value={questionTags}
                            onChange={(e) => setQuestionTags(e.target.value)}
                            data-testid="input-question-tags"
                          />
                        </div>
                        <Button className="w-full" onClick={handlePostQuestion} data-testid="button-post-question">
                          <Send className="mr-2 h-4 w-4" />
                          Post Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card data-testid="card-live-lectures">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-accent" />
                    Live Lectures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-6 text-center">
                    <Radio className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground" data-testid="text-no-lectures">
                      No live lectures scheduled at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-community-stats">
                <CardHeader>
                  <CardTitle>Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Discussions</span>
                    <span className="font-semibold" data-testid="stat-discussions">{isLoadingDiscussions ? '...' : discussions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Community Members</span>
                    <span className="font-semibold" data-testid="stat-members">{isLoadingUsers ? '...' : users.length}</span>
                  </div>
                </CardContent>
              </Card>

              {!user && (
                <Card className="bg-accent/10 border-accent/20" data-testid="card-join-cta">
                  <CardHeader>
                    <CardTitle>Join the Community</CardTitle>
                    <CardDescription>
                      Connect with fellow architects and share your knowledge.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild data-testid="button-get-started">
                      <Link href="/login">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {selectedDiscussion && (
              <div className="border-b pb-4">
                <h3 className="font-medium">{selectedDiscussion.title || "Discussion"}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedDiscussion.content}</p>
              </div>
            )}

            {user && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="textarea-new-comment"
                />
              </div>
            )}
            {user && (
              <Button 
                onClick={handlePostComment} 
                disabled={!newComment.trim() || commentMutation.isPending}
                className="w-full"
                data-testid="button-post-comment"
              >
                {commentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Comment
              </Button>
            )}

            <div className="space-y-4 pt-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-2" data-testid={`comment-${comment.id}`}>
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user?.avatar} />
                        <AvatarFallback>{getInitials(comment.user?.name || "U")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.user?.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{getTimeAgo(comment.createdAt)}</span>
                          </div>
                          {user && comment.user?.id === user.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`button-comment-menu-${comment.id}`}>
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}
                                  data-testid={`button-edit-comment-${comment.id}`}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  className="text-destructive"
                                  data-testid={`button-delete-comment-${comment.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[60px]"
                              data-testid="textarea-edit-comment"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => editCommentMutation.mutate({ commentId: comment.id, content: editingContent })}
                                disabled={!editingContent.trim() || editCommentMutation.isPending}
                                data-testid="button-save-edit"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { setEditingCommentId(null); setEditingContent(""); }}
                                data-testid="button-cancel-edit"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm mt-1">{comment.content}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={() => user && likeCommentMutation.mutate(comment.id)}
                            disabled={!user}
                            data-testid={`button-like-comment-${comment.id}`}
                          >
                            <Heart className={`h-3 w-3 mr-1 ${userLikes.some(l => l.targetType === "comment" && l.targetId === comment.id) ? "fill-current text-red-500" : ""}`} />
                            {comment.likesCount || 0}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={() => { setReplyingToId(replyingToId === comment.id ? null : comment.id); setReplyContent(""); }}
                            data-testid={`button-reply-comment-${comment.id}`}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                    {replyingToId === comment.id && (
                      <div className="ml-11 space-y-2">
                        <Textarea
                          placeholder={`Reply to ${comment.user?.name || "user"}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px]"
                          data-testid="textarea-reply"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (selectedDiscussion && replyContent.trim()) {
                                commentMutation.mutate({
                                  targetType: selectedDiscussion.feedType,
                                  targetId: selectedDiscussion.id,
                                  content: `@${comment.user?.name || "user"} ${replyContent.trim()}`,
                                });
                              }
                            }}
                            disabled={!replyContent.trim() || commentMutation.isPending}
                            data-testid="button-send-reply"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => { setReplyingToId(null); setReplyContent(""); }}
                            data-testid="button-cancel-reply"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
