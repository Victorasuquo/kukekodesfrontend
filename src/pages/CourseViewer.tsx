import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CheckCircle, ChevronDown, ChevronRight, Clock, Download, Loader2, Play } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Quiz } from '@/components/Quiz';
import { useAuth } from '@/contexts/AuthContext';
import api, { APICertificate, APIQuiz, Course, CourseProgress, getYoutubeVideoId, Lesson } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [quizzes, setQuizzes] = useState<APIQuiz[]>([]);
  const [certificate, setCertificate] = useState<APICertificate | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumePosition, setResumePosition] = useState(0);

  const loadLearningState = useCallback(async (id: string) => {
    if (!user) return;
    const enrollment = await api.checkEnrollment(id);
    setEnrolled(enrollment.is_enrolled);
    if (enrollment.is_enrolled) {
      const [courseProgress, courseQuizzes] = await Promise.all([api.getCourseProgress(id), api.listCourseQuizzes(id)]);
      setProgress(courseProgress); setQuizzes(courseQuizzes);
    }
  }, [user]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api.getCourse(courseId).then(async (data) => {
      setCourse(data);
      const firstModule = data.modules?.[0];
      if (firstModule) { setExpanded(new Set([firstModule.id])); setActiveLesson(firstModule.lessons?.[0] || null); }
      await loadLearningState(courseId);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load course')).finally(() => setLoading(false));
  }, [courseId, loadLearningState]);

  useEffect(() => {
    if (!activeLesson || !enrolled) return;
    api.getLessonProgress(activeLesson.id).then((item) => setResumePosition(item.resume_position_seconds || 0)).catch(() => setResumePosition(0));
  }, [activeLesson, enrolled]);

  const completedLessonIds = useMemo(() => new Set(progress?.modules?.flatMap((module) => module.lessons || []).filter((item) => item.is_completed).map((item) => item.lesson_id || item.id).filter(Boolean) as string[]), [progress]);
  const totalLessons = course?.modules?.reduce((count, module) => count + module.lessons.length, 0) || 0;
  const videoId = activeLesson?.youtube_video_id || (activeLesson?.youtube_url ? getYoutubeVideoId(activeLesson.youtube_url) : null);

  const enroll = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!courseId) return;
    setWorking(true);
    try { await api.enrollCourse(courseId); await loadLearningState(courseId); toast({ title: 'Enrollment complete', description: 'Your progress will now be saved.' }); }
    catch (reason) { toast({ title: 'Enrollment failed', description: reason instanceof Error ? reason.message : 'Request failed', variant: 'destructive' }); }
    finally { setWorking(false); }
  };
  const completeLesson = async () => {
    if (!courseId || !activeLesson) return; setWorking(true);
    try { await api.markLessonComplete(activeLesson.id, activeLesson.duration_minutes || 0); setProgress(await api.getCourseProgress(courseId)); toast({ title: 'Lesson completed', description: 'Your progress was saved.' }); }
    catch (reason) { toast({ title: 'Progress not saved', description: reason instanceof Error ? reason.message : 'Request failed', variant: 'destructive' }); }
    finally { setWorking(false); }
  };
  const loadCertificate = async () => {
    if (!courseId) return;
    try { setCertificate(await api.getCourseCertificate(courseId)); }
    catch (reason) { toast({ title: 'Certificate not ready', description: reason instanceof Error ? reason.message : 'Complete the course requirements first.', variant: 'destructive' }); }
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 pt-24"><Skeleton className="h-10 w-1/2" /><Skeleton className="mt-8 aspect-video w-full" /></div></div>;
  if (error || !course) return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 pt-32 text-center"><h1 className="text-2xl font-bold">Course unavailable</h1><p className="mt-2 text-muted-foreground">{error}</p><Button className="mt-6" onClick={() => navigate('/courses')}>Back to courses</Button></main></div>;
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 pt-24">
    <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to courses</Link>
    <div className="mb-6"><div className="mb-2 flex flex-wrap gap-2"><Badge variant="outline">{course.skill_level}</Badge><Badge variant="secondary">{course.category}</Badge>{course.is_free && <Badge>Free</Badge>}</div><h1 className="text-3xl font-bold">{course.title}</h1><p className="mt-2 text-muted-foreground">{course.description}</p><div className="mt-4 flex gap-4 text-sm text-muted-foreground"><span className="flex gap-1"><BookOpen className="h-4 w-4" />{course.modules?.length || 0} modules</span><span className="flex gap-1"><Play className="h-4 w-4" />{totalLessons} lessons</span></div></div>
    {!enrolled && <Card className="mb-6"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-medium">Enroll to save progress and take assessments</p><p className="text-sm text-muted-foreground">The transcript and course outline remain available as a low-data preview.</p></div><Button onClick={enroll} disabled={working}>{working && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enroll now</Button></CardContent></Card>}
    {enrolled && progress && <Card className="mb-6"><CardContent className="p-5"><div className="mb-2 flex justify-between text-sm"><span>Your progress</span><span>{Math.round(progress.completion_percentage)}%</span></div><Progress value={progress.completion_percentage} /></CardContent></Card>}
    <div className="grid gap-8 lg:grid-cols-3"><div className="space-y-5 lg:col-span-2">
      <div className="aspect-video overflow-hidden rounded-xl bg-muted">{videoId && videoLoaded ? <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={activeLesson?.title || course.title} allow="encrypted-media; picture-in-picture" allowFullScreen /> : <div className="grid h-full place-items-center text-center"><div><Play className="mx-auto mb-3 h-14 w-14 text-muted-foreground" /><p className="text-muted-foreground">{videoId ? 'Video is not loaded to save data.' : 'Select a lesson with a video.'}</p>{videoId && <Button className="mt-4" onClick={() => setVideoLoaded(true)}>Load video</Button>}</div></div>}</div>
      {activeLesson && <Card><CardHeader><CardTitle>{activeLesson.title}</CardTitle><CardDescription>{activeLesson.description}</CardDescription></CardHeader><CardContent className="space-y-5">{activeLesson.duration_minutes ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{activeLesson.duration_minutes} minutes</p> : null}<div><h2 className="mb-2 font-semibold">Transcript</h2><div className="whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm leading-6">{activeLesson.transcript || 'A transcript has not been added for this lesson.'}</div></div>{activeLesson.resources?.url && <a className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" href={activeLesson.resources.url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />{activeLesson.resources.title || 'Download lesson resource'}</a>}{enrolled && <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed p-3"><div className="space-y-1"><label htmlFor="resume-position" className="text-xs font-medium">Resume position (seconds)</label><Input id="resume-position" type="number" min={0} value={resumePosition} onChange={(event) => setResumePosition(Number(event.target.value))} className="w-40" /></div><Button variant="outline" onClick={async () => { try { await api.syncLessonPosition(activeLesson.id, resumePosition); toast({ title: 'Position saved' }); } catch (reason) { toast({ title: 'Position not saved', description: reason instanceof Error ? reason.message : 'Try again.', variant: 'destructive' }); } }}>Save position</Button></div>}{enrolled && <Button onClick={completeLesson} disabled={working || completedLessonIds.has(activeLesson.id)}>{completedLessonIds.has(activeLesson.id) ? <CheckCircle className="mr-2 h-4 w-4" /> : null}{completedLessonIds.has(activeLesson.id) ? 'Completed' : 'Mark lesson complete'}</Button>}</CardContent></Card>}
      {enrolled && quizzes.map((quiz) => <Card key={quiz.id}><CardContent className="p-6"><Quiz quizId={quiz.id} onComplete={() => courseId && loadLearningState(courseId)} /></CardContent></Card>)}
      {enrolled && progress?.is_completed && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Course certificate</CardTitle></CardHeader><CardContent>{certificate ? <div><p className="font-medium">Certificate {certificate.certificate_id}</p><p className="text-sm text-muted-foreground">Verification code: {certificate.verification_code}</p>{certificate.download_url && <Button asChild className="mt-4"><a href={certificate.download_url}>Download certificate</a></Button>}</div> : <Button onClick={loadCertificate}>Check certificate eligibility</Button>}</CardContent></Card>}
    </div><aside><Card className="sticky top-24"><CardHeader><CardTitle className="text-lg">Course content</CardTitle><CardDescription>{totalLessons} lessons</CardDescription></CardHeader><CardContent className="p-0"><ScrollArea className="h-[520px]">{course.modules?.map((module) => <div key={module.id} className="border-t"><button className="flex w-full items-center gap-2 px-4 py-3 text-left" onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(module.id)) next.delete(module.id); else next.add(module.id); return next; })}>{expanded.has(module.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}<span className="flex-1 text-sm font-medium">{module.title}</span></button>{expanded.has(module.id) && <div className="bg-muted/30">{module.lessons.map((lesson) => <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setVideoLoaded(false); }} className={`flex w-full items-center gap-2 px-4 py-3 pl-10 text-left text-sm hover:bg-muted/60 ${activeLesson?.id === lesson.id ? 'border-l-2 border-primary bg-primary/10' : ''}`}>{completedLessonIds.has(lesson.id) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Play className="h-3 w-3" />}<span className="flex-1 line-clamp-1">{lesson.title}</span></button>)}</div>}</div>)}</ScrollArea></CardContent></Card></aside></div>
  </main></div>;
}
