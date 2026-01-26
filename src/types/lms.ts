// LMS Type Definitions - FastAPI Backend Types
// These types match the new FastAPI backend API responses

// ============ Auth Types ============
export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_picture_url?: string;
  country?: string;
  role: 'student' | 'instructor' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
  message: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============ Course Types ============
export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  youtube_url?: string;
  youtube_video_id?: string;
  duration_minutes: number;
  thumbnail_url?: string;
  transcript?: string;
  resources?: Record<string, string>;
  order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructor_id: string;
  status: 'draft' | 'published';
  is_free: boolean;
  cover_image_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  average_rating?: string;
  total_reviews?: number;
  total_enrollments: number;
  total_estimated_hours?: number;
  modules?: Module[];
  created_at: string;
  published_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// ============ Progress Types ============
export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
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
  id: string;
  answer_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  answers?: Answer[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  questions?: Question[];
}

// ============ Live Session Types ============
export interface LiveSession {
  id: string;
  title: string;
  description: string;
  instructor_id?: string;
  course_id?: string;
  youtube_live_url?: string;
  scheduled_start: string;
  scheduled_end: string;
  is_active: boolean;
  max_participants: number;
}

// ============ Certificate & Badge Types ============
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_date: string;
  certificate_id: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

// ============ Forum Types ============
export interface Thread {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; profile_picture_url?: string };
  created_at: string;
  posts_count?: number;
  course_id?: string;
}

// ============ Code Execution Types ============
export interface CodeSubmissionResponse {
  submission_id: string;
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
  conversation_id: string;
}

// ============ API Standard Responses ============
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
}

// ============ Frontend User (mapped) ============
export interface AppUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  profilePicture?: string;
  country?: string;
}

// Legacy compatibility
export type Instructor = Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
export type AuthResult = { success: boolean; error?: string };
