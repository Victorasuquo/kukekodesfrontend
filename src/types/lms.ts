// LMS Type Definitions - Consolidated API Types
// These types match the Django backend API responses

// ============ User Types ============
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
  bio?: string;
  profile_picture?: string;
}

export interface Instructor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
}

// ============ Course Types ============
export interface Lesson {
  id: number;
  course: number;
  title: string;
  description: string;
  content?: string;
  youtube_url?: string;
  duration_minutes: number;
  order: number;
  quizzes?: Quiz[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail?: string;
  instructor?: Instructor;
  is_published: boolean;
  lessons?: Lesson[];
}

// ============ Progress Types ============
export interface UserProgress {
  id: number;
  user: number;
  lesson: number;
  completed: boolean;
  last_watched?: string;
  completion_date?: string;
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

// ============ Quiz Types ============
export interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  answers?: Answer[];
}

export interface Quiz {
  id: number;
  lesson: number;
  title: string;
  passing_score: number;
  questions?: Question[];
}

// ============ Live Session Types ============
export interface LiveSession {
  id: number;
  title: string;
  description: string;
  instructor?: Instructor;
  course?: number;
  youtube_live_url?: string;
  scheduled_start: string;
  scheduled_end: string;
  is_active: boolean;
  max_participants: number;
}

// ============ Certificate & Badge Types ============
export interface Certificate {
  id: number;
  user: number;
  course: number;
  issued_date: string;
  certificate_id: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

export interface Streak {
  id: number;
  user: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

// ============ Forum Types ============
export interface Thread {
  id: number;
  title: string;
  content: string;
  author: { username: string; profile_picture?: string };
  created_at: string;
  posts_count?: number;
  course?: number;
}

// ============ Code Execution Types ============
export interface CodeSubmissionResponse {
  submission_id: number;
  status: string;
}

export interface SubmissionStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

// ============ AI Types ============
export interface AIResponse {
  answer: string;
  conversation_id: number;
}

// ============ Auth Types ============
export interface AuthResult {
  success: boolean;
  status?: number;
  data?: unknown;
}

// ============ Frontend User (mapped) ============
export interface AppUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isInstructor: boolean;
  bio?: string;
  profilePicture?: string;
}
