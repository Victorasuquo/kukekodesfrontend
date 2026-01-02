import { motion } from "framer-motion";
import { 
  Bot, 
  Code, 
  Users, 
  Trophy, 
  TrendingUp,
  Globe,
  Zap,
  Shield
} from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const features = [
  {
    icon: Bot,
    title: "AI Coach 24/7",
    description: "Your personal AI tutor that explains concepts, debugs your code, and guides you through challenges at any hour.",
    color: "primary",
    stat: "1M+ questions answered"
  },
  {
    icon: Code,
    title: "Hands-on Coding",
    description: "Write and run code directly in your browser with our built-in sandbox. No setup required, just start coding.",
    color: "secondary",
    stat: "25K+ projects built"
  },
  {
    icon: Users,
    title: "Global Community",
    description: "Join thousands of learners worldwide. Share projects, ask questions, and grow together as developers.",
    color: "accent",
    stat: "120+ countries"
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Earn XP, unlock badges, maintain streaks, and climb leaderboards as you master new skills.",
    color: "primary",
    stat: "500K+ badges earned"
  },
  {
    icon: TrendingUp,
    title: "Career Paths",
    description: "Follow structured learning paths from beginner to job-ready developer, AI engineer, or data scientist.",
    color: "secondary",
    stat: "5 career tracks"
  },
  {
    icon: Globe,
    title: "100% Free Access",
    description: "No hidden fees, no premium walls. Quality education accessible to everyone, everywhere in the world.",
    color: "accent",
    stat: "Forever free"
  }
];

export function Features() {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return { bg: "bg-primary/10", text: "text-primary", hover: "group-hover:bg-primary group-hover:text-primary-foreground" };
      case "secondary":
        return { bg: "bg-secondary/10", text: "text-secondary", hover: "group-hover:bg-secondary group-hover:text-secondary-foreground" };
      case "accent":
        return { bg: "bg-accent/10", text: "text-accent", hover: "group-hover:bg-accent group-hover:text-accent-foreground" };
      default:
        return { bg: "bg-primary/10", text: "text-primary", hover: "group-hover:bg-primary group-hover:text-primary-foreground" };
    }
  };

  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Why Kukecodes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for learners who want more than just videos. Get real practice, 
            real support, and real results.
          </p>
        </ScrollReveal>

        {/* Features Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feature) => {
            const colors = getColorClasses(feature.color);
            return (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl ${colors.bg} ${colors.text} ${colors.hover} transition-all duration-300 mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {feature.stat}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom Highlight */}
        <ScrollReveal delay={0.3} className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground">Start learning in <span className="text-foreground font-medium">under 2 minutes</span></span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-border" />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground">No credit card <span className="text-foreground font-medium">ever required</span></span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
