import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api, { Course } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCardSkeleton } from '@/components/ui/card-skeleton';
import { BookOpen, Clock, Users, ArrowRight, BarChart3 } from 'lucide-react';
import coursePython from '@/assets/course-python.jpg';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await api.getCourses();
                setCourses(data);
            } catch (error) {
                // Error handled by logger in api.ts
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = filter === 'all'
        ? courses
        : courses.filter(c => c.level === filter);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        Explore Our <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Courses</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Start your journey with our free, AI-powered coding courses. Learn at your own pace.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                        <Button
                            key={level}
                            variant={filter === level ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(level)}
                        >
                            {level === 'all' ? 'All Levels' : level}
                        </Button>
                    ))}
                </div>

                {/* Course Grid */}
                {loading ? (
                    <CourseCardSkeleton />
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No courses found</h3>
                        <p className="text-muted-foreground">
                            {filter === 'all' ? 'Check back soon for new content!' : `No ${filter} courses available yet.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course) => (
                            <Card
                                key={course.id}
                                className="group overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.thumbnail || coursePython}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                                    {/* Level Badge */}
                                    <Badge className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-foreground border-border/50">
                                        <BarChart3 className="w-3 h-3 mr-1" />
                                        {course.level}
                                    </Badge>
                                </div>

                                <CardContent className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        {course.instructor && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {course.instructor.first_name}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {course.lessons?.length || 0} lessons
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                                    >
                                        <Link to={`/courses/${course.id}`}>
                                            Start Learning
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
