import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onShowToast }) => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    loginAsDemoUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'cliente' | 'admin'>('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        onShowToast('¡Sesión iniciada con éxito!', 'success');
      } else {
        await register(email, password, nombre, rol);
        onShowToast(`¡Cuenta creada con éxito! Rol asignado: ${rol}`, 'success');
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al autenticar');
      onShowToast(err.message || 'Error en la autenticación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (tipo: 'cliente' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemoUser(tipo);
      onShowToast(`Sesión iniciada como ${tipo === 'admin' ? 'Administradora' : 'Cliente'}`, 'success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-6 bg-gradient-to-r from-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Panadería Tito Calderonis
            </span>
            <h3 className="font-serif text-xl font-bold text-amber-100">
              {authModalMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              authModalMode === 'login'
                ? 'border-b-2 border-amber-600 text-amber-900 bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setAuthModalMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              authModalMode === 'register'
                ? 'border-b-2 border-amber-600 text-amber-900 bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          
          {/* Botones de demostración inmediata */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-xs space-y-2">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Acceso Rápido para Evaluación Docente:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('cliente')}
                className="py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 rounded-xl font-semibold border border-stone-300 text-[11px] transition-colors"
              >
                👤 Ana Gómez (Cliente)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-[11px] transition-colors shadow-sm"
              >
                🛡️ Admin Tito Calderonis
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {authModalMode === 'register' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rol a asignar</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="cliente">Cliente (acceso a compras y mis pedidos)</option>
                    <option value="admin">Administrador (acceso a panel ABM)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@panaderia.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-amber-900/10 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : authModalMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
