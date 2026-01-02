import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <h1 className="relative text-9xl font-bold bg-gradient-to-r from-primary via-[hsl(185,70%,50%)] to-secondary bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button variant="hero" size="lg" asChild>
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            Return Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
