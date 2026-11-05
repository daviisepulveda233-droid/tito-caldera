import React, { useState } from 'react';
import { ShoppingBag, Eye, AlertCircle, Check, Info } from 'lucide-react';
import { Producto, Categoria } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  producto: Producto;
  categoria?: Categoria;
  onOpenDetail: (producto: Producto) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  categoria,
  onOpenDetail,
  onShowToast,
}) => {
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const sinStock = producto.stock <= 0;
  const ultimaUnidad = producto.stock === 1;

  const handleAgregar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sinStock) {
      onShowToast(`No hay stock disponible de ${producto.nombre}`, 'error');
      return;
    }

    const res = addToCart(producto, cantidad);
    if (res.success) {
      setAgregadoAnim(true);
      setTimeout(() => setAgregadoAnim(false), 1200);
      onShowToast(`Se agregaron ${cantidad} unidad(es) de ${producto.nombre} al carrito`, 'success');
      setCantidad(1);
    } else {
      onShowToast(res.message || 'No se pudo agregar al carrito', 'error');
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 flex flex-col overflow-hidden relative">
      
      {/* Contenedor de Imagen con Insignias */}
      <div 
        onClick={() => onOpenDetail(producto)}
        className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer"
      >
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // Fallback seguro si la URL de Storage / imagen falla
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Categoría Badge */}
        {categoria && (
          <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {categoria.nombre}
          </span>
        )}

        {/* Badges de Estado de Stock */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {sinStock ? (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sin stock
            </span>
          ) : ultimaUnidad ? (
            <span className="bg-amber-500 text-stone-950 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
              ¡Última unidad!
            </span>
          ) : (
            <span className="bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
              Stock: {producto.stock}
            </span>
          )}
        </div>

        {/* Botón flotante para ver detalle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(producto);
          }}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-stone-800 p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Ver detalle del producto (Página de producto)"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido / Información */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onOpenDetail(producto)}
            className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 cursor-pointer"
            title={producto.nombre}
          >
            {producto.nombre}
          </h3>

          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {producto.descripcion}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-3">
          {/* Precio formateado */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-400 font-medium">Precio por unidad</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Selector de cantidad y Agregar */}
          <div className="flex items-center gap-2">
            {!sinStock && (
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCantidad((c) => Math.max(1, c - 1));
                  }}
                  className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-200 text-sm font-bold transition-colors"
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <span className="px-2 text-xs font-semibold text-stone-800 min-w-5 text-center">
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCantidad((c) => Math.min(producto.stock, c + 1));
                  }}
                  className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-200 text-sm font-bold transition-colors"
                  disabled={cantidad >= producto.stock}
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAgregar}
              disabled={sinStock}
              className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                sinStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                  : agregadoAnim
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-98 shadow-amber-900/10'
              }`}
            >
              {sinStock ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Agotado</span>
                </>
              ) : agregadoAnim ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
