-- Talking : comptes et sauvegarde de la progression.
-- À coller une fois dans Supabase → SQL Editor → New query → Run.
-- Le script peut être relancé sans risque (il ne recrée que ce qui manque).

-- 1. Progression de chaque utilisateur ---------------------------------------
-- Toute la progression de l'app (profil, séances, défis, rappels…) dans un seul document JSON.
create table if not exists public.user_state (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  state       jsonb       not null,
  app_version text,
  updated_at  timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- Chaque personne ne voit et ne modifie que sa propre progression.
drop policy if exists "user_state_select_own" on public.user_state;
create policy "user_state_select_own" on public.user_state
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_state_insert_own" on public.user_state;
create policy "user_state_insert_own" on public.user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_update_own" on public.user_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2. Abonnements (pour la version payante plus tard) --------------------------
-- Lecture seule pour l'utilisateur ; seul le serveur (clé service_role, webhook de paiement)
-- pourra écrire ici. Aucune règle d'écriture pour les utilisateurs : c'est voulu.
create table if not exists public.entitlements (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  plan       text        not null default 'free',
  expires_at timestamptz,
  source     text,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);
