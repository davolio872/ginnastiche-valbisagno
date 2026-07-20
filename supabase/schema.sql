create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'presidente', 'segreteria', 'direttore_tecnico', 'tecnico', 'insegnante', 'genitore', 'famiglia', 'atleta');
create type public.event_type as enum ('allenamento', 'gara', 'saggio', 'stage', 'riunione', 'chiusura');
create type public.attendance_status as enum ('presente', 'assente', 'assente giustificato', 'ritardo', 'uscita anticipata');
create type public.communication_category as enum ('allenamenti', 'gare', 'documenti', 'quote', 'eventi', 'urgente');
create type public.goal_status as enum ('da iniziare', 'in corso', 'raggiunto', 'consolidato');
create type public.certificate_status as enum ('valido', 'in scadenza', 'scaduto');
create type public.payment_status as enum ('pagato', 'non pagato', 'parziale', 'esonerato', 'da pagare', 'scaduto');
create type public.trial_status as enum ('nuova', 'contattata', 'prova fissata', 'iscritta', 'non interessata');

create table public.users_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'genitore',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  color text default '#0b6bb6',
  season text,
  age_range text,
  level text,
  gym text,
  days text,
  times text,
  created_at timestamptz not null default now()
);

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users_profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  gender text,
  tax_code text,
  birth_date date not null,
  guardian_id uuid references public.guardians(id) on delete set null,
  medical_certificate_expires_at date,
  medical_certificate_type text,
  medical_notes text,
  profile_photo_url text,
  created_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete cascade,
  coach_id uuid references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint team_member_has_person check (
    (athlete_id is not null and coach_id is null) or
    (athlete_id is null and coach_id is not null)
  ),
  unique (team_id, athlete_id),
  unique (team_id, coach_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  type public.event_type not null,
  title text not null,
  event_date date not null,
  starts_at time,
  ends_at time,
  location text,
  description text,
  attachments text[] default '{}',
  created_by uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.event_teams (
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (event_id, team_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  status public.attendance_status not null,
  reported_by uuid references public.users_profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, athlete_id)
);

create table public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users_profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes int generated always as (
    case when ended_at is null then null else greatest(0, floor(extract(epoch from ended_at - started_at) / 60)::int) end
  ) stored,
  created_at timestamptz not null default now()
);

create table public.training_programs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  objectives text not null,
  exercises text,
  athletic_preparation text,
  technical_elements text,
  final_notes text,
  created_by uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category public.communication_category not null,
  is_urgent boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.users_profiles(id) on delete set null,
  requires_read_confirmation boolean not null default false
);

create table public.communication_teams (
  communication_id uuid not null references public.communications(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (communication_id, team_id)
);

create table public.communication_reads (
  id uuid primary key default gen_random_uuid(),
  communication_id uuid not null references public.communications(id) on delete cascade,
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (communication_id, user_id)
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  competition_date date not null,
  location text,
  meeting_time text,
  program text,
  documents text[] default '{}',
  results text,
  media_urls text[] default '{}',
  technical_notes text,
  created_at timestamptz not null default now()
);

create table public.competition_athletes (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  primary key (competition_id, athlete_id)
);

create table public.competition_teams (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (competition_id, team_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  apparatus text not null,
  created_at timestamptz not null default now()
);

create table public.athlete_goals (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  custom_title text,
  status public.goal_status not null default 'da iniziare',
  assigned_by uuid references public.users_profiles(id) on delete set null,
  coach_note text,
  achieved_at date,
  created_at timestamptz not null default now()
);

create table public.medical_certificates (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  file_url text not null,
  expires_at date not null,
  status public.certificate_status not null default 'valido',
  uploaded_by uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  description text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  paid_at date,
  status public.payment_status not null default 'da pagare',
  receipt_url text,
  created_at timestamptz not null default now()
);

create table public.athlete_memberships (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  season text not null,
  federation text,
  card_number text,
  issued_at date,
  status text not null default 'attiva',
  source text,
  imported_at timestamptz not null default now(),
  unique (athlete_id, season, federation)
);

create table public.substitution_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  absent_teacher_id uuid not null references public.users_profiles(id) on delete cascade,
  substitute_teacher_id uuid references public.users_profiles(id) on delete set null,
  reason text,
  status text not null default 'richiesta',
  created_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  event_id uuid references public.events(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  season text,
  uploaded_by uuid references public.users_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.trial_requests (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  age int not null check (age between 2 and 99),
  guardian_name text not null,
  phone text not null,
  email text not null,
  discipline text not null,
  notes text,
  privacy_consent boolean not null check (privacy_consent = true),
  status public.trial_status not null default 'nuova',
  created_at timestamptz not null default now()
);

create schema if not exists gv_private;

create or replace function gv_private.current_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.users_profiles where id = (select auth.uid());
$$;

create or replace function gv_private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(gv_private.current_role() in ('admin', 'presidente'), false);
$$;

create or replace function gv_private.is_coach_for_team(team_id_to_check uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = team_id_to_check
      and coach_id = (select auth.uid())
  );
$$;

create or replace function gv_private.can_access_athlete(athlete_id_to_check uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(gv_private.is_admin(), false)
    or exists (
      select 1
      from public.guardians g
      join public.athletes a on a.guardian_id = g.id
      where a.id = athlete_id_to_check and g.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.athletes a
      where a.id = athlete_id_to_check and a.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.team_members tm_athlete
      join public.team_members tm_coach on tm_coach.team_id = tm_athlete.team_id
      where tm_athlete.athlete_id = athlete_id_to_check
        and tm_coach.coach_id = (select auth.uid())
    );
$$;

revoke all on schema gv_private from public;
grant usage on schema gv_private to authenticated;
grant execute on all functions in schema gv_private to authenticated;

alter table public.users_profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.teams enable row level security;
alter table public.athletes enable row level security;
alter table public.team_members enable row level security;
alter table public.events enable row level security;
alter table public.event_teams enable row level security;
alter table public.attendance enable row level security;
alter table public.teacher_attendance enable row level security;
alter table public.training_programs enable row level security;
alter table public.communications enable row level security;
alter table public.communication_teams enable row level security;
alter table public.communication_reads enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_athletes enable row level security;
alter table public.competition_teams enable row level security;
alter table public.goals enable row level security;
alter table public.athlete_goals enable row level security;
alter table public.medical_certificates enable row level security;
alter table public.payments enable row level security;
alter table public.athlete_memberships enable row level security;
alter table public.substitution_requests enable row level security;
alter table public.gallery_items enable row level security;
alter table public.trial_requests enable row level security;

create policy "profiles self or admin select" on public.users_profiles for select to authenticated
using (id = (select auth.uid()) or gv_private.is_admin());
create policy "profiles admin manage" on public.users_profiles for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "guardians scoped select" on public.guardians for select to authenticated
using (gv_private.is_admin() or user_id = (select auth.uid()) or exists (
  select 1 from public.athletes a where a.guardian_id = guardians.id and gv_private.can_access_athlete(a.id)
));
create policy "guardians admin manage" on public.guardians for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "teams visible by assignment" on public.teams for select to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.team_members tm
  where tm.team_id = teams.id
    and (tm.coach_id = (select auth.uid()) or gv_private.can_access_athlete(tm.athlete_id))
));
create policy "teams admin manage" on public.teams for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "athletes scoped select" on public.athletes for select to authenticated
using (gv_private.can_access_athlete(id));
create policy "athletes admin manage" on public.athletes for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "team members visible scoped" on public.team_members for select to authenticated
using (gv_private.is_admin() or coach_id = (select auth.uid()) or gv_private.is_coach_for_team(team_id) or gv_private.can_access_athlete(athlete_id));
create policy "team members admin manage" on public.team_members for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "events scoped select" on public.events for select to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.event_teams et
  join public.team_members tm on tm.team_id = et.team_id
  where et.event_id = events.id
    and (tm.coach_id = (select auth.uid()) or gv_private.can_access_athlete(tm.athlete_id))
));
create policy "events admin coach manage" on public.events for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() = 'tecnico')
with check (gv_private.is_admin() or gv_private.current_role() = 'tecnico');

create policy "event teams scoped select" on public.event_teams for select to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id) or exists (
  select 1 from public.team_members tm where tm.team_id = event_teams.team_id and gv_private.can_access_athlete(tm.athlete_id)
));
create policy "event teams admin coach manage" on public.event_teams for all to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id))
with check (gv_private.is_admin() or gv_private.is_coach_for_team(team_id));

create policy "attendance scoped select" on public.attendance for select to authenticated
using (gv_private.can_access_athlete(athlete_id));
create policy "attendance coach admin insert update" on public.attendance for all to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.team_members tm where tm.athlete_id = attendance.athlete_id and gv_private.is_coach_for_team(tm.team_id)
))
with check (gv_private.is_admin() or exists (
  select 1 from public.team_members tm where tm.athlete_id = attendance.athlete_id and gv_private.is_coach_for_team(tm.team_id)
));

create policy "communications scoped select" on public.communications for select to authenticated
using (gv_private.is_admin() or not exists (
  select 1 from public.communication_teams ct where ct.communication_id = communications.id
) or exists (
  select 1 from public.communication_teams ct
  join public.team_members tm on tm.team_id = ct.team_id
  where ct.communication_id = communications.id
    and (tm.coach_id = (select auth.uid()) or gv_private.can_access_athlete(tm.athlete_id))
));
create policy "communications admin coach manage" on public.communications for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() = 'tecnico')
with check (gv_private.is_admin() or gv_private.current_role() = 'tecnico');

create policy "communication teams scoped select" on public.communication_teams for select to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id) or exists (
  select 1 from public.team_members tm where tm.team_id = communication_teams.team_id and gv_private.can_access_athlete(tm.athlete_id)
));
create policy "communication teams admin coach manage" on public.communication_teams for all to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id))
with check (gv_private.is_admin() or gv_private.is_coach_for_team(team_id));

create policy "reads own select" on public.communication_reads for select to authenticated
using (user_id = (select auth.uid()) or gv_private.is_admin());
create policy "reads own insert" on public.communication_reads for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "competitions scoped select" on public.competitions for select to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.competition_athletes ca where ca.competition_id = competitions.id and gv_private.can_access_athlete(ca.athlete_id)
));
create policy "competitions admin coach manage" on public.competitions for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() = 'tecnico')
with check (gv_private.is_admin() or gv_private.current_role() = 'tecnico');

create policy "competition athletes scoped" on public.competition_athletes for select to authenticated
using (gv_private.can_access_athlete(athlete_id));
create policy "competition athletes admin coach manage" on public.competition_athletes for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "competition teams scoped" on public.competition_teams for select to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id));
create policy "competition teams admin coach manage" on public.competition_teams for all to authenticated
using (gv_private.is_admin() or gv_private.is_coach_for_team(team_id))
with check (gv_private.is_admin() or gv_private.is_coach_for_team(team_id));

create policy "goals visible authenticated" on public.goals for select to authenticated using (true);
create policy "goals admin coach manage" on public.goals for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() = 'tecnico')
with check (gv_private.is_admin() or gv_private.current_role() = 'tecnico');

create policy "athlete goals scoped select" on public.athlete_goals for select to authenticated
using (gv_private.can_access_athlete(athlete_id));
create policy "athlete goals coach admin manage" on public.athlete_goals for all to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.team_members tm where tm.athlete_id = athlete_goals.athlete_id and gv_private.is_coach_for_team(tm.team_id)
))
with check (gv_private.is_admin() or exists (
  select 1 from public.team_members tm where tm.athlete_id = athlete_goals.athlete_id and gv_private.is_coach_for_team(tm.team_id)
));

create policy "certificates scoped select" on public.medical_certificates for select to authenticated
using (gv_private.can_access_athlete(athlete_id));
create policy "certificates admin parent manage" on public.medical_certificates for all to authenticated
using (gv_private.is_admin() or exists (
  select 1 from public.athletes a join public.guardians g on g.id = a.guardian_id
  where a.id = medical_certificates.athlete_id and g.user_id = (select auth.uid())
))
with check (gv_private.is_admin() or exists (
  select 1 from public.athletes a join public.guardians g on g.id = a.guardian_id
  where a.id = medical_certificates.athlete_id and g.user_id = (select auth.uid())
));

create policy "payments scoped select" on public.payments for select to authenticated
using (gv_private.can_access_athlete(athlete_id));
create policy "payments admin manage" on public.payments for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

create policy "gallery scoped select" on public.gallery_items for select to authenticated
using (gv_private.is_admin() or team_id is null or gv_private.is_coach_for_team(team_id) or exists (
  select 1 from public.team_members tm where tm.team_id = gallery_items.team_id and gv_private.can_access_athlete(tm.athlete_id)
));
create policy "gallery admin coach manage" on public.gallery_items for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() = 'tecnico')
with check (gv_private.is_admin() or gv_private.current_role() = 'tecnico');

create policy "trial requests public insert" on public.trial_requests for insert to anon, authenticated
with check (privacy_consent = true);
create policy "trial requests admin select manage" on public.trial_requests for all to authenticated
using (gv_private.is_admin()) with check (gv_private.is_admin());

insert into public.teams (name, description, color, season) values
  ('Pulcini', 'Gruppo Pulcini. Insegnanti: Toscano Deborah, Spatari Arianna.', '#18aaa5', '2025/2026'),
  ('Pre-Agonistica/Mignon', 'Gruppo Pre-Agonistica/Mignon. Insegnanti: Ventroni Matilda, Strazzera Melissa.', '#0a6d78', '2025/2026'),
  ('Rassegna', 'Gruppo Rassegna. Insegnanti: Viale Denise, Esposito Alessia, Spatari Arianna.', '#38bdf8', '2025/2026'),
  ('Silver', 'Gruppo Silver. Insegnanti: Arthemalle Silvia, Toscano Deborah, Cavestro Amanda.', '#0ea5e9', '2025/2026'),
  ('Agonistica', 'Gruppo Agonistica. Direttore tecnico: Mariotto Serena. Insegnanti: Matera Giorgia, Caiti Aurora, Ravaschio Chiara.', '#063f4d', '2025/2026'),
  ('Acrobatica', 'Gruppo Acrobatica.', '#0891b2', '2025/2026'),
  ('Corso Adulti', 'Corso Adulti.', '#0284c7', '2025/2026')
on conflict (name) do nothing;

insert into public.goals (title, apparatus) values
  ('verticale', 'corpo libero'),
  ('ruota', 'corpo libero'),
  ('ponte', 'corpo libero'),
  ('rondata', 'corpo libero'),
  ('flic', 'corpo libero'),
  ('salto avanti', 'corpo libero'),
  ('salto indietro', 'corpo libero'),
  ('trave', 'trave'),
  ('parallele', 'parallele'),
  ('volteggio', 'volteggio'),
  ('corpo libero', 'corpo libero')
on conflict (title) do nothing;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant insert on public.trial_requests to anon;
grant usage, select on all sequences in schema public to authenticated;

create index if not exists idx_athlete_goals_assigned_by on public.athlete_goals(assigned_by);
create index if not exists idx_athlete_goals_athlete_id on public.athlete_goals(athlete_id);
create index if not exists idx_athlete_goals_goal_id on public.athlete_goals(goal_id);
create index if not exists idx_athletes_guardian_id on public.athletes(guardian_id);
create index if not exists idx_athletes_user_id on public.athletes(user_id);
create unique index if not exists athletes_tax_code_unique on public.athletes (tax_code) where tax_code is not null and tax_code <> '';
create index if not exists idx_athletes_last_first_birth on public.athletes(last_name, first_name, birth_date);
create index if not exists idx_attendance_athlete_id on public.attendance(athlete_id);
create index if not exists idx_attendance_reported_by on public.attendance(reported_by);
create index if not exists idx_communication_reads_user_id on public.communication_reads(user_id);
create index if not exists idx_communication_teams_team_id on public.communication_teams(team_id);
create index if not exists idx_communications_created_by on public.communications(created_by);
create index if not exists idx_competition_athletes_athlete_id on public.competition_athletes(athlete_id);
create index if not exists idx_competition_teams_team_id on public.competition_teams(team_id);
create index if not exists idx_event_teams_team_id on public.event_teams(team_id);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_gallery_items_event_id on public.gallery_items(event_id);
create index if not exists idx_gallery_items_team_id on public.gallery_items(team_id);
create index if not exists idx_gallery_items_uploaded_by on public.gallery_items(uploaded_by);
create index if not exists idx_guardians_user_id on public.guardians(user_id);
create index if not exists idx_medical_certificates_athlete_id on public.medical_certificates(athlete_id);
create index if not exists idx_medical_certificates_uploaded_by on public.medical_certificates(uploaded_by);
create index if not exists idx_payments_athlete_id on public.payments(athlete_id);
create index if not exists idx_team_members_athlete_id on public.team_members(athlete_id);
create index if not exists idx_team_members_coach_id on public.team_members(coach_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('athlete-media', 'athlete-media', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('certificates', 'certificates', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "athlete media authenticated read" on storage.objects for select to authenticated
using (bucket_id = 'athlete-media');
create policy "athlete media staff insert" on storage.objects for insert to authenticated
with check (bucket_id = 'athlete-media' and (gv_private.is_admin() or gv_private.current_role() = 'tecnico'));
create policy "athlete media staff update" on storage.objects for update to authenticated
using (bucket_id = 'athlete-media' and (gv_private.is_admin() or gv_private.current_role() = 'tecnico'))
with check (bucket_id = 'athlete-media' and (gv_private.is_admin() or gv_private.current_role() = 'tecnico'));
create policy "athlete media staff delete" on storage.objects for delete to authenticated
using (bucket_id = 'athlete-media' and (gv_private.is_admin() or gv_private.current_role() = 'tecnico'));

create policy "certificates authenticated read" on storage.objects for select to authenticated
using (bucket_id = 'certificates');
create policy "certificates admin parent insert" on storage.objects for insert to authenticated
with check (bucket_id = 'certificates' and (gv_private.is_admin() or gv_private.current_role() = 'genitore'));
create policy "certificates admin parent update" on storage.objects for update to authenticated
using (bucket_id = 'certificates' and (gv_private.is_admin() or gv_private.current_role() = 'genitore'))
with check (bucket_id = 'certificates' and (gv_private.is_admin() or gv_private.current_role() = 'genitore'));
create policy "certificates admin parent delete" on storage.objects for delete to authenticated
using (bucket_id = 'certificates' and (gv_private.is_admin() or gv_private.current_role() = 'genitore'));

create policy "attendance parent absence insert" on public.attendance for insert to authenticated
with check (
  status = 'assente' and exists (
    select 1 from public.athletes a
    join public.guardians g on g.id = a.guardian_id
    where a.id = attendance.athlete_id and g.user_id = (select auth.uid())
  )
);

create policy "teacher attendance staff scoped" on public.teacher_attendance for select to authenticated
using (
  gv_private.is_admin()
  or gv_private.current_role() in ('presidente', 'segreteria', 'direttore_tecnico')
  or teacher_id = (select auth.uid())
);
create policy "teacher attendance staff manage own" on public.teacher_attendance for all to authenticated
using (gv_private.is_admin() or teacher_id = (select auth.uid()) or gv_private.current_role() in ('presidente', 'direttore_tecnico'))
with check (gv_private.is_admin() or teacher_id = (select auth.uid()) or gv_private.current_role() in ('presidente', 'direttore_tecnico'));

create policy "training programs scoped select" on public.training_programs for select to authenticated
using (
  gv_private.is_admin()
  or gv_private.current_role() in ('presidente', 'segreteria', 'direttore_tecnico')
  or team_id is null
  or gv_private.is_coach_for_team(team_id)
  or exists (select 1 from public.team_members tm where tm.team_id = training_programs.team_id and gv_private.can_access_athlete(tm.athlete_id))
);
create policy "training programs staff manage" on public.training_programs for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'direttore_tecnico') or team_id is null or gv_private.is_coach_for_team(team_id))
with check (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'direttore_tecnico') or team_id is null or gv_private.is_coach_for_team(team_id));

create policy "memberships scoped select" on public.athlete_memberships for select to authenticated
using (gv_private.can_access_athlete(athlete_id) or gv_private.current_role() in ('presidente', 'segreteria', 'direttore_tecnico'));
create policy "memberships office manage" on public.athlete_memberships for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'segreteria'))
with check (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'segreteria'));

create policy "substitutions staff select" on public.substitution_requests for select to authenticated
using (
  gv_private.is_admin()
  or gv_private.current_role() in ('presidente', 'direttore_tecnico')
  or absent_teacher_id = (select auth.uid())
  or substitute_teacher_id = (select auth.uid())
);
create policy "substitutions staff manage" on public.substitution_requests for all to authenticated
using (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'direttore_tecnico') or absent_teacher_id = (select auth.uid()))
with check (gv_private.is_admin() or gv_private.current_role() in ('presidente', 'direttore_tecnico') or absent_teacher_id = (select auth.uid()));
