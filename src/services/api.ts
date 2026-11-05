import { Categoria, Producto, Pedido, Usuario } from '../types';

const API_BASE = '/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.error || `Error en la solicitud: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    return apiRequest<Categoria[]>('/categorias');
  },

  // Catálogo de Productos
  async getProductos(filtros?: {
    categoria_id?: number | null;
    busqueda?: string;
    todos?: boolean;
  }): Promise<Producto[]> {
    const params = new URLSearchParams();
    if (filtros?.categoria_id) params.append('categoria_id', String(filtros.categoria_id));
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.todos) params.append('todos', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Producto[]>(`/productos${query}`);
  },

  // Detalle de producto (404 si no existe)
  async getProductoById(id: number | string): Promise<Producto> {
    return apiRequest<Producto>(`/productos/${id}`);
  },

  // ABM de productos (requiere rol admin)
  async crearProducto(producto: Partial<Producto>, token?: string): Promise<Producto> {
    return apiRequest<Producto>(
      '/productos',
      {
        method: 'POST',
        body: JSON.stringify(producto),
      },
      token
    );
  },

  async actualizarProducto(
    id: number,
    cambios: Partial<Producto>,
    token?: string
  ): Promise<Producto> {
    return apiRequest<Producto>(
      `/productos/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(cambios),
      },
      token
    );
  },

  async eliminarProducto(id: number, token?: string): Promise<{ mensaje: string }> {
    return apiRequest<{ mensaje: string }>(
      `/productos/${id}`,
      {
        method: 'DELETE',
      },
      token
    );
  },

  // Autenticación
  async login(email: string, password: string): Promise<{ usuario: Usuario; token: string }> {
    return apiRequest<{ usuario: Usuario; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async registro(
    email: string,
    password: string,
    nombre: string,
    rol: 'cliente' | 'admin' = 'cliente'
  ): Promise<{ usuario: Usuario; token: string }> {
    return apiRequest<{ usuario: Usuario; token: string }>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre, rol }),
    });
  },

  async cambiarRolDemo(rol: 'cliente' | 'admin', token: string): Promise<{ usuario: Usuario }> {
    return apiRequest<{ usuario: Usuario }>(
      '/auth/cambiar-rol-demo',
      {
        method: 'POST',
        body: JSON.stringify({ rol }),
      },
      token
    );
  },

  // Pedidos y Compra
  async crearPedido(
    items: { producto_id: number; cantidad: number }[],
    token: string
  ): Promise<{ mensaje: string; pedido: Pedido }> {
    return apiRequest<{ mensaje: string; pedido: Pedido }>(
      '/pedidos',
      {
        method: 'POST',
        body: JSON.stringify({ items }),
      },
      token
    );
  },

  async getMisPedidos(token: string): Promise<Pedido[]> {
    return apiRequest<Pedido[]>('/pedidos/mis-pedidos', {}, token);
  },

  async getTodosLosPedidos(token: string): Promise<Pedido[]> {
    return apiRequest<Pedido[]>('/pedidos/todos', {}, token);
  },

};
