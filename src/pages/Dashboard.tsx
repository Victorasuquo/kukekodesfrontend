import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api, { APICourse, APIUserProgress } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, BookOpen, Clock, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [userProgress, setUserProgress] = useState<APIUserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        const [coursesData, progressData] = await Promise.all([
          api.getCourses(),
          api.getUserProgress().catch(() => []),
        ]);
        setCourses(coursesData);
        setUserProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getTotalLessons = (course: APICourse) => 
    course.lessons?.length || 0;

  const getTotalDuration = (course: APICourse) => 
    course.lessons?.reduce((acc, l) => acc + l.duration_minutes, 0) || 0;

  const getCourseProgress = (course: APICourse) => {
    const courseLessonIds = course.lessons?.map(l => l.id) || [];
    const completedLessons = userProgress.filter(
      p => courseLessonIds.includes(p.lesson) && p.completed
    ).length;
    const total = courseLessonIds.length;
    return total > 0 ? Math.round((completedLessons / total) * 100) : 0;
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
            <p className="text-muted-foreground">Check back soon for new content!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = getCourseProgress(course);
              return (
                <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                  <div className="aspect-video bg-muted relative">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    )}
                    <Badge className="absolute top-3 left-3">{course.level}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                    
                    {course.instructor && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Instructor: {course.instructor.first_name} {course.instructor.last_name}
                      </p>
                    )}
                    
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

                    {progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-primary font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      {progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
