import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import api, { Course, Module, Lesson } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, Save, Plus, Trash2, GripVertical,
    ChevronDown, ChevronRight, Video, Loader2
} from 'lucide-react';

export default function CourseEditor() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user, isAdmin, isInstructor } = useAuth();
    const { toast } = useToast();
    const isNew = courseId === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    // Course form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [category, setCategory] = useState('Programming');
    const [tags, setTags] = useState('');
    const [isFree, setIsFree] = useState(true);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user || (!isAdmin && !isInstructor)) {
            navigate('/dashboard');
            return;
        }

        if (!isNew && courseId) {
            const fetchCourse = async () => {
                try {
                    const course = await api.getCourse(courseId);
                    setTitle(course.title);
                    setDescription(course.description);
                    setSkillLevel(course.skill_level);
                    setCategory(course.category);
                    setTags(course.tags?.join(', ') || '');
                    setIsFree(course.is_free);
                    setModules(course.modules || []);
                } catch (error) {
                    console.error('Failed to fetch course', error);
                    toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
                } finally {
                    setLoading(false);
                }
            };
            fetchCourse();
        }
    }, [user, isAdmin, isInstructor, isNew, courseId, navigate, toast]);

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
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                is_free: isFree,
            };

            if (isNew) {
                const newCourse = await api.createCourse(courseData);
                toast({ title: 'Success', description: 'Course created successfully' });
                navigate(`/admin/courses/${newCourse.id}`);
            } else if (courseId) {
                await api.updateCourse(courseId, courseData);
                toast({ title: 'Success', description: 'Course updated successfully' });
            }
        } catch (error) {
            console.error('Failed to save course', error);
            const message = error instanceof Error ? error.message : 'Failed to save course';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

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

    const handleAddModule = async () => {
        if (!courseId || isNew) {
            toast({ title: 'Save First', description: 'Please save the course before adding modules', variant: 'destructive' });
            return;
        }

        try {
            const token = localStorage.getItem('kukekodes_access_token');
            const payload = {
                course_id: String(courseId),
                title: `Module ${modules.length + 1}`,
                description: 'Module description',
                order: modules.length + 1,
            };

            console.log('Using RAW FETCH with payload:', payload);

            const response = await fetch('https://kukekodesbackend-714266210254.europe-west1.run.app/api/v1/modules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Raw Fetch Error:', errorData);
                throw new Error(JSON.stringify(errorData));
            }

            const newModule = await response.json();
            setModules(prev => [...prev, { ...newModule, lessons: [] }]);
            setExpandedModules(prev => new Set([...prev, newModule.id]));
            toast({ title: 'Success', description: 'Module created' });
        } catch (error) {
            console.error('Failed to create module', error);
            const message = error instanceof Error ? error.message : 'Failed to create module';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        try {
            const newLesson = await api.createLesson({
                module_id: moduleId,
                title: `Lesson ${(module.lessons?.length || 0) + 1}`,
                description: '',
                order: (module.lessons?.length || 0) + 1,
            });

            setModules(prev => prev.map(m =>
                m.id === moduleId
                    ? { ...m, lessons: [...(m.lessons || []), newLesson] }
                    : m
            ));
            toast({ title: 'Success', description: 'Lesson created' });
        } catch (error) {
            console.error('Failed to create lesson', error);
            const message = error instanceof Error ? error.message : 'Failed to create lesson';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        }
    };

    if (!user || (!isAdmin && !isInstructor)) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isNew ? 'Create Course' : 'Edit Course'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isNew ? 'Create a new course' : 'Update course details and content'}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSaveCourse} disabled={saving}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Course
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Course Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                                <CardDescription>Basic information about your course</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Python Basics for Beginners"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what students will learn..."
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Skill Level</Label>
                                        <Select value={skillLevel} onValueChange={(v: any) => setSkillLevel(v)}>
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
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Programming">Programming</SelectItem>
                                                <SelectItem value="Web Development">Web Development</SelectItem>
                                                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                                                <SelectItem value="Data Science">Data Science</SelectItem>
                                                <SelectItem value="DevOps">DevOps</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma separated)</Label>
                                    <Input
                                        id="tags"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g., Python, Programming, Beginner"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Free Course</Label>
                                        <p className="text-sm text-muted-foreground">Make this course free for all users</p>
                                    </div>
                                    <Switch checked={isFree} onCheckedChange={setIsFree} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modules & Lessons */}
                        {!isNew && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Modules & Lessons</CardTitle>
                                            <CardDescription>Organize your course content</CardDescription>
                                        </div>
                                        <Button size="sm" onClick={handleAddModule}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Module
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {modules.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No modules yet. Add your first module to start organizing content.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {modules.map((module, idx) => (
                                                <div key={module.id} className="border rounded-lg">
                                                    <button
                                                        onClick={() => toggleModule(module.id)}
                                                        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                                                    >
                                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                        {expandedModules.has(module.id) ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                        <span className="font-medium flex-1 text-left">{module.title}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {module.lessons?.length || 0} lessons
                                                        </span>
                                                    </button>

                                                    {expandedModules.has(module.id) && (
                                                        <div className="border-t p-4 bg-muted/30">
                                                            {module.lessons?.map((lesson) => (
                                                                <div key={lesson.id} className="flex items-center gap-3 py-2 pl-8">
                                                                    <Video className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="flex-1">{lesson.title}</span>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="mt-2 ml-8"
                                                                onClick={() => handleAddLesson(module.id)}
                                                            >
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Add Lesson
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {isNew
                                        ? 'Save the course to start adding modules and lessons.'
                                        : 'Course is in draft mode. Publish when ready.'}
                                </p>
                                {!isNew && (
                                    <Button className="w-full" variant="outline" onClick={() => courseId && api.publishCourse(courseId)}>
                                        Publish Course
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
