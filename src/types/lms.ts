// LMS Type Definitions - FastAPI Backend Types
// Re-export types from api.ts for backward compatibility

export type {
  User,
  AuthToken,
  AuthResponse,
  Lesson,
  Module,
  Course,
  PaginatedResponse,
  APIError,
} from '@/services/api';

// Additional types used across the app
export type { AppUser } from '@/contexts/AuthContext';

// =============================================================================
// Progress Types
// =============================================================================

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

// =============================================================================
// Quiz Types
// =============================================================================

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

// =============================================================================
// Live Session Types
// =============================================================================

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

// =============================================================================
// Certificate & Badge Types
// =============================================================================

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

// =============================================================================
// Forum Types
// =============================================================================

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; profile_picture_url?: string };
  created_at: string;
  posts_count?: number;
  course_id?: string;
}

// =============================================================================
// Code Execution Types
// =============================================================================

export interface CodeSubmissionResponse {
  submission_id: string;
  status: string;
}

export interface SubmissionStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

// =============================================================================
// AI Types
// =============================================================================

export interface AIResponse {
  answer: string;
  conversation_id: string;
}

// =============================================================================
// Standard Response Types
// =============================================================================

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
}

// Legacy type aliases for backward compatibility
export type Instructor = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type AuthResult = { success: boolean; error?: string };
