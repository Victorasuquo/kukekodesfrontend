import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import {
    Target,
    Heart,
    Globe,
    Users,
    Lightbulb,
    Code,
    Bot,
    GraduationCap,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Rocket,
    BookOpen,
    MessageSquare,
    Zap,
    Play,
    Sparkles
} from "lucide-react";
import { useRef } from "react";

// Stats data
const impactStats = [
    { value: "50K+", label: "Active Learners", icon: Users },
    { value: "120+", label: "Countries", icon: Globe },
    { value: "85%", label: "Completion Rate", icon: TrendingUp },
    { value: "4.9★", label: "Rating", icon: Sparkles },
];

// Problem points
const problemPoints = [
    {
        stat: "60%",
        title: "Lack Digital Skills",
        description: "Most youth and adults globally don't meet minimum digital skill levels for modern jobs",
    },
    {
        stat: "3-15%",
        title: "MOOC Completion",
        description: "Traditional online courses have extremely low completion rates",
    },
    {
        stat: "Billions",
        title: "Left Behind",
        description: "Remain consumers, not creators, in the digital economy",
    },
];

// Core values
const coreValues = [
    {
        icon: Heart,
        title: "Free Forever",
        description: "Quality education without paywalls",
        color: "from-rose-500 to-pink-500",
    },
    {
        icon: Globe,
        title: "Globally Inclusive",
        description: "Built for emerging markets",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: Bot,
        title: "AI-Powered",
        description: "Personal tutor for everyone",
        color: "from-violet-500 to-purple-500",
    },
    {
        icon: Code,
        title: "Learn by Doing",
        description: "Real projects, real skills",
        color: "from-emerald-500 to-teal-500",
    },
    {
        icon: Users,
        title: "Community-Driven",
        description: "Grow together, never alone",
        color: "from-orange-500 to-amber-500",
    },
    {
        icon: Rocket,
        title: "Impact-Focused",
        description: "Jobs, projects, real outcomes",
        color: "from-primary to-secondary",
    },
];

// What makes us different
const differentiators = [
    {
        icon: Bot,
        title: "24/7 AI Coach",
        description: "Context-aware tutor that knows your lesson and code",
    },
    {
        icon: Code,
        title: "Browser Coding",
        description: "Write Python instantly—no downloads needed",
    },
    {
        icon: Target,
        title: "Adaptive Paths",
        description: "Personalized learning based on your goals",
    },
    {
        icon: MessageSquare,
        title: "Global Community",
        description: "Forums, peer reviews, and support",
    },
];

// Blob SVG component
function BlobShape({ className, variant = 1 }: { className?: string; variant?: number }) {
    const paths = [
        "M44.5,-76.3C56.9,-69.5,65.7,-55.8,72.3,-41.3C78.9,-26.8,83.3,-11.5,82.3,3.2C81.3,18,74.9,32.2,65.5,43.8C56.1,55.4,43.6,64.4,29.8,70.8C16,77.2,0.9,81,-14.8,80.6C-30.5,80.2,-46.8,75.7,-58.8,66.1C-70.8,56.5,-78.5,41.8,-81.8,26.3C-85.1,10.8,-84,-5.5,-79.1,-20.3C-74.2,-35.1,-65.5,-48.4,-53.5,-55.5C-41.5,-62.6,-26.2,-63.5,-11.4,-63.8C3.4,-64.1,18,-60.8,32.1,-68.4C46.2,-76,44.5,-76.3,44.5,-76.3Z",
        "M39.5,-67.4C50.9,-60.3,59.5,-48.5,66.8,-35.5C74.1,-22.5,80.1,-8.3,79.8,5.8C79.5,19.9,72.9,33.9,63.5,45.1C54.1,56.3,41.9,64.7,28.3,70.6C14.7,76.5,-0.3,79.9,-15.3,78.5C-30.3,77.1,-45.3,70.9,-56.7,60.6C-68.1,50.3,-75.9,35.9,-79.1,20.5C-82.3,5.1,-80.9,-11.3,-75.1,-25.9C-69.3,-40.5,-59.1,-53.3,-46.1,-60C-33.1,-66.7,-17.3,-67.3,-1.3,-65.2C14.7,-63.1,29.4,-58.3,39.5,-67.4Z",
        "M45.3,-77.5C58.4,-69.8,68.4,-56.3,75.5,-41.6C82.6,-26.9,86.8,-11,85.1,4.1C83.4,19.2,75.8,33.5,65.7,45.3C55.6,57.1,43,66.4,28.9,72.3C14.8,78.2,-0.8,80.7,-16.3,78.8C-31.8,76.9,-47.2,70.6,-58.8,60.1C-70.4,49.6,-78.2,34.9,-81.5,19.2C-84.8,3.5,-83.6,-13.2,-77.6,-27.5C-71.6,-41.8,-60.8,-53.7,-47.8,-61.5C-34.8,-69.3,-19.6,-73,-2.9,-68.7C13.8,-64.4,32.2,-52.1,45.3,-77.5Z",
    ];

    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill="currentColor"
                d={paths[variant % paths.length]}
                transform="translate(100 100)"
            />
        </svg>
    );
}

// Image with blob mask component
function BlobImage({
    src,
    alt,
    className,
    placeholder,
    variant = 1
}: {
    src?: string;
    alt: string;
    className?: string;
    placeholder?: React.ReactNode;
    variant?: number;
}) {
    const clipPaths = [
        "polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 50%)",
        "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)",
        "ellipse(45% 48% at 50% 50%)",
        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    ];

    return (
        <div className={`relative ${className}`}>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl scale-110 opacity-50" />

            {/* Blob background */}
            <BlobShape
                className="absolute inset-0 w-full h-full text-primary/10"
                variant={variant}
            />

            {/* Image container with organic shape */}
            <div
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
                style={{
                    clipPath: clipPaths[variant % clipPaths.length],
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section - Who We Are */}
                <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1/2 -right-1/2 w-full h-full"
                        >
                            <BlobShape className="w-full h-full text-primary/10" variant={1} />
                        </motion.div>
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [90, 0, 90],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-1/2 -left-1/2 w-full h-full"
                        >
                            <BlobShape className="w-full h-full text-secondary/10" variant={2} />
                        </motion.div>
                    </div>

                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="container mx-auto px-4 relative z-10"
                    >
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left - Text Content */}
                            <ScrollReveal className="text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                                >
                                    <Heart className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">Who We Are</span>
                                </motion.div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                    Democratizing{" "}
                                    <span className="relative">
                                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                            Tech Education
                                        </span>
                                        {/* Hand-drawn underline effect */}
                                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                            <path
                                                d="M2 8C20 4 60 2 100 6C140 10 180 8 198 4"
                                                stroke="url(#underline-gradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                className="opacity-60"
                                            />
                                            <defs>
                                                <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                                                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </span>
                                    <br />
                                    <span className="text-foreground">for Everyone</span>
                                </h1>

                                <p className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    We believe the next great developer, AI engineer, or tech entrepreneur
                                    could be anyone, anywhere. Our mission is to make that possible.
                                </p>

                                {/* Dual CTAs */}
                                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Button variant="hero" size="lg" className="group" asChild>
                                        <Link to="/auth?tab=signup">
                                            Start Learning Free
                                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="group backdrop-blur-sm" asChild>
                                        <Link to="/courses">
                                            <Play className="mr-2 w-5 h-5" />
                                            Explore Courses
                                        </Link>
                                    </Button>
                                </div>

                                {/* Mini stats */}
                                <div className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start">
                                    {impactStats.slice(0, 3).map((stat) => (
                                        <div key={stat.label} className="text-center lg:text-left">
                                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>

                            {/* Right - Image Collage with Organic Shapes */}
                            <ScrollReveal variant="slideRight" delay={0.2} className="relative">
                                <div className="relative h-[500px] lg:h-[600px]">
                                    {/* Main large image */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                        className="absolute right-0 top-0 w-[70%] h-[65%]"
                                    >
                                        <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl shadow-primary/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10 pointer-events-none" />
                                            <img
                                                src="/images/about/community-1.jpg"
                                                alt="Kukekodes community of learners"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Secondary image - bottom left */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="absolute left-0 bottom-[10%] w-[55%] h-[45%]"
                                    >
                                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-xl shadow-secondary/20 rotate-[-3deg]">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-accent/20 z-10 pointer-events-none" />
                                            <img
                                                src="/images/about/learning.jpg"
                                                alt="Student learning to code"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Small accent image - top left */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.6 }}
                                        className="absolute left-[5%] top-[15%] w-[35%] h-[30%]"
                                    >
                                        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden border-4 border-white/10 shadow-lg rotate-[6deg]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20" />
                                            {/* Placeholder */}
                                            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                                <Bot className="w-10 h-10 text-accent/30" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Floating elements */}
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute right-[5%] bottom-[5%] bg-card/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                <Bot className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">AI Tutor</p>
                                                <p className="text-xs text-muted-foreground">Always here to help!</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute left-[40%] top-[5%] bg-primary text-primary-foreground rounded-xl px-4 py-2 shadow-lg"
                                    >
                                        <span className="text-sm font-medium">100% Free ✨</span>
                                    </motion.div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
                            <div className="w-1 h-2 bg-primary/50 rounded-full" />
                        </div>
                    </motion.div>
                </section>

                {/* The Problem Section - Glassmorphism Cards */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

                    <div className="container mx-auto px-4 relative z-10">
                        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-destructive text-sm font-semibold uppercase tracking-wider">
                                The Challenge
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
                                A Global{" "}
                                <span className="text-destructive">Digital Skills Crisis</span>
                            </h2>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Millions want to learn coding, but existing systems leave most behind—
                                especially those with limited resources.
                            </p>
                        </ScrollReveal>

                        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
                            {problemPoints.map((point, i) => (
                                <StaggerItem key={point.title}>
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="relative group"
                                    >
                                        {/* Glassmorphism card */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative bg-card/50 backdrop-blur-xl border border-destructive/20 rounded-3xl p-8 h-full">
                                            <div className="text-5xl font-bold text-destructive mb-4">
                                                {point.stat}
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                                {point.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {point.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* Vision Section with Image */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Image Side */}
                            <ScrollReveal variant="slideLeft" className="relative">
                                <div className="relative">
                                    {/* Organic blob background */}
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 -m-8"
                                    >
                                        <BlobShape className="w-full h-full text-primary/10" variant={1} />
                                    </motion.div>

                                    {/* Main image */}
                                    <div className="relative rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl aspect-[4/3]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10 pointer-events-none" />
                                        <img
                                            src="/images/about/vision.jpg"
                                            alt="Global learners building their future"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Floating stat */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="absolute -bottom-6 -right-6 bg-card/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
                                    >
                                        <div className="text-3xl font-bold text-primary">120+</div>
                                        <div className="text-sm text-muted-foreground">Countries Reached</div>
                                    </motion.div>
                                </div>
                            </ScrollReveal>

                            {/* Content Side */}
                            <ScrollReveal variant="slideRight" delay={0.2}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">Our Vision</span>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold">
                                    The Most{" "}
                                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        Inclusive
                                    </span>{" "}
                                    Learning Platform
                                </h2>

                                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                    We envision a world where anyone, from any country, can build a career in tech
                                    and create solutions for their communities—regardless of background or income.
                                </p>

                                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                                    <blockquote className="text-lg italic text-foreground">
                                        "To become the most inclusive and impactful digital platform for learning
                                        coding, AI, and professional skills—enabling millions worldwide."
                                    </blockquote>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Mission Section with Image */}
                <section className="py-24 relative overflow-hidden bg-muted/20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Content Side */}
                            <ScrollReveal variant="slideLeft" className="order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
                                    <Rocket className="w-4 h-4 text-secondary" />
                                    <span className="text-sm font-medium text-secondary">Our Mission</span>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold">
                                    From First Line of Code to{" "}
                                    <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                                        Real Careers
                                    </span>
                                </h2>

                                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                    To provide free, high-quality, AI-powered coding education that supports learners
                                    from their very first line of code all the way to real projects and careers.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {[
                                        "Structured, beginner-friendly learning paths at zero cost",
                                        "Always-available AI tutor for real-time guidance",
                                        "Hands-on coding sandboxes and real projects",
                                        "Global peer community for support and growth",
                                        "Designed for low-bandwidth, emerging markets",
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                            <span className="text-foreground">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollReveal>

                            {/* Image Side */}
                            <ScrollReveal variant="slideRight" delay={0.2} className="order-1 lg:order-2 relative">
                                <div className="relative">
                                    {/* Organic blob background */}
                                    <motion.div
                                        animate={{ rotate: [360, 0] }}
                                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 -m-8"
                                    >
                                        <BlobShape className="w-full h-full text-secondary/10" variant={2} />
                                    </motion.div>

                                    {/* Main image */}
                                    <div className="relative rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl aspect-[4/3]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 z-10 pointer-events-none" />
                                        <img
                                            src="/images/about/mission.jpg"
                                            alt="Learners coding and building projects together"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Floating elements */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute -top-4 -left-4 bg-secondary text-secondary-foreground rounded-xl px-4 py-2 shadow-lg"
                                    >
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" /> 50K+ Graduated
                                        </span>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                        className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 shadow-lg"
                                    >
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-accent" /> 85% Completion
                                        </span>
                                    </motion.div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Core Values Section - Interactive Cards */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                                What We Stand For
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
                                Our Core{" "}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Values
                                </span>
                            </h2>
                        </ScrollReveal>

                        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                            {coreValues.map((value) => (
                                <StaggerItem key={value.title}>
                                    <motion.div
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="group relative h-full"
                                    >
                                        {/* Gradient glow on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                                        {/* Glassmorphism card */}
                                        <div className="relative bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full group-hover:border-white/20 transition-colors">
                                            {/* Icon with gradient background */}
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}>
                                                <value.icon className="w-7 h-7 text-white" />
                                            </div>

                                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                                {value.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {value.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* What Makes Us Different - Compact Grid */}
                <section className="py-24 bg-muted/20 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                            <BlobShape className="w-full h-full text-primary/5" variant={3} />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                                Why Kukekodes
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
                                What Sets Us{" "}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Apart
                                </span>
                            </h2>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Unlike platforms with passive lectures, we combine personal tutoring,
                                coding practice, and community into one seamless experience.
                            </p>
                        </ScrollReveal>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {differentiators.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    {/* Animated background blobs */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute top-0 left-1/4 w-[600px] h-[600px]"
                    >
                        <BlobShape className="w-full h-full text-primary/10" variant={1} />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], rotate: [45, 0, 45] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute bottom-0 right-1/4 w-[500px] h-[500px]"
                    >
                        <BlobShape className="w-full h-full text-secondary/10" variant={2} />
                    </motion.div>

                    <div className="container mx-auto px-4 relative z-10">
                        <ScrollReveal className="text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                Ready to Start Your{" "}
                                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                    Coding Journey
                                </span>
                                ?
                            </h2>
                            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                                Join thousands of learners worldwide who are already building their
                                future with Kukekodes. It's free, forever.
                            </p>

                            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="hero" size="lg" className="text-lg px-8 py-6 group" asChild>
                                    <Link to="/auth?tab=signup">
                                        Start Learning Free
                                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" className="text-lg px-8 py-6 backdrop-blur-sm" asChild>
                                    <Link to="/courses">
                                        Browse Courses
                                    </Link>
                                </Button>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground">
                                {impactStats.map((stat) => (
                                    <div key={stat.label} className="flex items-center gap-2">
                                        <stat.icon className="w-5 h-5 text-primary" />
                                        <span className="font-semibold text-foreground">{stat.value}</span>
                                        <span>{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
