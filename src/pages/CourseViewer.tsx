import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import api, { getYoutubeVideoId } from '@/services/api';
import type { Course, Lesson } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft, Play, Clock, Users, BookOpen,
    ChevronDown, ChevronRight, BarChart3
} from 'lucide-react';

const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export default function CourseViewer() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                const data = await api.getCourse(courseId);
                setCourse(data);

                // Auto-expand first module and select first lesson
                if (data.modules && data.modules.length > 0) {
                    setExpandedModules(new Set([data.modules[0].id]));
                    if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
                        setActiveLesson(data.modules[0].lessons[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch course', err);
                setError(err instanceof Error ? err.message : 'Failed to load course');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const getTotalLessons = (): number => {
        if (!course?.modules) return 0;
        return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-96 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                    <p className="text-muted-foreground mb-4">{error || 'This course does not exist.'}</p>
                    <Button onClick={() => navigate('/courses')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </Button>
                </div>
            </div>
        );
    }

    const videoId = activeLesson?.youtube_video_id ||
        (activeLesson?.youtube_url ? getYoutubeVideoId(activeLesson.youtube_url) : null);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Back button */}
                <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to courses
                </Link>

                {/* Course header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {levelLabels[course.skill_level] || course.skill_level}
                        </Badge>
                        {course.is_free && <Badge>Free</Badge>}
                        <Badge variant="secondary">{course.category}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-muted-foreground">{course.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {course.modules?.length || 0} modules
                        </span>
                        <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            {getTotalLessons()} lessons
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.total_enrollments || 0} enrolled
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Video Player */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                            {videoId ? (
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={activeLesson?.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            {activeLesson ? 'No video available for this lesson' : 'Select a lesson to start'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active lesson info */}
                        {activeLesson && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{activeLesson.title}</CardTitle>
                                    <CardDescription>{activeLesson.description}</CardDescription>
                                </CardHeader>
                                {activeLesson.duration_minutes && (
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            {activeLesson.duration_minutes} minutes
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Course content sidebar */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Course Content</CardTitle>
                                <CardDescription>
                                    {course.modules?.length || 0} modules • {getTotalLessons()} lessons
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[500px]">
                                    {course.modules?.map((module) => (
                                        <div key={module.id} className="border-t">
                                            {/* Module header */}
                                            <button
                                                onClick={() => toggleModule(module.id)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {expandedModules.has(module.id) ? (
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                    <span className="font-medium text-sm">{module.title}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {module.lessons?.length || 0} lessons
                                                </span>
                                            </button>

                                            {/* Lessons */}
                                            {expandedModules.has(module.id) && (
                                                <div className="bg-muted/30">
                                                    {module.lessons?.map((lesson) => (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            className={`w-full px-4 py-2 pl-10 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${activeLesson?.id === lesson.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                                                                }`}
                                                        >
                                                            <Play className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                            <span className="text-sm line-clamp-1 flex-1">{lesson.title}</span>
                                                            {lesson.duration_minutes && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {lesson.duration_minutes}m
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {(!course.modules || course.modules.length === 0) && (
                                        <div className="p-6 text-center text-muted-foreground">
                                            <BookOpen className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm">No modules available yet</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
