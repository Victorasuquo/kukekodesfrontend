import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Loader2, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import api, { APIQuiz, Lesson, Module } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const isNew = !courseId || courseId === 'new';
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [category, setCategory] = useState('Programming');
  const [tags, setTags] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published'>('draft');
  const [modules, setModules] = useState<Module[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [moduleTitle, setModuleTitle] = useState('');
  const [quizzes, setQuizzes] = useState<APIQuiz[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const loadCourse = useCallback(async () => {
    if (!courseId || isNew) return;
    const course = await api.getCourse(courseId);
    setTitle(course.title); setDescription(course.description); setSkillLevel(course.skill_level);
    setCategory(course.category); setTags(course.tags?.join(', ') || ''); setIsFree(course.is_free);
    setCourseStatus(course.status); setModules(course.modules || []);
    setQuizzes(await api.listCourseQuizzes(courseId));
  }, [courseId, isNew]);

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/dashboard'); return; }
    if (!isNew) loadCourse().catch((error) => toast({ title: 'Course unavailable', description: error instanceof Error ? error.message : 'Unable to load course', variant: 'destructive' })).finally(() => setLoading(false));
  }, [user, isAdmin, isNew, navigate, loadCourse, toast]);

  const saveCourse = async () => {
    if (!title.trim() || !description.trim()) { toast({ title: 'Course details required', description: 'Add a title and description before saving.', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { title: title.trim(), description: description.trim(), skill_level: skillLevel, category, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean), is_free: isFree };
      if (isNew) { const created = await api.createCourse(payload); toast({ title: 'Course created' }); navigate(`/admin/courses/${created.id}`, { replace: true }); }
      else if (courseId) { await api.updateCourse(courseId, payload); await loadCourse(); toast({ title: 'Course saved' }); }
    } catch (error) { toast({ title: 'Save failed', description: error instanceof Error ? error.message : 'Unable to save course', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const addModule = async () => {
    if (!courseId || !moduleTitle.trim()) return;
    try {
      const created = await api.createModule({ course_id: courseId, title: moduleTitle.trim(), description: '', order: modules.length + 1 });
      setModules((current) => [...current, { ...created, lessons: created.lessons || [] }]); setExpanded((current) => new Set(current).add(created.id)); setModuleTitle('');
    } catch (error) { toast({ title: 'Module not created', description: error instanceof Error ? error.message : 'Request failed', variant: 'destructive' }); }
  };
  const updateModuleState = (id: string, patch: Partial<Module>) => setModules((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const updateLessonState = (moduleId: string, lessonId: string, patch: Partial<Lesson>) => setModules((current) => current.map((item) => item.id === moduleId ? { ...item, lessons: item.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, ...patch } : lesson) } : item));
  const saveModule = async (module: Module) => { try { await api.updateModule(module.id, { title: module.title, description: module.description, order: module.order }); toast({ title: 'Module saved' }); } catch (error) { toast({ title: 'Module save failed', description: error instanceof Error ? error.message : 'Request failed', variant: 'destructive' }); } };
  const deleteModule = async (id: string) => { if (!window.confirm('Delete this module and its lessons?')) return; await api.deleteModule(id); setModules((current) => current.filter((item) => item.id !== id)); };
  const addLesson = async (module: Module) => { try { const created = await api.createLesson({ module_id: module.id, title: 'New lesson', description: '', order: module.lessons.length + 1 }); setModules((current) => current.map((item) => item.id === module.id ? { ...item, lessons: [...item.lessons, created] } : item)); } catch (error) { toast({ title: 'Lesson not created', description: error instanceof Error ? error.message : 'Request failed', variant: 'destructive' }); } };
  const saveLesson = async (lesson: Lesson) => { try { await api.updateLesson(lesson.id, { title: lesson.title, description: lesson.description, youtube_url: lesson.youtube_url, duration_minutes: Number(lesson.duration_minutes || 0), transcript: lesson.transcript, resources: lesson.resources, order: lesson.order }); toast({ title: 'Lesson saved' }); } catch (error) { toast({ title: 'Lesson save failed', description: error instanceof Error ? error.message : 'Check the lesson content.', variant: 'destructive' }); } };
  const deleteLesson = async (moduleId: string, lessonId: string) => { if (!window.confirm('Delete this lesson?')) return; await api.deleteLesson(lessonId); setModules((current) => current.map((item) => item.id === moduleId ? { ...item, lessons: item.lessons.filter((lesson) => lesson.id !== lessonId) } : item)); };

  const createQuiz = async () => {
    if (!courseId || !quizTitle.trim() || !questionText.trim() || !correctAnswer.trim() || !wrongAnswer.trim()) { toast({ title: 'Quiz details required', description: 'Complete every quiz field.', variant: 'destructive' }); return; }
    try {
      const quiz = await api.createQuiz({ course_id: courseId, title: quizTitle.trim(), passing_score: passingScore, questions: [{ question_text: questionText.trim(), answers: [{ answer_text: correctAnswer.trim(), is_correct: true }, { answer_text: wrongAnswer.trim(), is_correct: false }] }] });
      setQuizzes((current) => [...current, quiz]); setQuizTitle(''); setQuestionText(''); setCorrectAnswer(''); setWrongAnswer(''); toast({ title: 'Quiz created' });
    } catch (error) { toast({ title: 'Quiz not created', description: error instanceof Error ? error.message : 'Request failed', variant: 'destructive' }); }
  };
  const publish = async () => {
    if (!courseId) return; setPublishing(true); setValidationErrors([]);
    try { const preview = await api.getCoursePreview(courseId); if (!preview.is_publishable) { setValidationErrors(preview.validation_errors); return; } await api.publishCourse(courseId); setCourseStatus('published'); toast({ title: 'Course published' }); }
    catch (error) { toast({ title: 'Publish failed', description: error instanceof Error ? error.message : 'Request failed', variant: 'destructive' }); }
    finally { setPublishing(false); }
  };

  if (!user || !isAdmin) return null;
  if (loading) return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 py-8 pt-24">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><Link to="/admin" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link><div><h1 className="text-2xl font-bold">{isNew ? 'Create Course' : 'Edit Course'}</h1><p className="text-muted-foreground">Build the complete learner experience with real content.</p></div></div><Button onClick={saveCourse} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Course</Button></div>
    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <Card><CardHeader><CardTitle>Course details</CardTitle><CardDescription>These details appear in the learner catalog.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Skill level</Label><Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as SkillLevel)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div></div><div className="space-y-2"><Label>Tags</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma separated" /></div><div className="flex items-center justify-between"><div><Label>Free course</Label><p className="text-sm text-muted-foreground">No payment is required to enroll.</p></div><Switch checked={isFree} onCheckedChange={setIsFree} /></div></CardContent></Card>
      {!isNew && <Card><CardHeader><CardTitle>Modules and lessons</CardTitle><CardDescription>Add real video, transcript, and lightweight resources before publishing.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="New module title" /><Button onClick={addModule} disabled={!moduleTitle.trim()}><Plus className="mr-2 h-4 w-4" />Add</Button></div>{modules.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No modules yet.</p>}{modules.map((module) => <div key={module.id} className="rounded-lg border"><button className="flex w-full items-center gap-2 p-4 text-left" onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(module.id)) next.delete(module.id); else next.add(module.id); return next; })}>{expanded.has(module.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}<span className="flex-1 font-medium">{module.title}</span><span className="text-xs text-muted-foreground">{module.lessons.length} lessons</span></button>{expanded.has(module.id) && <div className="space-y-4 border-t bg-muted/20 p-4"><div className="grid gap-3 sm:grid-cols-2"><Input value={module.title} onChange={(e) => updateModuleState(module.id, { title: e.target.value })} aria-label="Module title" /><Input value={module.description || ''} onChange={(e) => updateModuleState(module.id, { description: e.target.value })} placeholder="Module description" /></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => saveModule(module)}>Save module</Button><Button size="sm" variant="ghost" onClick={() => deleteModule(module.id)}><Trash2 className="h-4 w-4" /></Button></div>{module.lessons.map((lesson) => <LessonEditor key={lesson.id} lesson={lesson} onChange={(patch) => updateLessonState(module.id, lesson.id, patch)} onSave={() => saveLesson(lesson)} onDelete={() => deleteLesson(module.id, lesson.id)} />)}<Button size="sm" variant="outline" onClick={() => addLesson(module)}><Plus className="mr-2 h-4 w-4" />Add lesson</Button></div>}</div>)}</CardContent></Card>}
      {!isNew && <Card><CardHeader><CardTitle>Assessment</CardTitle><CardDescription>Create a server-scored quiz for this course.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Quiz title" /><Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} aria-label="Passing score" /></div><Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Question" /><div className="grid gap-3 sm:grid-cols-2"><Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Correct answer" /><Input value={wrongAnswer} onChange={(e) => setWrongAnswer(e.target.value)} placeholder="Alternative answer" /></div><Button variant="outline" onClick={createQuiz}><Plus className="mr-2 h-4 w-4" />Create quiz</Button>{quizzes.map((quiz) => <div key={quiz.id} className="flex items-center justify-between rounded-md border p-3"><span>{quiz.title}</span><span className="text-sm text-muted-foreground">Pass: {quiz.passing_score}%</span></div>)}</CardContent></Card>}
    </div><aside><Card><CardHeader><CardTitle>Publication</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Status: <span className="font-medium text-foreground">{courseStatus}</span></p>{validationErrors.length > 0 && <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3"><p className="mb-2 text-sm font-medium">Resolve before publishing:</p><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}<Button className="w-full" onClick={publish} disabled={isNew || publishing || courseStatus === 'published'}>{publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{courseStatus === 'published' ? 'Published' : 'Validate and publish'}</Button></CardContent></Card></aside></div>
  </main></div>;
}

function LessonEditor({ lesson, onChange, onSave, onDelete }: { lesson: Lesson; onChange: (patch: Partial<Lesson>) => void; onSave: () => void; onDelete: () => void }) {
  const resources = lesson.resources || {};
  return <div className="space-y-3 rounded-lg border bg-background p-4"><Input value={lesson.title} onChange={(e) => onChange({ title: e.target.value })} aria-label="Lesson title" /><Textarea value={lesson.description || ''} onChange={(e) => onChange({ description: e.target.value })} placeholder="Lesson description" /><div className="grid gap-3 sm:grid-cols-[1fr_130px]"><Input value={lesson.youtube_url || ''} onChange={(e) => onChange({ youtube_url: e.target.value })} placeholder="YouTube URL" /><Input type="number" min={0} value={lesson.duration_minutes || 0} onChange={(e) => onChange({ duration_minutes: Number(e.target.value) })} aria-label="Duration minutes" /></div><Textarea rows={6} value={lesson.transcript || ''} onChange={(e) => onChange({ transcript: e.target.value })} placeholder="Transcript for low-data access" /><div className="grid gap-3 sm:grid-cols-2"><Input value={resources.title || ''} onChange={(e) => onChange({ resources: { ...resources, title: e.target.value } })} placeholder="Resource label" /><Input type="url" value={resources.url || ''} onChange={(e) => onChange({ resources: { ...resources, url: e.target.value } })} placeholder="Resource URL" /></div><div className="flex gap-2"><Button size="sm" onClick={onSave}><Save className="mr-2 h-4 w-4" />Save lesson</Button><Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button></div></div>;
}
