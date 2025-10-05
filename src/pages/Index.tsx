import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Shield, TrendingUp } from "lucide-react";
import cosmicHero from "@/assets/cosmic-hero.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/feed");
      }
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/feed");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${cosmicHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <Sparkles className="h-24 w-24 text-primary cosmic-glow float-animation" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            31 Atlas
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A sanctuary for seekers. A community for believers. A home for those who know we are not alone.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8"
            >
              Join the Atlas
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/feed")}
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8"
            >
              Explore Feed
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why Join 31 Atlas?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all">
              <Users className="h-12 w-12 text-primary mx-auto cosmic-glow" />
              <h3 className="text-xl font-semibold">Safe Community</h3>
              <p className="text-muted-foreground">
                Connect with like-minded seekers in a judgment-free space. Share experiences, theories, and evidence.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all">
              <Shield className="h-12 w-12 text-secondary mx-auto cosmic-glow" />
              <h3 className="text-xl font-semibold">Anonymous Options</h3>
              <p className="text-muted-foreground">
                Post and comment anonymously when you need privacy. Your identity, your choice.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all">
              <TrendingUp className="h-12 w-12 text-accent mx-auto cosmic-glow" />
              <h3 className="text-xl font-semibold">Level Up</h3>
              <p className="text-muted-foreground">
                Progress from Seeker to Oracle. Earn cosmic points through contributions and engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            You Are Not Alone
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of seekers sharing their truth across the cosmos. Your journey begins here.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary via-secondary to-accent text-background hover:opacity-90 text-lg px-12"
          >
            Begin Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
