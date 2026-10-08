-- Keep internal helpers outside the Data API; only the managed-user RPC is public.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter function public.is_admin() set schema private;
alter function public.create_profile_for_new_user() set schema private;
alter function public.guard_last_active_admin() set schema private;

-- RLS limits rows; SQL grants limit operations. Both must be explicit.
drop policy "Admins insert profiles" on public.profiles;
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
grant usage on schema public to authenticated, service_role;

create index profiles_full_name_id_idx on public.profiles (full_name, id);

create or replace function private.guard_last_active_admin()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.role = 'admin' and old.is_active then
    if tg_op = 'DELETE' or new.role <> 'admin' or not new.is_active then
      perform pg_advisory_xact_lock(hashtext('igloo_last_active_admin'));
      if not exists (
        select 1 from public.profiles
        where id <> old.id and role = 'admin' and is_active
      ) then
        raise exception 'Debe permanecer al menos un administrador activo.';
      end if;
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger profiles_guard_last_active_admin on public.profiles;
create trigger profiles_guard_last_active_admin before update or delete
on public.profiles for each row execute function private.guard_last_active_admin();

create or replace function public.update_managed_user(
  target_user_id uuid,
  target_full_name text,
  target_role public.app_role,
  target_is_active boolean
) returns void language plpgsql security definer set search_path = '' as $$
begin
  -- Serialize access changes before reading authorization or locking profile rows.
  perform pg_advisory_xact_lock(hashtext('igloo_last_active_admin'));
  if not private.is_admin() then raise exception 'No autorizado.'; end if;
  if target_full_name is null or char_length(trim(target_full_name)) not between 2 and 120 then
    raise exception 'Nombre inválido.';
  end if;
  if target_role is null or target_is_active is null then
    raise exception 'Datos de usuario incompletos.';
  end if;
  if target_user_id = auth.uid() and (target_role <> 'admin' or not target_is_active) then
    raise exception 'No puedes quitarte tu propio acceso de administrador.';
  end if;
  update public.profiles
  set full_name = trim(target_full_name), role = target_role, is_active = target_is_active
  where id = target_user_id;
  if not found then raise exception 'Usuario no encontrado.'; end if;
end;
$$;

-- Email belongs to Auth; keep the read model synchronized when Auth changes it.
create function private.sync_profile_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;
create trigger on_auth_user_email_updated after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute function private.sync_profile_email();

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function private.guard_last_active_admin() from public, anon, authenticated;
revoke all on function private.sync_profile_email() from public, anon, authenticated;
revoke all on function public.update_managed_user(uuid, text, public.app_role, boolean) from public, anon;
grant execute on function public.update_managed_user(uuid, text, public.app_role, boolean) to authenticated;
