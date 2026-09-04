create table if not exists career_profiles(id uuid default gen_random_uuid() primary key,user_id uuid references auth.users(id) on delete cascade,profile jsonb default '{}'::jsonb,created_at timestamptz default now(),updated_at timestamptz default now());
alter table career_profiles enable row level security;
drop policy if exists "own career profile" on career_profiles;
create policy "own career profile" on career_profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create table if not exists resume_versions(id uuid default gen_random_uuid() primary key,user_id uuid references auth.users(id) on delete cascade,resume_id uuid references resumes(id) on delete cascade,role_name text not null,version_name text not null,content text not null,metadata jsonb default '{}'::jsonb,created_at timestamptz default now(),updated_at timestamptz default now());
alter table resume_versions enable row level security;
drop policy if exists "own resume versions" on resume_versions;
create policy "own resume versions" on resume_versions for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists resume_versions_user_idx on resume_versions(user_id);
