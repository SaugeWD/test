import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
}

export function CommentSection({ postId, comments: initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = () => {
    if (!newComment.trim() || !isAuthenticated) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: user?.name || "Anonymous",
        avatar: user?.avatar || "/placeholder-user.jpg",
      },
      content: newComment,
      timestamp: "Just now",
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      {isAuthenticated && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none"
              data-testid={`textarea-comment-${postId}`}
            />
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()} data-testid={`button-submit-comment-${postId}`}>
              Comment
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
