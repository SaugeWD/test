import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Building2,
  Trophy,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Rss,
  TrendingUp,
  Users,
  UserPlus,
  X,
  ChevronDown,
  Link2,
  Loader2,
} from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, User, Comment as DbComment } from "@shared/schema";

interface Author {
  name: string;
  title: string;
  avatar: string;
  username: string;
  isVerified: boolean;
  verificationType?: "architect" | "educator" | "firm";
}

interface CommentDisplay {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface FeedPost {
  id: string;
  type: "text" | "project" | "competition";
  author: Author;
  content: string;
  title?: string;
  images?: string[];
  competitionLink?: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags: string[];
  postComments: CommentDisplay[];
}

function CreatePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] = useState<"text" | "project" | "competition">("text");
  const [content, setContent] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [competitionLink, setCompetitionLink] = useState("");
  const [tags, setTags] = useState("");
  const { user } = useAuth();

  const createPostMutation = useMutation({
    mutationFn: async (data: {
      type: "text" | "project" | "competition";
      content: string;
      title?: string;
      tags?: string[];
    }) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsOpen(false);
      setContent("");
      setProjectTitle("");
      setCompetitionLink("");
      setTags("");
      setPostType("text");
    },
  });

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await createPostMutation.mutateAsync({
      type: postType,
      content,
      title: postType === "project" ? projectTitle : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover-elevate" data-testid="card-create-post">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center h-12 rounded-full bg-secondary/50 px-4 text-muted-foreground">
                  What's on your mind?
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="button-post-type-text">
                    <FileText className="h-4 w-4" />
                    Text
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="button-post-type-project">
                    <Building2 className="h-4 w-4" />
                    Project
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2" data-testid="button-post-type-competition">
                    <Trophy className="h-4 w-4" />
                    Competition
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-create-post">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Post Type</Label>
            <div className="flex gap-2">
              <Button
                variant={postType === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("text")}
                data-testid="dialog-button-type-text"
              >
                <FileText className="mr-2 h-4 w-4" />
                Text
              </Button>
              <Button
                variant={postType === "project" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("project")}
                data-testid="dialog-button-type-project"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Project
              </Button>
              <Button
                variant={postType === "competition" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("competition")}
                data-testid="dialog-button-type-competition"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Competition
              </Button>
            </div>
          </div>

          {postType === "project" && (
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                placeholder="Enter project title..."
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                data-testid="input-project-title"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, projects, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              data-testid="textarea-post-content"
            />
          </div>

          {postType === "project" && (
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                data-testid="input-upload-images"
              />
            </div>
          )}

          {postType === "competition" && (
            <div className="space-y-2">
              <Label htmlFor="competition-link">Competition Link</Label>
              <Input
                id="competition-link"
                type="url"
                placeholder="https://..."
                value={competitionLink}
                onChange={(e) => setCompetitionLink(e.target.value)}
                data-testid="input-competition-link"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="Sustainable, Modern, Amman..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              data-testid="input-tags"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              data-testid="button-cancel-post"
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-testid="button-publish-post"
              disabled={createPostMutation.isPending || !content.trim()}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  const { data: likeData } = useQuery<{ count: number }>({
    queryKey: [`/api/likes/post/${post.id}`],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: [`/api/users/${user?.id}/likes`],
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const { data: commentsData = [] } = useQuery<Array<DbComment & { user?: User }>>({
    queryKey: [`/api/comments/post/${post.id}`],
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "post" && like.targetId === post.id
  );

  const isSaved = savedItems.some(
    (item) => item.targetType === "post" && item.targetId === post.id
  );

  const likes = likeData?.count ?? post.likes;

  const localComments: CommentDisplay[] = commentsData.length > 0
    ? commentsData.map((comment) => ({
        id: comment.id,
        author: {
          name: comment.user?.name || "User",
          avatar: comment.user?.avatar || "/placeholder-user.jpg",
        },
        content: comment.content,
        timestamp: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "just now",
      }))
    : post.postComments;

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", { targetType: "post", targetId: post.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/likes/post/${post.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/likes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", { targetType: "post", targetId: post.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/comments", { targetType: "post", targetId: post.id, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments/post/${post.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) return;
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate();
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !isAuthenticated) return;
    commentMutation.mutate(newComment);
  };

  const displayedComments = showAllComments
    ? localComments
    : localComments.slice(0, 2);

  return (
    <Card data-testid={`card-post-${post.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <div className="flex gap-3 cursor-pointer">
              <Avatar className="h-12 w-12 hover:ring-2 hover:ring-accent transition-all">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold hover:text-accent transition-colors">
                    {post.author.name}
                  </span>
                  {post.author.isVerified && (
                    <VerificationBadge
                      type={post.author.verificationType}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{post.author.title}</p>
                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {post.type}
            </Badge>
            <Button variant="ghost" size="icon" data-testid={`button-more-${post.id}`}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && (
          <h3 className="font-semibold text-lg" data-testid={`text-title-${post.id}`}>
            {post.title}
          </h3>
        )}
        <p className="text-sm leading-relaxed" data-testid={`text-content-${post.id}`}>
          {post.content}
        </p>

        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
            data-testid={`images-container-${post.id}`}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg cursor-pointer ${
                  post.images!.length === 3 && index === 0 ? "col-span-2" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  data-testid={`image-${post.id}-${index}`}
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {post.competitionLink && (
          <Link href={post.competitionLink}>
            <Button variant="outline" className="gap-2" data-testid={`button-competition-link-${post.id}`}>
              <Link2 className="h-4 w-4" />
              View Competition Details
            </Button>
          </Link>
        )}

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" data-testid={`badge-tag-${post.id}-${tag}`}>
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-1.5 ${isLiked ? "text-accent" : ""}`}
            data-testid={`button-like-${post.id}`}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-1.5"
            data-testid={`button-comment-${post.id}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{localComments.length || post.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`gap-1.5 ${isSaved ? "text-accent" : ""}`}
            data-testid={`button-save-${post.id}`}
            disabled={saveMutation.isPending}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {showComments && (
          <div className="pt-4 border-t space-y-4" data-testid={`comments-section-${post.id}`}>
            {displayedComments.map((comment) => (
              <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}

            {localComments.length > 2 && !showAllComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="w-full"
                data-testid={`button-view-all-comments-${post.id}`}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                View all {localComments.length} comments
              </Button>
            )}

            {isAuthenticated && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    data-testid={`input-comment-${post.id}`}
                  />
                  <Button
                    size="sm"
                    disabled={!newComment.trim() || commentMutation.isPending}
                    onClick={handleSubmitComment}
                    data-testid={`button-submit-comment-${post.id}`}
                  >
                    {commentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {selectedImage !== null && post.images && (
        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={post.images[selectedImage]}
              alt={`Project image ${selectedImage + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function SuggestedPeopleCard() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();

  const { data: suggestedUsers = [], isLoading } = useQuery<Array<User & { password?: string }>>({
    queryKey: ["/api/users"],
  });

  const suggestedPeople = suggestedUsers.slice(0, 3).map((user) => ({
    id: user.id,
    name: user.name,
    title: user.title || "Member",
    avatar: user.avatar || "/placeholder-user.jpg",
    username: user.username,
    followers: "0",
    isVerified: user.isVerified || false,
    verificationType: user.verificationType as "architect" | "educator" | "firm" | undefined,
  }));

  const followMutation = useMutation({
    mutationFn: async (followingId: string) => {
      await apiRequest("POST", "/api/follow", { followingId });
    },
    onSuccess: (_, followingId) => {
      setFollowing((prev) => ({ ...prev, [followingId]: !prev[followingId] }));
    },
  });

  const toggleFollow = (id: string) => {
    if (!isAuthenticated) return;
    followMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Card data-testid="card-suggested-people">
        <CardHeader>
          <CardTitle className="text-lg">Suggested People</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (suggestedPeople.length === 0) {
    return (
      <Card data-testid="card-suggested-people">
        <CardHeader>
          <CardTitle className="text-lg">Suggested People</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No suggestions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-suggested-people">
      <CardHeader>
        <CardTitle className="text-lg">Suggested People</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedPeople.map((person) => (
          <div
            key={person.id}
            className="flex items-start gap-3"
            data-testid={`suggested-person-${person.id}`}
          >
            <Link href={`/profile/${person.username}`}>
              <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback>{person.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${person.username}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="font-semibold text-sm hover:text-accent transition-colors cursor-pointer truncate">
                    {person.name}
                  </h4>
                  {person.isVerified && (
                    <VerificationBadge type={person.verificationType} size="sm" />
                  )}
                </div>
              </Link>
              <p className="text-xs text-muted-foreground truncate">{person.title}</p>
              <p className="text-xs text-muted-foreground">{person.followers} followers</p>
            </div>
            <Button
              variant={following[person.id] ? "outline" : "default"}
              size="sm"
              onClick={() => toggleFollow(person.id)}
              disabled={followMutation.isPending}
              data-testid={`button-follow-${person.id}`}
            >
              {following[person.id] ? (
                "Following"
              ) : (
                <>
                  <UserPlus className="mr-1 h-3 w-3" />
                  Follow
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

async function transformPostToFeedPost(post: Post, userCache: Map<string, User>): Promise<FeedPost | null> {
  try {
    let author = userCache.get(post.authorId);
    
    if (!author && post.authorId) {
      try {
        const response = await fetch(`/api/users/${post.authorId}`, {
          credentials: "include",
        });
        if (response.ok) {
          author = await response.json();
          if (author) {
            userCache.set(post.authorId, author);
          }
        }
      } catch {
        console.error(`Failed to fetch author for post ${post.id}`);
      }
    }

    if (!author) {
      return null;
    }

    return {
      id: post.id,
      type: (post.type as "text" | "project" | "competition") || "text",
      author: {
        name: author.name,
        title: author.title || "Member",
        avatar: author.avatar || "/placeholder-user.jpg",
        username: author.username,
        isVerified: author.isVerified || false,
        verificationType: author.verificationType as "architect" | "educator" | "firm" | undefined,
      },
      content: post.content,
      title: post.title || undefined,
      images: post.image ? [post.image] : [],
      likes: 0,
      comments: 0,
      timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "just now",
      tags: post.tags || [],
      postComments: [],
    };
  } catch (error) {
    console.error("Error transforming post:", error);
    return null;
  }
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [userCache] = useState(() => new Map<string, User>());

  const { data: apiPosts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const [displayPosts, setDisplayPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      if (apiPosts.length > 0) {
        const transformed = await Promise.all(
          apiPosts.map((post) => transformPostToFeedPost(post, userCache))
        );
        setDisplayPosts(transformed.filter((p): p is FeedPost => p !== null));
      } else {
        setDisplayPosts([]);
      }
    };
    loadPosts();
  }, [apiPosts, userCache]);

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h1 className="font-serif text-3xl font-bold" data-testid="text-page-title">
              Your Feed
            </h1>
            <p className="mt-2 text-muted-foreground">
              Stay updated with the architectural community
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <CreatePostDialog />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3" data-testid="tabs-feed">
                  <TabsTrigger value="all" className="gap-2" data-testid="tab-all-posts">
                    <Rss className="h-4 w-4" />
                    All Posts
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="gap-2" data-testid="tab-trending">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="following" className="gap-2" data-testid="tab-following">
                    <Users className="h-4 w-4" />
                    Following
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex items-center justify-center py-12" data-testid="loading-posts">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : displayPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6" data-testid="feed-posts-container">
                  {displayPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <SuggestedPeopleCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
