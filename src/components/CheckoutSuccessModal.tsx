import React from 'react';
import { CheckCircle2, ShoppingBag, Calendar, PackageCheck, ArrowRight, Printer } from 'lucide-react';
import { Pedido } from '../types';

interface CheckoutSuccessModalProps {
  pedido: Pedido | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  pedido,
  onClose,
  onViewOrders,
}) => {
  if (!pedido) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera festiva */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 p-6 text-center text-white relative">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/40 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-amber-100" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            ¡Pedido Realizado con Éxito!
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Panadería Tito Calderonis está preparando tu orden con dedicación artesanal.
          </p>
        </div>

        {/* Detalle del Ticket */}
        <div className="p-6 space-y-5">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-medium">Número de Pedido:</span>
              <span className="font-mono font-bold text-sm text-stone-900">#{pedido.id}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-medium">Fecha y Hora:</span>
              <span>{new Date(pedido.creado).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-medium">Estado inicial:</span>
              <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full capitalize">
                {pedido.estado}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="font-medium">Cliente:</span>
              <span>{pedido.usuario_nombre || pedido.usuario_email || 'Cliente Tito Calderonis'}</span>
            </div>
          </div>

          {/* Tabla de items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Items Comprados (precio unitario)
              </h4>
              <span className="text-[10px] text-stone-400">Stock actualizado en base de datos</span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
              {pedido.items && pedido.items.length > 0 ? (
                pedido.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between bg-white hover:bg-stone-50">
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        {it.producto_nombre || `Producto #${it.producto_id}`}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {it.cantidad} unidad(es) × ${it.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">
                      ${(it.cantidad * it.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-stone-500">Items registrados</div>
              )}
            </div>
          </div>

          {/* Total calculado por backend */}
          <div className="pt-3 border-t border-dashed border-stone-300 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-600 block">
                Total Calculado por Backend:
              </span>
              <span className="text-[11px] text-stone-400">Precios oficiales de la tienda</span>
            </div>
            <span className="font-serif text-2xl font-bold text-stone-900">
              ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Ver Mis Pedidos</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-900/10"
            >
              <span>Seguir Comprando</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
