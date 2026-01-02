import { Course, Module, Lesson, CourseProgress, UserProgress } from '@/types/lms';
import { mockCourses } from '@/data/mockCourses';

const COURSES_STORAGE_KEY = 'kukekodes_courses';
const PROGRESS_STORAGE_KEY = 'kukekodes_progress';

// Course operations
export const getCourses = (): Course[] => {
  const stored = localStorage.getItem(COURSES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : mockCourses;
};

export const saveCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
};

export const getCourseById = (courseId: string): Course | undefined => {
  return getCourses().find(c => c.id === courseId);
};

export const createCourse = (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'modules'>): Course => {
  const courses = getCourses();
  const newCourse: Course = {
    ...course,
    id: `course-${Date.now()}`,
    modules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  courses.push(newCourse);
  saveCourses(courses);
  return newCourse;
};

export const updateCourse = (courseId: string, updates: Partial<Course>): Course | undefined => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === courseId);
  if (index === -1) return undefined;
  
  courses[index] = { 
    ...courses[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  saveCourses(courses);
  return courses[index];
};

export const deleteCourse = (courseId: string): boolean => {
  const courses = getCourses();
  const filtered = courses.filter(c => c.id !== courseId);
  if (filtered.length === courses.length) return false;
  saveCourses(filtered);
  return true;
};

// Module operations
export const addModule = (courseId: string, module: Omit<Module, 'id' | 'lessons' | 'order'>): Module | undefined => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const newModule: Module = {
    ...module,
    id: `mod-${Date.now()}`,
    lessons: [],
    order: courses[courseIndex].modules.length + 1,
  };
  
  courses[courseIndex].modules.push(newModule);
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return newModule;
};

export const updateModule = (courseId: string, moduleId: string, updates: Partial<Module>): Module | undefined => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const moduleIndex = courses[courseIndex].modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return undefined;

  courses[courseIndex].modules[moduleIndex] = {
    ...courses[courseIndex].modules[moduleIndex],
    ...updates,
  };
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return courses[courseIndex].modules[moduleIndex];
};

export const deleteModule = (courseId: string, moduleId: string): boolean => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return false;

  const filtered = courses[courseIndex].modules.filter(m => m.id !== moduleId);
  if (filtered.length === courses[courseIndex].modules.length) return false;
  
  courses[courseIndex].modules = filtered;
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return true;
};

// Lesson operations
export const addLesson = (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id' | 'order'>): Lesson | undefined => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const moduleIndex = courses[courseIndex].modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return undefined;

  const newLesson: Lesson = {
    ...lesson,
    id: `les-${Date.now()}`,
    order: courses[courseIndex].modules[moduleIndex].lessons.length + 1,
  };

  courses[courseIndex].modules[moduleIndex].lessons.push(newLesson);
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return newLesson;
};

export const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>): Lesson | undefined => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const moduleIndex = courses[courseIndex].modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return undefined;

  const lessonIndex = courses[courseIndex].modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
  if (lessonIndex === -1) return undefined;

  courses[courseIndex].modules[moduleIndex].lessons[lessonIndex] = {
    ...courses[courseIndex].modules[moduleIndex].lessons[lessonIndex],
    ...updates,
  };
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return courses[courseIndex].modules[moduleIndex].lessons[lessonIndex];
};

export const deleteLesson = (courseId: string, moduleId: string, lessonId: string): boolean => {
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return false;

  const moduleIndex = courses[courseIndex].modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return false;

  const filtered = courses[courseIndex].modules[moduleIndex].lessons.filter(l => l.id !== lessonId);
  if (filtered.length === courses[courseIndex].modules[moduleIndex].lessons.length) return false;

  courses[courseIndex].modules[moduleIndex].lessons = filtered;
  courses[courseIndex].updatedAt = new Date().toISOString();
  saveCourses(courses);
  return true;
};

// Progress operations
export const getUserProgress = (userId: string): UserProgress => {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
  const allProgress: UserProgress[] = stored ? JSON.parse(stored) : [];
  const userProgress = allProgress.find(p => p.userId === userId);
  return userProgress || { userId, courses: [] };
};

export const saveUserProgress = (progress: UserProgress) => {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
  const allProgress: UserProgress[] = stored ? JSON.parse(stored) : [];
  const index = allProgress.findIndex(p => p.userId === progress.userId);
  
  if (index === -1) {
    allProgress.push(progress);
  } else {
    allProgress[index] = progress;
  }
  
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
};

export const markLessonComplete = (userId: string, courseId: string, lessonId: string) => {
  const progress = getUserProgress(userId);
  let courseProgress = progress.courses.find(c => c.courseId === courseId);
  
  if (!courseProgress) {
    courseProgress = {
      courseId,
      lessonProgress: [],
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    progress.courses.push(courseProgress);
  }

  let lessonProgress = courseProgress.lessonProgress.find(l => l.lessonId === lessonId);
  
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      completed: true,
      watchedSeconds: 0,
      completedAt: new Date().toISOString(),
    };
    courseProgress.lessonProgress.push(lessonProgress);
  } else {
    lessonProgress.completed = true;
    lessonProgress.completedAt = new Date().toISOString();
  }

  courseProgress.lastAccessedAt = new Date().toISOString();
  saveUserProgress(progress);
};

export const getCourseProgressPercent = (userId: string, courseId: string): number => {
  const progress = getUserProgress(userId);
  const courseProgress = progress.courses.find(c => c.courseId === courseId);
  if (!courseProgress) return 0;

  const course = getCourseById(courseId);
  if (!course) return 0;

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  if (totalLessons === 0) return 0;

  const completedLessons = courseProgress.lessonProgress.filter(l => l.completed).length;
  return Math.round((completedLessons / totalLessons) * 100);
};

export const isLessonComplete = (userId: string, courseId: string, lessonId: string): boolean => {
  const progress = getUserProgress(userId);
  const courseProgress = progress.courses.find(c => c.courseId === courseId);
  if (!courseProgress) return false;
  
  const lessonProgress = courseProgress.lessonProgress.find(l => l.lessonId === lessonId);
  return lessonProgress?.completed || false;
};

// Helper to extract YouTube video ID
export const getYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
