import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api, { Course, Module, Lesson, getYoutubeVideoId } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Play, Loader2, FolderOpen, ChevronDown } from 'lucide-react';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

const levelLabels: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function CourseEditor() {
  const { courseId } = useParams();
  const isNewCourse = courseId === 'new';
  const navigate = useNavigate();
  const { user, isAdmin, isInstructor } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(!isNewCourse);
  const [saving, setSaving] = useState(false);

  // Course form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [category, setCategory] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Module dialog state
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState(1);
  const [savingModule, setSavingModule] = useState(false);

  // Lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [savingLesson, setSavingLesson] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId || isNewCourse) return;

    try {
      const courseData = await api.getCourse(courseId);
      setCourse(courseData);
      setModules(courseData.modules?.sort((a, b) => a.order - b.order) || []);
      setTitle(courseData.title);
      setDescription(courseData.description);
      setSkillLevel(courseData.skill_level);
      setCategory(courseData.category || '');
      setIsFree(courseData.is_free);
      setStatus(courseData.status);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }, [courseId, isNewCourse, navigate, toast]);

  useEffect(() => {
    if (!user || (!isAdmin && !isInstructor)) {
      navigate('/auth');
      return;
    }

    fetchCourse();
  }, [user, isAdmin, isInstructor, navigate, fetchCourse]);

  const handleSaveCourse = async () => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Course title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        title,
        description,
        skill_level: skillLevel,
        category: category || 'Programming',
        is_free: isFree,
        status,
      };

      if (isNewCourse) {
        const newCourse = await api.createCourse(courseData);
        toast({ title: 'Course created!', description: 'Now add some modules and lessons.' });
        navigate(`/admin/courses/${newCourse.id}`);
      } else if (courseId) {
        await api.updateCourse(courseId, courseData);
        toast({ title: 'Course updated!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save course', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Module handlers
  const openModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleTitle(module.title);
      setModuleDescription(module.description);
      setModuleOrder(module.order);
    } else {
      setEditingModule(null);
      setModuleTitle('');
      setModuleDescription('');
      setModuleOrder(modules.length + 1);
    }
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      toast({ title: 'Error', description: 'Module title is required', variant: 'destructive' });
      return;
    }

    setSavingModule(true);
    try {
      if (editingModule) {
        const updated = await api.updateModule(editingModule.id, {
          title: moduleTitle,
          description: moduleDescription,
          order: moduleOrder,
        });
        setModules(prev =>
          prev.map(m => m.id === editingModule.id ? { ...updated, lessons: m.lessons } : m)
            .sort((a, b) => a.order - b.order)
        );
        toast({ title: 'Module updated!' });
      } else {
        const newModule = await api.createModule({
          course_id: courseId!,
          title: moduleTitle,
          description: moduleDescription,
          order: moduleOrder,
        });
        setModules(prev => [...prev, { ...newModule, lessons: [] }].sort((a, b) => a.order - b.order));
        toast({ title: 'Module added!' });
      }
      setModuleDialogOpen(false);
    } catch (error: any) {
      console.error('Module save error:', error);
      const errorMessage = error?.message || 'Failed to save module';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await api.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      toast({ title: 'Module deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete module', variant: 'destructive' });
    }
  };

  // Lesson handlers
  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setLessonModuleId(moduleId);
    const module = modules.find(m => m.id === moduleId);

    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description);
      setLessonYoutubeUrl(lesson.youtube_url || '');
      setLessonDuration(lesson.duration_minutes);
      setLessonOrder(lesson.order);
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonDescription('');
      setLessonYoutubeUrl('');
      setLessonDuration(10);
      setLessonOrder((module?.lessons?.length || 0) + 1);
    }
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) {
      toast({ title: 'Error', description: 'Lesson title is required', variant: 'destructive' });
      return;
    }

    if (lessonYoutubeUrl && !getYoutubeVideoId(lessonYoutubeUrl)) {
      toast({ title: 'Error', description: 'Invalid YouTube URL format', variant: 'destructive' });
      return;
    }

    setSavingLesson(true);
    try {
      if (editingLesson) {
        const updated = await api.updateLesson(editingLesson.id, {
          title: lessonTitle,
          description: lessonDescription,
          youtube_url: lessonYoutubeUrl || undefined,
          duration_minutes: lessonDuration,
          order: lessonOrder,
        });

        setModules(prev => prev.map(m => {
          if (m.id === lessonModuleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => l.id === editingLesson.id ? updated : l)
                .sort((a, b) => a.order - b.order),
            };
          }
          return m;
        }));
        toast({ title: 'Lesson updated!' });
      } else {
        const newLesson = await api.createLesson({
          module_id: lessonModuleId,
          title: lessonTitle,
          description: lessonDescription,
          youtube_url: lessonYoutubeUrl || undefined,
          order: lessonOrder,
        });

        setModules(prev => prev.map(m => {
          if (m.id === lessonModuleId) {
            return {
              ...m,
              lessons: [...(m.lessons || []), newLesson].sort((a, b) => a.order - b.order),
            };
          }
          return m;
        }));
        toast({ title: 'Lesson added!' });
      }
      setLessonDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save lesson', variant: 'destructive' });
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    try {
      await api.deleteLesson(lessonId);
      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
      toast({ title: 'Lesson deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lesson', variant: 'destructive' });
    }
  };

  if (!user || (!isAdmin && !isInstructor)) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <Button onClick={handleSaveCourse} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNewCourse ? 'Create Course' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          {isNewCourse ? 'Create New Course' : 'Edit Course'}
        </h1>

        {/* Course Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Python for Beginners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this course?"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Skill Level</Label>
                <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v as SkillLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Programming, Web Development"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as 'draft' | 'published')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="is-free"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
                <Label htmlFor="is-free">Free Course</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules & Lessons - Only show for existing courses */}
        {!isNewCourse && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Modules & Lessons</CardTitle>
              <Button size="sm" onClick={() => openModuleDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No modules yet. Add your first module to get started.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {modules.map((module) => (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-sm font-medium text-muted-foreground">
                            {module.order}.
                          </span>
                          <span className="font-semibold">{module.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({module.lessons?.length || 0} lessons)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Button variant="outline" size="sm" onClick={() => openModuleDialog(module)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Module
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLessonDialog(module.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Lesson
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Module</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the module and all its lessons. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteModule(module.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {module.lessons?.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {module.lessons?.sort((a, b) => a.order - b.order).map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <Play className="w-4 h-4 text-primary" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {lesson.order}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {lesson.duration_minutes} min
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openLessonDialog(module.id, lesson)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this lesson?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteLesson(module.id, lesson.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
              <DialogDescription>
                Organize your course content into modules.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Title</Label>
                <Input
                  id="module-title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g., Getting Started"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="What will students learn in this module?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-order">Order</Label>
                <Input
                  id="module-order"
                  type="number"
                  value={moduleOrder}
                  onChange={(e) => setModuleOrder(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveModule} disabled={savingModule}>
                {savingModule && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingModule ? 'Update' : 'Add'} Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
              <DialogDescription>
                Add video content and details for this lesson.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Title</Label>
                <Input
                  id="lesson-title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to Variables"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-description">Description</Label>
                <Textarea
                  id="lesson-description"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Brief description of this lesson"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-youtube">YouTube URL</Label>
                <Input
                  id="lesson-youtube"
                  value={lessonYoutubeUrl}
                  onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-order">Order</Label>
                  <Input
                    id="lesson-order"
                    type="number"
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLesson} disabled={savingLesson}>
                {savingLesson && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingLesson ? 'Update' : 'Add'} Lesson
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
