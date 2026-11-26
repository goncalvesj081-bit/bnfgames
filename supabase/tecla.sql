-- =====================================================================
-- TECLA — ranking e evolução
-- Tabelas fechadas (RLS sem políticas): o site só acessa pelas funções
-- abaixo, que conferem o segredo do jogador antes de gravar.
-- =====================================================================

create table if not exists public.tecla_players (
  id           uuid primary key default gen_random_uuid(),
  nick         text not null check (char_length(nick) between 2 and 20),
  secret_hash  text not null,
  xp           integer not null default 0 check (xp >= 0),
  level        integer not null default 1 check (level >= 1),
  lessons      integer not null default 0 check (lessons >= 0),
  streak       integer not null default 0 check (streak >= 0),
  best_combo   integer not null default 0 check (best_combo >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  last_run_at  timestamptz
);
create unique index if not exists tecla_players_nick_key on public.tecla_players (lower(nick));

create table if not exists public.tecla_runs (
  id          bigint generated always as identity primary key,
  player_id   uuid not null references public.tecla_players(id) on delete cascade,
  kind        text not null check (kind in ('lesson','test','weak','warm','practice')),
  lesson      text,
  ppm         integer not null check (ppm between 0 and 250),
  acc         numeric(5,1) not null check (acc between 0 and 100),
  duration_s  integer not null check (duration_s between 1 and 7200),
  chars       integer not null default 0 check (chars >= 0),
  created_at  timestamptz not null default now()
);
create index if not exists tecla_runs_player_idx on public.tecla_runs (player_id, created_at desc);
create index if not exists tecla_runs_rank_idx on public.tecla_runs (kind, created_at desc, ppm desc);

alter table public.tecla_players enable row level security;
alter table public.tecla_runs enable row level security;
revoke all on public.tecla_players from anon, authenticated;
revoke all on public.tecla_runs from anon, authenticated;

-- ---------------------------------------------------------------------
create or replace function public.tecla_hash(p text)
returns text language sql immutable set search_path = '' as $$
  select encode(sha256(convert_to(p, 'UTF8')), 'hex')
$$;

create or replace function public.tecla_check(p_id uuid, p_secret text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.tecla_players
                 where id = p_id and secret_hash = public.tecla_hash(coalesce(p_secret, '')))
$$;

-- cria o jogador e devolve id + segredo (o segredo só existe no navegador dele)
create or replace function public.tecla_register(p_nick text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_nick text := btrim(p_nick);
  v_secret text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_id uuid;
begin
  if v_nick !~ '^[A-Za-zÀ-ÿ0-9_. -]{2,20}$' then
    raise exception 'apelido_invalido';
  end if;
  if exists (select 1 from public.tecla_players where lower(nick) = lower(v_nick)) then
    raise exception 'apelido_em_uso';
  end if;
  insert into public.tecla_players (nick, secret_hash)
  values (v_nick, public.tecla_hash(v_secret)) returning id into v_id;
  return json_build_object('id', v_id, 'secret', v_secret, 'nick', v_nick);
end $$;

-- atualiza perfil (XP só sobe, com limite por chamada)
create or replace function public.tecla_update_profile(
  p_id uuid, p_secret text, p_nick text, p_xp integer, p_level integer,
  p_lessons integer, p_streak integer, p_best_combo integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old public.tecla_players;
begin
  if not public.tecla_check(p_id, p_secret) then raise exception 'nao_autorizado'; end if;
  select * into v_old from public.tecla_players where id = p_id;
  if p_nick is not null and btrim(p_nick) <> v_old.nick then
    if btrim(p_nick) !~ '^[A-Za-zÀ-ÿ0-9_. -]{2,20}$' then raise exception 'apelido_invalido'; end if;
    if exists (select 1 from public.tecla_players where lower(nick) = lower(btrim(p_nick)) and id <> p_id) then
      raise exception 'apelido_em_uso';
    end if;
  end if;
  update public.tecla_players set
    nick       = coalesce(nullif(btrim(p_nick), ''), nick),
    xp         = greatest(xp, least(coalesce(p_xp, xp), xp + 5000)),
    level      = greatest(1, least(coalesce(p_level, level), 200)),
    lessons    = greatest(0, least(coalesce(p_lessons, lessons), 100)),
    streak     = greatest(0, least(coalesce(p_streak, streak), 3650)),
    best_combo = greatest(best_combo, least(coalesce(p_best_combo, 0), 5000)),
    updated_at = now()
  where id = p_id;
end $$;

-- grava uma rodada
create or replace function public.tecla_add_run(
  p_id uuid, p_secret text, p_kind text, p_lesson text,
  p_ppm integer, p_acc numeric, p_duration integer, p_chars integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.tecla_check(p_id, p_secret) then raise exception 'nao_autorizado'; end if;
  if exists (select 1 from public.tecla_players where id = p_id and last_run_at > now() - interval '3 seconds') then
    return; -- limite simples contra envio em massa
  end if;
  insert into public.tecla_runs (player_id, kind, lesson, ppm, acc, duration_s, chars)
  values (p_id, p_kind, left(p_lesson, 60), least(greatest(p_ppm, 0), 250),
          least(greatest(p_acc, 0), 100), least(greatest(p_duration, 1), 7200), greatest(p_chars, 0));
  update public.tecla_players set last_run_at = now() where id = p_id;
end $$;

-- importa o histórico local uma única vez (quando o jogador ainda não tem rodadas)
create or replace function public.tecla_import(p_id uuid, p_secret text, p_runs jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if not public.tecla_check(p_id, p_secret) then raise exception 'nao_autorizado'; end if;
  if exists (select 1 from public.tecla_runs where player_id = p_id) then return 0; end if;
  insert into public.tecla_runs (player_id, kind, lesson, ppm, acc, duration_s, chars, created_at)
  select p_id, r->>'kind', left(r->>'lesson', 60),
         least(greatest((r->>'ppm')::int, 0), 250), least(greatest((r->>'acc')::numeric, 0), 100),
         least(greatest((r->>'dur')::int, 1), 7200), greatest(coalesce((r->>'chars')::int, 0), 0),
         least(to_timestamp((r->>'t')::bigint / 1000.0), now())
  from (select jsonb_array_elements(p_runs) r limit 200) x
  where r->>'kind' in ('lesson','test','weak','warm','practice');
  get diagnostics n = row_count;
  return n;
end $$;

-- recupera perfil e evolução em outro computador
create or replace function public.tecla_restore(p_id uuid, p_secret text)
returns json language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.tecla_check(p_id, p_secret) then raise exception 'nao_autorizado'; end if;
  return (
    select json_build_object(
      'nick', p.nick, 'xp', p.xp, 'level', p.level, 'best_combo', p.best_combo,
      'runs', coalesce((select json_agg(json_build_object('t', (extract(epoch from r.created_at) * 1000)::bigint,
                 'kind', r.kind, 'name', r.lesson, 'ppm', r.ppm, 'acc', r.acc, 'sec', r.duration_s) order by r.created_at)
               from (select * from public.tecla_runs where player_id = p.id order by created_at desc limit 300) r), '[]'::json))
    from public.tecla_players p where p.id = p_id
  );
end $$;

-- rankings públicos: velocidade (semana / geral) e XP
create or replace function public.tecla_ranking(p_board text, p_me uuid default null)
returns table (pos bigint, nick text, value numeric, acc numeric, me boolean)
language sql stable security definer set search_path = '' as $$
  with speed as (
    select distinct on (r.player_id) r.player_id, r.ppm::numeric as value, r.acc
    from public.tecla_runs r
    where r.kind in ('test','practice') and r.duration_s >= 30 and r.acc >= 90
      and (p_board <> 'week' or r.created_at > now() - interval '7 days')
    order by r.player_id, r.ppm desc, r.acc desc
  ), board as (
    select player_id, value, acc from speed where p_board in ('week','all')
    union all
    select id, xp::numeric, level::numeric from public.tecla_players where p_board = 'xp' and xp > 0
  )
  select row_number() over (order by b.value desc, b.acc desc) as pos,
         p.nick, b.value, b.acc, (p.id = p_me) as me
  from board b join public.tecla_players p on p.id = b.player_id
  order by pos
  limit 50
$$;

revoke all on function public.tecla_hash(text) from public, anon, authenticated;
revoke all on function public.tecla_check(uuid, text) from public, anon, authenticated;
revoke all on function public.tecla_register(text) from public;
revoke all on function public.tecla_update_profile(uuid, text, text, integer, integer, integer, integer, integer) from public;
revoke all on function public.tecla_add_run(uuid, text, text, text, integer, numeric, integer, integer) from public;
revoke all on function public.tecla_import(uuid, text, jsonb) from public;
revoke all on function public.tecla_restore(uuid, text) from public;
revoke all on function public.tecla_ranking(text, uuid) from public;
grant execute on function public.tecla_register(text) to anon, authenticated;
grant execute on function public.tecla_update_profile(uuid, text, text, integer, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.tecla_add_run(uuid, text, text, text, integer, numeric, integer, integer) to anon, authenticated;
grant execute on function public.tecla_import(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.tecla_restore(uuid, text) to anon, authenticated;
grant execute on function public.tecla_ranking(text, uuid) to anon, authenticated;
