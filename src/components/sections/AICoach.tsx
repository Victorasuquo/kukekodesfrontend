import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Lightbulb, Bug, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Landing page demo component - functional demo or static info
export function AICoach() {
  // Keeping this as a presentational section for the landing page
  // The actual functional AI Tutor is in the CourseViewer
  const features = [
    {
      icon: MessageCircle,
      title: "Conversational Learning",
      description: "Ask questions naturally and get clear, step-by-step explanations"
    },
    {
      icon: Bug,
      title: "Instant Debugging",
      description: "Paste your code and get help identifying and fixing errors"
    },
    {
      icon: Lightbulb,
      title: "Personalized Hints",
      description: "Get guided hints that help you learn, not just answers"
    }
  ];

  return (
    <section id="ai-coach" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal variant="slideLeft">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              AI-Powered Learning
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mt-2">
              Your Personal
              <span className="bg-gradient-to-r from-primary to-[hsl(195,80%,50%)] bg-clip-text text-transparent"> AI Tutor</span>
              <br />
              Always Available
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Never feel stuck again. Our AI coach understands your code,
              explains concepts at your level, and guides you through
              challenges — without giving away the answers.
            </p>

            <StaggerContainer className="mt-10 space-y-6" staggerDelay={0.1}>
              {features.map((feature) => (
                <StaggerItem key={feature.title} className="flex items-start gap-4 group">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

          {/* Static Visual Representation for Landing Page */}
          <ScrollReveal variant="slideRight" delay={0.2} className="relative">
            <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-primary/5 p-8 text-center text-muted-foreground">
              <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground">Try it in the Course Viewer!</h3>
              <p className="mt-2">Sign in and start a course to interact with the live AI Tutor.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// Function component to be used in CourseViewer
export function AITutor({ lessonId }: { lessonId: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askAI(userMsg, lessonId);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to get response from AI", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-border rounded-lg bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Ask a question about this lesson!</p>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input
          className="flex-1 bg-background border border-input rounded-md px-3 text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI Tutor..."
          disabled={loading}
        />
        <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
