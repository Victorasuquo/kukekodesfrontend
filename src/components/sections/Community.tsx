import { motion, useInView } from "framer-motion";
import { Users, MessageSquare, Heart, Award, Globe2, Quote } from "lucide-react";
import { useRef, useState } from "react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const testimonials = [
  {
    name: "Amara Okonkwo",
    role: "Junior Developer",
    location: "Lagos, Nigeria",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
    content: "Kukecodes changed my life. I went from zero coding knowledge to landing my first developer job in 8 months. The AI coach helped me through every obstacle when I couldn't afford a bootcamp.",
    gradient: "from-primary to-[hsl(195,80%,50%)]"
  },
  {
    name: "Carlos Martinez",
    role: "Data Analyst",
    location: "São Paulo, Brazil",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "The community here is incredible. Whenever I got stuck on a pandas problem, someone was always there to help. It feels like having a study group from around the world, available 24/7.",
    gradient: "from-secondary to-[hsl(35,90%,55%)]"
  },
  {
    name: "Priya Sharma",
    role: "ML Engineer",
    location: "Bangalore, India",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    content: "Finally, a free platform that actually teaches you to code properly. The projects are practical, and the AI explanations are crystal clear. I've recommended it to everyone at my college.",
    gradient: "from-accent to-[hsl(60,90%,50%)]"
  }
];

const stats = [
  { icon: Users, value: 50000, suffix: "+", label: "Active Learners" },
  { icon: Globe2, value: 120, suffix: "+", label: "Countries" },
  { icon: MessageSquare, value: 1, suffix: "M+", label: "Questions Answered" },
  { icon: Award, value: 25000, suffix: "+", label: "Projects Completed" }
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useState(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  });

  return (
    <span ref={ref}>
      {isInView ? count.toLocaleString() : "0"}{suffix}
    </span>
  );
}

export function Community() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
            Learn alongside thousands of aspiring developers from around the world. 
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
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Testimonials */}
        <StaggerContainer className="grid lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.name}>
              <motion.div
                whileHover={{ y: -5 }}
                className="relative group h-full"
              >
                <div className="bg-card rounded-2xl p-6 border border-border h-full hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />

                  {/* Quote */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <Heart className="w-5 h-5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* World Map Visualization (Simplified) */}
        <ScrollReveal delay={0.3} className="mt-20 text-center">
          <p className="text-muted-foreground mb-8">
            Learners from <span className="text-primary font-semibold">120+ countries</span> are building their future with Kukecodes
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
