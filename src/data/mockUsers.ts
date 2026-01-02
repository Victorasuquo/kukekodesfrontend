import { User } from '@/types/lms';

// Mock users for demo purposes
// In production, this would come from a secure backend
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@kukekodes.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01',
  },
  {
    id: 'user-1',
    email: 'student@example.com',
    name: 'John Student',
    role: 'user',
    createdAt: '2024-01-15',
  },
];

// Demo credentials for testing
export const demoCredentials = {
  admin: { email: 'admin@kukekodes.com', password: 'admin123' },
  user: { email: 'student@example.com', password: 'student123' },
};
