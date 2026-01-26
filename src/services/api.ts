// FastAPI Backend API Service
// Base URL configured via Vite proxy (dev) and Vercel rewrites (prod)

import {
  User,
  Course,
  Module,
  Lesson,
  AuthToken,
  AuthResponse,
  RefreshTokenResponse,
  PaginatedResponse,
  SuccessResponse,
} from '@/types/lms';

const API_BASE = '/api/v1';
const TOKEN_KEY = 'kukekodes_access_token';
const REFRESH_TOKEN_KEY = 'kukekodes_refresh_token';
const USER_KEY = 'kukekodes_user';

// ============ Token Management ============
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ============ API Request Helper ============
class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Handle body
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 - try token refresh
      if (response.status === 401 && requiresAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${getAccessToken()}`;
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            throw new Error('Request failed after token refresh');
          }
          return await retryResponse.json();
        } else {
          clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        console.error('API request failed', { url, status: response.status, error });
        throw new Error(error.detail || error.message || 'Request failed');
      }

      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error', { url, error });
      throw error;
    }
  }

  // ============ Auth Endpoints ============
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    country?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/auth/register',
      { method: 'POST', body: data as unknown as BodyInit },
      false
    );

    // Store tokens and user
    setTokens(response.token.access_token, response.token.refresh_token);
    setStoredUser(response.user);

    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: { email, password } as unknown as BodyInit },
      false
    );

    // Store tokens and user
    setTokens(response.token.access_token, response.token.refresh_token);
    setStoredUser(response.user);

    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await this.request<RefreshTokenResponse>(
        '/auth/refresh-token',
        { method: 'POST', body: { refresh_token: refreshToken } as unknown as BodyInit },
        false
      );

      localStorage.setItem(TOKEN_KEY, response.access_token);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      await this.request<SuccessResponse>('/auth/logout', { method: 'POST' });
    } catch {
      // Continue with local logout even if server fails
    }
    clearTokens();
    return true;
  }

  // ============ Courses Endpoints ============
  async getCourses(params?: {
    page?: number;
    page_size?: number;
    skill_level?: string;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Course>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.page_size) queryParams.append('page_size', String(params.page_size));
    if (params?.skill_level) queryParams.append('skill_level', params.skill_level);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<PaginatedResponse<Course>>(`/courses${query}`, {}, false);
  }

  async getCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}`, {}, false);
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: data as unknown as BodyInit,
    });
  }

  async deleteCourse(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/courses/${id}`, { method: 'DELETE' });
  }

  async publishCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}/publish`, { method: 'POST' });
  }

  async getCoursePreview(id: string): Promise<{
    id: string;
    title: string;
    modules_count: number;
    lessons_count: number;
    is_publishable: boolean;
    validation_errors: string[];
  }> {
    return this.request(`/courses/${id}/preview`, {}, false);
  }

  // ============ Modules Endpoints ============
  async getModule(id: string): Promise<Module> {
    return this.request<Module>(`/modules/${id}`, {}, false);
  }

  async createModule(data: {
    course_id: string;
    title: string;
    description: string;
    order: number;
  }): Promise<Module> {
    return this.request<Module>('/modules', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    return this.request<Module>(`/modules/${id}`, {
      method: 'PUT',
      body: data as unknown as BodyInit,
    });
  }

  async deleteModule(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/modules/${id}`, { method: 'DELETE' });
  }

  // ============ Lessons Endpoints ============
  async getLesson(id: string): Promise<Lesson> {
    return this.request<Lesson>(`/lessons/${id}`, {}, false);
  }

  async createLesson(data: {
    module_id: string;
    title: string;
    description: string;
    youtube_url?: string;
    order: number;
  }): Promise<Lesson> {
    return this.request<Lesson>('/lessons', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: data as unknown as BodyInit,
    });
  }

  async deleteLesson(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(`/lessons/${id}`, { method: 'DELETE' });
  }

  // ============ Health Check ============
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('/health');
    return response.json();
  }

  // ============ Placeholder Methods ============
  // The following methods are placeholders for features not yet available in the new backend.
  // They return mock data or throw errors to indicate the feature is not implemented.

  // Code Execution (not yet in new backend)
  async runCode(code: string, lessonId: string): Promise<{ submission_id: string }> {
    console.warn('Code execution is not yet available in the new backend');
    throw new Error('Code execution feature is coming soon');
  }

  async getSubmissionStatus(submissionId: string): Promise<{
    status: string;
    output?: string;
    error?: string;
  }> {
    console.warn('Submission status is not yet available in the new backend');
    throw new Error('Code execution feature is coming soon');
  }

  // AI Tutoring (not yet in new backend)
  async askAI(question: string, lessonId: string): Promise<{ answer: string }> {
    console.warn('AI Tutoring is not yet available in the new backend');
    throw new Error('AI Tutor feature is coming soon');
  }

  // Quiz (not yet in new backend)
  async getQuiz(quizId: string): Promise<{
    id: string;
    title: string;
    passing_score: number;
    questions: Array<{
      id: string;
      question_text: string;
      answers: Array<{
        id: string;
        answer_text: string;
        is_correct: boolean;
      }>;
    }>;
  }> {
    console.warn('Quiz feature is not yet available in the new backend');
    throw new Error('Quiz feature is coming soon');
  }

  async submitQuizAttempt(quizId: string, answers: Record<string, string>): Promise<{
    score: number;
    passed: boolean;
  }> {
    console.warn('Quiz submission is not yet available in the new backend');
    throw new Error('Quiz feature is coming soon');
  }

  // Forum (not yet in new backend)
  async getThreads(): Promise<Array<{
    id: string;
    title: string;
    author: string;
    replies_count: number;
    created_at: string;
  }>> {
    console.warn('Forum is not yet available in the new backend');
    return []; // Return empty array to show no threads
  }

  async createThread(title: string, content: string): Promise<{
    id: string;
    title: string;
  }> {
    console.warn('Forum thread creation is not yet available in the new backend');
    throw new Error('Forum feature is coming soon');
  }

  // Live Sessions (not yet in new backend)
  async getLiveSessions(): Promise<Array<{
    id: string;
    title: string;
    instructor: string;
    scheduled_at: string;
    status: string;
  }>> {
    console.warn('Live sessions are not yet available in the new backend');
    return []; // Return empty array
  }

  async joinSession(sessionId: string): Promise<{ join_url: string }> {
    console.warn('Joining live sessions is not yet available in the new backend');
    throw new Error('Live sessions feature is coming soon');
  }
}

// Export singleton instance
export const api = new APIService();
export default api;

// Helper to extract YouTube video ID
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Re-export types for convenience
export type { User, Course, Module, Lesson, AuthToken, AuthResponse };
