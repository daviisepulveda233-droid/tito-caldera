import { supabase, isSupabaseConfigured, localStore, Categoria, setTablasExistenEnSupabase } from '../db/supabaseClient';

export const CategoriaModel = {
  async getAll(): Promise<Categoria[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          // Si las tablas aún no se corrieron en el SQL Editor de Supabase
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            setTablasExistenEnSupabase(false);
          } else {
            console.warn('Aviso Supabase categorias:', error.message);
          }
          return localStore.categorias;
        }

        setTablasExistenEnSupabase(true);
        return (data as Categoria[]) || [];
      } catch (err) {
        return localStore.categorias;
      }
    }
    return localStore.categorias;
  },

  async getById(id: number): Promise<Categoria | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) return null;
        return data as Categoria;
      } catch {
        return localStore.categorias.find((c) => c.id === id) || null;
      }
    }
    return localStore.categorias.find((c) => c.id === id) || null;
  },
};
