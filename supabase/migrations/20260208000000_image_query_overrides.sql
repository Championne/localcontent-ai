-- Image query overrides: per-user customization of stock image search terms
create table if not exists image_query_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  industry_key text not null,
  tier text not null check (tier in ('primary', 'secondary', 'generic')),
  queries text[] not null default '{}',
  updated_at timestamptz default now(),
  unique (user_id, industry_key, tier)
);

-- RLS: users can only read/write their own overrides
alter table image_query_overrides enable row level security;

create policy "Users can read own image_query_overrides"
  on image_query_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert own image_query_overrides"
  on image_query_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own image_query_overrides"
  on image_query_overrides for update
  using (auth.uid() = user_id);

create policy "Users can delete own image_query_overrides"
  on image_query_overrides for delete
  using (auth.uid() = user_id);
