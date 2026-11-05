# Tito Calderonis · Panadería Artesanal & Tienda Online
### TP Integrador · Unidad 7: Del CRUD al E-Commerce
**Colegio Tecnológico UTN · Diseño Backend · 5.° año**  
**Profesora:** Julia Panei  
**Rubro Asignado:** Panadería  

---

## 👥 Integrantes del Grupo
- Leandro Paneblanco
- David Sepulveda
- Equipo de Desarrollo Backend UTN

---

## 🥖 Sobre el Proyecto
**Tito Calderonis** es una tienda online completa de panadería artesanal y masa madre, desarrollada con arquitectura en tres capas (**Routes → Controllers → Models**), base de datos relacional y autenticación en **Supabase**, servidor backend en **Express** y cliente reactivo moderno en **React + Tailwind CSS**.

**Cómo se ve:** diseño simple, con una paleta crema y terracota definida en `src/index.css`.

---

## 📋 Checklist de Requisitos Mínimos (Para Aprobar)

| Requisito | Qué hace | Estado |
|---|---|:---:|
| **Catálogo** | Mostrar los productos con foto, precio y stock, con filtro por categoría | ✅ **Cumplido** |
| **Carrito** | Agregar, quitar y cambiar cantidades, sin perderse al recargar la página (`localStorage`) | ✅ **Cumplido** |
| **Usuarios** | Registro y login con Supabase Auth (tabla `auth.users` y tabla `perfiles`) | ✅ **Cumplido** |
| **Compra** | El backend controla el stock y calcula el total con los precios de la base (nunca del carrito) | ✅ **Cumplido** |
| **Online** | Publicada y desplegable con backend completo | ✅ **Cumplido** |

---

## ⭐ Extras Implementados (Para Mejor Nota)

| Extra | Qué es en este proyecto | Estado |
|---|---|:---:|
| **Panel Admin (ABM)** | ABM de productos protegido con rol admin: un cliente recibe **HTTP 403 Forbidden** (incluye botón interactivo para probar el rechazo 403). | ✅ **Implementado** |
| **Buscador** | Buscar productos por nombre usando `.ilike()` en tiempo real contra el backend. | ✅ **Implementado** |
| **Mis Pedidos** | Cada usuario consulta su historial de compras con el desglose de productos y la foto histórica de `precio_unitario`. | ✅ **Implementado** |
| **Detalle de Producto** | Vista/modal de detalle individual por producto, con respuesta **HTTP 404** si el producto no existe (incluye botón para testear `GET /api/productos/9999`). | ✅ **Implementado** |

---

## 🗄️ Esquema de la Base de Datos (Supabase)

El script SQL completo se encuentra en `db/esquema.sql` y cuenta con las 5 tablas especificadas en la consigna:

1. **`categorias`**: `id`, `nombre`
   - *Panes y Masa Madre*
   - *Facturas y Bollería*
   - *Pastelería y Tartas*
   - *Sandwiches y Salados*
2. **`productos`**: `id`, `nombre`, `descripcion`, `precio` (`CHECK >= 0`), `stock` (`CHECK >= 0`), `imagen_url`, `categoria_id` (FK), `activo` (`boolean`).
   - Mínimo 8 productos (posee **11 productos cargados** con fotos y precios de panadería creíbles).
   - Incluye producto con stock bajo (`Focaccia Genovesa`, stock = 1) y producto sin stock (`Sándwich de Miga`, stock = 0) para verificar la validación y respuesta `400` del backend.
3. **`perfiles`**: `id` (FK a `auth.users`), `nombre`, `rol` (`'cliente'` / `'admin'`).
4. **`pedidos`**: `id`, `usuario_id` (FK a `auth.users`), `total`, `estado`, `creado`.
5. **`pedido_items`**: `id`, `pedido_id` (FK a `pedidos`), `producto_id` (FK a `productos`), `cantidad`, `precio_unitario` (`numeric(10,2)`).

### ¿Por qué guardar `precio_unitario` en cada item?
Porque los precios de los productos pueden cambiar en el futuro. `precio_unitario` guarda la foto congelada del valor exacto al momento de la compra para que la contabilidad del pedido no se altere.

---

## 🚀 Cómo Correr el Proyecto

### 1. Variables de Entorno (`.env`)
Crear un archivo `.env` en la raíz (a partir de `.env.example`):
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_secreta_service_role
PORT=3000
```
> **Nota de Seguridad:** La clave secreta (`service_role`) se utiliza exclusivamente en el servidor backend Express. Nunca se expone en el cliente ni se sube a repositorios públicos.

### 2. Base de Datos en Supabase
1. Ingresar al panel de **Supabase** y crear el proyecto `tienda-panaderia`.
2. Ir a **SQL Editor**, pegar el contenido de `db/esquema.sql` y presionar **Run**.
3. (Opcional Storage) Crear bucket público `productos` y subir las fotos con formato `1.jpg`, `2.jpg`, etc.

### 3. Instalar y Levantar Servidor
```bash
npm install
npm run dev
```
Abrir `http://localhost:3000` en el navegador.

---

## 🧪 Usuarios Demo para Corrección Rápida

| Rol | Email | Contraseña |
|---|---|---|
| **Admin Panadería** | `admin@espigadorada.com` | `admin123` |
| **Cliente** | `cliente@ejemplo.com` | `cliente123` |

*También es posible alternar entre roles con 1 clic desde el menú superior de la aplicación.*
