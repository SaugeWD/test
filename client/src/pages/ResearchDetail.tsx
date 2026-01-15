import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Loader2, Download, Users, GraduationCap, Calendar, 
  FileText, Quote, BookOpen, ExternalLink, Heart, MessageSquare,
  Share2, Bookmark, Globe, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { Research, User as UserType, Comment } from "@shared/schema";

interface ResearchWithAuthor extends Research {
  submittedBy?: UserType;
}

export default function ResearchDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");

  const { data: research, isLoading } = useQuery<ResearchWithAuthor>({
    queryKey: ["/api/research", id],
  });

  const { data: author } = useQuery<UserType>({
    queryKey: ["/api/users", research?.submittedById],
    enabled: !!research?.submittedById,
  });

  const { data: allComments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments", "research", id],
  });

  const { data: likesData } = useQuery<{ count: number }>({
    queryKey: ["/api/likes", "research", id],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", user?.id, "likes"],
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "research" && like.targetId === id
  );

  const isSaved = savedItems.some(
    (item) => item.targetType === "research" && item.targetId === id
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: "research",
        targetId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", "research", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "likes"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", {
        targetType: "research",
        targetId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: isSaved ? "Removed from saved" : "Saved to library",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/comments", {
        targetType: "research",
        targetId: id,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "research", id] });
      toast({ description: "Comment posted" });
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: research?.title,
          text: research?.abstract?.slice(0, 100) + "...",
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!research) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Research not found</h1>
          <p className="text-muted-foreground mb-6">The research paper you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/research">Back to Research</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header with back button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/research">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Research
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/research?category=${encodeURIComponent(research.category || "Research")}`}>
                  <Badge variant="default" className="cursor-pointer hover:opacity-80 transition-opacity">{research.category || "Research"}</Badge>
                </Link>
                {research.language && (
                  <Badge variant="secondary">{research.language}</Badge>
                )}
                {research.publishedYear && (
                  <Badge variant="outline">{research.publishedYear}</Badge>
                )}
                {research.status === "pending" && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Pending Review
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight" data-testid="text-research-title">
                {research.title}
              </h1>

              {/* Authors and University */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                {research.authors && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span data-testid="text-authors">{research.authors}</span>
                  </div>
                )}
                {research.university && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span data-testid="text-university">{research.university}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={!isAuthenticated || likeMutation.isPending}
                  data-testid="button-like"
                >
                  <Heart className={cn("mr-1.5 h-4 w-4", isLiked && "fill-current")} />
                  {likesData?.count || 0}
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={!isAuthenticated || saveMutation.isPending}
                  data-testid="button-save"
                >
                  <Bookmark className={cn("mr-1.5 h-4 w-4", isSaved && "fill-current")} />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Share
                </Button>
                {research.pdfUrl && (
                  <Button size="sm" asChild data-testid="button-download-pdf">
                    <a href={research.pdfUrl} download>
                      <Download className="mr-1.5 h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {research.image && (
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={research.image} 
                  alt={research.title} 
                  className="w-full h-auto max-h-96 object-cover"
                  data-testid="img-research-cover"
                />
              </div>
            )}

            {/* Abstract */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Quote className="h-5 w-5 text-muted-foreground" />
                Abstract
              </h2>
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-abstract">
                  {research.abstract || "No abstract provided."}
                </p>
              </div>
            </div>

            {/* PDF Viewer */}
            {research.pdfUrl && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Full Paper
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <a href={research.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border bg-white">
                  <iframe
                    src={research.pdfUrl}
                    className="w-full h-full"
                    title="Research PDF"
                  />
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Discussion ({allComments.length})
              </h2>

              {isAuthenticated ? (
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user?.avatar || ""} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[80px]"
                      data-testid="input-comment"
                    />
                    <Button 
                      size="sm"
                      onClick={() => commentMutation.mutate(commentText)}
                      disabled={!commentText.trim() || commentMutation.isPending}
                      data-testid="button-post-comment"
                    >
                      {commentMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                      Post Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-3">Sign in to join the discussion</p>
                  <Button size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allComments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allComments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Paper Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paper Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{research.citations || 0}</p>
                    <p className="text-xs text-muted-foreground">Citations</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{research.downloads || 0}</p>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-medium">{research.publishedYear || research.year || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{research.language || "English"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{research.category || "General"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Card */}
            {author && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Submitted By</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/profile/${author.username}`}>
                    <div className="flex items-center gap-3 hover-elevate p-2 rounded-lg -m-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={author.avatar || ""} />
                        <AvatarFallback>{author.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">{author.name}</span>
                          {author.isVerified && <VerificationBadge type="architect" size="sm" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">@{author.username}</p>
                        {author.university && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{author.university}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {research.pdfUrl && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Full Paper</p>
                      <p className="text-xs text-muted-foreground">PDF available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="w-full" asChild>
                      <a href={research.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={research.pdfUrl} download>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const { data: commentAuthor } = useQuery<UserType>({
    queryKey: ["/api/users", comment.authorId],
    enabled: !!comment.authorId,
  });

  return (
    <div className="flex gap-3" data-testid={`comment-${comment.id}`}>
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={commentAuthor?.avatar || ""} />
        <AvatarFallback>{commentAuthor?.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{commentAuthor?.name || "User"}</span>
            {commentAuthor?.isVerified && <VerificationBadge type="architect" size="sm" />}
            <span className="text-xs text-muted-foreground">
              {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
