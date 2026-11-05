import React from 'react';
import { ShoppingBag, User, ShieldCheck, Utensils, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'catalogo' | 'mis-pedidos' | 'admin';
  setCurrentTab: (tab: 'catalogo' | 'mis-pedidos' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { usuario, logout, setIsAuthModalOpen, setAuthModalMode, cambiarRol } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-amber-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo y Nombre de la Panadería */}
          <div 
            onClick={() => setCurrentTab('catalogo')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-amber-200">
                  Tito Calderonis
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 hidden sm:inline-block">
                  Panadería Artesanal
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Masa Madre & Pastelería de Barrio
              </p>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-800/80 p-1.5 rounded-xl border border-stone-700/60 text-sm">
            <button
              onClick={() => setCurrentTab('catalogo')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'catalogo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setCurrentTab('mis-pedidos')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTab === 'mis-pedidos'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              Mis Pedidos
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                currentTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Panel Admin (ABM)
            </button>
          </nav>

          {/* Acciones del Usuario y Carrito */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Menú de Usuario / Login */}
            {usuario ? (
              <div className="flex items-center gap-2 bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-700">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-semibold text-stone-200 leading-tight">
                    {usuario.nombre}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        usuario.rol === 'admin'
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                          : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                    <button
                      onClick={() => cambiarRol(usuario.rol === 'admin' ? 'cliente' : 'admin')}
                      title="Alternar rol para probar el control de acceso (403)"
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      (cambiar)
                    </button>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Ingresar</span>
              </button>
            )}

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md shadow-amber-950/40 transition-transform active:scale-95 flex items-center justify-center"
              aria-label="Abrir Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900 animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Barra Móvil de navegación */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setCurrentTab('catalogo')}
            className={`py-1 px-3 rounded-md ${
              currentTab === 'catalogo' ? 'bg-amber-600 text-white font-medium' : 'text-stone-300'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setCurrentTab('mis-pedidos')}
            className={`py-1 px-3 rounded-md ${
              currentTab === 'mis-pedidos' ? 'bg-amber-600 text-white font-medium' : 'text-stone-300'
            }`}
          >
            Mis Pedidos
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`py-1 px-3 rounded-md flex items-center gap-1 ${
              currentTab === 'admin' ? 'bg-amber-600 text-white font-medium' : 'text-stone-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (ABM)
          </button>
        </div>

      </div>
    </header>
  );
};
