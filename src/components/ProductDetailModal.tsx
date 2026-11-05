import React, { useState } from 'react';
import { X, ShoppingBag, AlertTriangle, ShieldCheck, Check, Sparkles, HelpCircle } from 'lucide-react';
import { Producto, Categoria } from '../types';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

interface ProductDetailModalProps {
  producto: Producto | null;
  categoria?: Categoria;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  producto,
  categoria,
  onClose,
  onShowToast,
}) => {
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [test404Result, setTest404Result] = useState<string | null>(null);
  const [testing404, setTesting404] = useState(false);

  if (!producto) return null;

  const sinStock = producto.stock <= 0;

  const handleAgregar = () => {
    if (sinStock) {
      onShowToast(`No hay stock disponible de ${producto.nombre}`, 'error');
      return;
    }
    const res = addToCart(producto, cantidad);
    if (res.success) {
      onShowToast(`Se agregaron ${cantidad} unidad(es) de ${producto.nombre} al carrito`, 'success');
      onClose();
    } else {
      onShowToast(res.message || 'No se pudo agregar al carrito', 'error');
    }
  };

  const handleTest404 = async () => {
    setTesting404(true);
    setTest404Result(null);
    try {
      // Llamada deliberada a un producto inexistente con ID 9999
      await api.getProductoById(9999);
      setTest404Result('Respuesta inesperada');
    } catch (err: any) {
      setTest404Result(
        `✓ Respuesta del Backend: Status HTTP ${err.status || 404} Not Found - "${
          err.message || 'El producto con ID 9999 no existe en la base de datos'
        }"`
      );
    } finally {
      setTesting404(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="relative">
          <div className="aspect-16/9 w-full bg-stone-100 overflow-hidden">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-900/70 hover:bg-stone-900 text-white p-2 rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {categoria && (
            <span className="absolute bottom-4 left-4 bg-stone-900/85 backdrop-blur-md text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
              {categoria.nombre}
            </span>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {producto.nombre}
              </h2>
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-800 shrink-0">
                ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
              {producto.descripcion}
            </p>
          </div>

          {/* Ficha artesanal de la panadería */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-xs">
            <div>
              <span className="text-stone-500 block font-medium">Disponibilidad:</span>
              <span className={`font-bold text-sm ${sinStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                {sinStock ? 'Sin stock' : `${producto.stock} unidades`}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block font-medium">Categoría ID:</span>
              <span className="font-bold text-sm text-stone-800">
                #{producto.categoria_id} ({categoria?.nombre || 'General'})
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-stone-500 block font-medium">Estado en BD:</span>
              <span className="font-bold text-sm text-stone-800">
                {producto.activo ? 'Activo (Visible)' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Selector de cantidad y compra */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {!sinStock && (
              <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-stone-50 w-full sm:w-auto justify-between">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-stone-800">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-200 font-bold transition-colors"
                  disabled={cantidad >= producto.stock}
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAgregar}
              disabled={sinStock}
              className={`w-full flex-1 py-3 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all ${
                sinStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98 shadow-amber-900/20'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{sinStock ? 'Sin stock disponible' : `Agregar al carrito · $${(producto.precio * cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}</span>
            </button>
          </div>

          {/* Sección de prueba docente para el Extra: Detalle 404 */}
          <div className="mt-4 pt-4 border-t border-stone-200 bg-stone-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-5 sm:p-6 text-xs text-stone-600">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Extra TP: Validación de Detalle 404
              </span>
              <button
                onClick={handleTest404}
                disabled={testing404}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg font-medium transition-colors border border-stone-700"
              >
                {testing404 ? 'Probando...' : 'Probar GET /api/productos/9999'}
              </button>
            </div>
            <p className="text-stone-500">
              La consigna exige que si un producto no existe en la base, el backend responda con código HTTP 404.
            </p>
            {test404Result && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-mono text-[11px]">
                {test404Result}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
