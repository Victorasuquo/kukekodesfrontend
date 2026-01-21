// Django Backend API Service
// Use relative URL to leverage Vite Proxy (dev) and Vercel Rewrites (prod)

import {
  User,
  Course,
  Lesson,
  UserProgress,
  Quiz,
  LiveSession,
  Certificate,
  Badge,
  Streak,
  Thread,
  CodeSubmissionResponse,
  SubmissionStatus,
  AIResponse,
  AuthResult,
} from '@/types/lms';
import { logger } from '@/lib/logger';

const API_BASE_URL = '';

function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Re-export types for backward compatibility
export type {
  User as APIUser,
  Course as APICourse,
  Lesson as APILesson,
  UserProgress as APIUserProgress,
  Quiz as APIQuiz,
  LiveSession as APILiveSession,
  Certificate as APICertificate,
  Badge as APIBadge,
  Streak as APIStreak,
};

// Also export the new names
export type {
  User,
  Course,
  Lesson,
  UserProgress,
  Quiz,
  LiveSession,
  Certificate,
  Badge,
  Streak,
  Thread,
};

class APIService {
  private baseURL: string;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const csrftoken = getCookie('csrftoken');

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrftoken || '',
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      // @ts-ignore
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      logger.error('API request failed', { url, status: response.status, error });
      throw new Error(error.detail || error.message || 'Request failed');
    }

    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  }

  // Courses
  getCourses(): Promise<Course[]> {
    return this.request<Course[]>('/api/courses/');
  }

  getCourse(id: number): Promise<Course> {
    return this.request<Course>(`/api/courses/${id}/`);
  }

  createCourse(data: Partial<Course> | FormData): Promise<Course> {
    return this.request<Course>('/api/courses/', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    return this.request<Course>(`/api/courses/${id}/`, {
      method: 'PATCH',
      body: data as unknown as BodyInit,
    });
  }

  deleteCourse(id: number): Promise<void> {
    return this.request<void>(`/api/courses/${id}/`, {
      method: 'DELETE',
    });
  }

  // Lessons
  getLessons(courseId?: number): Promise<Lesson[]> {
    const query = courseId ? `?course=${courseId}` : '';
    return this.request<Lesson[]>(`/api/lessons/${query}`);
  }

  getLesson(id: number): Promise<Lesson> {
    return this.request<Lesson>(`/api/lessons/${id}/`);
  }

  createLesson(data: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>('/api/lessons/', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>(`/api/lessons/${id}/`, {
      method: 'PATCH',
      body: data as unknown as BodyInit,
    });
  }

  deleteLesson(id: number): Promise<void> {
    return this.request<void>(`/api/lessons/${id}/`, {
      method: 'DELETE',
    });
  }

  // Progress
  getUserProgress(): Promise<UserProgress[]> {
    return this.request<UserProgress[]>('/api/user-progress/');
  }

  markLessonComplete(lessonId: number): Promise<UserProgress> {
    return this.request<UserProgress>('/api/user-progress/', {
      method: 'POST',
      body: { lesson: lessonId, completed: true } as unknown as BodyInit,
    });
  }

  // Quizzes
  getQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/api/quizzes/');
  }

  getQuiz(id: number): Promise<Quiz> {
    return this.request<Quiz>(`/api/quizzes/${id}/`);
  }

  submitQuizAttempt(quizId: number, answers: Record<number, number>): Promise<unknown> {
    return this.request<unknown>('/api/quiz-attempts/', {
      method: 'POST',
      body: { quiz: quizId, answers } as unknown as BodyInit,
    });
  }

  // Live Sessions
  getLiveSessions(): Promise<LiveSession[]> {
    return this.request<LiveSession[]>('/api/live-sessions/');
  }

  joinSession(sessionId: number): Promise<unknown> {
    return this.request<unknown>('/api/live-attendance/', {
      method: 'POST',
      body: { session: sessionId } as unknown as BodyInit,
    });
  }

  // Certificates
  getCertificates(): Promise<Certificate[]> {
    return this.request<Certificate[]>('/api/certificates/');
  }

  // Badges
  getBadges(): Promise<Badge[]> {
    return this.request<Badge[]>('/api/badges/');
  }

  getUserBadges(): Promise<unknown[]> {
    return this.request<unknown[]>('/api/badge-awards/');
  }

  // Streaks
  getStreaks(): Promise<Streak[]> {
    return this.request<Streak[]>('/api/streaks/');
  }

  // Users
  getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users/');
  }

  getUser(id: number): Promise<User> {
    return this.request<User>(`/api/users/${id}/`);
  }

  // Forum
  getThreads(courseId?: number): Promise<Thread[]> {
    const query = courseId ? `?course=${courseId}` : '';
    return this.request<Thread[]>(`/api/threads/${query}`);
  }

  getThread(id: number): Promise<Thread> {
    return this.request<Thread>(`/api/threads/${id}/`);
  }

  createThread(data: FormData): Promise<Thread> {
    return this.request<Thread>('/api/threads/', {
      method: 'POST',
      body: data,
    });
  }

  // Code Execution
  runCode(code: string, lessonId: number): Promise<CodeSubmissionResponse> {
    return this.request<CodeSubmissionResponse>('/courses/run-code/', {
      method: 'POST',
      body: { code, lesson_id: lessonId } as unknown as BodyInit,
    });
  }

  getSubmissionStatus(submissionId: number): Promise<SubmissionStatus> {
    return this.request<SubmissionStatus>(`/courses/submission-status/${submissionId}/`);
  }

  // AI Tutor
  askAI(question: string, lessonId: number): Promise<AIResponse> {
    return this.request<AIResponse>('/courses/ai-query/', {
      method: 'POST',
      body: { question, lesson_id: lessonId } as unknown as BodyInit,
    });
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResult> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const csrftoken = getCookie('csrftoken');

    try {
      const response = await fetch(`${this.baseURL}/users/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        body: formData,
      });

      if (response.ok) {
        return { success: true, status: response.status };
      }
      return { success: false, status: response.status, data: await response.text() };
    } catch (error) {
      logger.error('Login failed', error);
      return { success: false, status: 0, data: error };
    }
  }

  async register(username: string, email: string, password: string, passwordConfirm: string): Promise<AuthResult> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirm', passwordConfirm);

    const csrftoken = getCookie('csrftoken');

    try {
      const response = await fetch(`${this.baseURL}/users/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        body: formData,
      });

      if (response.ok) {
        return { success: true, status: response.status };
      }
      return { success: false, status: response.status, data: await response.text() };
    } catch (error) {
      logger.error('Registration failed', error);
      return { success: false, status: 0, data: error };
    }
  }

  async logout(): Promise<boolean> {
    const csrftoken = getCookie('csrftoken');

    const response = await fetch(`${this.baseURL}/users/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrftoken || '',
      },
    });

    return response.ok;
  }
}

export const api = new APIService();
export default api;

// Helper to extract YouTube video ID
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
