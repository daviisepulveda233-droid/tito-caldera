import { supabase, isSupabaseConfigured, localStore, Usuario } from '../db/supabaseClient';

export const UsuarioModel = {
  async register(email: string, password: string, nombre: string, rol: 'cliente' | 'admin' = 'cliente'): Promise<Usuario> {
    if (!email || !password || !nombre) {
      throw new Error('Todos los campos son obligatorios (email, password, nombre)');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          throw new Error(authError.message);
        }

        const userId = authData.user?.id || `u-${Date.now()}`;

        // Insertar en tabla perfiles
        await supabase.from('perfiles').insert([
          {
            id: userId,
            nombre,
            rol,
          },
        ]);

        return {
          id: userId,
          email,
          nombre,
          rol,
        };
      } catch (err: any) {
        console.warn('Fallo registro en Supabase Auth, usando almacenamiento local:', err.message);
      }
    }

    // Almacén local
    const existe = localStore.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      throw new Error('El correo electrónico ya se encuentra registrado');
    }

    const nuevo: Usuario = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      password,
      nombre,
      rol,
    };
    localStore.usuarios.push(nuevo);

    return {
      id: nuevo.id,
      email: nuevo.email,
      nombre: nuevo.nombre,
      rol: nuevo.rol,
    };
  },

  async login(email: string, password: string): Promise<Usuario> {
    if (!email || !password) {
      throw new Error('Email y contraseña requeridos');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!authError && authData.user) {
          const userId = authData.user.id;
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('nombre, rol')
            .eq('id', userId)
            .single();

          return {
            id: userId,
            email: authData.user.email || email,
            nombre: perfil?.nombre || 'Usuario',
            rol: (perfil?.rol as 'cliente' | 'admin') || 'cliente',
          };
        }
      } catch (err) {
        console.warn('Error en Supabase login, probando usuarios locales:', err);
      }
    }

    // Búsqueda en almacén local
    const user = localStore.usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Credenciales inválidas. Verifique su email y contraseña.');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };
  },

  async getById(id: string): Promise<Usuario | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('id, nombre, rol')
          .eq('id', id)
          .single();

        if (perfil) {
          return {
            id: perfil.id,
            email: '',
            nombre: perfil.nombre,
            rol: perfil.rol,
          };
        }
      } catch {}
    }

    const local = localStore.usuarios.find((u) => u.id === id);
    if (local) {
      return {
        id: local.id,
        email: local.email,
        nombre: local.nombre,
        rol: local.rol,
      };
    }
    return null;
  },
};
