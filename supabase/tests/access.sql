-- Run only against a disposable local database after applying all migrations.
-- Every fixture and change is rolled back, including when an assertion fails.
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', 'admin@base-test.invalid', '{"full_name":"Admin Test"}'),
  ('10000000-0000-4000-8000-000000000002', 'user@base-test.invalid', '{"full_name":"User Test"}'),
  ('10000000-0000-4000-8000-000000000003', 'inactive@base-test.invalid', '{"full_name":"Inactive Test"}');
update public.profiles set role = 'admin' where email = 'admin@base-test.invalid';
update public.profiles set role = 'admin', is_active = false where email = 'inactive@base-test.invalid';

do $$ begin
  if (select count(*) from public.profiles where email like '%@base-test.invalid') <> 3 then
    raise exception 'FAIL: Auth trigger must create all profiles';
  end if;
  if has_table_privilege('anon', 'public.profiles', 'SELECT') then
    raise exception 'FAIL: anon must not read profiles';
  end if;
  if has_table_privilege('authenticated', 'public.profiles', 'INSERT,UPDATE,DELETE') then
    raise exception 'FAIL: authenticated must not write profiles directly';
  end if;
  if has_function_privilege('anon', 'public.update_managed_user(uuid,text,public.app_role,boolean)', 'EXECUTE') then
    raise exception 'FAIL: anon must not execute management RPC';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'FAIL: user must only see their own profile';
  end if;
  begin
    perform public.update_managed_user('10000000-0000-4000-8000-000000000002', 'User Test', 'admin', true);
    raise exception 'FAIL: user escalated own role';
  exception when raise_exception then
    if sqlerrm <> 'No autorizado.' then raise; end if;
  end;
end $$;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1 or private.is_admin() then
    raise exception 'FAIL: inactive admin must not read other profiles';
  end if;
  begin
    perform public.update_managed_user('10000000-0000-4000-8000-000000000002', 'User Test', 'admin', true);
    raise exception 'FAIL: inactive admin changed access';
  exception when raise_exception then
    if sqlerrm <> 'No autorizado.' then raise; end if;
  end;
end $$;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.profiles where email like '%@base-test.invalid') <> 3 then
    raise exception 'FAIL: admin must read all profiles';
  end if;
  perform public.update_managed_user('10000000-0000-4000-8000-000000000002', ' Edited User ', 'user', false);
  if not exists (select 1 from public.profiles where full_name = 'Edited User' and not is_active) then
    raise exception 'FAIL: admin edit was not persisted';
  end if;
  begin
    perform public.update_managed_user('10000000-0000-4000-8000-000000000001', 'Admin Test', 'user', false);
    raise exception 'FAIL: admin removed own access';
  exception when raise_exception then
    if sqlerrm <> 'No puedes quitarte tu propio acceso de administrador.' then raise; end if;
  end;
  begin
    perform public.update_managed_user('10000000-0000-4000-8000-000000000009', 'Missing User', 'user', true);
    raise exception 'FAIL: missing user update silently succeeded';
  exception when raise_exception then
    if sqlerrm <> 'Usuario no encontrado.' then raise; end if;
  end;
end $$;

reset role;
update auth.users set email = 'updated@base-test.invalid' where id = '10000000-0000-4000-8000-000000000002';
do $$ begin
  if not exists (select 1 from public.profiles where email = 'updated@base-test.invalid') then
    raise exception 'FAIL: Auth email change was not synchronized';
  end if;
  -- Other users in a local database must not affect the last-admin assertion.
  update public.profiles set is_active = false where role = 'admin' and id <> '10000000-0000-4000-8000-000000000001';
  begin
    delete from auth.users where id = '10000000-0000-4000-8000-000000000001';
    raise exception 'FAIL: last active admin was deleted';
  exception when raise_exception then
    if sqlerrm <> 'Debe permanecer al menos un administrador activo.' then raise; end if;
  end;
end $$;

rollback;
