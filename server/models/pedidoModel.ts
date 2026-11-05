import { supabase, isSupabaseConfigured, localStore, Pedido, PedidoItem } from '../db/supabaseClient';
import { ProductoModel } from './productoModel';

export interface ItemCompraInput {
  producto_id: number;
  cantidad: number;
}

export const PedidoModel = {
  async crearPedido(
    usuario_id: string,
    itemsInput: ItemCompraInput[],
    datosUsuario?: { nombre?: string; email?: string }
  ): Promise<Pedido> {
    if (!itemsInput || itemsInput.length === 0) {
      const error: any = new Error('El carrito no puede estar vacío');
      error.status = 400;
      throw error;
    }

    // 1. Validar existencia y stock de cada producto, y obtener el precio DIRECTAMENTE de la base
    let totalCalculadoPorBackend = 0;
    const itemsValidados: {
      producto: any;
      cantidad: number;
      precio_unitario: number;
    }[] = [];

    for (const item of itemsInput) {
      if (!item.cantidad || item.cantidad <= 0) {
        const error: any = new Error('La cantidad debe ser mayor a 0');
        error.status = 400;
        throw error;
      }

      const producto = await ProductoModel.getById(item.producto_id);
      if (!producto || !producto.activo) {
        const error: any = new Error(
          `El producto con ID ${item.producto_id} no existe o no está disponible`
        );
        error.status = 404;
        throw error;
      }

      if (producto.stock < item.cantidad) {
        const error: any = new Error(
          `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
        );
        error.status = 400;
        throw error;
      }

      // Regla de oro: El precio sale de la base de datos, NUNCA del cliente
      const precioUnitario = Number(producto.precio);
      totalCalculadoPorBackend += precioUnitario * item.cantidad;

      itemsValidados.push({
        producto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
      });
    }

    // 2. Descontar el stock de cada producto
    for (const item of itemsValidados) {
      await ProductoModel.descontarStock(item.producto.id, item.cantidad);
    }

    // 3. Crear el registro en 'pedidos' y 'pedido_items'
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: pedidoCreado, error: errPedido } = await supabase
          .from('pedidos')
          .insert([
            {
              usuario_id,
              total: totalCalculadoPorBackend,
              estado: 'pendiente',
            },
          ])
          .select()
          .single();

        if (errPedido || !pedidoCreado) {
          throw new Error(errPedido?.message || 'Error al insertar pedido');
        }

        const itemsParaInsertar = itemsValidados.map((it) => ({
          pedido_id: pedidoCreado.id,
          producto_id: it.producto.id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario, // Foto del precio al momento de la compra
        }));

        const { data: itemsCreados, error: errItems } = await supabase
          .from('pedido_items')
          .insert(itemsParaInsertar)
          .select();

        if (errItems) {
          console.error('Error insertando items en Supabase:', errItems.message);
        }

        return {
          ...pedidoCreado,
          usuario_nombre: datosUsuario?.nombre,
          usuario_email: datosUsuario?.email,
          items: itemsCreados || [],
        };
      } catch (err) {
        console.warn('Fallo guardado en Supabase, persistiendo en almacén local:', err);
      }
    }

    // Almacén Local Fallback
    const nuevoPedidoId = localStore.nextPedidoId++;
    const fechaActual = new Date().toISOString();

    const itemsRegistrados: PedidoItem[] = itemsValidados.map((it) => {
      const itemRegistrado: PedidoItem = {
        id: localStore.nextPedidoItemId++,
        pedido_id: nuevoPedidoId,
        producto_id: it.producto.id,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        producto_nombre: it.producto.nombre,
        producto_imagen: it.producto.imagen_url,
      };
      localStore.pedidoItems.push(itemRegistrado);
      return itemRegistrado;
    });

    const nuevoPedido: Pedido = {
      id: nuevoPedidoId,
      usuario_id,
      usuario_nombre: datosUsuario?.nombre || 'Cliente',
      usuario_email: datosUsuario?.email || 'cliente@ejemplo.com',
      total: Number(totalCalculadoPorBackend.toFixed(2)),
      estado: 'pendiente',
      creado: fechaActual,
      items: itemsRegistrados,
    };

    localStore.pedidos.unshift(nuevoPedido);
    return nuevoPedido;
  },

  async getByUsuarioId(usuario_id: string): Promise<Pedido[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id,
            usuario_id,
            total,
            estado,
            creado,
            pedido_items (
              id,
              pedido_id,
              producto_id,
              cantidad,
              precio_unitario,
              productos (nombre, imagen_url)
            )
          `)
          .eq('usuario_id', usuario_id)
          .order('creado', { ascending: false });

        if (!error && data) {
          return data.map((p: any) => ({
            id: p.id,
            usuario_id: p.usuario_id,
            total: p.total,
            estado: p.estado,
            creado: p.creado,
            items: (p.pedido_items || []).map((it: any) => ({
              id: it.id,
              pedido_id: it.pedido_id,
              producto_id: it.producto_id,
              cantidad: it.cantidad,
              precio_unitario: it.precio_unitario,
              producto_nombre: it.productos?.nombre,
              producto_imagen: it.productos?.imagen_url,
            })),
          }));
        }
      } catch (err) {
        console.error('Error al obtener pedidos por usuario en Supabase:', err);
      }
    }

    return localStore.pedidos
      .filter((p) => p.usuario_id === usuario_id)
      .map((p) => ({
        ...p,
        items: localStore.pedidoItems.filter((it) => it.pedido_id === p.id),
      }));
  },

  async getAll(): Promise<Pedido[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id,
            usuario_id,
            total,
            estado,
            creado,
            pedido_items (
              id,
              pedido_id,
              producto_id,
              cantidad,
              precio_unitario,
              productos (nombre, imagen_url)
            )
          `)
          .order('creado', { ascending: false });

        if (!error && data) {
          return data.map((p: any) => ({
            id: p.id,
            usuario_id: p.usuario_id,
            total: p.total,
            estado: p.estado,
            creado: p.creado,
            items: (p.pedido_items || []).map((it: any) => ({
              id: it.id,
              pedido_id: it.pedido_id,
              producto_id: it.producto_id,
              cantidad: it.cantidad,
              precio_unitario: it.precio_unitario,
              producto_nombre: it.productos?.nombre,
              producto_imagen: it.productos?.imagen_url,
            })),
          }));
        }
      } catch (err) {
        console.error('Error al obtener todos los pedidos en Supabase:', err);
      }
    }

    return localStore.pedidos.map((p) => ({
      ...p,
      items: localStore.pedidoItems.filter((it) => it.pedido_id === p.id),
    }));
  },
};
