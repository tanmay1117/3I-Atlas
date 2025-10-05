import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, MessageCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: any;
  profile: any;
  onVote?: () => void;
}

const PostCard = ({ post, profile, onVote }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVote = async (voteType: number) => {
    if (!profile) {
      toast({
        title: "Sign in required",
        description: "You must be signed in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", profile.id)
        .eq("post_id", post.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase.from("votes").delete().eq("id", existingVote.id);
          
          const field = voteType === 1 ? "upvotes" : "downvotes";
          await supabase
            .from("posts")
            .update({ [field]: Math.max(0, post[field] - 1) })
            .eq("id", post.id);
        } else {
          // Change vote
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("id", existingVote.id);
          
          const addField = voteType === 1 ? "upvotes" : "downvotes";
          const removeField = voteType === 1 ? "downvotes" : "upvotes";
          
          await supabase
            .from("posts")
            .update({ 
              [addField]: post[addField] + 1,
              [removeField]: Math.max(0, post[removeField] - 1)
            })
            .eq("id", post.id);
        }
      } else {
        // New vote
        await supabase.from("votes").insert({
          user_id: profile.id,
          post_id: post.id,
          vote_type: voteType,
        });
        
        const field = voteType === 1 ? "upvotes" : "downvotes";
        await supabase
          .from("posts")
          .update({ [field]: post[field] + 1 })
          .eq("id", post.id);
      }

      onVote?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });
    
    setComments(data || []);
  };

  const handleComment = async () => {
    if (!profile || !newComment.trim()) return;

    setLoading(true);
    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: profile.id,
        content: newComment,
        anonymous: false,
      });

      setNewComment("");
      await loadComments();
      
      toast({
        title: "Comment added",
        description: "Your voice echoes through the cosmos",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "oracle": return "text-accent";
      case "mystic": return "text-secondary";
      case "believer": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${getLevelColor(post.profiles?.level || "seeker")}`}>
              {post.anonymous ? "Anonymous Seeker" : post.profiles?.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
            {post.channel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleVote(1)}
              className="hover:text-primary"
            >
              <ArrowUp className="h-4 w-4" />
              <span>{post.upvotes}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleVote(-1)}
              className="hover:text-destructive"
            >
              <ArrowDown className="h-4 w-4" />
              <span>{post.downvotes}</span>
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleComments}
            className="hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Comments
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t border-border">
            {profile && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-background/50 min-h-[80px]"
                />
                <Button
                  onClick={handleComment}
                  disabled={loading || !newComment.trim()}
                  className="bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Post
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className={`text-sm font-medium ${getLevelColor(comment.profiles?.level || "seeker")}`}>
                      {comment.anonymous ? "Anonymous" : comment.profiles?.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
