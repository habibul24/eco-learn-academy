
-- Enable RLS on user_progress and course_enrollments just in case (safe to run even if enabled)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT/INSERT/UPDATE/DELETE their own progress records (user_progress)
CREATE POLICY "User can view their own progress"
  ON public.user_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "User can delete their own progress"
  ON public.user_progress FOR DELETE
  USING (user_id = auth.uid());

-- Allow users to SELECT/INSERT/UPDATE/DELETE their own course enrollments (course_enrollments)
CREATE POLICY "User can view their own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can create their own enrollment"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their own enrollment"
  ON public.course_enrollments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "User can delete their own enrollment"
  ON public.course_enrollments FOR DELETE
  USING (user_id = auth.uid());
