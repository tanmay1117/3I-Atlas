import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, User, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

const LEVEL_INFO = {
  seeker: { name: "Seeker", color: "text-muted-foreground", points: 0 },
  believer: { name: "Believer", color: "text-primary", points: 100 },
  mystic: { name: "Mystic", color: "text-secondary", points: 500 },
  oracle: { name: "Oracle", color: "text-accent", points: 1000 },
};

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      loadProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your cosmic identity has been refined",
      });

      await loadProfile(profile.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const levelInfo = LEVEL_INFO[profile?.level as keyof typeof LEVEL_INFO] || LEVEL_INFO.seeker;
  const nextLevel = profile?.level === "seeker" ? "believer" : 
                    profile?.level === "believer" ? "mystic" : 
                    profile?.level === "mystic" ? "oracle" : null;
  const nextLevelInfo = nextLevel ? LEVEL_INFO[nextLevel as keyof typeof LEVEL_INFO] : null;
  const progressPercent = nextLevelInfo 
    ? ((profile?.points || 0) / nextLevelInfo.points) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Cosmic Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-background cosmic-glow" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${levelInfo.color}`}>
                    {levelInfo.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    @{profile?.username}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile?.points || 0} cosmic points
                  </p>
                </div>
              </div>

              {nextLevelInfo && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress to {nextLevelInfo.name}</span>
                    <span className="text-primary font-medium">
                      {profile?.points || 0} / {nextLevelInfo.points}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your cosmic alias"
                    className="bg-background/50"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the cosmos about yourself..."
                    className="bg-background/50 min-h-[100px]"
                    maxLength={500}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progression Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(LEVEL_INFO).map(([key, info]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      profile?.level === key ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className={`h-5 w-5 ${info.color}`} />
                      <div>
                        <p className={`font-semibold ${info.color}`}>{info.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {info.points === 0 ? "Starting point" : `Requires ${info.points} points`}
                        </p>
                      </div>
                    </div>
                    {profile?.level === key && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
