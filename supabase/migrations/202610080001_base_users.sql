-- Run this migration on a NEW Supabase project for the reusable Igloo base.
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin' and is_active);
$$;
create policy "Admins read profiles" on public.profiles for select to authenticated using ((select public.is_admin()));
create policy "Admins insert profiles" on public.profiles for insert to authenticated with check ((select public.is_admin()));

create function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();

create function public.guard_last_active_admin() returns trigger language plpgsql set search_path = '' as $$
begin
  if old.role = 'admin' and old.is_active and (new.role <> 'admin' or not new.is_active) then
    perform pg_advisory_xact_lock(hashtext('igloo_last_active_admin'));
    if not exists (select 1 from public.profiles where id <> old.id and role = 'admin' and is_active) then
      raise exception 'Debe permanecer al menos un administrador activo.';
    end if;
  end if;
  return new;
end;
$$;
create trigger profiles_guard_last_active_admin before update on public.profiles for each row execute function public.guard_last_active_admin();

create function public.update_managed_user(target_user_id uuid, target_full_name text, target_role public.app_role, target_is_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'No autorizado.'; end if;
  if target_full_name is null or char_length(trim(target_full_name)) not between 2 and 120 then raise exception 'Nombre inválido.'; end if;
  if target_role is null or target_is_active is null then raise exception 'Datos de usuario incompletos.'; end if;
  if target_user_id = auth.uid() and (target_role <> 'admin' or not target_is_active) then raise exception 'No puedes quitarte tu propio acceso de administrador.'; end if;
  update public.profiles set full_name = trim(target_full_name), role = target_role, is_active = target_is_active where id = target_user_id;
  if not found then raise exception 'Usuario no encontrado.'; end if;
end;
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function public.guard_last_active_admin() from public, anon, authenticated;
revoke all on function public.update_managed_user(uuid, text, public.app_role, boolean) from public, anon;
grant execute on function public.update_managed_user(uuid, text, public.app_role, boolean) to authenticated;
