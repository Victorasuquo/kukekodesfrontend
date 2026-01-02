// LMS Type Definitions

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  duration: number; // in minutes
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  completedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  lessonProgress: LessonProgress[];
  startedAt: string;
  lastAccessedAt: string;
}

export interface UserProgress {
  userId: string;
  courses: CourseProgress[];
}
