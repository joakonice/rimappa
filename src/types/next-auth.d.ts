import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'ORGANIZER' | 'COMPETITOR';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN' | 'ORGANIZER' | 'COMPETITOR';
    }
  }
} 