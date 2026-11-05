import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = (process.env.SUPABASE_URL || '').trim();
if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);
if (rawUrl.endsWith('/rest/v1')) rawUrl = rawUrl.replace(/\/rest\/v1$/, '');

const supabaseUrl = rawUrl;
const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('tu-proyecto') &&
  !supabaseUrl.includes('xxxx') &&
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export let tablasExistenEnSupabase = false;

export function setTablasExistenEnSupabase(val: boolean) {
  tablasExistenEnSupabase = val;
}

// ====================================================================
// Datos y modelos locales persistentes (Fallback resiliente)
// Permite que la app funcione inmediatamente para pruebas y evaluación
// conservando exactamente la misma estructura SQL de Supabase.
// ====================================================================

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url: string;
  categoria_id: number;
  activo: boolean;
}

export interface Usuario {
  id: string; // uuid
  email: string;
  password?: string;
  nombre: string;
  rol: 'cliente' | 'admin';
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre?: string;
  producto_imagen?: string;
}

export interface Pedido {
  id: number;
  usuario_id: string;
  usuario_nombre?: string;
  usuario_email?: string;
  total: number;
  estado: string;
  creado: string;
  items?: PedidoItem[];
}

export const initialCategorias: Categoria[] = [
  { id: 1, nombre: 'Panes y Masa Madre' },
  { id: 2, nombre: 'Facturas y Bollería' },
  { id: 3, nombre: 'Pastelería y Tartas' },
  { id: 4, nombre: 'Sandwiches y Salados' },
];

export const initialProductos: Producto[] = [
  {
    id: 1,
    nombre: 'Baguette Tradicional de Masa Madre',
    descripcion: 'Corteza crocante, miga alveolada y fermentación lenta de 24 horas.',
    precio: 2200.0,
    stock: 15,
    categoria_id: 1,
    imagen_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Pan de Campo con Semillas',
    descripcion: 'Harina integral orgánica, masa madre, lino, chía y semillas de girasol tostadas.',
    precio: 3100.0,
    stock: 12,
    categoria_id: 1,
    imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Ciabatta Clásica Italiana',
    descripcion: 'Pan liviano de hidratación alta, ideal para tostadas o sándwiches gourmet.',
    precio: 2400.0,
    stock: 8,
    categoria_id: 1,
    imagen_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Medialunas de Manteca (Docena)',
    descripcion: 'Hojaldradas al estilo porteño con manteca de primera calidad y almíbar liviano.',
    precio: 7800.0,
    stock: 20,
    categoria_id: 2,
    imagen_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 5,
    nombre: 'Vigilantes con Crema Pastelera y Dulce',
    descripcion: 'Masa vienesa suave con crema pastelera artesanal y dulce de membrillo.',
    precio: 950.0,
    stock: 18,
    categoria_id: 2,
    imagen_url: 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 6,
    nombre: 'Croissant Francés de Almendras',
    descripcion: 'Relleno de frangipane y cubierto de almendras fileteadas tostadas.',
    precio: 2900.0,
    stock: 6,
    categoria_id: 2,
    imagen_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 7,
    nombre: 'Tarta Rogel Individual',
    descripcion: 'Finas capas crocantes rellenas de abundante dulce de leche repostero y merengue italiano.',
    precio: 3800.0,
    stock: 10,
    categoria_id: 3,
    imagen_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 8,
    nombre: 'Torta Marquise de Chocolate y Frutos Rojos',
    descripcion: 'Base húmeda de chocolate belga, dulce de leche, crema chantilly y frutos rojos frescos.',
    precio: 4500.0,
    stock: 5,
    categoria_id: 3,
    imagen_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 9,
    nombre: 'Chipá Correntino Tradicional (250g)',
    descripcion: 'Bocaditos de fécula de mandioca con queso gouda y sardo estacionado.',
    precio: 3200.0,
    stock: 14,
    categoria_id: 4,
    imagen_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 10,
    nombre: 'Focaccia Genovesa con Romero y Cherrys',
    descripcion: 'Aceite de oliva virgen extra, sal marina en escamas, romero del huerto y tomatines confitados.',
    precio: 2800.0,
    stock: 1, // Stock bajo para probar alerta y última unidad
    categoria_id: 4,
    imagen_url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 11,
    nombre: 'Sándwich de Miga Triple Especial (x3)',
    descripcion: 'Pan de miga casero extra tierno, jamón cocido natural, queso tybo y manteca.',
    precio: 4200.0,
    stock: 0, // SIN STOCK para probar validación 400 y botón deshabilitado
    categoria_id: 4,
    imagen_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
];

// Usuarios precargados para testeo inmediato (Cliente y Admin)
export const initialUsuarios: Usuario[] = [
  {
    id: 'u-admin-001',
    email: 'admin@michoytito.com',
    password: 'admin123',
    nombre: 'Administrador Micho y Tito',
    rol: 'admin',
  },
  {
    id: 'u-cliente-002',
    email: 'cliente@ejemplo.com',
    password: 'cliente123',
    nombre: 'Ana Gómez',
    rol: 'cliente',
  },
];

export const initialPedidos: Pedido[] = [
  {
    id: 1,
    usuario_id: 'u-cliente-002',
    usuario_nombre: 'Ana Gómez',
    usuario_email: 'cliente@ejemplo.com',
    total: 10000.0,
    estado: 'completado',
    creado: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [
      {
        id: 1,
        pedido_id: 1,
        producto_id: 1,
        cantidad: 1,
        precio_unitario: 2200.0,
        producto_nombre: 'Baguette Tradicional de Masa Madre',
      },
      {
        id: 2,
        pedido_id: 1,
        producto_id: 4,
        cantidad: 1,
        precio_unitario: 7800.0,
        producto_nombre: 'Medialunas de Manteca (Docena)',
      },
    ],
  },
];

// Almacén en memoria sincronizado
export class LocalStore {
  categorias: Categoria[] = [...initialCategorias];
  productos: Producto[] = [...initialProductos];
  usuarios: Usuario[] = [...initialUsuarios];
  pedidos: Pedido[] = [...initialPedidos];
  pedidoItems: PedidoItem[] = initialPedidos[0].items ? [...initialPedidos[0].items] : [];
  nextProductoId = 12;
  nextPedidoId = 2;
  nextPedidoItemId = 3;

  reset() {
    this.categorias = [...initialCategorias];
    this.productos = JSON.parse(JSON.stringify(initialProductos));
    this.usuarios = JSON.parse(JSON.stringify(initialUsuarios));
    this.pedidos = JSON.parse(JSON.stringify(initialPedidos));
    this.pedidoItems = initialPedidos[0].items ? [...initialPedidos[0].items] : [];
    this.nextProductoId = 12;
    this.nextPedidoId = 2;
    this.nextPedidoItemId = 3;
  }
}

export const localStore = new LocalStore();
