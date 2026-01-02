import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api, { APICourse, APILesson } from '@/services/api';
import { getYoutubeVideoId } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Play, Loader2 } from 'lucide-react';

export default function CourseEditor() {
  const { courseId } = useParams();
  const isNewCourse = courseId === 'new';
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<APICourse | null>(null);
  const [lessons, setLessons] = useState<APILesson[]>([]);
  const [loading, setLoading] = useState(!isNewCourse);
  const [saving, setSaving] = useState(false);

  // Course form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [isPublished, setIsPublished] = useState(false);

  // Lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<APILesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonOrder, setLessonOrder] = useState(1);
  const [savingLesson, setSavingLesson] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/auth');
      return;
    }

    if (!isNewCourse && courseId) {
      const fetchCourse = async () => {
        try {
          const [courseData, lessonsData] = await Promise.all([
            api.getCourse(parseInt(courseId)),
            api.getLessons(parseInt(courseId)),
          ]);
          setCourse(courseData);
          setLessons(lessonsData.sort((a, b) => a.order - b.order));
          setTitle(courseData.title);
          setDescription(courseData.description);
          setLevel(courseData.level);
          setIsPublished(courseData.is_published);
        } catch (error) {
          console.error('Failed to fetch course:', error);
          toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
          navigate('/admin');
        } finally {
          setLoading(false);
        }
      };

      fetchCourse();
    }
  }, [courseId, isNewCourse, user, isAdmin, navigate, toast]);

  const handleSaveCourse = async () => {
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Course title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isNewCourse) {
        const newCourse = await api.createCourse({ 
          title, 
          description, 
          level, 
          is_published: isPublished 
        });
        toast({ title: 'Course created!', description: 'Now add some lessons.' });
        navigate(`/admin/courses/${newCourse.id}`);
      } else if (courseId) {
        await api.updateCourse(parseInt(courseId), { 
          title, 
          description, 
          level, 
          is_published: isPublished 
        });
        toast({ title: 'Course updated!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save course', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Lesson handlers
  const openLessonDialog = (lesson?: APILesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description);
      setLessonContent(lesson.content || '');
      setLessonYoutubeUrl(lesson.youtube_url || '');
      setLessonDuration(lesson.duration_minutes);
      setLessonOrder(lesson.order);
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonDescription('');
      setLessonContent('');
      setLessonYoutubeUrl('');
      setLessonDuration(10);
      setLessonOrder(lessons.length + 1);
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
      const lessonData = {
        course: parseInt(courseId!),
        title: lessonTitle,
        description: lessonDescription,
        content: lessonContent,
        youtube_url: lessonYoutubeUrl,
        duration_minutes: lessonDuration,
        order: lessonOrder,
      };

      if (editingLesson) {
        const updated = await api.updateLesson(editingLesson.id, lessonData);
        setLessons(prev => prev.map(l => l.id === editingLesson.id ? updated : l).sort((a, b) => a.order - b.order));
        toast({ title: 'Lesson updated!' });
      } else {
        const newLesson = await api.createLesson(lessonData);
        setLessons(prev => [...prev, newLesson].sort((a, b) => a.order - b.order));
        toast({ title: 'Lesson added!' });
      }

      setLessonDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save lesson', variant: 'destructive' });
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await api.deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      toast({ title: 'Lesson deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lesson', variant: 'destructive' });
    }
  };

  if (!user || !isAdmin) return null;

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
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="published">Status</Label>
                <Select 
                  value={isPublished ? 'published' : 'draft'} 
                  onValueChange={(v) => setIsPublished(v === 'published')}
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
            </div>
          </CardContent>
        </Card>

        {/* Lessons - Only show for existing courses */}
        {!isNewCourse && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lessons</CardTitle>
              <Button size="sm" onClick={() => openLessonDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No lessons yet. Add your first lesson to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
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
                          onClick={() => openLessonDialog(lesson)}
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
                              <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
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
            </CardContent>
          </Card>
        )}

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
                <Label htmlFor="lesson-content">Content (optional)</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Additional lesson content or notes"
                  rows={3}
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
