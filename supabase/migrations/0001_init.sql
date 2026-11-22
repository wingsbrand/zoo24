-- ZOO24 — PROPOZYCJA schematu (zoo24-architect, 2026-11-22). NIEURUCHAMIANA w F1.
-- Brak kolumn na tokeny/sekrety. Brak danych adresowych osób prywatnych (address_text = adres firmy, tylko gdy opublikowany).
create extension if not exists pgcrypto;

-- Admin wyłącznie z app_metadata (ustawia backend service-role). user_metadata jest edytowalne przez użytkownika -> NIE używać.
create or replace function public.is_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create type public.content_status as enum ('idea','draft','fact_check','rights_check','needs_review',
  'approved','scheduled','publishing','published','failed','rejected','held','cancelled');
create type public.redirect_decision as enum ('pending','keep_200','redirect_301','redirect_308','gone_410','not_found_404');

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  title text not null, summary text, body text not null,
  sources jsonb not null default '[]', disclosure text, author_display text,
  reviewed_by uuid, internal_notes text,
  status text not null default 'draft' check (status in ('draft','needs_review','published','archived')),
  is_demo boolean not null default false,
  published_at timestamptz, updated_at timestamptz not null default now());

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null, category_slug text not null, city_slug text not null,
  address_text text, service_area text, website_url text, phone_public text, description text,
  status text not null default 'draft' check (status in ('draft','published','hidden','removed')),
  is_demo boolean not null default false,
  source_url text, verification_note text, checked_at timestamptz,
  updated_at timestamptz not null default now());

create table public.legacy_urls (
  id uuid primary key default gen_random_uuid(),
  old_path text unique not null check (old_path like '/%'),
  historical_clicks int, historical_impressions int,
  data_source text not null,                       -- 'gsc_export_YYYYMMDD' | 'DEMO'
  segment text check (segment in ('A','B','C','D','E')),
  link_priority smallint, intent text,
  rights_status text not null default 'unknown' check (rights_status in ('unknown','owned','licensed','none')),
  current_http smallint, decision public.redirect_decision not null default 'pending',
  target_path text, semantic_match_explanation text, reviewed_by uuid, reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (decision not in ('redirect_301','redirect_308') or (target_path is not null and reviewed_by is not null)),
  check (target_path is null or target_path <> '/' or segment = 'A'));   -- zakaz blanket->home

create table public.url_redirects (                 -- tylko zatwierdzone; generowane do buildu
  old_path text primary key check (old_path like '/%'),
  new_path text, status_code smallint not null check (status_code in (301,308,410)),
  legacy_url_id uuid not null references public.legacy_urls(id),
  reason text not null, approved_by uuid not null, approved_at timestamptz not null default now(),
  active boolean not null default false,
  check ((status_code = 410) = (new_path is null)), check (old_path <> new_path));

create table public.seo_checks (
  id bigint generated always as identity primary key,
  checked_on date not null, path text not null, http_status smallint, canonical text,
  index_state text, issue_type text, severity text check (severity in ('info','warn','critical')),
  is_mock boolean not null default true, resolved_at timestamptz);

create table public.social_assets (
  id uuid primary key default gen_random_uuid(),
  asset_uri text not null,
  license_type text not null check (license_type in ('own','licensed','provider_granted','cc_by','illustration','unknown')),
  license_proof text, alt_text text not null,
  rights_checked_by uuid, rights_checked_at timestamptz, expires_at timestamptz,
  is_demo boolean not null default false);

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook','instagram')),
  version int not null default 1, content_hash text not null,
  copy text not null, asset_ids uuid[] not null default '{}', target_url text, utm jsonb not null default '{}',
  disclosure text, source_refs jsonb not null default '[]', content_owner text,
  status public.content_status not null default 'draft',
  scheduled_at timestamptz,                          -- UTC
  lease_owner text, lease_until timestamptz,
  external_container_id text, external_post_id text unique, published_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.social_approvals (               -- insert-only
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id),
  post_version int not null, content_hash text not null, batch_id uuid,
  decision text not null check (decision in ('approved','rejected')),
  approved_by uuid not null, comment text, created_at timestamptz not null default now());
create unique index social_approvals_one_ok on public.social_approvals(post_id, post_version) where decision = 'approved';

create table public.social_publish_attempts (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.social_posts(id),
  attempt smallint not null, idempotency_key text not null,   -- sha256(post_id:version)
  status text not null check (status in ('started','succeeded','failed_retryable','failed_permanent','unknown','skipped')),
  error_code text, error_class text, external_post_id text, is_mock boolean not null default true,
  started_at timestamptz not null default now(), finished_at timestamptz,
  unique (idempotency_key, attempt));
create unique index attempts_one_success on public.social_publish_attempts(idempotency_key) where status = 'succeeded';

create table public.ops_settings (
  key text primary key, value jsonb not null, updated_by uuid, updated_at timestamptz not null default now());
insert into public.ops_settings(key, value) values
  ('kill_switch', '{"publish_enabled": false, "channels": {"facebook": false, "instagram": false}}'),
  ('social_mode', '0'), ('max_posts_per_channel_week', '3'), ('stale_after_minutes', '30');

create table public.audit_log (                      -- insert-only
  id bigint generated always as identity primary key,
  actor_id uuid, actor_kind text not null check (actor_kind in ('user','worker','system')),
  entity_type text not null, entity_id text, action text not null,
  metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  check (not (metadata ?| array['access_token','token','authorization','password','secret','email','address'])));

-- Edycja po akceptacji => nowa wersja + needs_review; approved/scheduled tylko z akceptacją bieżącej wersji.
create or replace function public.social_posts_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Statusy publishing/published ustawia wyłącznie worker (service_role), nigdy klient/admin z przeglądarki.
  if new.status in ('publishing','published') and new.status is distinct from old.status
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'status % only for service_role', new.status;
  end if;
  -- Hash treści liczony w bazie (nie ufamy wartości od klienta); obejmuje source_refs.
  new.content_hash := encode(extensions.digest(concat_ws('|', new.platform, new.copy, new.asset_ids::text, new.target_url,
    new.utm::text, new.disclosure, new.scheduled_at::text, new.source_refs::text), 'sha256'), 'hex');
  if (new.copy, new.asset_ids, new.target_url, new.utm, new.disclosure, new.platform, new.scheduled_at, new.source_refs)
     is distinct from (old.copy, old.asset_ids, old.target_url, old.utm, old.disclosure, old.platform, old.scheduled_at, old.source_refs) then
    if old.status in ('publishing','published') then raise exception 'post locked'; end if;
    new.version := old.version + 1;
    if old.status in ('approved','scheduled','held','failed') then new.status := 'needs_review'; end if;
  end if;
  if new.status in ('approved','scheduled') and not exists (
     select 1 from public.social_approvals a where a.post_id = new.id and a.post_version = new.version
       and a.content_hash = new.content_hash and a.decision = 'approved') then
    raise exception 'no approval for version %', new.version;
  end if;
  new.updated_at := now(); return new;
end $$;
create trigger social_posts_guard before update on public.social_posts
  for each row execute function public.social_posts_guard();

-- RLS: deny-by-default
do $$ declare t text; begin
  foreach t in array array['articles','businesses','legacy_urls','url_redirects','seo_checks','social_assets',
    'social_posts','social_approvals','social_publish_attempts','ops_settings','audit_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop; end $$;

-- anon: tylko SELECT opublikowanych, tylko kolumny publiczne
grant select (id, slug, title, summary, body, sources, disclosure, author_display, published_at, updated_at, is_demo)
  on public.articles to anon;
create policy articles_anon_read on public.articles for select to anon
  using (status = 'published' and published_at <= now());
grant select (id, slug, name, category_slug, city_slug, address_text, service_area, website_url,
  phone_public, description, checked_at, is_demo) on public.businesses to anon;
create policy businesses_anon_read on public.businesses for select to anon using (status = 'published');

-- admin (authenticated + claim). Zalogowany nie-admin = 0 wierszy.
do $$ declare t text; begin
  foreach t in array array['articles','businesses','legacy_urls','url_redirects','seo_checks',
    'social_assets','social_posts','ops_settings'] loop
    execute format('grant select, insert, update on public.%I to authenticated', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t||'_admin', t);
  end loop; end $$;
grant select, insert on public.social_approvals, public.audit_log to authenticated;
create policy approvals_admin_read on public.social_approvals for select to authenticated using (public.is_admin());
create policy approvals_admin_ins on public.social_approvals for insert to authenticated
  with check (public.is_admin() and approved_by = auth.uid());
create policy audit_admin_read on public.audit_log for select to authenticated using (public.is_admin());
create policy audit_admin_ins on public.audit_log for insert to authenticated
  with check (public.is_admin() and actor_id = auth.uid() and actor_kind = 'user');
grant select on public.social_publish_attempts to authenticated;
create policy attempts_admin_read on public.social_publish_attempts for select to authenticated using (public.is_admin());
-- Brak polityk DELETE. Attempts zapisuje tylko worker po stronie serwera (service-role, wyłącznie backend).
