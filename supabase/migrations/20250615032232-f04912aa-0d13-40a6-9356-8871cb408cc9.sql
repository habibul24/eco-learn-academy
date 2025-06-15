
-- 1. Function to auto-assign 'user' (learner) role on signup
create or replace function public.assign_learner_role()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;
  return new;
end;
$$;

-- 2. Trigger on auth.users for new sign ups
drop trigger if exists on_user_created_assign_learner_role on auth.users;

create trigger on_user_created_assign_learner_role
  after insert on auth.users
  for each row execute procedure public.assign_learner_role();
