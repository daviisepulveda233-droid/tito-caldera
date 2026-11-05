-- ====================================================================
-- PANADERÍA ARTESANAL "MICHO Y TITO" · ESQUEMA SUPABASE & DATOS INICIALES
-- ====================================================================
-- Este script crea las 5 tablas necesarias para la tienda online
-- y carga los datos iniciales de Panadería (mínimo 3 categorías y 8 productos).
-- Pégalo completo en el "SQL Editor" de tu proyecto de Supabase y apretá "Run".
-- ====================================================================

-- 1. LIMPIEZA PREVIA (Opcional si reiniciás la base)
drop table if exists pedido_items cascade;
drop table if exists pedidos cascade;
drop table if exists perfiles cascade;
drop table if exists productos cascade;
drop table if exists categorias cascade;

-- 2. TABLA DE CATEGORÍAS
create table categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique
);

alter table categorias enable row level security;

-- Política de lectura pública para categorías
create policy "Categorías visibles para todos" 
  on categorias for select 
  using (true);

-- 3. TABLA DE PRODUCTOS
create table productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null check (precio >= 0),
  stock int not null default 0 check (stock >= 0),
  imagen_url text,
  categoria_id bigint references categorias(id) on delete set null,
  activo boolean not null default true
);

alter table productos enable row level security;

-- Política de lectura pública para productos activos
create policy "Productos activos visibles para todos" 
  on productos for select 
  using (activo = true);

-- 4. TABLA DE PERFILES (Extiende auth.users)
create table perfiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  rol text not null default 'cliente' check (rol in ('cliente', 'admin'))
);

alter table perfiles enable row level security;

create policy "Usuarios leen su propio perfil o admin lee todos" 
  on perfiles for select 
  using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" 
  on perfiles for update 
  using (auth.uid() = id);

-- 5. TABLA DE PEDIDOS
create table pedidos (
  id bigint generated always as identity primary key,
  usuario_id uuid references auth.users(id) on delete cascade,
  total numeric(10,2) not null check (total >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en preparación', 'listo', 'entregado', 'cancelado')),
  creado timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table pedidos enable row level security;

create policy "Usuarios ven sus propios pedidos" 
  on pedidos for select 
  using (auth.uid() = usuario_id);

create policy "Usuarios pueden crear pedidos" 
  on pedidos for insert 
  with check (auth.uid() = usuario_id);

-- 6. TABLA DE ITEMS DEL PEDIDO
-- precio_unitario: Foto del precio en el momento exacto de la compra
create table pedido_items (
  id bigint generated always as identity primary key,
  pedido_id bigint references pedidos(id) on delete cascade,
  producto_id bigint references productos(id) on delete restrict,
  cantidad int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)
);

alter table pedido_items enable row level security;

create policy "Usuarios ven los items de sus pedidos" 
  on pedido_items for select 
  using (
    exists (
      select 1 from pedidos 
      where pedidos.id = pedido_items.pedido_id 
        and pedidos.usuario_id = auth.uid()
    )
  );

-- ====================================================================
-- PASO 3: DATOS DE TU RUBRO (PANADERÍA)
-- Al menos 3 categorías y al menos 8 productos con descripciones y precios
-- Incluye un producto con stock bajo (1 o 0) para probar el "sin stock".
-- ====================================================================

-- Carga de categorías
insert into categorias (nombre) values
  ('Panes y Masa Madre'),       -- id 1
  ('Facturas y Bollería'),      -- id 2
  ('Pastelería y Tartas'),      -- id 3
  ('Sandwiches y Salados');      -- id 4

-- Carga de productos de Panadería
-- id 1 a 10 con precios creíbles en pesos y fotos listas
insert into productos (nombre, descripcion, precio, stock, categoria_id, imagen_url, activo) values
  ('Baguette Tradicional de Masa Madre', 'Corteza crocante, miga alveolada y fermentación lenta de 24 horas.', 2200.00, 15, 1, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80', true),
  ('Pan de Campo con Semillas', 'Harina integral orgánica, masa madre, lino, chía y semillas de girasol tostadas.', 3100.00, 12, 1, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', true),
  ('Ciabatta Clásica Italiana', 'Pan liviano de hidratación alta, ideal para tostadas o sándwiches gourmet.', 2400.00, 8, 1, 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80', true),
  ('Medialunas de Manteca (Docena)', 'Hojaldradas al estilo porteño con manteca de primera calidad y almíbar liviano.', 7800.00, 20, 2, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80', true),
  ('Vigilantes con Crema Pastelera y Dulce', 'Masa vienesa suave con crema pastelera artesanal y dulce de membrillo.', 950.00, 18, 2, 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?w=800&auto=format&fit=crop&q=80', true),
  ('Croissant Francés de Almendras', 'Relleno de frangipane y cubierto de almendras fileteadas tostadas.', 2900.00, 6, 2, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&auto=format&fit=crop&q=80', true),
  ('Tarta Rogel Individual', 'Finas capas crocantes rellenas de abundante dulce de leche repostero y merengue italiano.', 3800.00, 10, 3, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', true),
  ('Torta Marquise de Chocolate y Frutos Rojos', 'Base húmeda de chocolate belga, dulce de leche, crema chantilly y frutos rojos frescos.', 4500.00, 5, 3, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80', true),
  ('Chipá Correntino Tradicional (250g)', 'Bocaditos de fécula de mandioca con queso gouda y sardo estacionado.', 3200.00, 14, 4, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&auto=format&fit=crop&q=80', true),
  ('Focaccia Genovesa con Romero y Cherrys', 'Aceite de oliva virgen extra, sal marina en escamas, romero del huerto y tomatines confitados.', 2800.00, 1, 4, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop&q=80', true),
  ('Sándwich de Miga Triple Especial (x3)', 'Pan de miga casero extra tierno, jamón cocido natural, queso tybo y manteca.', 4200.00, 0, 4, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80', true);

-- Nota:
-- * Producto 10 ('Focaccia Genovesa'): stock = 1 (¡Última unidad disponible!)
-- * Producto 11 ('Sándwich de Miga'): stock = 0 (Sin stock para probar validación y respuesta 400 del backend)

-- ====================================================================
-- PASO 4: STORAGE (OPCIONAL)
-- Si subiste fotos al bucket 'productos' con el formato 1.jpg, 2.jpg...
-- Corré el siguiente comando reemplazando 'xxxx' por la ID de tu proyecto:
--
-- update productos
-- set imagen_url = 'https://xxxx.supabase.co/storage/v1/object/public/productos/' || id || '.jpg';
-- ====================================================================
