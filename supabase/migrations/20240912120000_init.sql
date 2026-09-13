-- Life RPG initial schema: enums, tables, leveling math, RLS, RPCs, catalog seed.

create extension if not exists pgcrypto;

create type public.hero_attribute as enum (
  'strength',
  'intellect',
  'discipline',
  'creativity',
  'social'
);

create type public.task_difficulty as enum (
  'trivial',
  'easy',
  'normal',
  'hard',
  'epic'
);

create type public.task_status as enum (
  'active',
  'completed',
  'archived'
);

create type public.item_kind as enum (
  'badge',
  'title',
  'theme',
  'consumable'
);

create type public.item_rarity as enum (
  'common',
  'rare',
  'epic',
  'legendary'
);

create type public.activity_type as enum (
  'task_created',
  'task_updated',
  'task_deleted',
  'task_completed',
  'level_up',
  'item_granted',
  'item_purchased',
  'item_equipped',
  'streak_updated'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Adventurer'
    check (char_length(display_name) between 1 and 40),
  avatar_key text not null default 'rune-01',
  level integer not null default 1 check (level >= 1),
  total_xp bigint not null default 0 check (total_xp >= 0),
  gold integer not null default 90 check (gold >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  last_quest_date date,
  timezone text not null default 'UTC',
  equipped_theme text not null default 'void-ember',
  equipped_title text,
  equipped_badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attributes (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  strength integer not null default 1 check (strength >= 0),
  intellect integer not null default 1 check (intellect >= 0),
  discipline integer not null default 1 check (discipline >= 0),
  creativity integer not null default 1 check (creativity >= 0),
  social integer not null default 1 check (social >= 0),
  updated_at timestamptz not null default now()
);

create table public.difficulty_rewards (
  difficulty public.task_difficulty primary key,
  base_xp integer not null check (base_xp > 0),
  gold integer not null check (gold >= 0),
  attribute_pts integer not null check (attribute_pts > 0)
);

create table public.item_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  kind public.item_kind not null,
  rarity public.item_rarity not null,
  gold_cost integer not null check (gold_cost >= 0),
  min_level integer not null default 1 check (min_level >= 1),
  effect jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  attribute public.hero_attribute not null,
  difficulty public.task_difficulty not null default 'normal',
  status public.task_status not null default 'active',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id uuid not null references public.item_catalog (id) on delete cascade,
  qty integer not null default 1 check (qty >= 1),
  acquired_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.activity_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index tasks_user_status_idx on public.tasks (user_id, status, created_at desc);
create index activity_user_created_idx on public.activity_events (user_id, created_at desc);
create index inventory_user_idx on public.inventory (user_id);

insert into public.difficulty_rewards (difficulty, base_xp, gold, attribute_pts) values
  ('trivial', 8, 1, 1),
  ('easy', 15, 2, 1),
  ('normal', 28, 4, 2),
  ('hard', 50, 8, 3),
  ('epic', 90, 15, 4);

insert into public.item_catalog (slug, name, description, kind, rarity, gold_cost, min_level, effect) values
  ('first-spark', 'First Spark', 'The ember that answered when you inscribed your name.', 'badge', 'common', 0, 1, '{}'::jsonb),
  ('quest-seal', 'Quest Seal', 'Proof you closed a contract in the living world.', 'badge', 'common', 0, 1, '{}'::jsonb),
  ('ember-streak', 'Ember Streak', 'Three consecutive dawns of resolve.', 'badge', 'rare', 0, 1, '{}'::jsonb),
  ('solar-streak', 'Solar Streak', 'A week of unbroken fire.', 'badge', 'epic', 0, 1, '{}'::jsonb),
  ('level-adept', 'Adept Crest', 'You crossed the fifth threshold.', 'badge', 'rare', 0, 5, '{}'::jsonb),
  ('level-warden', 'Warden Crest', 'The keep recognizes a tenth-circle hero.', 'badge', 'legendary', 0, 10, '{}'::jsonb),
  ('awakened', 'Awakened', 'Title granted at first breath in the keep.', 'title', 'common', 0, 1, '{}'::jsonb),
  ('rune-scribe', 'Rune-Scribe', 'Earned when you first rise in rank.', 'title', 'rare', 0, 2, '{}'::jsonb),
  ('keep-architect', 'Keep Architect', 'For shaping a life with intention.', 'title', 'epic', 0, 5, '{}'::jsonb),
  ('void-ember', 'Void Ember', 'Default shrine lighting: deep coals and gold runes.', 'theme', 'common', 0, 1, '{"theme":"void-ember"}'::jsonb),
  ('cyber-shrine', 'Cyber Shrine', 'Neon lattice over black stone. A future temple.', 'theme', 'rare', 80, 2, '{"theme":"cyber-shrine"}'::jsonb),
  ('aurora-keep', 'Aurora Keep', 'Cold green fire along the battlements.', 'theme', 'epic', 140, 3, '{"theme":"aurora-keep"}'::jsonb),
  ('obsidian-sun', 'Obsidian Sun', 'Harsh gold against volcanic glass.', 'theme', 'legendary', 220, 5, '{"theme":"obsidian-sun"}'::jsonb),
  ('echo-flask', 'Echo Flask', 'A bottled cheer from the tavern. Trophy, not a cheat.', 'consumable', 'common', 18, 1, '{}'::jsonb);

create or replace function public.xp_required_for_level(n integer)
returns integer
language sql
immutable
as $$
  select floor(80 * power(n::numeric, 1.65) + 40 * n)::integer;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger trg_tasks_updated
before update on public.tasks
for each row execute procedure public.set_updated_at();

create or replace function public.tg_task_sanitize()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.bypass_task_seal', true) = '1' then
    return new;
  end if;

  new.user_id := coalesce(auth.uid(), new.user_id);
  if tg_op = 'INSERT' then
    new.status := 'active';
    new.completed_at := null;
  elsif tg_op = 'UPDATE' then
    if old.status = 'completed' then
      raise exception 'Completed quests are sealed' using errcode = 'P0001';
    end if;
    new.status := old.status;
    new.completed_at := old.completed_at;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_tasks_sanitize
before insert or update on public.tasks
for each row execute procedure public.tg_task_sanitize();

create or replace function public.tg_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_events (user_id, type, payload)
    values (
      new.user_id,
      'task_created',
      jsonb_build_object(
        'task_id', new.id,
        'title', new.title,
        'attribute', new.attribute,
        'difficulty', new.difficulty
      )
    );
    return new;
  elsif tg_op = 'UPDATE' then
    if old.status is distinct from 'completed' and new.status = 'completed' then
      return new;
    end if;
    insert into public.activity_events (user_id, type, payload)
    values (
      new.user_id,
      'task_updated',
      jsonb_build_object('task_id', new.id, 'title', new.title)
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_events (user_id, type, payload)
    values (
      old.user_id,
      'task_deleted',
      jsonb_build_object('task_id', old.id, 'title', old.title)
    );
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_tasks_activity
after insert or update or delete on public.tasks
for each row execute procedure public.tg_task_activity();

create or replace function public.try_grant_item(p_user uuid, p_slug text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.item_catalog%rowtype;
  v_id uuid;
begin
  select * into v_item from public.item_catalog where slug = p_slug;
  if not found then
    return null;
  end if;

  insert into public.inventory (user_id, item_id, qty)
  values (p_user, v_item.id, 1)
  on conflict (user_id, item_id) do nothing
  returning id into v_id;

  if v_id is null then
    return null;
  end if;

  insert into public.activity_events (user_id, type, payload)
  values (
    p_user,
    'item_granted',
    jsonb_build_object(
      'slug', v_item.slug,
      'name', v_item.name,
      'kind', v_item.kind,
      'reason', p_reason
    )
  );

  return jsonb_build_object(
    'slug', v_item.slug,
    'name', v_item.name,
    'kind', v_item.kind,
    'rarity', v_item.rarity
  );
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Adventurer'
  );
  v_name := left(v_name, 40);

  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    v_name,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'timezone'), ''), 'UTC')
  );

  insert into public.attributes (user_id)
  values (new.id);

  perform public.try_grant_item(new.id, 'first-spark', 'signup');
  perform public.try_grant_item(new.id, 'void-ember', 'signup');
  perform public.try_grant_item(new.id, 'awakened', 'signup');

  update public.profiles
  set equipped_theme = 'void-ember',
      equipped_title = 'awakened',
      equipped_badge = 'first-spark'
  where id = new.id;

  insert into public.activity_events (user_id, type, payload)
  values (
    new.id,
    'item_granted',
    jsonb_build_object('reason', 'awakening', 'message', 'The keep opens.')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.complete_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_task public.tasks%rowtype;
  v_profile public.profiles%rowtype;
  v_xp integer;
  v_gold integer;
  v_pts integer;
  v_today date;
  v_new_streak integer;
  v_old_level integer;
  v_spent bigint;
  v_need integer;
  v_granted jsonb := '[]'::jsonb;
  v_piece jsonb;
  v_levels integer[] := '{}';
  v_completed_count integer;
  v_attr text;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id and user_id = v_user
  for update;

  if not found then
    raise exception 'Quest not found' using errcode = 'P0001';
  end if;

  if v_task.status is distinct from 'active' then
    raise exception 'Quest already resolved' using errcode = 'P0001';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user
  for update;

  select dr.base_xp, dr.gold, dr.attribute_pts
  into v_xp, v_gold, v_pts
  from public.difficulty_rewards dr
  where dr.difficulty = v_task.difficulty;

  v_today := (timezone(coalesce(v_profile.timezone, 'UTC'), now()))::date;

  if v_profile.last_quest_date = v_today then
    v_new_streak := greatest(v_profile.streak_count, 1);
  elsif v_profile.last_quest_date = v_today - 1 then
    v_new_streak := v_profile.streak_count + 1;
  else
    v_new_streak := 1;
  end if;

  v_xp := v_xp + least(12, (v_new_streak / 3));

  v_old_level := v_profile.level;
  v_profile.total_xp := v_profile.total_xp + v_xp;
  v_profile.gold := v_profile.gold + v_gold;
  v_profile.streak_count := v_new_streak;
  v_profile.last_quest_date := v_today;

  loop
    select coalesce(sum(public.xp_required_for_level(g)), 0)
    into v_spent
    from generate_series(1, v_profile.level - 1) as g;

    v_need := public.xp_required_for_level(v_profile.level);

    if v_profile.total_xp >= v_spent + v_need then
      v_profile.level := v_profile.level + 1;
      v_profile.gold := v_profile.gold + (12 * v_profile.level);
      v_levels := array_append(v_levels, v_profile.level);

      insert into public.activity_events (user_id, type, payload)
      values (
        v_user,
        'level_up',
        jsonb_build_object('level', v_profile.level, 'total_xp', v_profile.total_xp)
      );

      if v_profile.level = 2 then
        v_piece := public.try_grant_item(v_user, 'rune-scribe', 'level-2');
        if v_piece is not null then
          v_granted := v_granted || jsonb_build_array(v_piece);
          v_profile.equipped_title := 'rune-scribe';
        end if;
      elsif v_profile.level = 5 then
        v_piece := public.try_grant_item(v_user, 'level-adept', 'level-5');
        if v_piece is not null then
          v_granted := v_granted || jsonb_build_array(v_piece);
        end if;
        v_piece := public.try_grant_item(v_user, 'keep-architect', 'level-5');
        if v_piece is not null then
          v_granted := v_granted || jsonb_build_array(v_piece);
          v_profile.equipped_title := 'keep-architect';
        end if;
      elsif v_profile.level = 10 then
        v_piece := public.try_grant_item(v_user, 'level-warden', 'level-10');
        if v_piece is not null then
          v_granted := v_granted || jsonb_build_array(v_piece);
        end if;
      end if;
    else
      exit;
    end if;
  end loop;

  update public.profiles
  set
    level = v_profile.level,
    total_xp = v_profile.total_xp,
    gold = v_profile.gold,
    streak_count = v_profile.streak_count,
    last_quest_date = v_profile.last_quest_date,
    equipped_title = v_profile.equipped_title
  where id = v_user;

  v_attr := v_task.attribute::text;

  update public.attributes
  set
    strength = strength + case when v_attr = 'strength' then v_pts else 0 end,
    intellect = intellect + case when v_attr = 'intellect' then v_pts else 0 end,
    discipline = discipline + case when v_attr = 'discipline' then v_pts else 0 end,
    creativity = creativity + case when v_attr = 'creativity' then v_pts else 0 end,
    social = social + case when v_attr = 'social' then v_pts else 0 end,
    updated_at = now()
  where user_id = v_user;

  perform set_config('app.bypass_task_seal', '1', true);

  update public.tasks
  set status = 'completed', completed_at = now()
  where id = v_task.id;

  select count(*) into v_completed_count
  from public.tasks
  where user_id = v_user and status = 'completed';

  if v_completed_count = 1 then
    v_piece := public.try_grant_item(v_user, 'quest-seal', 'first-quest');
    if v_piece is not null then
      v_granted := v_granted || jsonb_build_array(v_piece);
    end if;
  end if;

  if v_new_streak = 3 then
    v_piece := public.try_grant_item(v_user, 'ember-streak', 'streak-3');
    if v_piece is not null then
      v_granted := v_granted || jsonb_build_array(v_piece);
    end if;
  elsif v_new_streak = 7 then
    v_piece := public.try_grant_item(v_user, 'solar-streak', 'streak-7');
    if v_piece is not null then
      v_granted := v_granted || jsonb_build_array(v_piece);
    end if;
  end if;

  insert into public.activity_events (user_id, type, payload)
  values (
    v_user,
    'streak_updated',
    jsonb_build_object('streak', v_new_streak, 'date', v_today)
  );

  insert into public.activity_events (user_id, type, payload)
  values (
    v_user,
    'task_completed',
    jsonb_build_object(
      'task_id', v_task.id,
      'title', v_task.title,
      'xp', v_xp,
      'gold', v_gold,
      'attribute', v_attr,
      'attribute_pts', v_pts,
      'difficulty', v_task.difficulty
    )
  );

  return jsonb_build_object(
    'task_id', v_task.id,
    'title', v_task.title,
    'xp', v_xp,
    'gold', v_gold,
    'attribute', v_attr,
    'attribute_pts', v_pts,
    'streak', v_new_streak,
    'level', v_profile.level,
    'previous_level', v_old_level,
    'total_xp', v_profile.total_xp,
    'leveled_up', v_profile.level > v_old_level,
    'levels_gained', to_jsonb(v_levels),
    'granted_items', v_granted
  );
end;
$$;

create or replace function public.purchase_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item public.item_catalog%rowtype;
  v_profile public.profiles%rowtype;
  v_owned boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  select * into v_item from public.item_catalog where id = p_item_id;
  if not found then
    raise exception 'Relic not found' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_user for update;

  if v_profile.level < v_item.min_level then
    raise exception 'Your circle is too low for this relic' using errcode = 'P0001';
  end if;

  if v_item.gold_cost <= 0 then
    raise exception 'This relic cannot be bought' using errcode = 'P0001';
  end if;

  select exists (
    select 1 from public.inventory where user_id = v_user and item_id = v_item.id
  ) into v_owned;

  if v_owned and v_item.kind is distinct from 'consumable' then
    raise exception 'Already in your inventory' using errcode = 'P0001';
  end if;

  if v_profile.gold < v_item.gold_cost then
    raise exception 'Not enough gold' using errcode = 'P0001';
  end if;

  update public.profiles
  set gold = gold - v_item.gold_cost
  where id = v_user;

  insert into public.inventory (user_id, item_id, qty)
  values (v_user, v_item.id, 1)
  on conflict (user_id, item_id)
  do update set qty = public.inventory.qty + 1;

  insert into public.activity_events (user_id, type, payload)
  values (
    v_user,
    'item_purchased',
    jsonb_build_object(
      'slug', v_item.slug,
      'name', v_item.name,
      'gold', v_item.gold_cost
    )
  );

  return jsonb_build_object(
    'slug', v_item.slug,
    'name', v_item.name,
    'kind', v_item.kind,
    'gold_spent', v_item.gold_cost
  );
end;
$$;

create or replace function public.equip_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item public.item_catalog%rowtype;
  v_owned boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;

  select * into v_item from public.item_catalog where id = p_item_id;
  if not found then
    raise exception 'Relic not found' using errcode = 'P0001';
  end if;

  select exists (
    select 1 from public.inventory where user_id = v_user and item_id = v_item.id
  ) into v_owned;

  if not v_owned then
    raise exception 'You do not hold this relic' using errcode = 'P0001';
  end if;

  if v_item.kind = 'theme' then
    update public.profiles set equipped_theme = v_item.slug where id = v_user;
  elsif v_item.kind = 'badge' then
    update public.profiles set equipped_badge = v_item.slug where id = v_user;
  elsif v_item.kind = 'title' then
    update public.profiles set equipped_title = v_item.slug where id = v_user;
  else
    raise exception 'This relic cannot be equipped' using errcode = 'P0001';
  end if;

  insert into public.activity_events (user_id, type, payload)
  values (
    v_user,
    'item_equipped',
    jsonb_build_object('slug', v_item.slug, 'kind', v_item.kind)
  );

  return jsonb_build_object('slug', v_item.slug, 'kind', v_item.kind);
end;
$$;

create or replace function public.update_hero_identity(p_display_name text, p_timezone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text := left(trim(p_display_name), 40);
  v_tz text := trim(p_timezone);
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = 'P0001';
  end if;
  if v_name is null or char_length(v_name) < 1 then
    raise exception 'Name required' using errcode = 'P0001';
  end if;
  if v_tz is null or char_length(v_tz) < 1 or char_length(v_tz) > 64 then
    raise exception 'Timezone required' using errcode = 'P0001';
  end if;
  -- Validate timezone by attempting conversion.
  perform timezone(v_tz, now());

  update public.profiles
  set display_name = v_name, timezone = v_tz
  where id = v_user;
end;
$$;

alter table public.profiles enable row level security;
alter table public.attributes enable row level security;
alter table public.tasks enable row level security;
alter table public.inventory enable row level security;
alter table public.activity_events enable row level security;
alter table public.item_catalog enable row level security;
alter table public.difficulty_rewards enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "attributes_select_own" on public.attributes
  for select to authenticated using (user_id = auth.uid());

create policy "tasks_select_own" on public.tasks
  for select to authenticated using (user_id = auth.uid());

create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check (user_id = auth.uid());

create policy "tasks_update_own_active" on public.tasks
  for update to authenticated
  using (user_id = auth.uid() and status = 'active')
  with check (user_id = auth.uid());

create policy "tasks_delete_own_active" on public.tasks
  for delete to authenticated
  using (user_id = auth.uid() and status = 'active');

create policy "inventory_select_own" on public.inventory
  for select to authenticated using (user_id = auth.uid());

create policy "activity_select_own" on public.activity_events
  for select to authenticated using (user_id = auth.uid());

create policy "catalog_read" on public.item_catalog
  for select to authenticated using (true);

create policy "difficulty_read" on public.difficulty_rewards
  for select to authenticated using (true);

revoke all on public.profiles from anon, authenticated;
revoke all on public.attributes from anon, authenticated;
revoke all on public.tasks from anon, authenticated;
revoke all on public.inventory from anon, authenticated;
revoke all on public.activity_events from anon, authenticated;
revoke all on public.item_catalog from anon, authenticated;
revoke all on public.difficulty_rewards from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.attributes to authenticated;
grant select, insert, delete on public.tasks to authenticated;
grant update (
  title,
  description,
  attribute,
  difficulty,
  due_at
) on public.tasks to authenticated;
grant select on public.inventory to authenticated;
grant select on public.activity_events to authenticated;
grant select on public.item_catalog to authenticated;
grant select on public.difficulty_rewards to authenticated;

grant execute on function public.xp_required_for_level(integer) to authenticated;
grant execute on function public.complete_task(uuid) to authenticated;
grant execute on function public.purchase_item(uuid) to authenticated;
grant execute on function public.equip_item(uuid) to authenticated;
grant execute on function public.update_hero_identity(text, text) to authenticated;

revoke execute on function public.try_grant_item(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
