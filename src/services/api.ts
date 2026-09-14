// FastAPI Backend API Service

import { logger } from '@/lib/logger';

// =============================================================================
// CONFIGURATION
// =============================================================================

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, '');

const API_PREFIX = '/api/v1';

// Storage keys
const TOKEN_KEY = 'kukekodes_access_token';
const REFRESH_TOKEN_KEY = 'kukekodes_refresh_token';
const USER_KEY = 'kukekodes_user';
let accessTokenMemory: string | null = null;

// =============================================================================
// TYPES - Matching exact API response schemas
// =============================================================================

export interface User {
  id: string;
  learner_id?: string | null;
  email: string;
  contact_email?: string | null;
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

export interface Membership {
  organization_id: string;
  role: 'owner' | 'admin' | 'instructor' | 'student';
  status: string;
  joined_at: string;
}

export interface SessionResponse {
  user: User;
  memberships: Membership[];
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  owner_user_id: string;
  status: string;
  timezone: string;
  created_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  recipient_email?: string | null;
  role: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
  token?: string | null;
}

export interface Cohort {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  status: string;
  created_at: string;
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
  exercise_runtime?: 'python' | 'javascript' | null;
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
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  request_id?: string;
}

export type APICourse = Course;

export interface APIUserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string | null;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string | null;
  resume_position_seconds?: number;
}

export interface APIQuizAnswer {
  id: string;
  answer_text: string;
  is_correct?: boolean;
}

export interface APIQuizQuestion {
  id: string;
  question_text: string;
  answers: APIQuizAnswer[];
}

export interface APIQuiz {
  id: string;
  course_id: string;
  title: string;
  passing_score: number;
  questions: APIQuizQuestion[];
}

export interface APICertificate {
  id: string;
  certificate_id: string;
  verification_code: string;
  course_id: string;
  course_title: string;
  issued_at: string;
  is_revoked?: boolean;
  download_url?: string | null;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status?: 'active' | 'completed' | 'withdrawn';
  completion_percentage: number;
  is_completed: boolean;
  enrolled_at: string;
  completed_at?: string | null;
  course_title?: string;
  course_cover_url?: string | null;
}

export interface LessonProgressItem {
  id?: string;
  lesson_id?: string;
  is_completed: boolean;
  progress_percentage?: number;
}

export interface CourseProgress {
  course_id: string;
  course_title?: string;
  completion_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  is_completed: boolean;
  modules?: Array<{ module_id: string; title?: string; lessons?: LessonProgressItem[] }>;
}

export interface ProgressDashboard {
  statistics: {
    total_courses_enrolled: number;
    total_courses_completed: number;
    total_lessons_completed: number;
    total_time_spent_hours: number;
    badges_earned: number;
  };
  enrolled_courses?: Array<{
    course_id: string;
    course_title: string;
    cover_image_url?: string | null;
    completion_percentage: number;
    is_completed: boolean;
    enrolled_at: string;
  }>;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  submitted_at: string;
  certificate_available?: boolean;
}

export interface CoursePreview {
  course_id: string;
  is_publishable: boolean;
  validation_errors: string[];
}

export interface CoursePublishResponse {
  course_id: string;
  status: string;
  published_at?: string | null;
  message?: string;
}

export interface LiveSession {
  id: number;
  title: string;
  description?: string | null;
  course?: string | number | null;
  scheduled_start: string;
  scheduled_end: string;
  max_participants?: number | null;
  is_active: boolean;
  youtube_live_url?: string | null;
  instructor?: Pick<User, 'first_name' | 'last_name'> | null;
  recording_url?: string | null;
  attendance_status?: 'joined' | 'attended' | null;
}

export interface CommunityThread {
  id: string;
  title: string;
  content: string;
  course_id?: string | null;
  organization_id?: string | null;
  author?: { id: string; name?: string; username?: string } | null;
  created_at: string;
  updated_at?: string;
  replies_count?: number;
  moderation_status?: 'visible' | 'pending' | 'hidden' | 'removed';
}

export interface CommunityReply {
  id: string;
  thread_id: string;
  content: string;
  author?: { id: string; name?: string; username?: string } | null;
  created_at: string;
  moderation_status?: 'visible' | 'pending' | 'hidden' | 'removed';
}

export interface CommunityReport { id: string; status: string; created_at: string; }
export interface CodeSubmission {
  submission_id: string;
  runtime: 'javascript' | 'python';
  status: 'queued' | 'running' | 'completed' | 'failed';
  output?: string | null;
  error?: string | null;
  score?: number | null;
  created_at?: string;
}

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

export function getAccessToken(): string | null {
  return accessTokenMemory || localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, _refreshToken: string): void {
  accessTokenMemory = accessToken;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  accessTokenMemory = null;
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
      credentials: 'include',
    };

    // Handle body serialization
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    logger.info(`API Request: ${options.method || 'GET'} ${endpoint}`, config.body);

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

      if (typeof data.code === 'string' && typeof data.message === 'string') {
        return data.message;
      }

      // Handle FastAPI validation errors (array of objects)
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((err: { loc?: Array<string | number>; msg?: string }) => `${err.loc?.[err.loc.length - 1] || 'Field'}: ${err.msg || 'Invalid value'}`)
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

  async login(learnerId: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: { learner_id: learnerId, password } as unknown as BodyInit },
      false
    );

    // Store tokens and user
    setTokens(response.token.access_token, response.token.refresh_token);
    setStoredUser(response.user);

    return response;
  }

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/admin/auth/login',
      { method: 'POST', body: { email, password } as unknown as BodyInit },
      false
    );

    setTokens(response.token.access_token, response.token.refresh_token);
    setStoredUser(response.user);

    return response;
  }

  async refreshAdminAccessToken(): Promise<boolean> {
    try {
      const response = await this.request<{ access_token: string; token_type: string; expires_in: number }>(
        '/admin/auth/refresh',
        { method: 'POST' },
        false
      );

      accessTokenMemory = response.access_token;
      localStorage.removeItem(TOKEN_KEY);
      return true;
    } catch {
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await this.request<{ access_token: string; token_type: string; expires_in: number }>(
        '/auth/refresh',
        { method: 'POST' },
        false
      );

      accessTokenMemory = response.access_token;
      localStorage.removeItem(TOKEN_KEY);
      return true;
    } catch {
      return false;
    }
  }

  async getSession(): Promise<SessionResponse> {
    return this.request<SessionResponse>('/auth/session');
  }

  async logout(): Promise<void> {
    await Promise.allSettled([
      this.request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }),
      this.request<{ success: boolean; message: string }>('/admin/auth/logout', { method: 'POST' }, false),
    ]);
    clearTokens();
  }

  async logoutAll(): Promise<void> {
    try {
      await Promise.allSettled([
        this.request<{ success: boolean; message: string }>('/auth/logout-all', { method: 'POST' }),
        this.request<{ success: boolean; message: string }>('/admin/auth/logout', { method: 'POST' }, false),
      ]);
    } finally {
      clearTokens();
    }
  }

  async requestPasswordRecovery(contactEmail: string, learnerId: string): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/recovery/request', {
      method: 'POST',
      body: { contact_email: contactEmail, learner_id: learnerId } as unknown as BodyInit,
    }, false);
  }

  async listOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/organizations');
  }

  async createOrganization(data: { name: string; slug: string; timezone?: string }): Promise<Organization> {
    return this.request<Organization>('/organizations', {
      method: 'POST',
      body: data as unknown as BodyInit,
    });
  }

  async listOrganizationMemberships(organizationId: string): Promise<OrganizationMembership[]> {
    return this.request<OrganizationMembership[]>(`/organizations/${organizationId}/memberships`);
  }

  async addOrganizationMemberByLearnerId(data: {
    organizationId: string;
    learnerId: string;
    role: 'owner' | 'admin' | 'instructor' | 'student';
  }): Promise<OrganizationMembership> {
    return this.request<OrganizationMembership>(`/organizations/${data.organizationId}/memberships/by-learner-id`, {
      method: 'POST',
      body: { learner_id: data.learnerId, role: data.role } as unknown as BodyInit,
    });
  }

  async createOrganizationInvitation(data: {
    organizationId: string;
    recipientEmail?: string;
    role: 'owner' | 'admin' | 'instructor' | 'student';
    expiresInDays?: number;
  }): Promise<OrganizationInvitation> {
    return this.request<OrganizationInvitation>(`/organizations/${data.organizationId}/invitations`, {
      method: 'POST',
      body: {
        recipient_email: data.recipientEmail || null,
        role: data.role,
        expires_in_days: data.expiresInDays || 7,
      } as unknown as BodyInit,
    });
  }

  async listCohorts(organizationId: string): Promise<Cohort[]> {
    return this.request<Cohort[]>(`/organizations/${organizationId}/cohorts`);
  }

  async createCohort(data: { organizationId: string; name: string; description?: string }): Promise<Cohort> {
    return this.request<Cohort>(`/organizations/${data.organizationId}/cohorts`, {
      method: 'POST',
      body: { name: data.name, description: data.description || null } as unknown as BodyInit,
    });
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

    return this.request<PaginatedResponse<Course>>(`/courses${query}`, {}, false);
  }

  async getAdminCourses(params?: { page?: number; page_size?: number; search?: string }): Promise<PaginatedResponse<Course>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.page_size) queryParams.append('page_size', String(params.page_size));
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<PaginatedResponse<Course>>(`/admin/courses${query}`);
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

  async getCoursePreview(id: string): Promise<CoursePreview> {
    return this.request<CoursePreview>(`/courses/${id}/preview`);
  }

  async publishCourse(id: string): Promise<CoursePublishResponse> {
    return this.request<CoursePublishResponse>(`/courses/${id}/publish`, { method: 'POST' });
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
    duration_minutes?: number;
    transcript?: string;
    resources?: Record<string, string>;
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
  // Launch-plan endpoints. These call real backend contracts once mounted.
  // UI components must render failure/unavailable states instead of fake data.
  // ---------------------------------------------------------------------------
  async askAI(message: string, lessonId: string): Promise<{ answer: string; remaining_quota?: number }> {
    return this.request<{ answer: string }>('/ai/coach', {
      method: 'POST',
      body: { message, lesson_id: lessonId } as unknown as BodyInit,
    });
  }

  async getAIConversation(lessonId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    return this.request(`/ai/conversations?lesson_id=${encodeURIComponent(lessonId)}`);
  }

  async getQuiz(quizId: string): Promise<APIQuiz> {
    return this.request<APIQuiz>(`/quizzes/${quizId}`);
  }

  async submitQuizAttempt(
    quizId: string,
    answers: Record<string, string>
  ): Promise<QuizAttemptResult> {
    return this.request<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: { answers } as unknown as BodyInit,
    });
  }
  async getLatestQuizAttempt(quizId: string): Promise<(QuizAttemptResult & { answers?: Record<string, string> }) | null> {
    return this.request(`\/quizzes\/${quizId}\/attempts\/latest`);
  }

  async listCourseQuizzes(courseId: string): Promise<APIQuiz[]> {
    const response = await this.request<APIQuiz[] | { data: APIQuiz[] }>(`/quizzes/course/${encodeURIComponent(courseId)}`);
    return Array.isArray(response) ? response : response.data;
  }

  async createQuiz(data: {
    course_id: string;
    title: string;
    passing_score: number;
    questions: Array<{ question_text: string; answers: Array<{ answer_text: string; is_correct: boolean }> }>;
  }): Promise<APIQuiz> {
    return this.request<APIQuiz>('/quizzes', { method: 'POST', body: data as unknown as BodyInit });
  }

  async enrollCourse(courseId: string): Promise<Enrollment> {
    return this.request<Enrollment>('/enrollments', {
      method: 'POST',
      body: { course_id: courseId } as unknown as BodyInit,
    });
  }

  async checkEnrollment(courseId: string): Promise<{ course_id: string; is_enrolled: boolean; enrollment?: Enrollment }> {
    return this.request(`/enrollments/check/${courseId}`);
  }

  async getMyEnrollments(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<Enrollment>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    return this.request<PaginatedResponse<Enrollment>>(`/enrollments/my-enrollments${query.size ? `?${query}` : ''}`);
  }

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    return this.request<CourseProgress>(`/progress/course/${courseId}`);
  }

  async markLessonComplete(lessonId: string, timeSpentMinutes = 0): Promise<APIUserProgress> {
    return this.request<APIUserProgress>(`/progress/mark-lesson-complete/${lessonId}`, {
      method: 'POST',
      body: { time_spent_minutes: timeSpentMinutes } as unknown as BodyInit,
    });
  }

  async getLessonProgress(lessonId: string): Promise<APIUserProgress> {
    return this.request<APIUserProgress>(`/progress/lesson/${lessonId}`);
  }

  async syncLessonPosition(lessonId: string, positionSeconds: number, timeSpentMinutes = 0): Promise<APIUserProgress> {
    return this.request<APIUserProgress>(`/progress/lesson/${lessonId}/position`, {
      method: 'PUT',
      body: {
        position_seconds: positionSeconds,
        time_spent_minutes: timeSpentMinutes,
        idempotency_key: crypto.randomUUID(),
      } as unknown as BodyInit,
    });
  }

  async getProgressDashboard(): Promise<ProgressDashboard> {
    return this.request<ProgressDashboard>('/progress/user/dashboard');
  }

  async getCourseCertificate(courseId: string): Promise<APICertificate> {
    return this.request<APICertificate>(`/progress/certificate/${courseId}`);
  }

  async runCode(code: string, lessonId: string, runtime: 'python' | 'javascript' = 'python'): Promise<{ submission_id: string }> {
    return this.request<{ submission_id: string }>('/code/submissions', {
      method: 'POST',
      body: { source: code, lesson_id: lessonId, runtime } as unknown as BodyInit,
    });
  }

  async getSubmissionStatus(
    submissionId: string
  ): Promise<CodeSubmission> {
    return this.request(`/code/submissions/${submissionId}`);
  }

  async getCertificates(): Promise<APICertificate[]> {
    const response = await this.request<APICertificate[] | { certificates: APICertificate[] }>('/progress/certificates');
    return Array.isArray(response) ? response : response.certificates;
  }

  async getLiveSessions(): Promise<LiveSession[]> {
    const response = await this.request<LiveSession[] | PaginatedResponse<LiveSession>>('/live-sessions');
    return Array.isArray(response) ? response : response.data;
  }

  async joinSession(sessionId: string | number): Promise<{ join_url?: string }> {
    return this.request<{ join_url?: string }>(`/live-sessions/${sessionId}/join`, {
      method: 'POST',
    });
  }

  async getSessionDetails(sessionId: string | number): Promise<LiveSession> {
    return this.request<LiveSession>(`/live-sessions/${sessionId}`);
  }

  async markSessionAttendance(sessionId: string | number): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/live-sessions/${sessionId}/attendance`, { method: 'POST' });
  }

  async listCommunityThreads(params?: { course_id?: string; organization_id?: string; page?: number; page_size?: number }): Promise<PaginatedResponse<CommunityThread>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
    return this.request<PaginatedResponse<CommunityThread>>(`/community/threads${query.size ? `?${query}` : ''}`);
  }

  async createCommunityThread(data: { title: string; content: string; course_id?: string; organization_id?: string }): Promise<CommunityThread> {
    return this.request<CommunityThread>('/community/threads', { method: 'POST', body: data as unknown as BodyInit });
  }

  async listCommunityReplies(threadId: string): Promise<PaginatedResponse<CommunityReply>> {
    return this.request<PaginatedResponse<CommunityReply>>(`/community/threads/${threadId}/replies`);
  }

  async createCommunityReply(threadId: string, content: string): Promise<CommunityReply> {
    return this.request<CommunityReply>(`/community/threads/${threadId}/replies`, { method: 'POST', body: { content } as unknown as BodyInit });
  }

  async reportCommunityContent(data: { thread_id?: string; reply_id?: string; reason: string }): Promise<CommunityReport> {
    const content_id = data.thread_id || data.reply_id;
    return this.request<CommunityReport>('/community/reports', { method: 'POST', body: { content_id, reason: data.reason } as unknown as BodyInit });
  }

  async blockCommunityUser(userId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>('/community/blocks', { method: 'POST', body: { user_id: userId } as unknown as BodyInit });
  }

  async getCodeSubmissionHistory(lessonId: string): Promise<CodeSubmission[]> {
    const response = await this.request<CodeSubmission[] | { data: CodeSubmission[] }>(`/code/submissions?lesson_id=${encodeURIComponent(lessonId)}`);
    return Array.isArray(response) ? response : response.data;
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/readyz`, { credentials: 'include' });
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
  const regex = new RegExp('(?:youtube\\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\\.be/)([^"&?/\\s]{11})');
  const match = url.match(regex);
  return match ? match[1] : null;
};
