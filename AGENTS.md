<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Forma de trabajar en Igloo Base

Este archivo define cómo desarrollar esta aplicación. El objetivo es una interfaz clara, consistente y fácil de mantener. Las instrucciones concretas del usuario tienen prioridad sobre estas convenciones.

## Antes de implementar

- Entiende el flujo solicitado y revisa los componentes, rutas y patrones existentes antes de crear otros.
- Consulta la documentación de la versión instalada de Next.js en `node_modules/next/dist/docs/` para las APIs que vayas a usar.
- Haz el cambio más pequeño que resuelva el problema completo. No agregues funciones, abstracciones, dependencias o carpetas por si acaso; instalar una pieza de shadcn necesaria para la tarea sí corresponde al flujo normal.
- Conserva las utilidades y composiciones reutilizables aunque una pantalla todavía no las use. No borres código solo por no encontrar referencias actuales; elimina lo que el usuario pida retirar o lo que sea claramente específico de una función ya descartada.

## Skills del proyecto

- Para construir o modificar componentes y páginas React/Next.js, usa `vercel-react-best-practices` y consulta solo las reglas relacionadas con la tarea.
- Para buscar, instalar o componer piezas de shadcn, usa `shadcn`. Respeta `components.json` y las decisiones visuales de esta guía: las plantillas de ejemplo de una skill no justifican añadir tarjetas ni sobrescribir componentes existentes.
- Para Auth, clientes, sesiones, CLI u otras funciones de Supabase, usa `supabase`. Si el trabajo también cambia SQL, esquema, migraciones, funciones o RLS, usa además `supabase-postgres-best-practices`.
- Para una revisión solicitada de interfaz o accesibilidad, usa `web-design-guidelines`. No hace falta cargarla en tareas que no afecten la interfaz.
- Estas skills viven en `.agents/skills/`. Las preferencias del usuario y las convenciones específicas de este proyecto prevalecen sobre ejemplos genéricos de las skills.

## Diseño visual de páginas

- La dirección visual es sobria y limpia: buena tipografía, espacios generosos pero medidos, alineación consistente y una jerarquía clara entre título, descripción, contenido y acciones.
- Usa la estructura del dashboard existente. Para una página interna, empieza con `PageHeader` cuando corresponda; después muestra el contenido directamente. Prefiere tablas o listas para conjuntos de datos, `EmptyState` para ausencia de datos y formularios claros para capturar información.
- No uses tarjetas como recurso habitual. Evita cuadrículas de `Card`, paneles con sombra, bordes alrededor de cada sección, degradados y métricas decorativas. Separa el contenido con espacio, encabezados y divisores sutiles. Usa una tarjeta solo cuando el usuario la pida o el contenido necesite realmente una superficie independiente.
- Mantén una acción principal reconocible por pantalla. Agrupa acciones secundarias sin llenar cada fila o encabezado de botones e iconos. Usa iconos Lucide solo cuando aporten significado.
- Diseña estados de carga, vacío, error y éxito donde el flujo los requiera. Escribe textos breves y concretos en español. No dejes datos de muestra ni textos de relleno en la experiencia final.
- Revisa escritorio y móvil. Cuida foco visible, navegación con teclado, etiquetas de formularios, contraste y movimiento reducido.
- La apariencia debe partir de la configuración de shadcn y los tokens de `src/app/globals.css`. Usa las variantes y tamaños ya disponibles. Añade solo clases de disposición o ajustes puntuales; no rediseñes cada componente con colores, radios y estilos propios.

## Componentes

- Sigue este orden para construir interfaces: (1) reutiliza una primitiva ya instalada en `@/components/ui`; (2) si falta, busca e instala el componente correspondiente de shadcn con la configuración de `components.json`; (3) crea un componente propio únicamente cuando shadcn no ofrezca una solución adecuada o se necesite una composición específica del producto. No inventes botones, inputs, selectores, diálogos, tablas o controles equivalentes con HTML y Tailwind.
- No edites ni sobrescribas los archivos existentes de `src/components/ui` salvo petición explícita del usuario. Al instalar desde shadcn, no uses opciones que sobrescriban archivos existentes y revisa los cambios generados. Ajusta componentes mediante sus props, variantes y tamaños; reserva `className` para disposición y diferencias pequeñas. Si hace falta un estilo transversal, usa los tokens compartidos antes que estilos aislados.
- Reutiliza las composiciones de `src/components` antes de crear variantes nuevas. Una composición propia debe combinar primitivas shadcn y encapsular una necesidad real; no debe sustituir su sistema visual. Conserva componentes genéricos como `ConfirmDeleteButton` y `StatusBadge` aunque su uso futuro aún no esté definido.
- Usa Motion para transiciones entre rutas o cambios de estado que ayuden a entender la interfaz. Usa las clases de `tw-animate-css` ya incluidas en las primitivas para entradas y salidas sencillas. Evita animación ornamental o duplicar ambos sistemas en el mismo efecto.

## Gráficas

- Recharts ya está instalado. Cuando una función necesite visualizar datos, comprueba primero si el componente `Chart` de shadcn cubre el caso e instálalo si falta; compón la gráfica con Recharts sin alterar las primitivas de `src/components/ui`.
- Elige la visualización según la pregunta que debe responder el usuario. No añadas gráficas decorativas ni una tarjeta alrededor por defecto. Si una tabla o una cifra comunica mejor los datos, úsala.
- Mantén la consulta y preparación de datos en el servidor; deja la interacción y el render de Recharts en un Client Component de la función correspondiente. Usa los tokens `--chart-*` y los colores semánticos existentes, sin paletas aisladas por página.
- Muestra título, unidades, etiquetas o leyenda necesarias, estados vacíos y una alternativa textual accesible para los valores importantes. Evita datos ficticios en la interfaz final.

## Estructura y código

- `src/app` contiene rutas, layouts, metadatos y composición. Mantén `page.tsx` enfocado en obtener datos y componer la pantalla. Los flujos, formularios, acciones y componentes propios de una función viven en `src/features/<nombre>/`.
- `src/components` contiene piezas compartidas; `src/components/ui` contiene primitivas shadcn; `src/lib` contiene infraestructura y utilidades realmente compartidas; `src/hooks` y `src/types` se usan para código transversal. `src/proxy.ts` gestiona la sesión en las peticiones.
- Mantén `public`, `supabase`, variables de entorno y configuración en la raíz. Usa imports con `@/`, configurado hacia `src/`.
- Prefiere Server Components para lectura y composición. Usa Client Components solo para interacción que los requiera. Mantén validación, autorización y escrituras en el servidor.
- Evita duplicar lógica, tipos y estilos. Nombra archivos y funciones según su responsabilidad. Extrae una abstracción cuando exista reutilización real, no antes.
- Para cambios de datos, añade una migración de Supabase y define permisos con RLS. Protege rutas y acciones con las comprobaciones de acceso existentes; ocultar un botón no es autorización. Nunca envíes credenciales de servicio al navegador.

## Consultas, autenticación y Supabase

- Las lecturas de una función viven en `src/features/<nombre>/queries.ts` con `import "server-only"`; las escrituras en `actions.ts` con `"use server"`. Autoriza dentro de cada entrada con `requireUser` o `requireAdmin`, aunque el layout ya lo haga.
- Usa el cliente de sesión de `src/lib/supabase/server.ts` para consultas y RPC sujetos a RLS. Reserva `createAdminClient` para operaciones de Auth que necesiten privilegios, después de comprobar el administrador; no lo uses para evitar un error de permisos.
- Los clientes usan el contrato `Database` de `src/types/database.ts`. Los tipos compartidos de perfil y rol están en `src/types/profiles.ts`. Al cambiar el esquema, regenera el contrato desde Supabase y comprueba TypeScript. No sustituyas errores de tipos con `any` ni fuerces resultados con casts.
- Selecciona columnas explícitas, aplica filtros y pagina las listas en el servidor con un orden estable. Distingue un resultado vacío de un error. `getUsersPage` es el ejemplo de la base.
- No caches sesiones ni datos privados entre peticiones. `React.cache` se usa para deduplicar durante un render. Al cambiar respuestas o redirigir en el proxy, conserva todas las cookies y las cabeceras de caché entregadas por Supabase.
- Crea migraciones con la CLI. Define tanto permisos SQL (`GRANT`/`REVOKE`) como RLS: uno no reemplaza al otro. Mantén helpers internos en `private`, con `search_path` fijo y permisos mínimos. Las RPC públicas con privilegios deben validar al usuario dentro de la función.
- Los roles y el estado activo salen de `profiles`, nunca de `user_metadata`. Para futuras tablas, la RLS debe comprobar también el acceso activo según el flujo, además de identidad/propiedad.
- Prueba cambios de permisos con usuarios normales, administradores, inactivos y acceso anónimo. `supabase/tests/access.sql` verifica el contrato actual en una base local desechable. No ejecutes fixtures en producción.
- Si una operación cruza Auth y tablas, contempla fallos parciales y comprueba que realmente se afectó la fila esperada. Devuelve errores comprensibles al usuario y registra detalles técnicos solo en el servidor.

## Formularios y navegación

- Compón formularios con `FieldGroup`, `Field`, `FieldLabel` y controles shadcn. Asocia etiquetas mediante `htmlFor`/`id`, incluye `name` y `autoComplete`, y usa `Checkbox` para confirmaciones. Los `SelectItem` van dentro de `SelectGroup`.
- En campos de texto, usa iconos Lucide contextuales dentro de `InputGroup` (`InputGroupAddon` + `InputGroupInput`) cuando ayuden a identificar el dato; márcalos `aria-hidden` y conserva siempre la etiqueta visible. Para revelar, copiar u otra acción dentro del campo, usa `InputGroupButton` dentro de `InputGroupAddon`.
- Valida otra vez en el servidor. Bloquea envíos repetidos y evita que un diálogo descarte un resultado mientras se guarda. Al volver a abrir una edición, toma los valores actuales de sus props.
- Mantén enlaces nativos o `Link` de Next.js. No interceptes globalmente los clics para animar: puede romper paginación, anclas, apertura en otra pestaña y componentes compuestos.
- Los mensajes de éxito y error deben anunciarse de forma accesible. Usa los estados `loading.tsx`, `error.tsx`, `EmptyState` y los componentes ya disponibles cuando apliquen.
- El formateador excluye `src/components/ui` y `.agents`; no reformatees primitivas ni skills instaladas como parte de un cambio de aplicación.

## Entrega

- Verifica lo que cambiaste con `pnpm lint`, `pnpm typecheck`, las pruebas pertinentes y `pnpm build` cuando corresponda. No agregues pruebas que solo repitan la implementación.
- Si cambiaste una pantalla, inspecciona su resultado visual y sus estados principales cuando el entorno lo permita. Si cambiaste estructura, configuración o pasos de arranque, actualiza el README.
