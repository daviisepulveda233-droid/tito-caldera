import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Check, AlertTriangle, ShieldAlert, Package, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Producto, Categoria, Pedido } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminPanelProps {
  categorias: Categoria[];
  onProductUpdated: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categorias,
  onProductUpdated,
  onShowToast,
}) => {
  const { usuario, token, cambiarRol, loginAsDemoUser } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<'abm' | 'pedidos'>('abm');
  const [error403Msg, setError403Msg] = useState<string | null>(null);

  // Formulario para Crear / Editar Producto
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [imagenUrl, setImagenUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const prods = await api.getProductos({ todos: true });
      setProductos(prods);

      if (token && usuario?.rol === 'admin') {
        const ords = await api.getTodosLosPedidos(token);
        setPedidos(ords);
      }
    } catch (err: any) {
      console.error('Error cargando datos en admin:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [token, usuario?.rol]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setCategoriaId(1);
    setImagenUrl('');
  };

  const handleEditClick = (p: Producto) => {
    setIsEditing(true);
    setEditingId(p.id);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setPrecio(p.precio);
    setStock(p.stock);
    setCategoriaId(p.categoria_id);
    setImagenUrl(p.imagen_url);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onShowToast('Debes iniciar sesión para realizar cambios', 'error');
      return;
    }

    if (!nombre.trim()) {
      onShowToast('El nombre del producto es obligatorio', 'error');
      return;
    }

    const numPrecio = Number(precio);
    const numStock = Number(stock);

    if (isNaN(numPrecio) || numPrecio < 0) {
      onShowToast('El precio debe ser un número mayor o igual a 0', 'error');
      return;
    }

    if (isNaN(numStock) || numStock < 0) {
      onShowToast('El stock debe ser un número entero mayor o igual a 0', 'error');
      return;
    }

    setGuardando(true);
    setError403Msg(null);

    try {
      const payload: Partial<Producto> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: numPrecio,
        stock: Math.floor(numStock),
        categoria_id: categoriaId,
        imagen_url:
          imagenUrl.trim() ||
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      };

      if (isEditing && editingId) {
        await api.actualizarProducto(editingId, payload, token);
        onShowToast(`Producto #${editingId} actualizado con éxito`, 'success');
      } else {
        await api.crearProducto(payload, token);
        onShowToast('Nuevo producto agregado al catálogo de la panadería', 'success');
      }

      resetForm();
      await cargarDatos();
      onProductUpdated();
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      if (err.status === 403) {
        setError403Msg(`403 Forbidden: ${err.message}`);
        onShowToast('403 Forbidden: No tienes rol de administrador', 'error');
      } else {
        onShowToast(err.message || 'Error al procesar la solicitud', 'error');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (p: Producto) => {
    if (!token) return;
    try {
      if (p.activo) {
        await api.eliminarProducto(p.id, token);
        onShowToast(`Producto #${p.id} desactivado (soft delete)`, 'info');
      } else {
        await api.actualizarProducto(p.id, { activo: true }, token);
        onShowToast(`Producto #${p.id} reactivado en catálogo`, 'success');
      }
      await cargarDatos();
      onProductUpdated();
    } catch (err: any) {
      if (err.status === 403) {
        setError403Msg(`403 Forbidden: Solo administradores pueden modificar productos.`);
        onShowToast('403 Forbidden', 'error');
      }
    }
  };

  // Botón especial para probar la consigna de los extras:
  // "ABM de productos con rol admin; un cliente recibe 403"
  const handleTestCliente403 = async () => {
    setError403Msg(null);
    try {
      // Simula enviar petición con credencial de cliente o forzando error 403
      await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-u-cliente-002', // Token de cliente Ana Gómez
        },
        body: JSON.stringify({
          nombre: 'Producto no autorizado',
          precio: 1000,
          stock: 10,
        }),
      }).then(async (res) => {
        const body = await res.json();
        if (res.status === 403) {
          setError403Msg(
            `✓ Prueba Exitosa del Backend: Código HTTP ${res.status} Forbidden - "${body.error}" (Rol actual: ${body.rolActual || 'cliente'})`
          );
          onShowToast('Comprobado: El servidor rechazó con 403 Forbidden', 'info');
        } else {
          setError403Msg(`Respuesta HTTP: ${res.status}`);
        }
      });
    } catch (e: any) {
      setError403Msg(`Error en la llamada: ${e.message}`);
    }
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Banner de Estado y Control de Roles */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Panel de Administración (ABM de Productos)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Gestión de catálogo, stock de panadería y pedidos recibidos.
          </p>
        </div>

        {/* Selector de rol rápido para testing docente */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-2 rounded-2xl border border-stone-200 text-xs">
          <span className="text-stone-600 font-medium px-2">Rol Actual:</span>
          {usuario ? (
            <span
              className={`font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                esAdmin
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-300 text-stone-800'
              }`}
            >
              {usuario.rol}
            </span>
          ) : (
            <span className="font-bold text-stone-500 px-2 py-1">No Autenticado</span>
          )}

          <button
            onClick={() => cambiarRol(esAdmin ? 'cliente' : 'admin')}
            disabled={!usuario}
            className="px-3 py-1 bg-white hover:bg-stone-200 text-stone-800 rounded-xl font-semibold border border-stone-300 transition-colors disabled:opacity-40"
          >
            Cambiar a {esAdmin ? 'Cliente' : 'Admin'}
          </button>

          {!usuario && (
            <button
              onClick={() => loginAsDemoUser('admin')}
              className="px-3 py-1 bg-amber-600 text-white rounded-xl font-semibold shadow-sm"
            >
              Entrar como Admin
            </button>
          )}
        </div>
      </div>

      {/* Alerta interactiva de demostración del 403 */}
      <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold block text-sm">Control de Seguridad y Roles:</span>
            Acceso protegido con permisos de administrador (un cliente recibe 403 Forbidden).
            <p className="text-amber-800/80 mt-0.5">
              Probá qué sucede cuando un cliente intenta modificar o crear productos sin autorización.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestCliente403}
          className="shrink-0 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-semibold shadow-sm transition-colors border border-stone-700"
        >
          Probar respuesta 403 (Rol Cliente)
        </button>
      </div>

      {error403Msg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-mono">
          {error403Msg}
        </div>
      )}

      {/* Tabs ABM vs Pedidos */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setVista('abm')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            vista === 'abm'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          ABM de Productos ({productos.length})
        </button>
        <button
          onClick={() => setVista('pedidos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            vista === 'pedidos'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Todos los Pedidos de la Panadería ({pedidos.length})
        </button>
      </div>

      {vista === 'abm' && (
        <>
          {/* Formulario de Creación / Edición */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {isEditing ? `Editar Producto #${editingId}` : 'Crear Nuevo Producto de Panadería'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEditing
                    ? 'Modificá precios o stock respetando las restricciones de la base (precio >= 0, stock >= 0)'
                    : 'Agregá una nueva especialidad artesanal al catálogo'}
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Focaccia con Aceitunas Negras"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id} - {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Detalles de la masa, fermentación, ingredientes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Precio (ARS) * (CHECK precio &gt;= 0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2400.00"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Stock Disponible * (CHECK stock &gt;= 0)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="15"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL de Imagen (Storage / Unsplash)
                </label>
                <input
                  type="url"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-amber-900/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{guardando ? 'Guardando en BD...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Productos Existentes */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Catálogo Completo en Base de Datos
              </h4>
              <button
                onClick={cargarDatos}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Foto</th>
                    <th className="p-3.5">Nombre & Descripción</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Precio</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-stone-900">
                        #{prod.id}
                      </td>
                      <td className="p-3.5">
                        <img
                          src={prod.imagen_url}
                          alt={prod.nombre}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-stone-900">{prod.nombre}</div>
                        <div className="text-[11px] text-stone-500 truncate">{prod.descripcion}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md text-[11px]">
                          {categorias.find((c) => c.id === prod.categoria_id)?.nombre || `Cat #${prod.categoria_id}`}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">
                        ${prod.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            prod.stock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : prod.stock === 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stock} un.
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {prod.activo ? 'Activo' : 'Desactivado'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActivo(prod)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            prod.activo
                              ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={prod.activo ? 'Desactivar del catálogo (soft delete)' : 'Reactivar en catálogo'}
                        >
                          {prod.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {vista === 'pedidos' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Todos los Pedidos de la Panadería
              </h3>
              <p className="text-xs text-stone-500">
                Visualización central para el equipo de producción y mostrador.
              </p>
            </div>
            <button
              onClick={cargarDatos}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="space-y-3">
            {pedidos.map((ped) => (
              <div
                key={ped.id}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      Pedido #{ped.id}
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                      {ped.estado}
                    </span>
                    <span className="text-stone-400">
                      {new Date(ped.creado).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="text-stone-600 mt-1">
                    Cliente: <strong>{ped.usuario_nombre || ped.usuario_email || ped.usuario_id}</strong>
                  </div>
                  <div className="text-stone-500 mt-1">
                    {ped.items?.map((it) => `${it.cantidad}x ${it.producto_nombre || 'Item'}`).join(', ')}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Total cobrado:</span>
                  <span className="font-serif text-lg font-bold text-stone-900">
                    ${ped.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
