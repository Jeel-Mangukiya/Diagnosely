# Chapter 6: Database Schema

## 6.1 Document Analysis Table
```sql
CREATE TABLE public.document_analysis (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  original_text text NOT NULL,
  analysis text NOT NULL,
  confidence text NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 6.2 User Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## 6.3 Row Level Security (RLS)
All tables implement RLS policies:
- Users can only access their own data
- Automatic profile creation on user signup
- CRUD operations restricted to authenticated users

## 6.4 Database Triggers
```sql
-- Create profile automatically on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
