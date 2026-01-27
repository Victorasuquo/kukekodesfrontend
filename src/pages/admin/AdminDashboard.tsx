import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Course } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, BookOpen, Users, Edit, Trash2, Eye, ArrowLeft, Search
} from 'lucide-react';
import coursePython from '@/assets/course-python.jpg';

const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export default function AdminDashboard() {
    const { user, isAdmin, isInstructor } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user || (!isAdmin && !isInstructor)) {
            navigate('/dashboard');
            return;
        }

        const fetchCourses = async () => {
            try {
                const response = await api.getCourses({ page_size: 50 });
                setCourses(response?.data || []);
            } catch (error) {
                console.error('Failed to fetch courses', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user, isAdmin, isInstructor, navigate]);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            await api.deleteCourse(courseId);
            setCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (error) {
            console.error('Failed to delete course', error);
        }
    };

    if (!user || (!isAdmin && !isInstructor)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage courses, modules, and lessons</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Courses</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {courses.filter(c => c.status === 'published').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Published</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                    <Edit className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {courses.filter(c => c.status === 'draft').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Drafts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {courses.reduce((sum, c) => sum + (c.total_enrollments || 0), 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Management */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <CardTitle>Courses</CardTitle>
                                <CardDescription>Create and manage your courses</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-[200px]"
                                    />
                                </div>
                                <Button asChild>
                                    <Link to="/admin/courses/new">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Course
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery ? 'Try a different search term' : 'Create your first course to get started'}
                                </p>
                                <Button asChild>
                                    <Link to="/admin/courses/new">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Course
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                                    >
                                        <img
                                            src={course.thumbnail_url || course.cover_image_url || coursePython}
                                            alt={course.title}
                                            className="w-20 h-14 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{course.title}</h3>
                                                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                                    {course.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{levelLabels[course.skill_level] || course.skill_level}</span>
                                                <span>{course.modules?.length || 0} modules</span>
                                                <span>{course.total_enrollments || 0} enrolled</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/courses/${course.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/admin/courses/${course.id}`}>
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
