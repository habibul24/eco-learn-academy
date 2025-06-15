
-- 1. Create an enum for user roles (admin, user only)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create a user_roles table linked to auth.users
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Allow every user to read their assigned roles (frontend logic)
CREATE POLICY "Users can read their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Allow any admin to see all roles (for admin features)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Policy: allow admins to select all roles if ever needed from frontend
CREATE POLICY "Admins can select all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
