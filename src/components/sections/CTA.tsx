import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

const benefits = [
  "Access all courses for free",
  "24/7 AI coding assistant",
  "Hands-on projects & sandbox",
  "Global community support"
];

export function CTA() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Navigate to auth page with email
    setTimeout(() => {
      navigate(`/auth?tab=signup&email=${encodeURIComponent(email)}`);
    }, 500);
  };

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal variant="scale" className="max-w-4xl mx-auto">
          {/* Card Container */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-8 lg:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Start Your Coding Journey Today
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Ready to Build Your
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Future in Tech?
              </span>
            </h2>

            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners who are already building real projects
              and launching careers in tech.
            </p>

            {/* Benefits */}
            <StaggerContainer className="mt-8 flex flex-wrap justify-center gap-4" staggerDelay={0.1}>
              {benefits.map((benefit) => (
                <StaggerItem
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {benefit}
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Email Signup Form */}
            <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-card rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors"
                  required
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="group whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Joining..."
                  ) : (
                    <>
                      Get Started Free
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                No credit card required • Free forever • Cancel anytime
              </p>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">50K+</span>
              <span className="text-sm">Learners</span>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">4.9</span>
              <span className="text-sm">★ Rating</span>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">120+</span>
              <span className="text-sm">Countries</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
