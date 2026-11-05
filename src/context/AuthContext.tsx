import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, nombre: string, rol?: 'cliente' | 'admin') => Promise<void>;
  logout: () => void;
  cambiarRol: (nuevoRol: 'cliente' | 'admin') => Promise<void>;
  loginAsDemoUser: (tipo: 'cliente' | 'admin') => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'tienda_panaderia_user_v1';
const TOKEN_STORAGE_KEY = 'tienda_panaderia_token_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (usuario && token) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [usuario, token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUsuario(res.usuario);
    setToken(res.token);
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, pass: string, nombre: string, rol: 'cliente' | 'admin' = 'cliente') => {
    const res = await api.registro(email, pass, nombre, rol);
    setUsuario(res.usuario);
    setToken(res.token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
  };

  const cambiarRol = async (nuevoRol: 'cliente' | 'admin') => {
    if (!usuario || !token) return;
    try {
      const res = await api.cambiarRolDemo(nuevoRol, token);
      setUsuario(res.usuario);
    } catch (e) {
      console.error('Error al cambiar rol:', e);
      // Fallback local
      setUsuario({ ...usuario, rol: nuevoRol });
    }
  };

  const loginAsDemoUser = async (tipo: 'cliente' | 'admin') => {
    if (tipo === 'admin') {
      await login('admin@michoytito.com', 'admin123');
    } else {
      await login('cliente@ejemplo.com', 'cliente123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        register,
        logout,
        cambiarRol,
        loginAsDemoUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
