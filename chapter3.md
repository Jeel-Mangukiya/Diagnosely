# Chapter 3: Authentication & Security

## 3.1 Authentication Flow
The application uses Supabase for authentication with the following flow:

1. **User Registration**: Users sign up with email/password
2. **Email Verification**: Supabase sends confirmation email
3. **Session Management**: JWT-based session handling
4. **Protected Routes**: Route protection for authenticated users
5. **Automatic Sign-in**: Remember user sessions

## 3.2 Security Features
- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage
- **CORS Protection**: Configured for specific domains
- **Environment Variables**: Sensitive data stored securely
- **HTTPS**: Secure communication in production

## 3.3 AuthContext Implementation
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}
```

## 3.4 Protected Routes
The application implements route protection using a ProtectedRoute component:
- Checks user authentication status
- Redirects unauthenticated users to sign-in page
- Maintains intended destination for post-authentication redirect
