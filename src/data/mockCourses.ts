import { Course } from '@/types/lms';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Python for Beginners',
    description: 'Learn Python from scratch with hands-on projects and real-world examples. Perfect for those new to programming.',
    thumbnail: '/placeholder.svg',
    level: 'Beginner',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    modules: [
      {
        id: 'mod-1-1',
        title: 'Getting Started',
        description: 'Introduction to Python and setting up your environment',
        order: 1,
        lessons: [
          {
            id: 'les-1-1-1',
            title: 'What is Python?',
            description: 'An introduction to Python programming language',
            youtubeUrl: 'https://www.youtube.com/watch?v=Y8Tko2YC5hA',
            duration: 10,
            order: 1,
          },
          {
            id: 'les-1-1-2',
            title: 'Installing Python',
            description: 'Step by step guide to install Python on your computer',
            youtubeUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
            duration: 15,
            order: 2,
          },
        ],
      },
      {
        id: 'mod-1-2',
        title: 'Python Basics',
        description: 'Learn the fundamental concepts of Python',
        order: 2,
        lessons: [
          {
            id: 'les-1-2-1',
            title: 'Variables and Data Types',
            description: 'Understanding variables and different data types in Python',
            youtubeUrl: 'https://www.youtube.com/watch?v=cQT33yu9pY8',
            duration: 20,
            order: 1,
          },
          {
            id: 'les-1-2-2',
            title: 'Control Flow',
            description: 'If statements, loops, and conditional logic',
            youtubeUrl: 'https://www.youtube.com/watch?v=Zp5MuPOtsSY',
            duration: 25,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'AI & Machine Learning Fundamentals',
    description: 'Dive into the world of artificial intelligence and machine learning with practical examples.',
    thumbnail: '/placeholder.svg',
    level: 'Intermediate',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Introduction to AI',
        description: 'Understanding artificial intelligence concepts',
        order: 1,
        lessons: [
          {
            id: 'les-2-1-1',
            title: 'What is AI?',
            description: 'An overview of artificial intelligence',
            youtubeUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
            duration: 12,
            order: 1,
          },
          {
            id: 'les-2-1-2',
            title: 'Types of Machine Learning',
            description: 'Supervised, unsupervised, and reinforcement learning',
            youtubeUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
            duration: 18,
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Advanced Data Science',
    description: 'Master data analysis, visualization, and predictive modeling techniques.',
    thumbnail: '/placeholder.svg',
    level: 'Advanced',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Data Analysis with Pandas',
        description: 'Advanced data manipulation techniques',
        order: 1,
        lessons: [
          {
            id: 'les-3-1-1',
            title: 'Advanced Pandas Operations',
            description: 'Complex data transformations and aggregations',
            youtubeUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
            duration: 30,
            order: 1,
          },
        ],
      },
    ],
  },
];
