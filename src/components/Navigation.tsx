import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  user: any;
  profile: any;
  onCreatePost?: () => void;
}

const Navigation = ({ user, profile, onCreatePost }: NavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
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
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-primary cosmic-glow" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            31 Atlas
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {onCreatePost && (
                <Button 
                  onClick={onCreatePost}
                  className="bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className={getLevelColor(profile?.level || "seeker")}>
                      {profile?.display_name || "Seeker"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Join the Atlas
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
