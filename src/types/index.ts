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
  id: string;
  email: string;
  nombre: string;
  rol: 'cliente' | 'admin';
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
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

