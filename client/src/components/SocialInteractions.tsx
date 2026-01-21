import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { CommentsDialog } from "./CommentsDialog";

interface SocialInteractionsProps {
  contentId: string;
  contentType?: string;
  initialLikes?: number;
  initialComments?: number;
  initialIsLiked?: boolean;
  initialIsSaved?: boolean;
  onComment?: () => void;
  className?: string;
  shareUrl?: string;
}

export function SocialInteractions({
  contentId,
  contentType = "post",
  initialLikes = 0,
  initialComments = 0,
  initialIsLiked = false,
  initialIsSaved = false,
  onComment,
  className,
  shareUrl,
}: SocialInteractionsProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const { data: likesData } = useQuery<{ count: number }>({
    queryKey: ["/api/likes", contentType, contentId],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", user?.id, "likes"],
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const { data: commentsData } = useQuery<Array<unknown>>({
    queryKey: ["/api/comments", contentType, contentId],
  });

  const likes = likesData?.count ?? initialLikes;
  const commentsCount = commentsData?.length ?? initialComments;

  const isLiked = userLikes.some(
    (like) => like.targetType === contentType && like.targetId === contentId
  ) || initialIsLiked;

  const isSaved = savedItems.some(
    (item) => item.targetType === contentType && item.targetId === contentId
  ) || initialIsSaved;

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: contentType,
        targetId: contentId,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all related queries for cross-page sync
      queryClient.invalidateQueries({ queryKey: ["/api/likes", contentType, contentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "likes"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/likes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (!isLiked) {
        toast({
          description: "Added to your liked content",
        });
      }
    },
    onError: () => {
      toast({
        description: "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", {
        targetType: contentType,
        targetId: contentId,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all related queries for cross-page sync
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        description: isSaved ? "Removed from saved items" : "Saved to your library",
      });
    },
    onError: () => {
      toast({
        description: "Failed to update saved items",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        description: "Please log in to like content",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        description: "Please log in to save content",
      });
      return;
    }
    saveMutation.mutate();
  };

  const handleShare = () => {
    const urlToShare = shareUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Check this out on ArchNet",
        url: urlToShare,
      });
    } else {
      navigator.clipboard.writeText(urlToShare);
      toast({
        description: "Link copied to clipboard",
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={cn(
          "gap-1.5 transition-all duration-200 hover:scale-105",
          isLiked && "text-accent hover:text-accent"
        )}
        data-testid={`button-like-${contentId}`}
      >
        {likeMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4 transition-all", isLiked && "fill-current scale-110")} />
        )}
        <span className="text-sm">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className={cn(
          "gap-1.5 transition-all duration-200 hover:scale-105",
          isSaved && "text-accent hover:text-accent"
        )}
        data-testid={`button-save-${contentId}`}
      >
        {saveMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className={cn("h-4 w-4 transition-all", isSaved && "fill-current scale-110")} />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsCommentsOpen(true);
          onComment?.();
        }}
        className="gap-1.5 transition-all duration-200 hover:scale-105"
        data-testid={`button-comment-${contentId}`}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-1.5 transition-all duration-200 hover:scale-105"
        data-testid={`button-share-${contentId}`}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <CommentsDialog
        contentType={contentType}
        contentId={contentId}
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
      />
    </div>
  );
}
