-- ═══════════════════════════════════════════════════════════════════════════
-- Regrow — schéma initial (Supabase, région UE)
-- Sécurité : RLS activée partout, chaque utilisatrice ne voit QUE ses données.
-- RGPD : toutes les tables cascadent sur la suppression du compte auth
-- (supprimer l'utilisatrice = tout effacer, réellement).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Profil (créé à la première synchro, session anonyme comprise) ──────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  ex_name text,
  weak_hour text,
  user_name text,
  program_started_at date,
  created_at timestamptz not null default now()
);

-- ─── Réponses du quiz (47 réponses, JSON) ───────────────────────────────────
create table public.quiz_answers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  answers jsonb not null,
  completed_at timestamptz not null default now()
);

-- ─── Rapport d'autopsie généré ──────────────────────────────────────────────
create table public.reports (
  user_id uuid primary key references auth.users (id) on delete cascade,
  report jsonb not null,
  created_at timestamptz not null default now()
);

-- ─── Check-ins quotidiens ───────────────────────────────────────────────────
create table public.checkins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  mood smallint not null check (mood between 1 and 5),
  question_id text not null,
  answer text not null,
  contact text not null check (contact in ('none', 'they_wrote', 'i_wrote', 'we_met')),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

-- ─── Coffre-fort (métadonnées ; fichiers dans le bucket privé `vault`) ──────
create table public.vault_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  locked_at timestamptz,
  unlock_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Capsules vocales (fichiers dans le bucket privé `capsules`) ────────────
create table public.capsules (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  recorded_at timestamptz not null default now(),
  unlock_at timestamptz not null,
  played_at timestamptz
);

-- ─── Accès (rempli par le webhook RevenueCat — JAMAIS par le client) ────────
create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  product_id text not null,
  active boolean not null default false,
  source text not null default 'revenuecat',
  updated_at timestamptz not null default now()
);

-- ═══ RLS : chacune chez soi ═════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.reports enable row level security;
alter table public.checkins enable row level security;
alter table public.vault_items enable row level security;
alter table public.capsules enable row level security;
alter table public.entitlements enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own answers" on public.quiz_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own report read" on public.reports
  for select using (auth.uid() = user_id);
create policy "own checkins" on public.checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own vault" on public.vault_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own capsules" on public.capsules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Les accès sont en lecture seule côté client : seul le webhook (service_role)
-- écrit. Le hard paywall n'accorde jamais confiance au client.
create policy "own entitlement read" on public.entitlements
  for select using (auth.uid() = user_id);

-- ═══ Buckets de stockage (privés, chiffrés au repos par Supabase) ═══════════
insert into storage.buckets (id, name, public) values
  ('vault', 'vault', false),
  ('capsules', 'capsules', false)
on conflict (id) do nothing;

create policy "own vault files" on storage.objects
  for all using (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'vault' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own capsule files" on storage.objects
  for all using (bucket_id = 'capsules' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'capsules' and auth.uid()::text = (storage.foldername(name))[1]);
