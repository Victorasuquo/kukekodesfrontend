import { motion } from "framer-motion";
import { Users, MessageSquare, Heart, Award } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const communityCards = [
  {
    title: "Course Discussions",
    description: "Ask questions inside the course context so help stays focused and searchable.",
    icon: MessageSquare,
    gradient: "from-primary to-[hsl(195,80%,50%)]"
  },
  {
    title: "Moderated Support",
    description: "Reports, soft deletion, and admin review keep learner spaces safer at launch.",
    icon: Users,
    gradient: "from-secondary to-[hsl(35,90%,55%)]"
  },
  {
    title: "Achievement Sharing",
    description: "Learners can celebrate course progress without exposing private profile details.",
    icon: Award,
    gradient: "from-accent to-[hsl(60,90%,50%)]"
  }
];

const stats = [
  { icon: Users, value: "Organization", label: "Channels" },
  { icon: MessageSquare, value: "Course", label: "Threads" },
  { icon: Heart, value: "Report", label: "Tools" },
  { icon: Award, value: "Moderation", label: "Queue" }
];

export function Community() {
  return (
    <section id="community" className="py-24 lg:py-32 relative bg-muted/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Community
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
            Join a Global
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Community</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Learn alongside aspiring developers from around the world.
            Share your journey, get help, and celebrate wins together.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20" staggerDelay={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div 
                className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-colors group h-full"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Community capabilities */}
        <StaggerContainer className="grid lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {communityCards.map((item) => (
            <StaggerItem key={item.title}>
              <motion.div
                whileHover={{ y: -5 }}
                className="relative group h-full"
              >
                <div className="bg-card rounded-2xl p-6 border border-border h-full hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold text-foreground mb-3">{item.title}</h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* World Map Visualization (Simplified) */}
        <ScrollReveal delay={0.3} className="mt-20 text-center">
          <p className="text-muted-foreground mb-8">
            KukeKodes is built for low-bandwidth learners and organization-led communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {["🇳🇬", "🇧🇷", "🇮🇳", "🇰🇪", "🇵🇭", "🇮🇩", "🇲🇽", "🇿🇦", "🇵🇰", "🇧🇩", "🇪🇬", "🇻🇳"].map((flag, i) => (
              <motion.span 
                key={i}
                className="text-3xl"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                {flag}
              </motion.span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
