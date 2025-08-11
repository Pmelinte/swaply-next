-- ==============================================
-- Swaply: policies.sql (RLS)
-- Enable Row Level Security and create policies
-- Requires Supabase (Postgres) with auth.uid()
-- ==============================================

-- Enable RLS
alter table public.users    enable row level security;
alter table public.objects  enable row level security;
alter table public.messages enable row level security;
alter table public.matches  enable row level security;

-- USERS
-- Anyone authenticated can read basic user info.
drop policy if exists "users_select_auth" on public.users;
create policy "users_select_auth"
on public.users for select
to authenticated
using (true);

-- A user can insert their own users row if it doesn't exist yet.
drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users for insert
to authenticated
with check (auth.uid() = auth_uid);

-- A user can update only their own profile row.
drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users for update
to authenticated
using (auth.uid() = auth_uid)
with check (auth.uid() = auth_uid);

-- OBJECTS
-- Public read access to objects (listings)
drop policy if exists "objects_select_public" on public.objects;
create policy "objects_select_public"
on public.objects for select
to anon, authenticated
using (true);

-- Only authenticated users can insert objects and only for their own user_id.
drop policy if exists "objects_insert_owner" on public.objects;
create policy "objects_insert_owner"
on public.objects for insert
to authenticated
with check (exists (
  select 1 from public.users u
  where u.id = user_id and u.auth_uid = auth.uid()
));

-- Owners can update/delete their own objects.
drop policy if exists "objects_update_owner" on public.objects;
create policy "objects_update_owner"
on public.objects for update
to authenticated
using (exists (
  select 1 from public.users u
  where u.id = user_id and u.auth_uid = auth.uid()
))
with check (exists (
  select 1 from public.users u
  where u.id = user_id and u.auth_uid = auth.uid()
));

drop policy if exists "objects_delete_owner" on public.objects;
create policy "objects_delete_owner"
on public.objects for delete
to authenticated
using (exists (
  select 1 from public.users u
  where u.id = user_id and u.auth_uid = auth.uid()
));

-- MESSAGES
-- Users can read messages where they participate OR they own the object.
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.auth_uid = auth.uid()
      and (u.id = from_user_id or u.id = to_user_id
           or exists (
             select 1
             from public.objects o
             where o.id = object_id and o.user_id = u.id
           ))
  )
);

-- Only the sender can insert; must be the current user.
drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender"
on public.messages for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);

-- Only the sender can update/delete their messages (optional but safer).
drop policy if exists "messages_update_sender" on public.messages;
create policy "messages_update_sender"
on public.messages for update
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_uid = auth.uid() and u.id = from_user_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);

drop policy if exists "messages_delete_sender" on public.messages;
create policy "messages_delete_sender"
on public.messages for delete
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);

-- MATCHES (keep permissive but safe-ish)
drop policy if exists "matches_select_participants" on public.matches;
create policy "matches_select_participants"
on public.matches for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_uid = auth.uid()
      and (u.id = from_user_id or u.id = to_user_id
           or exists (select 1 from public.objects o where o.id = object_id and o.user_id = u.id)
           or (other_object_id is not null and exists (select 1 from public.objects o2 where o2.id = other_object_id and o2.user_id = u.id))
      )
  )
);

drop policy if exists "matches_insert_initiator" on public.matches;
create policy "matches_insert_initiator"
on public.matches for insert
to authenticated
with check (
  exists (
    select 1 from public.users u where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);

drop policy if exists "matches_update_initiator" on public.matches;
create policy "matches_update_initiator"
on public.matches for update
to authenticated
using (
  exists (
    select 1 from public.users u where u.auth_uid = auth.uid() and u.id = from_user_id
  )
)
with check (
  exists (
    select 1 from public.users u where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);

drop policy if exists "matches_delete_initiator" on public.matches;
create policy "matches_delete_initiator"
on public.matches for delete
to authenticated
using (
  exists (
    select 1 from public.users u where u.auth_uid = auth.uid() and u.id = from_user_id
  )
);
