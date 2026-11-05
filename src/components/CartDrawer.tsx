import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, AlertCircle, ArrowRight, Loader2, Sparkles, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Pedido } from '../types';

interface CartDrawerProps {
  onOrderCompleted: (pedido: Pedido) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOrderCompleted,
  onShowToast,
  onRefreshProducts,
}) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const { usuario, token, setIsAuthModalOpen, setAuthModalMode, loginAsDemoUser } = useAuth();
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!usuario || !token) {
      setIsAuthModalOpen(true);
      setAuthModalMode('login');
      onShowToast('Iniciá sesión o creá una cuenta para registrar tu pedido', 'info');
      return;
    }

    if (items.length === 0) {
      onShowToast('El carrito está vacío', 'error');
      return;
    }

    setComprando(true);
    setErrorCompra(null);

    try {
      // REQUISITO CRÍTICO DEL TP:
      // Solo enviamos producto_id y cantidad.
      // El total lo calcula el backend directamente de la base de datos!
      const itemsPayload = items.map((it) => ({
        producto_id: it.producto.id,
        cantidad: it.cantidad,
      }));

      const res = await api.crearPedido(itemsPayload, token);
      
      clearCart();
      setIsCartOpen(false);
      onRefreshProducts(); // Actualizar stock visual en catálogo
      onOrderCompleted(res.pedido);
      onShowToast('¡Compra realizada con éxito! Stock descontado en la base de datos.', 'success');
    } catch (err: any) {
      console.error('Error en compra:', err);
      const msg = err.message || 'No se pudo completar el pedido';
      setErrorCompra(msg);
      onShowToast(msg, 'error');
    } finally {
      setComprando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Carrito */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Tu Carrito · Tito Calderonis
              </h2>
              <span className="text-xs text-stone-500">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} · Productos guardados
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Productos del Carrito */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <p className="font-serif text-lg text-stone-700 font-medium">
                Tu carrito está vacío
              </p>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                Elegí tus panes de masa madre, facturas frescas o tartas del catálogo para comenzar.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <>
              {items.map(({ producto, cantidad }) => (
                <div
                  key={producto.id}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/70 hover:border-amber-300 transition-colors"
                >
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 truncate" title={producto.nombre}>
                      {producto.nombre}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                    </p>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(producto.id, cantidad - 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(producto.id, cantidad + 1)}
                          disabled={cantidad >= producto.stock}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900 ml-auto">
                        ${(producto.precio * cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>

                      <button
                        onClick={() => removeFromCart(producto.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors ml-1"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors pt-2 ml-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Vaciar todo el carrito</span>
              </button>
            </>
          )}
        </div>

        {/* Pie del Carrito / Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
            
            {/* Garantía de precios transparentes */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Compra Segura y Transparente:</span>
                El total y el stock se validan y confirman en tiempo real con nuestra base de datos.
              </div>
            </div>

            {/* Error si no hay stock */}
            {errorCompra && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorCompra}</span>
              </div>
            )}

            {/* Subtotal estimado */}
            <div className="flex items-center justify-between text-stone-600 text-sm">
              <span>Subtotal estimado:</span>
              <span className="font-serif text-xl font-bold text-stone-900">
                ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Estado de autenticación */}
            {!usuario ? (
              <div className="space-y-2">
                <div className="text-xs text-stone-500 flex items-center gap-1 justify-center">
                  <User className="w-3.5 h-3.5" />
                  <span>Requiere iniciar sesión para comprar</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => loginAsDemoUser('cliente')}
                    className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    Auto-Login Cliente
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-600 flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="truncate">Comprando como: <strong>{usuario.nombre}</strong></span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {usuario.rol}
                </span>
              </div>
            )}

            {/* Botón Finalizar Compra */}
            <button
              onClick={handleCheckout}
              disabled={comprando}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {comprando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>El backend está procesando el pedido...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Compra</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
