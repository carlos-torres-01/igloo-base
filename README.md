# Base Igloo

Base reutilizable para desarrollar herramientas de Igloo con Next.js, React, TypeScript, Supabase Auth, gestión de usuarios, Tailwind, componentes UI y animaciones.

Recharts está disponible para futuras visualizaciones. Cuando se implemente una gráfica, se puede añadir el componente `Chart` de shadcn según la necesidad concreta.

El código de la aplicación está en `src/` (`app`, `components`, `features`, `hooks`, `lib` y `types`). `public/`, `supabase/` y los archivos de configuración permanecen en la raíz.

## Convenciones para desarrollar

La guía de trabajo para la IA y colaboradores está en [AGENTS.md](AGENTS.md). Para la interfaz, primero reutiliza componentes shadcn instalados; si falta uno, instálalo; crea una pieza propia solo cuando shadcn no cubra la necesidad. Conserva su estilo configurado y evita tarjetas como estructura predeterminada. La lógica de cada función va en `src/features`; los cambios de datos requieren migraciones y comprobaciones de acceso en el servidor.

Las skills locales están en `.agents/skills/`: React/Next.js (Vercel), shadcn, Supabase, PostgreSQL/RLS y revisión de interfaz. `AGENTS.md` indica cuándo usar cada una; `skills-lock.json` registra su origen.

## Desarrollo

1. Instala las dependencias con `pnpm install`.
2. Crea un proyecto **nuevo** de Supabase. Copia `.env.example` a `.env.local` y configura sus credenciales.
3. Ejecuta `supabase/migrations/202610080001_base_users.sql` en ese proyecto nuevo. La migración está pensada para una base vacía.
4. Crea el primer usuario en Supabase Auth y asígnale el rol `admin` con `update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';` en el editor SQL.
5. Inicia con `pnpm dev`.

Incluye login, inicio interno, Mi cuenta y administración de usuarios. Los roles son `admin` y `user`.

## Verificación

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
