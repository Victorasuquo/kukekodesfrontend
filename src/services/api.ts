// FastAPI Backend API Service
// Robust implementation with direct URL, error handling, and proper typing

import { logger } from '@/lib/logger';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Use direct backend URL to bypass proxy DNS issues
const API_BASE_URL = import.meta.env.PROD
  ? '' // Production uses Vercel rewrites
  : 'https://kukekodesbackend-714266210254.europe-west1.run.app';

const API_PREFIX = '/api/v1';

// Storage keys
const TOKEN_KEY = 'kukekodes_access_token';
const REFRESH_TOKEN_KEY = 'kukekodes_refresh_token';
const USER_KEY = 'kukekodes_user';

// =============================================================================
// TYPES - Matching exact API response schemas
// =============================================================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string | null;
  profile_picture_url?: string | null;
  country?: string | null;
  role: 'student' | 'instructor' | 'admin';
  is_active: boolean;
  created_at?: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
  message: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  duration_minutes?: number;
  thumbnail_url?: string | null;
  transcript?: string | null;
  resources?: Record<string, string> | null;
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
  cover_image_url?: string | null;
  thumbnail_url?: string | null;
  is_featured?: boolean;
  average_rating?: string | null;
  total_reviews?: number;
  total_enrollments: number;
  total_estimated_hours?: number;
  modules?: Module[];
  created_at: string;
  published_at?: string | null;
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

export interface APIError {
  detail: string;
  error_code?: string;
}

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

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

// =============================================================================
// API SERVICE CLASS
// =============================================================================

class APIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL + API_PREFIX;
  }

  // ---------------------------------------------------------------------------
  // Core Request Method
  // ---------------------------------------------------------------------------
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

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
      mode: 'cors',
    };

    // Handle body serialization
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    logger.info(`API Request: ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, config);

      // Handle 401 - try token refresh
      if (response.status === 401 && requiresAuth) {
        logger.info('Token expired, attempting refresh...');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${getAccessToken()}`;
          const retryResponse = await fetch(url, { ...config, headers });
          if (!retryResponse.ok) {
            const error = await this.parseError(retryResponse);
            throw new Error(error);
          }
          return await retryResponse.json();
        } else {
          clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.parseError(response);
        logger.error(`API Error: ${response.status} - ${error}`);
        throw new Error(error);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      logger.info(`API Response: ${endpoint} - Success`);
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        logger.error('Network error - unable to reach API server');
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  private async parseError(response: Response): Promise<string> {
    try {
      const data = await response.json();

      // Handle FastAPI validation errors (array of objects)
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((err: any) => `${err.loc?.[err.loc.length - 1] || 'Field'}: ${err.msg}`)
          .join('\n');
      }

      // Handle standard error format
      if (typeof data.detail === 'string') {
        return data.detail;
      }

      return data.message || `Request failed (${response.status})`;
    } catch {
      return `Request failed (${response.status})`;
    }
  }

  // ---------------------------------------------------------------------------
  // Auth Endpoints
  // ---------------------------------------------------------------------------
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
      const response = await this.request<{ access_token: string; token_type: string; expires_in: number }>(
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

  async logout(): Promise<void> {
    try {
      await this.request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // Continue with local logout even if server fails
    }
    clearTokens();
  }

  // ---------------------------------------------------------------------------
  // Courses Endpoints
  // ---------------------------------------------------------------------------
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

    try {
      return await this.request<PaginatedResponse<Course>>(`/courses${query}`, {}, false);
    } catch (error) {
      // Return empty response on error so UI doesn't break
      logger.error('Failed to fetch courses', error);
      return { data: [], meta: { total: 0, page: 1, page_size: 10, total_pages: 0 } };
    }
  }

  async getCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}`, {}, false);
  }

  async createCourse(data: {
    title: string;
    description: string;
    skill_level: string;
    category: string;
    tags?: string[];
    is_free?: boolean;
  }): Promise<Course> {
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

  async deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/courses/${id}`, { method: 'DELETE' });
  }

  async publishCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}/publish`, { method: 'POST' });
  }

  // ---------------------------------------------------------------------------
  // Modules Endpoints
  // ---------------------------------------------------------------------------
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

  async deleteModule(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/modules/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // Lessons Endpoints
  // ---------------------------------------------------------------------------
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

  async deleteLesson(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/lessons/${id}`, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.json();
    } catch {
      return { status: 'unreachable' };
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const api = new APIService();
export default api;

// Helper to extract YouTube video ID
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
