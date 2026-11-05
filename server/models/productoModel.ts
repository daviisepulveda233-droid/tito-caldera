import { supabase, isSupabaseConfigured, localStore, Producto, setTablasExistenEnSupabase } from '../db/supabaseClient';

export interface ProductoFiltros {
  categoria_id?: number;
  busqueda?: string;
  soloActivos?: boolean;
}

export const ProductoModel = {
  async getAll(filtros: ProductoFiltros = {}): Promise<Producto[]> {
    const { categoria_id, busqueda, soloActivos = true } = filtros;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('productos').select('*').order('id', { ascending: true });

        if (soloActivos) {
          query = query.eq('activo', true);
        }

        if (categoria_id && !isNaN(categoria_id)) {
          query = query.eq('categoria_id', categoria_id);
        }

        if (busqueda && busqueda.trim().length > 0) {
          // Buscador con ilike() como pide la consigna de los extras
          query = query.ilike('nombre', `%${busqueda.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            setTablasExistenEnSupabase(false);
          } else {
            console.warn('Aviso Supabase productos:', error.message);
          }
          return this.getAllLocal(filtros);
        }

        setTablasExistenEnSupabase(true);
        return (data as Producto[]) || [];
      } catch (err) {
        return this.getAllLocal(filtros);
      }
    }

    return this.getAllLocal(filtros);
  },

  getAllLocal(filtros: ProductoFiltros): Producto[] {
    const { categoria_id, busqueda, soloActivos = true } = filtros;
    let list = [...localStore.productos];

    if (soloActivos) {
      list = list.filter((p) => p.activo);
    }

    if (categoria_id && !isNaN(categoria_id)) {
      list = list.filter((p) => p.categoria_id === Number(categoria_id));
    }

    if (busqueda && busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getById(id: number): Promise<Producto | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          return localStore.productos.find((p) => p.id === id) || null;
        }
        return data as Producto;
      } catch {
        return localStore.productos.find((p) => p.id === id) || null;
      }
    }

    return localStore.productos.find((p) => p.id === id) || null;
  },

  async create(data: Omit<Producto, 'id'>): Promise<Producto> {
    // Validaciones de esquema SQL (CHECK constraints)
    if (data.precio < 0) {
      throw new Error('El precio no puede ser negativo (check precio >= 0)');
    }
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo (check stock >= 0)');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: created, error } = await supabase
          .from('productos')
          .insert([data])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        return created as Producto;
      } catch (err: any) {
        console.error('Error en Supabase create producto:', err);
        // Fallback local si la llamada a Supabase falla
      }
    }

    const newProd: Producto = {
      ...data,
      id: localStore.nextProductoId++,
      activo: data.activo !== undefined ? data.activo : true,
    };
    localStore.productos.push(newProd);
    return newProd;
  },

  async update(id: number, data: Partial<Producto>): Promise<Producto | null> {
    if (data.precio !== undefined && data.precio < 0) {
      throw new Error('El precio no puede ser negativo (check precio >= 0)');
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock no puede ser negativo (check stock >= 0)');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('productos')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error al actualizar en Supabase:', error.message);
        } else if (updated) {
          return updated as Producto;
        }
      } catch (err) {
        console.error('Fallo Supabase update:', err);
      }
    }

    const idx = localStore.productos.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    localStore.productos[idx] = {
      ...localStore.productos[idx],
      ...data,
    };
    return localStore.productos[idx];
  },

  async softDelete(id: number): Promise<boolean> {
    // Como indica la consigna: "activo: para 'borrar' un producto sin perder los pedidos viejos que lo incluyen"
    return (await this.update(id, { activo: false })) !== null;
  },

  async descontarStock(id: number, cantidad: number): Promise<Producto> {
    const prod = await this.getById(id);
    if (!prod) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    if (prod.stock < cantidad) {
      throw new Error(
        `Stock insuficiente para ${prod.nombre}. Solicitado: ${cantidad}, Disponible: ${prod.stock}`
      );
    }

    const nuevoStock = prod.stock - cantidad;
    const actualizado = await this.update(id, { stock: nuevoStock });
    if (!actualizado) {
      throw new Error(`No se pudo actualizar el stock para ${prod.nombre}`);
    }
    return actualizado;
  },
};
