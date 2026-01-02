// Django Backend API Service
const API_BASE_URL = 'https://linkup-neon-ten.vercel.app';

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

// API Types based on Django backend
export interface APIUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
  bio?: string;
  profile_picture?: string;
}

export interface APIInstructor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_instructor: boolean;
}

export interface APILesson {
  id: number;
  course: number;
  title: string;
  description: string;
  content?: string;
  youtube_url?: string;
  duration_minutes: number;
  order: number;
  quizzes?: APIQuiz[];
}

export interface APICourse {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail?: string;
  instructor?: APIInstructor;
  is_published: boolean;
  lessons?: APILesson[];
}

export interface APIUserProgress {
  id: number;
  user: number;
  lesson: number;
  completed: boolean;
  last_watched?: string;
  completion_date?: string;
}

export interface APIQuiz {
  id: number;
  lesson: number;
  title: string;
  passing_score: number;
  questions?: APIQuestion[];
}

export interface APIQuestion {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  answers?: APIAnswer[];
}

export interface APIAnswer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface APILiveSession {
  id: number;
  title: string;
  description: string;
  instructor?: APIInstructor;
  course?: number;
  youtube_live_url?: string;
  scheduled_start: string;
  scheduled_end: string;
  is_active: boolean;
  max_participants: number;
}

export interface APICertificate {
  id: number;
  user: number;
  course: number;
  issued_date: string;
  certificate_id: string;
}

export interface APIBadge {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

export interface APIStreak {
  id: number;
  user: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

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
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }

    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  }

  // Courses
  getCourses(): Promise<APICourse[]> {
    return this.request<APICourse[]>('/api/courses/');
  }

  getCourse(id: number): Promise<APICourse> {
    return this.request<APICourse>(`/api/courses/${id}/`);
  }

  createCourse(data: Partial<APICourse>): Promise<APICourse> {
    return this.request<APICourse>('/api/courses/', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  updateCourse(id: number, data: Partial<APICourse>): Promise<APICourse> {
    return this.request<APICourse>(`/api/courses/${id}/`, {
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
  getLessons(courseId?: number): Promise<APILesson[]> {
    const query = courseId ? `?course=${courseId}` : '';
    return this.request<APILesson[]>(`/api/lessons/${query}`);
  }

  getLesson(id: number): Promise<APILesson> {
    return this.request<APILesson>(`/api/lessons/${id}/`);
  }

  createLesson(data: Partial<APILesson>): Promise<APILesson> {
    return this.request<APILesson>('/api/lessons/', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  updateLesson(id: number, data: Partial<APILesson>): Promise<APILesson> {
    return this.request<APILesson>(`/api/lessons/${id}/`, {
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
  getUserProgress(): Promise<APIUserProgress[]> {
    return this.request<APIUserProgress[]>('/api/user-progress/');
  }

  markLessonComplete(lessonId: number): Promise<APIUserProgress> {
    return this.request<APIUserProgress>('/api/user-progress/', {
      method: 'POST',
      body: { lesson: lessonId, completed: true } as unknown as BodyInit,
    });
  }

  // Quizzes
  getQuizzes(): Promise<APIQuiz[]> {
    return this.request<APIQuiz[]>('/api/quizzes/');
  }

  getQuiz(id: number): Promise<APIQuiz> {
    return this.request<APIQuiz>(`/api/quizzes/${id}/`);
  }

  submitQuizAttempt(quizId: number, answers: Record<number, number>): Promise<any> {
    return this.request<any>('/api/quiz-attempts/', {
      method: 'POST',
      body: { quiz: quizId, answers } as unknown as BodyInit,
    });
  }

  // Live Sessions
  getLiveSessions(): Promise<APILiveSession[]> {
    return this.request<APILiveSession[]>('/api/live-sessions/');
  }

  joinSession(sessionId: number): Promise<any> {
    return this.request<any>('/api/live-attendance/', {
      method: 'POST',
      body: { session: sessionId } as unknown as BodyInit,
    });
  }

  // Certificates
  getCertificates(): Promise<APICertificate[]> {
    return this.request<APICertificate[]>('/api/certificates/');
  }

  // Badges
  getBadges(): Promise<APIBadge[]> {
    return this.request<APIBadge[]>('/api/badges/');
  }

  getUserBadges(): Promise<any[]> {
    return this.request<any[]>('/api/badge-awards/');
  }

  // Streaks
  getStreaks(): Promise<APIStreak[]> {
    return this.request<APIStreak[]>('/api/streaks/');
  }

  // Users
  getUsers(): Promise<APIUser[]> {
    return this.request<APIUser[]>('/api/users/');
  }

  getUser(id: number): Promise<APIUser> {
    return this.request<APIUser>(`/api/users/${id}/`);
  }

  // Forum
  getThreads(courseId?: number): Promise<any[]> {
    const query = courseId ? `?course=${courseId}` : '';
    return this.request<any[]>(`/api/threads/${query}`);
  }

  getThread(id: number): Promise<any> {
    return this.request<any>(`/api/threads/${id}/`);
  }

  createThread(data: FormData): Promise<any> {
    return this.request<any>('/api/threads/', {
      method: 'POST',
      body: data,
    });
  }

  // Code Execution
  runCode(code: string, lessonId: number): Promise<{ submission_id: number; status: string }> {
    return this.request<{ submission_id: number; status: string }>('/courses/run-code/', {
      method: 'POST',
      body: { code, lesson_id: lessonId } as unknown as BodyInit,
    });
  }

  getSubmissionStatus(submissionId: number): Promise<any> {
    return this.request<any>(`/courses/submission-status/${submissionId}/`);
  }

  // AI Tutor
  askAI(question: string, lessonId: number): Promise<{ answer: string; conversation_id: number }> {
    return this.request<{ answer: string; conversation_id: number }>('/courses/ai-query/', {
      method: 'POST',
      body: { question, lesson_id: lessonId } as unknown as BodyInit,
    });
  }

  // Auth
  async login(username: string, password: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const csrftoken = getCookie('csrftoken');

    const response = await fetch(`${this.baseURL}/users/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrftoken || '',
      },
      body: formData,
    });

    return response.ok;
  }

  async register(username: string, email: string, password: string, passwordConfirm: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirm', passwordConfirm);

    const csrftoken = getCookie('csrftoken');

    const response = await fetch(`${this.baseURL}/users/register/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrftoken || '',
      },
      body: formData,
    });

    return response.ok;
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
