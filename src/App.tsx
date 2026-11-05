import React, { useState, useEffect, useTransition } from 'react';
import { Search, PackageOpen, RefreshCw, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Categoria, Producto, Pedido } from './types';
import { api } from './services/api';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BannerHero } from './components/BannerHero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutSuccessModal } from './components/CheckoutSuccessModal';
import { AuthModal } from './components/AuthModal';
import { OrdersView } from './components/OrdersView';
import { AdminPanel } from './components/AdminPanel';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'catalogo' | 'mis-pedidos' | 'admin'>('catalogo');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modales
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [pedidoExitoso, setPedidoExitoso] = useState<Pedido | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategorias(),
        api.getProductos({
          categoria_id: categoriaSeleccionada,
          busqueda: busqueda.trim() ? busqueda : undefined,
        }),
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (err: any) {
      console.error('Error al cargar datos de panadería:', err);
      setError(err.message || 'No se pudieron cargar los datos del catálogo');
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarDatos();
  }, [categoriaSeleccionada]);

  // Búsqueda con debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .getProductos({
          categoria_id: categoriaSeleccionada,
          busqueda: busqueda.trim() ? busqueda : undefined,
        })
        .then((prods) => setProductos(prods))
        .catch((err) => console.error('Error en búsqueda:', err));
    }, 250);

    return () => clearTimeout(timer);
  }, [busqueda]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      
      {/* Barra de Navegación Principal */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {currentTab === 'catalogo' && (
          <div className="space-y-6">
            {/* Banner de Panadería */}
            <BannerHero />

            {/* Barra de Búsqueda y Filtros de Categoría */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Buscador (Cumple Requisito Extra: .ilike() por nombre) */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar pan de masa madre, medialunas, tortas..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Contador de productos y botón de actualización */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-stone-500">
                  <span>
                    Mostrando <strong>{productos.length}</strong> especialidades
                  </span>
                  <button
                    onClick={cargarDatos}
                    className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition-colors flex items-center gap-1 border border-stone-200"
                    title="Recargar catálogo de productos"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>

              </div>

              {/* Botones de Categoría (Filtro por categoría exigido en consigna) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                <button
                  onClick={() => setCategoriaSeleccionada(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    categoriaSeleccionada === null
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  Todas las Especialidades
                </button>

                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      categoriaSeleccionada === cat.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

            </div>

            {/* Grilla del Catálogo de Productos */}
            {cargando && productos.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-stone-700">
                  Cargando productos...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold">Error:</span> {error}
                </div>
              </div>
            ) : productos.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <PackageOpen className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  No se encontraron productos
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Probá ajustando el filtro de categoría o cambiando el término de búsqueda.
                </p>
                <button
                  onClick={() => {
                    setCategoriaSeleccionada(null);
                    setBusqueda('');
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold"
                >
                  Ver todo el catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productos.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    categoria={categorias.find((c) => c.id === producto.categoria_id)}
                    onOpenDetail={(prod) => setProductoDetalle(prod)}
                    onShowToast={showToast}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {currentTab === 'mis-pedidos' && (
          <OrdersView
            onGoToCatalog={() => setCurrentTab('catalogo')}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            categorias={categorias}
            onProductUpdated={cargarDatos}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* Pie de Página */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-amber-200">
              Tito Calderonis
            </span>
            <span className="text-stone-500">·</span>
            <span>Panadería Artesanal & Masa Madre</span>
          </div>

          <div className="text-stone-400 text-center sm:text-right space-y-0.5">
            <div>Panadería Tito Calderonis · Tradición en cada horneada</div>
            <div className="text-stone-500 text-[11px]">
              Abierto todos los días de 07:00 a 20:30 hs
            </div>
          </div>
        </div>
      </footer>

      {/* Modales y Drawers Globales */}
      <ProductDetailModal
        producto={productoDetalle}
        categoria={categorias.find((c) => c.id === productoDetalle?.categoria_id)}
        onClose={() => setProductoDetalle(null)}
        onShowToast={showToast}
      />

      <CartDrawer
        onOrderCompleted={(pedido) => setPedidoExitoso(pedido)}
        onShowToast={showToast}
        onRefreshProducts={cargarDatos}
      />

      <CheckoutSuccessModal
        pedido={pedidoExitoso}
        onClose={() => setPedidoExitoso(null)}
        onViewOrders={() => {
          setPedidoExitoso(null);
          setCurrentTab('mis-pedidos');
        }}
      />

      <AuthModal onShowToast={showToast} />

      {/* Notificaciones Flotantes (Toasts) */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-800 text-white border border-emerald-700'
                : t.type === 'error'
                ? 'bg-rose-800 text-white border border-rose-700'
                : 'bg-stone-900 text-stone-100 border border-stone-700'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
