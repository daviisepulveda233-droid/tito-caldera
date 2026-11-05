import React, { useEffect, useState } from 'react';
import { Package, Calendar, Clock, ShoppingBag, AlertCircle, RefreshCw, User, CheckCircle2 } from 'lucide-react';
import { Pedido } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface OrdersViewProps {
  onGoToCatalog: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onGoToCatalog, onShowToast }) => {
  const { usuario, token, setIsAuthModalOpen, setAuthModalMode, loginAsDemoUser } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      const data = await api.getMisPedidos(token);
      setPedidos(data);
    } catch (err: any) {
      console.error('Error cargando pedidos:', err);
      setError(err.message || 'Error al obtener tus pedidos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarPedidos();
    }
  }, [token]);

  if (!usuario || !token) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/80 shadow-sm max-w-xl mx-auto my-10 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Iniciá sesión para ver tus pedidos
        </h2>
        <p className="text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
          Para acceder al historial de compras de la panadería con el detalle de cada producto y sus precios congelados, ingresá con tu cuenta.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => loginAsDemoUser('cliente')}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-sm font-semibold transition-colors border border-stone-300"
          >
            Entrar como Cliente Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Mis Pedidos en Tito Calderonis
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Historial de compras realizadas por <strong>{usuario.nombre}</strong> ({usuario.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarPedidos}
            disabled={cargando}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-300 disabled:opacity-50"
            title="Recargar pedidos"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={onGoToCatalog}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Ir al Catálogo
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {cargando ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Cargando tus pedidos desde la base de datos...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-bold">Error:</span> {error}
          </div>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-800">
            Aún no has realizado ningún pedido
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Descubrí nuestras baguettes de masa madre, medialunas de manteca hojaldradas y tartas artesanales.
          </p>
          <button
            onClick={onGoToCatalog}
            className="mt-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            Ver productos de la panadería
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* Barra de cabecera de la orden */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-lg">
                    Pedido #{pedido.id}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(pedido.creado).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      pedido.estado === 'completado' || pedido.estado === 'entregado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pedido.estado === 'en preparación'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ● {pedido.estado}
                  </span>

                  <span className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Items del pedido con precio_unitario */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Items en este pedido:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pedido.items && pedido.items.length > 0 ? (
                    pedido.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-stone-800 block truncate">
                            {item.producto_nombre || `Producto #${item.producto_id}`}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {item.cantidad} × ${item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="font-bold text-stone-900 shrink-0">
                          ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-400 italic">Detalle de items guardados</div>
                  )}
                </div>
              </div>

              {/* Nota explicativa de la cátedra */}
              <div className="pt-2 text-[11px] text-stone-400 flex items-center justify-between">
                <span>
                  ✓ Los precios de cada item son una <strong>foto histórica</strong> (precio_unitario) al momento de la compra.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
