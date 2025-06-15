
-- Grant "admin" role to the user with the given email.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'habibul@greendatabiz.com'
ON CONFLICT (user_id, role) DO NOTHING;
