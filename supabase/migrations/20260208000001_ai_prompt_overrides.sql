-- AI prompt overrides: per-user customization of scene hints and style prefixes
create table if not exists ai_prompt_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  override_type text not null check (override_type in ('scene_hint', 'style_prefix')),
  key text not null,           -- industry key or style key
  prompt_text text not null,
  updated_at timestamptz default now(),
  unique (user_id, override_type, key)
);

-- RLS: users can only read/write their own overrides
alter table ai_prompt_overrides enable row level security;

create policy "Users can read own ai_prompt_overrides"
  on ai_prompt_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert own ai_prompt_overrides"
  on ai_prompt_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ai_prompt_overrides"
  on ai_prompt_overrides for update
  using (auth.uid() = user_id);

create policy "Users can delete own ai_prompt_overrides"
  on ai_prompt_overrides for delete
  using (auth.uid() = user_id);
