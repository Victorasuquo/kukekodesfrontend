import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Course } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCardSkeleton } from '@/components/ui/card-skeleton';
import {
    BookOpen, Clock, Play, ArrowRight, Award, Target,
    TrendingUp, Calendar, Settings, LogOut
} from 'lucide-react';
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

        const fetchCourses = async () => {
            try {
                const response = await api.getCourses({ page_size: 6 });
                setCourses(response?.data || []);
            } catch (error) {
                console.error('Failed to fetch courses', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Count total lessons from modules
    const getLessonCount = (course: Course): number => {
        if (!course.modules) return 0;
        return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, <span className="text-primary">{user.firstName || user.name}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Continue your learning journey
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {(isAdmin || isInstructor) && (
                            <Button variant="outline" asChild>
                                <Link to="/admin">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Admin Panel
                                </Link>
                            </Button>
                        )}
                        <Button variant="ghost" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                    <p className="text-sm text-muted-foreground">Courses Available</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-sm text-muted-foreground">Enrolled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">0</p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Courses */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Available Courses</h2>
                            <p className="text-muted-foreground">Start learning something new today</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/courses">
                                View All
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {loading ? (
                        <CourseCardSkeleton />
                    ) : courses.length === 0 ? (
                        <Card className="p-12 text-center">
                            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Courses will appear here once they're published
                            </p>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.slice(0, 6).map((course) => (
                                <Card key={course.id} className="group overflow-hidden hover:border-primary/50 transition-all">
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={course.thumbnail_url || course.cover_image_url || coursePython}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                                        <Badge className="absolute top-3 left-3 bg-card/90">
                                            {levelLabels[course.skill_level] || course.skill_level}
                                        </Badge>
                                        {course.is_free && (
                                            <Badge className="absolute top-3 right-3 bg-primary">Free</Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {getLessonCount(course)} lessons
                                            </span>
                                            <span>{course.total_enrollments || 0} enrolled</span>
                                        </div>
                                        <Button asChild className="w-full" size="sm">
                                            <Link to={`/courses/${course.id}`}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Course
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/courses')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Browse Courses</h3>
                                <p className="text-sm text-muted-foreground">Explore all available courses</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/live')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Live Sessions</h3>
                                <p className="text-sm text-muted-foreground">Join live coding sessions</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/community')}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Award className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Community</h3>
                                <p className="text-sm text-muted-foreground">Connect with other learners</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
