import { motion } from "framer-motion";
import { Clock, BarChart3, Users, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api, { Course } from "@/services/api";
import coursePython from "@/assets/course-python.jpg";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { Link } from "react-router-dom";
import { CourseCardSkeleton } from "@/components/ui/card-skeleton";

// Map skill_level to display text
const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.getCourses({ page_size: 6 });
        setCourses(response.data || []);
      } catch (error) {
        // Error logged by api.ts
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Count total lessons from modules
  const getLessonCount = (course: Course): number => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  };

  return (
    <section id="courses" className="py-24 lg:py-32 relative bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Learning Paths
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">
              Start Your <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Journey</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Structured learning paths designed to take you from complete beginner
              to job-ready developer. All courses are free, forever.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 group" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </ScrollReveal>

        {/* Course Cards */}
        {loading ? (
          <CourseCardSkeleton />
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.15}>
            {courses.map((course, index) => (
              <StaggerItem key={course.id}>
                <div
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <motion.img
                      src={course.thumbnail_url || course.cover_image_url || coursePython}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: hoveredIndex === index ? 1.1 : 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                    {/* Play Button Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                      </div>
                    </motion.div>

                    {/* Level Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-card/90 backdrop-blur-sm text-foreground border border-border/50">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {levelLabels[course.skill_level] || course.skill_level}
                    </div>

                    {/* Free Badge */}
                    {course.is_free && (
                      <div className="absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                        Free
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.total_enrollments || 0} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getLessonCount(course)} lessons
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-primary`}
                            initial={{ width: 0 }}
                            animate={{ width: hoveredIndex === index ? "100%" : "0%" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                      >
                        <Link to={`/courses/${course.id}`}>
                          Start Learning
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Bottom CTA */}
        <ScrollReveal delay={0.3} className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Can't decide? Take our quick assessment to find the perfect course for you.
          </p>
          <Button variant="secondary" size="lg">
            Take Skill Assessment
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
