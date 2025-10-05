import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const CHANNELS = ["All", "Sightings", "Theories", "Evidence", "Experiences", "Ancient Wisdom", "Technology", "General"];

const Feed = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedChannel]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(data);
  };

  const loadPosts = async () => {
    let query = supabase
      .from("posts")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    if (selectedChannel !== "All") {
      query = query.eq("channel", selectedChannel);
    }

    const { data } = await query;
    setPosts(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user} 
        profile={profile}
        onCreatePost={() => user ? setCreateDialogOpen(true) : navigate("/auth")}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            The Collective Feed
          </h1>
          <p className="text-muted-foreground">
            Voices echoing across the cosmos, united in wonder
          </p>
        </div>

        <Tabs value={selectedChannel} onValueChange={setSelectedChannel} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 flex-wrap h-auto">
            {CHANNELS.map((channel) => (
              <TabsTrigger key={channel} value={channel} className="whitespace-nowrap">
                {channel}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No transmissions in this channel yet. Be the first to share.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                profile={profile}
                onVote={loadPosts}
              />
            ))
          )}
        </div>
      </main>

      {profile && (
        <CreatePostDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          profile={profile}
          onPostCreated={loadPosts}
        />
      )}
    </div>
  );
};

export default Feed;
