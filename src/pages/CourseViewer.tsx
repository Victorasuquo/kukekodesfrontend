import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api, { APICourse, APILesson, APIUserProgress } from '@/services/api';
import { getYoutubeVideoId } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle, Circle, Loader2, BookOpen, MessageSquare, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AICoach, AITutor } from '@/components/sections/AICoach';
import { CodeEditor } from '@/components/CodeEditor';

export default function CourseViewer() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<APICourse | null>(null);
  const [lessons, setLessons] = useState<APILesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<APILesson | null>(null);
  const [userProgress, setUserProgress] = useState<APIUserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (courseId) {
      const fetchCourse = async () => {
        try {
          const [courseData, lessonsData, progressData] = await Promise.all([
            api.getCourse(parseInt(courseId)),
            api.getLessons(parseInt(courseId)),
            api.getUserProgress().catch(() => []),
          ]);

          setCourse(courseData);
          setLessons(lessonsData.sort((a, b) => a.order - b.order));
          setUserProgress(progressData);

          // Set first incomplete lesson or first lesson
          const lessonIds = lessonsData.map(l => l.id);
          const completedLessonIds = progressData
            .filter(p => lessonIds.includes(p.lesson) && p.completed)
            .map(p => p.lesson);

          const firstIncomplete = lessonsData.find(l => !completedLessonIds.includes(l.id));
          setCurrentLesson(firstIncomplete || lessonsData[0] || null);
        } catch (error) {
          console.error('Failed to fetch course:', error);
          toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };

      fetchCourse();
    }
  }, [courseId, user, navigate, toast]);

  const isLessonComplete = (lessonId: number) => {
    return userProgress.some(p => p.lesson === lessonId && p.completed);
  };

  const getCourseProgressPercent = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => isLessonComplete(l.id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    setMarkingComplete(true);
    try {
      const result = await api.markLessonComplete(currentLesson.id);
      setUserProgress(prev => [...prev, result]);
      toast({ title: 'Lesson completed!' });

      // Auto-advance to next lesson
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark lesson complete', variant: 'destructive' });
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !user) return null;

  const videoId = currentLesson?.youtube_url ? getYoutubeVideoId(currentLesson.youtube_url) : null;
  const progress = getCourseProgressPercent();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground truncate">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-2 w-32" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Player */}
        <div className="flex-1 bg-black flex flex-col">
          {videoId ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted-foreground">
              {currentLesson ? 'No video available for this lesson' : 'Select a lesson to start'}
            </div>
          )}

          {currentLesson && (
            <div className="p-4 bg-card border-t border-border mt-4">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="content" className="flex gap-2"><BookOpen className="w-4 h-4" /> Lesson</TabsTrigger>
                  <TabsTrigger value="code" className="flex gap-2"><Terminal className="w-4 h-4" /> Code</TabsTrigger>
                  <TabsTrigger value="ai" className="flex gap-2"><MessageSquare className="w-4 h-4" /> AI Tutor</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-1">{currentLesson.title}</h2>
                      <p className="text-muted-foreground text-sm">{currentLesson.description}</p>
                    </div>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isLessonComplete(currentLesson.id) || markingComplete}
                      size="sm"
                    >
                      {markingComplete ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isLessonComplete(currentLesson.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </Button>
                  </div>

                  {currentLesson.content && (
                    <div className="prose dark:prose-invert max-w-none text-sm p-4 bg-muted/50 rounded-lg" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  )}
                </TabsContent>

                <TabsContent value="code">
                  <CodeEditor lessonId={currentLesson.id} />
                </TabsContent>

                <TabsContent value="ai">
                  <AITutor lessonId={currentLesson.id} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <ScrollArea className="w-full lg:w-80 border-l border-border bg-card">
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Course Content</h3>
            <div className="space-y-1">
              {lessons.map((lesson, index) => {
                const completed = isLessonComplete(lesson.id);
                const isCurrent = currentLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors ${isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                  >
                    {completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{index + 1}. {lesson.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{lesson.duration_minutes}m</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
