import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Loader2, Send, Trash2, Pencil, Flag, MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommentWithUser {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  user: { id: string; name: string; username: string; avatar?: string };
  likesCount: number;
  replies?: CommentWithUser[];
}

interface CommentsDialogProps {
  contentType: string;
  contentId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommentFormValues {
  content: string;
}

const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Inappropriate content",
  "Misinformation",
  "Other",
];

function CommentItem({
  comment,
  contentType,
  contentId,
  isReply = false,
  onReply,
}: {
  comment: CommentWithUser;
  contentType: string;
  contentId: string;
  isReply?: boolean;
  onReply: (parentId: string) => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwner = user?.id === comment.userId;

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", user?.id, "likes"],
    enabled: isAuthenticated && !!user?.id,
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "comment" && like.targetId === comment.id
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: "comment",
        targetId: comment.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", contentType, contentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "likes"] });
    },
    onError: () => {
      toast({
        description: "Failed to like comment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/comments/${comment.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", contentType, contentId] });
      toast({
        description: "Comment deleted",
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (newContent: string) => {
      const res = await apiRequest("PATCH", `/api/comments/${comment.id}`, {
        content: newContent,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", contentType, contentId] });
      setIsEditing(false);
      toast({
        description: "Comment updated",
      });
    },
    onError: () => {
      toast({
        description: "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("POST", "/api/reports", {
        targetType: "comment",
        targetId: comment.id,
        reason,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowReportDialog(false);
      toast({
        description: "Comment reported",
      });
    },
    onError: () => {
      toast({
        description: "Failed to report comment",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        description: "Please log in to like comments",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    editMutation.mutate(editContent.trim());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleReport = (reason: string) => {
    reportMutation.mutate(reason);
  };

  const initials = comment.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn("flex gap-3", isReply && "ml-10 mt-3")}
      data-testid={`comment-item-${comment.id}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-medium text-sm"
            data-testid={`comment-user-name-${comment.id}`}
          >
            {comment.user.name}
          </span>
          <span
            className="text-muted-foreground text-xs"
            data-testid={`comment-user-username-${comment.id}`}
          >
            @{comment.user.username}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  data-testid={`button-comment-menu-${comment.id}`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      data-testid={`button-edit-comment-${comment.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwner && (
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    data-testid={`button-report-comment-${comment.id}`}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] resize-none"
              data-testid={`input-edit-comment-${comment.id}`}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={editMutation.isPending || !editContent.trim()}
                data-testid={`button-save-edit-${comment.id}`}
              >
                {editMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={editMutation.isPending}
                data-testid={`button-cancel-edit-${comment.id}`}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm mt-1 break-words"
            data-testid={`comment-content-${comment.id}`}
          >
            {comment.content}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              "h-7 px-2 gap-1",
              isLiked && "text-accent"
            )}
            data-testid={`button-like-comment-${comment.id}`}
          >
            {likeMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Heart
                className={cn("h-3.5 w-3.5", isLiked && "fill-current")}
              />
            )}
            <span className="text-xs" data-testid={`comment-likes-count-${comment.id}`}>
              {comment.likesCount}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            className="h-7 px-2 gap-1"
            data-testid={`button-reply-comment-${comment.id}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs">Reply</span>
          </Button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                contentType={contentType}
                contentId={contentId}
                isReply
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Select a reason for reporting this comment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleReport(reason)}
                disabled={reportMutation.isPending}
                data-testid={`button-report-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {reportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CommentsDialog({
  contentType,
  contentId,
  isOpen,
  onOpenChange,
}: CommentsDialogProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const form = useForm<CommentFormValues>({
    defaultValues: {
      content: "",
    },
  });

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/comments", contentType, contentId],
    enabled: isOpen,
  });

  const parentComments = comments.filter((c) => !c.parentId);
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as Record<string, CommentWithUser[]>);

  const addRepliesToComments = (commentList: CommentWithUser[]): CommentWithUser[] => {
    return commentList.map((comment) => ({
      ...comment,
      replies: addRepliesToComments(repliesMap[comment.id] || []),
    }));
  };

  const commentsWithReplies = addRepliesToComments(parentComments);

  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      const res = await apiRequest("POST", "/api/comments", {
        targetType: contentType,
        targetId: contentId,
        content: data.content,
        parentId: data.parentId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", contentType, contentId] });
      form.reset();
      setReplyingTo(null);
      toast({
        description: "Comment posted successfully",
      });
    },
    onError: () => {
      toast({
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormValues) => {
    if (!isAuthenticated) {
      toast({
        description: "Please log in to comment",
      });
      return;
    }
    if (!data.content.trim()) return;
    addCommentMutation.mutate({
      content: data.content,
      parentId: replyingTo || undefined,
    });
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    form.reset();
  };

  const replyingToComment = replyingTo
    ? comments.find((c) => c.id === replyingTo)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        data-testid="comments-dialog"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle data-testid="comments-dialog-title">
            Comments
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : commentsWithReplies.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-testid="comments-empty"
              >
                No comments yet. Be the first to comment!
              </div>
            ) : (
              commentsWithReplies.map((comment) => (
                <div key={comment.id}>
                  <CommentItem
                    comment={comment}
                    contentType={contentType}
                    contentId={contentId}
                    onReply={handleReply}
                  />
                  <Separator className="mt-4" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {replyingToComment && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Replying to{" "}
                <span className="font-medium text-foreground">
                  @{replyingToComment.user.username}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReply}
                className="h-6 px-2 text-xs"
                data-testid="button-cancel-reply"
              >
                Cancel
              </Button>
            </div>
          )}
          {isAuthenticated ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex gap-2"
                data-testid="comment-form"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder={
                            replyingTo ? "Write a reply..." : "Write a comment..."
                          }
                          className="min-h-[60px] resize-none"
                          data-testid="input-comment"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={addCommentMutation.isPending || !form.watch("content").trim()}
                  data-testid="button-submit-comment"
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div
              className="text-center text-sm text-muted-foreground"
              data-testid="comments-login-prompt"
            >
              Please log in to comment
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
