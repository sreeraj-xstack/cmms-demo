export type UserRole = 'manager' | 'engineer' | 'operator';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
