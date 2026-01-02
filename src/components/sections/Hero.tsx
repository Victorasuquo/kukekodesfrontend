import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Code2, Terminal, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "100%", label: "Free Forever", icon: Zap },
  { value: "24/7", label: "AI Coach", icon: MessageSquare },
  { value: "50K+", label: "Learners", icon: Code2 },
];

const codeLines = [
  { indent: 0, text: 'def greet(name):', color: 'text-primary' },
  { indent: 1, text: '"""Say hello to a learner"""', color: 'text-muted-foreground' },
  { indent: 1, text: 'message = f"Hello, {name}!"', color: 'text-foreground' },
  { indent: 1, text: 'print(message)', color: 'text-foreground' },
  { indent: 1, text: 'return message', color: 'text-secondary' },
  { indent: 0, text: '', color: '' },
  { indent: 0, text: 'greet("Future Developer")', color: 'text-primary' },
];

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
        />
      </div>

      {/* Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] z-10"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                Join 50,000+ learners worldwide
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              Learn to Code
              <br />
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-primary via-[hsl(185,70%,50%)] to-secondary bg-clip-text text-transparent">
                  with AI by Your Side
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-primary/30 to-secondary/30 blur-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Free, world-class coding education for everyone. Start with Python,
              build real projects, and get instant help from your personal AI coach.
            </motion.p>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6 flex flex-wrap justify-center lg:justify-start gap-4 text-sm"
            >
              {["No credit card", "Learn at your pace", "Real projects"].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button variant="hero" size="xl" className="group min-w-[220px] shadow-lg shadow-primary/25" asChild>
                <Link to="/auth?tab=signup">
                  Start Learning for Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 ml-2" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" className="group min-w-[160px]" asChild>
                <Link to="/courses">
                  <Play className="w-5 h-5 fill-current mr-2" />
                  View Courses
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center lg:text-left p-3 rounded-xl bg-card/30 border border-border/30"
                  whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary) / 0.5)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="w-5 h-5 text-primary mb-2 mx-auto lg:mx-0" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Code Editor Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl scale-110" />

            {/* Code Editor */}
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Editor Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">hello_world.py</span>
                </div>
                <Terminal className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm">
                {codeLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <span className="w-6 text-right text-muted-foreground/50 text-xs">{i + 1}</span>
                    <span className={`${line.color}`} style={{ paddingLeft: `${line.indent * 24}px` }}>
                      {line.text || '\u00A0'}
                    </span>
                  </motion.div>
                ))}

                {/* Output */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="mt-6 pt-4 border-t border-border/50"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Terminal className="w-3 h-3" />
                    <span>Output</span>
                  </div>
                  <motion.div
                    className="text-green-500 dark:text-green-400"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    &gt; Hello, Future Developer! 🚀
                  </motion.div>
                </motion.div>
              </div>

              {/* AI Assistant Tooltip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                className="absolute -bottom-4 -right-4 bg-card border border-primary/30 rounded-xl p-4 shadow-xl max-w-[200px]"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">AI Coach</p>
                    <p className="text-xs text-muted-foreground mt-1">Great job! Try adding a loop next 💡</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-card border border-border/50 rounded-xl p-3 shadow-lg"
            >
              <Code2 className="w-6 h-6 text-primary" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-3 shadow-lg"
            >
              <Zap className="w-6 h-6 text-secondary" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-primary/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
