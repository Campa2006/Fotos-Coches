-- ============================================================================
-- Gestoría Campalans · Registro de empresas contactadas
-- Script de creación de la base de datos en Supabase
-- ============================================================================
-- Instrucciones: copia TODO este archivo y pégalo en Supabase → SQL Editor →
-- "New query", y pulsa "Run". Se puede ejecutar una sola vez.
-- ============================================================================

-- Extensión necesaria para generar identificadores únicos (uuid)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabla principal: empresas
-- ----------------------------------------------------------------------------
create table if not exists public.empresas (
  id                          uuid primary key default gen_random_uuid(),

  -- Datos importados del Excel
  razon_social                text not null,
  municipio                   text,
  pagina_web                  text,
  linkedin                    text,
  email                       text,
  telefono                    text,
  tamano                      text not null default 'No encontrado'
                                constraint empresas_tamano_valido check (
                                  tamano in (
                                    '1-10 empleados',
                                    '11-50 empleados',
                                    '51-200 empleados',
                                    '201-500 empleados',
                                    '501-1.000 empleados',
                                    'Más de 1.000 empleados',
                                    'No encontrado'
                                  )
                                ),

  -- Columna calculada para detectar duplicados por razón social,
  -- ignorando mayúsculas/minúsculas y espacios sobrantes.
  razon_social_normalizada    text generated always as (
                                 lower(trim(regexp_replace(razon_social, '\s+', ' ', 'g')))
                               ) stored,

  -- Campos de seguimiento de contacto (añadidos por la aplicación)
  estado                      text not null default 'No contactado'
                                constraint empresas_estado_valido check (
                                  estado in ('No contactado', 'Contactado')
                                ),
  fecha_contacto              date,
  observaciones               text,

  -- Metadatos
  creado_en                   timestamptz not null default now(),
  actualizado_en               timestamptz not null default now()
);

comment on table public.empresas is 'Registro de empresas contactadas por Gestoría Campalans.';

-- Evita duplicados exactos por razón social normalizada, salvo para el valor
-- "no encontrado" (varias empresas pueden compartir ese valor sin ser duplicadas).
create unique index if not exists empresas_razon_social_unica
  on public.empresas (razon_social_normalizada)
  where razon_social_normalizada <> 'no encontrado' and razon_social_normalizada <> '';

-- Índices de apoyo para búsqueda y filtros
create index if not exists empresas_tamano_idx on public.empresas (tamano);
create index if not exists empresas_estado_idx on public.empresas (estado);
create index if not exists empresas_municipio_idx on public.empresas (municipio);

-- ----------------------------------------------------------------------------
-- Actualiza automáticamente "actualizado_en" en cada modificación
-- ----------------------------------------------------------------------------
create or replace function public.empresas_set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists empresas_actualizado_en on public.empresas;
create trigger empresas_actualizado_en
  before update on public.empresas
  for each row
  execute function public.empresas_set_actualizado_en();

-- ----------------------------------------------------------------------------
-- Seguridad: solo el usuario autenticado (el único usuario de la app)
-- puede leer o modificar datos. No hay registro público, así que en la
-- práctica esto restringe el acceso a la única persona que inicie sesión.
-- ----------------------------------------------------------------------------
alter table public.empresas enable row level security;

drop policy if exists "empresas_select_autenticados" on public.empresas;
create policy "empresas_select_autenticados"
  on public.empresas for select
  to authenticated
  using (true);

drop policy if exists "empresas_insert_autenticados" on public.empresas;
create policy "empresas_insert_autenticados"
  on public.empresas for insert
  to authenticated
  with check (true);

drop policy if exists "empresas_update_autenticados" on public.empresas;
create policy "empresas_update_autenticados"
  on public.empresas for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "empresas_delete_autenticados" on public.empresas;
create policy "empresas_delete_autenticados"
  on public.empresas for delete
  to authenticated
  using (true);

-- No se crea ninguna política para el rol "anon": los usuarios no
-- autenticados no pueden leer ni escribir ningún dato.

-- ============================================================================
-- Fin del script. Siguiente paso: crea el único usuario en
-- Authentication → Users → Add user (ver instrucciones aparte).
-- ============================================================================
