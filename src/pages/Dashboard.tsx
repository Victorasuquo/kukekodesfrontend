import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api, { Course } from '@/services/api';
import { Certificates } from '@/components/sections/Certificates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, BookOpen, Clock, Loader2 } from 'lucide-react';
import coursePython from '@/assets/course-python.jpg';

// Map skill_level to display text
const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function Dashboard() {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isAdmin || isInstructor) {
      navigate('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.getCourses();
        setCourses(response.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, isInstructor, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Count total lessons from modules
  const getTotalLessons = (course: Course): number => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  };

  // Get total duration from all lessons in all modules
  const getTotalDuration = (course: Course): number => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => {
      const moduleDuration = module.lessons?.reduce((acc, l) => acc + (l.duration_minutes || 0), 0) || 0;
      return total + moduleDuration;
    }, 0);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">KukeKodes</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
        <p className="text-muted-foreground mb-8">Continue learning where you left off</p>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses available</h3>
            <p className="text-muted-foreground mb-4">Check back soon for new content!</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={course.thumbnail_url || course.cover_image_url || coursePython}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3">
                    {levelLabels[course.skill_level] || course.skill_level}
                  </Badge>
                  {course.is_free && (
                    <Badge className="absolute top-3 right-3 bg-primary">Free</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {getTotalLessons(course)} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTotalDuration(course)} min
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Start Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <section className="container mx-auto px-4 py-8 border-t border-border">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-6">
          My Certificates
        </h2>
        <Certificates />
      </section>
    </div>
  );
}
