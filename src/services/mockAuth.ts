import { User, AppRole } from '@/types';

const STORAGE_KEY = 'scott_auth';
const USERS_KEY = 'scott_users';

// Initialize with a default admin user
const initializeDefaultUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultAdmin: User = {
      id: '1',
      email: 'admin@scottinternational.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    // Default password: admin123
    localStorage.setItem('scott_password_1', 'admin123');
  }
};

initializeDefaultUsers();

export const mockAuthService = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const storedPassword = localStorage.getItem(`scott_password_${user.id}`);
    if (storedPassword !== password) {
      throw new Error('Invalid email or password');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  register: async (email: string, password: string, name: string, role: AppRole = 'production_team'): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`scott_password_${newUser.id}`, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  updateUser: (userId: string, updates: Partial<User>): User => {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = mockAuthService.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users[index]));
    }
    
    return users[index];
  },

  getAllUsers: (): User[] => {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  createUser: (email: string, password: string, name: string, role: AppRole): User => {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`scott_password_${newUser.id}`, password);
    
    return newUser;
  },

  deleteUser: (userId: string): void => {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    localStorage.removeItem(`scott_password_${userId}`);
  },
};
