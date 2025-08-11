-- ==============================================
-- Swaply: schema.sql
-- Tables: users, objects, messages, matches
-- Safe to run multiple times (IF NOT EXISTS).
-- ==============================================

create schema if not exists public;

-- USERS
create table if not exists public.users (
  id               bigserial primary key,
  auth_uid         uuid unique,
  email            text unique,
  name             text,
  avatar_url       text,
  created_at       timestamptz not null default now()
);

-- OBJECTS (items listed by users)
create table if not exists public.objects (
  id               bigserial primary key,
  user_id          bigint not null references public.users(id) on delete cascade,
  title            text not null,
  description      text,
  category         text,
  image_url        text,
  created_at       timestamptz not null default now()
);

-- MESSAGES (private messages about an object)
create table if not exists public.messages (
  id               bigserial primary key,
  object_id        bigint not null references public.objects(id) on delete cascade,
  from_user_id     bigint not null references public.users(id) on delete cascade,
  to_user_id       bigint not null references public.users(id) on delete cascade,
  content          text not null,
  created_at       timestamptz not null default now()
);

-- MATCHES (optional: store matches/intents; structure kept flexible)
create table if not exists public.matches (
  id               bigserial primary key,
  object_id        bigint not null references public.objects(id) on delete cascade,
  other_object_id  bigint references public.objects(id),
  from_user_id     bigint references public.users(id),
  to_user_id       bigint references public.users(id),
  status           text check (status in ('pending','accepted','rejected')) default 'pending',
  created_at       timestamptz not null default now()
);

-- Helpful indexes
create index if not exists objects_user_created_at_idx on public.objects (user_id, created_at desc);
create index if not exists messages_object_idx on public.messages (object_id);
create index if not exists messages_from_idx on public.messages (from_user_id);
create index if not exists messages_to_idx on public.messages (to_user_id);
