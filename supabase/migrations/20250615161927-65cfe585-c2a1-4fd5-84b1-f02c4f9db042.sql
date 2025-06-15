
-- Grant admins the ability to view all enrollments in the admin dashboard.

CREATE POLICY "Admins can view all enrollments"
  ON public.course_enrollments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
