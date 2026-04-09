begin;

create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'hr', 'manager', 'employee');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'access_level') then
    create type access_level as enum ('na', 'read', 'update', 'crud');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_status') then
    create type employee_status as enum ('active', 'inactive', 'on_leave', 'terminated');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('todo', 'in_progress', 'review', 'blocked', 'done');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high', 'critical');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'leave_status') then
    create type leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'leave_type') then
    create type leave_type as enum ('casual', 'sick', 'earned', 'unpaid', 'other');
  end if;
end $$;

-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Permission matrix tables
create table modules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table features (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, name)
);

create table role_feature_permissions (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  feature_id uuid not null references features(id) on delete cascade,
  access access_level not null default 'na',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(role, feature_id)
);

-- Organization tables
create table plants_offices (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  location text,
  address text,
  timezone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table designations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table responsibilities (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table designation_responsibilities (
  id uuid primary key default gen_random_uuid(),
  designation_id uuid not null references designations(id) on delete cascade,
  responsibility_id uuid not null references responsibilities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(designation_id, responsibility_id)
);

-- Employee profile (personal / academic / professional / health)
create table employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  employee_code text unique,
  role app_role not null default 'employee',
  status employee_status not null default 'active',

  first_name text not null,
  last_name text,
  email text not null unique,
  phone text,
  date_of_birth date,
  gender text,

  qualification text,
  institution text,
  graduation_year int,

  joining_date date,
  experience_years numeric(4,1),
  designation_id uuid references designations(id) on delete set null,
  manager_employee_id uuid references employees(id) on delete set null,
  plant_office_id uuid references plants_offices(id) on delete set null,

  blood_group text,
  allergies text,
  emergency_contact_name text,
  emergency_contact_phone text,

  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects / teams
create table projects (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  description text,
  start_date date,
  end_date date,
  manager_employee_id uuid references employees(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  member_role text,
  joined_on date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, employee_id)
);

create table team_member_swaps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  old_employee_id uuid not null references employees(id) on delete restrict,
  new_employee_id uuid not null references employees(id) on delete restrict,
  swapped_by uuid references employees(id) on delete set null,
  reason text,
  swapped_at timestamptz not null default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  assigned_to uuid references employees(id) on delete set null,
  assigned_by uuid references employees(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  updated_by uuid references employees(id) on delete set null,
  note text,
  media_url text,
  media_type text,
  created_at timestamptz not null default now()
);

-- Leave management
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  leave_type leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status not null default 'pending',
  approver_id uuid references employees(id) on delete set null,
  decision_note text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- Communication and org updates
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table holiday_calendar (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null,
  title text not null,
  description text,
  plant_office_id uuid references plants_offices(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(holiday_date, title, plant_office_id)
);

create table notice_board (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  priority text not null default 'normal',
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table upcoming_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_start_at timestamptz not null,
  event_end_at timestamptz,
  location text,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (event_end_at is null or event_end_at >= event_start_at)
);

-- Internal chat
create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  thread_name text,
  is_group boolean not null default false,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table chat_thread_members (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(thread_id, employee_id)
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_employee_id uuid references employees(id) on delete set null,
  message text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

-- Training
create table training_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  trainer_name text,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table employee_trainings (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  training_program_id uuid not null references training_programs(id) on delete cascade,
  status text not null default 'assigned',
  score numeric(5,2),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_id, training_program_id)
);

-- Helpful indexes
create index idx_features_module_id on features(module_id);
create index idx_permissions_role on role_feature_permissions(role);
create index idx_employees_role on employees(role);
create index idx_employees_manager on employees(manager_employee_id);
create index idx_project_members_project on project_members(project_id);
create index idx_project_members_employee on project_members(employee_id);
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_assigned_to on tasks(assigned_to);
create index idx_tasks_status on tasks(status);
create index idx_leave_requests_employee on leave_requests(employee_id);
create index idx_leave_requests_status on leave_requests(status);
create index idx_announcements_published on announcements(is_published, publish_at);
create index idx_chat_messages_thread on chat_messages(thread_id, created_at);

-- Add updated_at triggers where applicable
DO $$
DECLARE
  t text;
  tables text[] := array[
    'modules',
    'features',
    'role_feature_permissions',
    'plants_offices',
    'designations',
    'responsibilities',
    'employees',
    'projects',
    'project_members',
    'tasks',
    'leave_requests',
    'announcements',
    'notice_board',
    'upcoming_events',
    'chat_threads',
    'training_programs',
    'employee_trainings'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = 'set_updated_at_' || t
    ) THEN
      EXECUTE format(
        'create trigger %I before update on %I for each row execute function set_updated_at()',
        'set_updated_at_' || t,
        t
      );
    END IF;
  END LOOP;
END $$;

-- Seed modules
insert into modules (name, description)
values
  ('Employee', 'Employee profile, list, and registration features'),
  ('Plants / Offices', 'Company plant and office management'),
  ('Projects', 'Project creation and project listing'),
  ('Roles', 'Designation management'),
  ('Responsibilities', 'Responsibility setup and listing'),
  ('Teams', 'Project teams and member swap'),
  ('Tasks', 'Task lifecycle and updates'),
  ('Dashboard', 'Role-based dashboard visibility'),
  ('Chat', 'Internal communication'),
  ('Training', 'Training assignments and tracking'),
  ('Leave Management', 'Leave request workflow'),
  ('Announcements', 'Announcements and notices'),
  ('Holiday Calendar', 'Holiday management'),
  ('Notice Board', 'Public notice board'),
  ('Upcoming Events', 'Events planning and visibility')
on conflict (name) do nothing;

-- Seed features + role permissions from HRIMS feature list
with seed(module_name, feature_name, admin_access, hr_access, manager_access, employee_access) as (
  values
    ('Employee', 'Register Employee', 'crud', 'crud', 'read', 'read'),
    ('Employee', 'Employee list', 'read', 'read', 'read', 'read'),
    ('Employee', 'Employee Profile (Personal / Academic / Professional / Health)', 'read', 'read', 'read', 'crud'),

    ('Plants / Offices', 'Plants / Offices', 'crud', 'crud', 'read', 'read'),
    ('Plants / Offices', 'Plants / Offices List', 'read', 'read', 'read', 'read'),

    ('Projects', 'Projects', 'read', 'read', 'crud', 'read'),
    ('Projects', 'Projects List', 'read', 'read', 'read', 'read'),

    ('Roles', 'Create Designation', 'read', 'crud', 'read', 'read'),
    ('Roles', 'Designation List', 'read', 'read', 'read', 'read'),

    ('Responsibilities', 'Create Responsibilities', 'read', 'crud', 'read', 'read'),
    ('Responsibilities', 'List Responsibilities', 'read', 'read', 'read', 'read'),

    ('Teams', 'Project Team', 'read', 'read', 'crud', 'read'),
    ('Teams', 'Team List', 'read', 'read', 'read', 'read'),
    ('Teams', 'Team Member Swap', 'read', 'read', 'crud', 'read'),

    ('Tasks', 'Tasks', 'read', 'read', 'crud', 'read'),
    ('Tasks', 'Tasks List', 'read', 'read', 'read', 'read'),
    ('Tasks', 'Tasks Update / Completion', 'read', 'read', 'read', 'update'),
    ('Tasks', 'Tasks Note / Images / Video', 'read', 'read', 'read', 'crud'),
    ('Tasks', 'Tasks Progress', 'read', 'read', 'read', 'read'),

    ('Dashboard', 'Admin Dash Board', 'read', 'read', 'na', 'na'),
    ('Dashboard', 'Manager Dash Board', 'read', 'read', 'read', 'na'),
    ('Dashboard', 'Employee Dashboard', 'read', 'read', 'read', 'read'),

    ('Chat', 'Internal Chat System', 'na', 'na', 'na', 'na'),
    ('Training', 'Training', 'na', 'na', 'na', 'na'),
    ('Leave Management', 'Leave Management', 'na', 'na', 'na', 'na'),
    ('Announcements', 'Announcements', 'na', 'na', 'na', 'na'),
    ('Holiday Calendar', 'Holiday Calendar', 'na', 'na', 'na', 'na'),
    ('Notice Board', 'Notice Board', 'na', 'na', 'na', 'na'),
    ('Upcoming Events', 'Upcoming Events', 'na', 'na', 'na', 'na')
), inserted_features as (
  insert into features (module_id, name)
  select m.id, s.feature_name
  from seed s
  join modules m on m.name = s.module_name
  on conflict (module_id, name) do update set name = excluded.name
  returning id, module_id, name
)
insert into role_feature_permissions (role, feature_id, access)
select role_name, f.id, access_value::access_level
from seed s
join modules m on m.name = s.module_name
join features f on f.module_id = m.id and f.name = s.feature_name
cross join lateral (
  values
    ('admin'::app_role, s.admin_access),
    ('hr'::app_role, s.hr_access),
    ('manager'::app_role, s.manager_access),
    ('employee'::app_role, s.employee_access)
) as permission_rows(role_name, access_value)
on conflict (role, feature_id) do update set access = excluded.access;

commit;
