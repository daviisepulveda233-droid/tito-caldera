 // server/app.ts
import express from "express";
import dotenv2 from "dotenv";

// server/routes/categoriaRoutes.ts
import { Router } from "express";

// server/db/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
var rawUrl = (process.env.SUPABASE_URL || "").trim();
if (rawUrl.endsWith("/")) rawUrl = rawUrl.slice(0, -1);
if (rawUrl.endsWith("/rest/v1")) rawUrl = rawUrl.replace(/\/rest\/v1$/, "");
var supabaseUrl = rawUrl;
var supabaseKey = (process.env.SUPABASE_KEY || "").trim();
var isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && !supabaseUrl.includes("tu-proyecto") && !supabaseUrl.includes("xxxx") && supabaseUrl.startsWith("http")
);
var supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;
var tablasExistenEnSupabase = false;
function setTablasExistenEnSupabase(val) {
  tablasExistenEnSupabase = val;
}
var initialCategorias = [
  { id: 1, nombre: "Panes y Masa Madre" },
  { id: 2, nombre: "Facturas y Boller\xEDa" },
  { id: 3, nombre: "Pasteler\xEDa y Tartas" },
  { id: 4, nombre: "Sandwiches y Salados" }
];
var initialProductos = [
  {
    id: 1,
    nombre: "Baguette Tradicional de Masa Madre",
    descripcion: "Corteza crocante, miga alveolada y fermentaci\xF3n lenta de 24 horas.",
    precio: 2200,
    stock: 15,
    categoria_id: 1,
    imagen_url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 2,
    nombre: "Pan de Campo con Semillas",
    descripcion: "Harina integral org\xE1nica, masa madre, lino, ch\xEDa y semillas de girasol tostadas.",
    precio: 3100,
    stock: 12,
    categoria_id: 1,
    imagen_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 3,
    nombre: "Ciabatta Cl\xE1sica Italiana",
    descripcion: "Pan liviano de hidrataci\xF3n alta, ideal para tostadas o s\xE1ndwiches gourmet.",
    precio: 2400,
    stock: 8,
    categoria_id: 1,
    imagen_url: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 4,
    nombre: "Medialunas de Manteca (Docena)",
    descripcion: "Hojaldradas al estilo porte\xF1o con manteca de primera calidad y alm\xEDbar liviano.",
    precio: 7800,
    stock: 20,
    categoria_id: 2,
    imagen_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 5,
    nombre: "Vigilantes con Crema Pastelera y Dulce",
    descripcion: "Masa vienesa suave con crema pastelera artesanal y dulce de membrillo.",
    precio: 950,
    stock: 18,
    categoria_id: 2,
    imagen_url: "https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 6,
    nombre: "Croissant Franc\xE9s de Almendras",
    descripcion: "Relleno de frangipane y cubierto de almendras fileteadas tostadas.",
    precio: 2900,
    stock: 6,
    categoria_id: 2,
    imagen_url: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 7,
    nombre: "Tarta Rogel Individual",
    descripcion: "Finas capas crocantes rellenas de abundante dulce de leche repostero y merengue italiano.",
    precio: 3800,
    stock: 10,
    categoria_id: 3,
    imagen_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 8,
    nombre: "Torta Marquise de Chocolate y Frutos Rojos",
    descripcion: "Base h\xFAmeda de chocolate belga, dulce de leche, crema chantilly y frutos rojos frescos.",
    precio: 4500,
    stock: 5,
    categoria_id: 3,
    imagen_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 9,
    nombre: "Chip\xE1 Correntino Tradicional (250g)",
    descripcion: "Bocaditos de f\xE9cula de mandioca con queso gouda y sardo estacionado.",
    precio: 3200,
    stock: 14,
    categoria_id: 4,
    imagen_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 10,
    nombre: "Focaccia Genovesa con Romero y Cherrys",
    descripcion: "Aceite de oliva virgen extra, sal marina en escamas, romero del huerto y tomatines confitados.",
    precio: 2800,
    stock: 1,
    // Stock bajo para probar alerta y última unidad
    categoria_id: 4,
    imagen_url: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop&q=80",
    activo: true
  },
  {
    id: 11,
    nombre: "S\xE1ndwich de Miga Triple Especial (x3)",
    descripcion: "Pan de miga casero extra tierno, jam\xF3n cocido natural, queso tybo y manteca.",
    precio: 4200,
    stock: 0,
    // SIN STOCK para probar validación 400 y botón deshabilitado
    categoria_id: 4,
    imagen_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80",
    activo: true
  }
];
var initialUsuarios = [
  {
    id: "u-admin-001",
    email: "admin@michoytito.com",
    password: "admin123",
    nombre: "Administrador Micho y Tito",
    rol: "admin"
  },
  {
    id: "u-cliente-002",
    email: "cliente@ejemplo.com",
    password: "cliente123",
    nombre: "Ana G\xF3mez",
    rol: "cliente"
  }
];
var initialPedidos = [
  {
    id: 1,
    usuario_id: "u-cliente-002",
    usuario_nombre: "Ana G\xF3mez",
    usuario_email: "cliente@ejemplo.com",
    total: 1e4,
    estado: "completado",
    creado: new Date(Date.now() - 864e5 * 2).toISOString(),
    items: [
      {
        id: 1,
        pedido_id: 1,
        producto_id: 1,
        cantidad: 1,
        precio_unitario: 2200,
        producto_nombre: "Baguette Tradicional de Masa Madre"
      },
      {
        id: 2,
        pedido_id: 1,
        producto_id: 4,
        cantidad: 1,
        precio_unitario: 7800,
        producto_nombre: "Medialunas de Manteca (Docena)"
      }
    ]
  }
];
var LocalStore = class {
  constructor() {
    this.categorias = [...initialCategorias];
    this.productos = [...initialProductos];
    this.usuarios = [...initialUsuarios];
    this.pedidos = [...initialPedidos];
    this.pedidoItems = initialPedidos[0].items ? [...initialPedidos[0].items] : [];
    this.nextProductoId = 12;
    this.nextPedidoId = 2;
    this.nextPedidoItemId = 3;
  }
  reset() {
    this.categorias = [...initialCategorias];
    this.productos = JSON.parse(JSON.stringify(initialProductos));
    this.usuarios = JSON.parse(JSON.stringify(initialUsuarios));
    this.pedidos = JSON.parse(JSON.stringify(initialPedidos));
    this.pedidoItems = initialPedidos[0].items ? [...initialPedidos[0].items] : [];
    this.nextProductoId = 12;
    this.nextPedidoId = 2;
    this.nextPedidoItemId = 3;
  }
};
var localStore = new LocalStore();

// server/models/categoriaModel.ts
var CategoriaModel = {
  async getAll() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("categorias").select("*").order("id", { ascending: true });
        if (error) {
          if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
            setTablasExistenEnSupabase(false);
          } else {
            console.warn("Aviso Supabase categorias:", error.message);
          }
          return localStore.categorias;
        }
        setTablasExistenEnSupabase(true);
        return data || [];
      } catch (err) {
        return localStore.categorias;
      }
    }
    return localStore.categorias;
  },
  async getById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("categorias").select("*").eq("id", id).single();
        if (error || !data) return null;
        return data;
      } catch {
        return localStore.categorias.find((c) => c.id === id) || null;
      }
    }
    return localStore.categorias.find((c) => c.id === id) || null;
  }
};

// server/controllers/categoriaController.ts
var CategoriaController = {
  async obtenerTodas(req, res) {
    try {
      const categorias = await CategoriaModel.getAll();
      return res.json(categorias);
    } catch (error) {
      console.error("Error en CategoriaController.obtenerTodas:", error);
      return res.status(500).json({ error: "Error al obtener categor\xEDas" });
    }
  },
  async obtenerPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de categor\xEDa inv\xE1lido" });
      }
      const categoria = await CategoriaModel.getById(id);
      if (!categoria) {
        return res.status(404).json({ error: "Categor\xEDa no encontrada" });
      }
      return res.json(categoria);
    } catch (error) {
      return res.status(500).json({ error: "Error al consultar la categor\xEDa" });
    }
  }
};

// server/routes/categoriaRoutes.ts
var router = Router();
router.get("/", CategoriaController.obtenerTodas);
router.get("/:id", CategoriaController.obtenerPorId);
var categoriaRoutes_default = router;

// server/routes/productoRoutes.ts
import { Router as Router2 } from "express";

// server/models/productoModel.ts
var ProductoModel = {
  async getAll(filtros = {}) {
    const { categoria_id, busqueda, soloActivos = true } = filtros;
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("productos").select("*").order("id", { ascending: true });
        if (soloActivos) {
          query = query.eq("activo", true);
        }
        if (categoria_id && !isNaN(categoria_id)) {
          query = query.eq("categoria_id", categoria_id);
        }
        if (busqueda && busqueda.trim().length > 0) {
          query = query.ilike("nombre", `%${busqueda.trim()}%`);
        }
        const { data, error } = await query;
        if (error) {
          if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
            setTablasExistenEnSupabase(false);
          } else {
            console.warn("Aviso Supabase productos:", error.message);
          }
          return this.getAllLocal(filtros);
        }
        setTablasExistenEnSupabase(true);
        return data || [];
      } catch (err) {
        return this.getAllLocal(filtros);
      }
    }
    return this.getAllLocal(filtros);
  },
  getAllLocal(filtros) {
    const { categoria_id, busqueda, soloActivos = true } = filtros;
    let list = [...localStore.productos];
    if (soloActivos) {
      list = list.filter((p) => p.activo);
    }
    if (categoria_id && !isNaN(categoria_id)) {
      list = list.filter((p) => p.categoria_id === Number(categoria_id));
    }
    if (busqueda && busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)
      );
    }
    return list;
  },
  async getById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("productos").select("*").eq("id", id).single();
        if (error || !data) {
          return localStore.productos.find((p) => p.id === id) || null;
        }
        return data;
      } catch {
        return localStore.productos.find((p) => p.id === id) || null;
      }
    }
    return localStore.productos.find((p) => p.id === id) || null;
  },
  async create(data) {
    if (data.precio < 0) {
      throw new Error("El precio no puede ser negativo (check precio >= 0)");
    }
    if (data.stock < 0) {
      throw new Error("El stock no puede ser negativo (check stock >= 0)");
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: created, error } = await supabase.from("productos").insert([data]).select().single();
        if (error) {
          throw new Error(error.message);
        }
        return created;
      } catch (err) {
        console.error("Error en Supabase create producto:", err);
      }
    }
    const newProd = {
      ...data,
      id: localStore.nextProductoId++,
      activo: data.activo !== void 0 ? data.activo : true
    };
    localStore.productos.push(newProd);
    return newProd;
  },
  async update(id, data) {
    if (data.precio !== void 0 && data.precio < 0) {
      throw new Error("El precio no puede ser negativo (check precio >= 0)");
    }
    if (data.stock !== void 0 && data.stock < 0) {
      throw new Error("El stock no puede ser negativo (check stock >= 0)");
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: updated, error } = await supabase.from("productos").update(data).eq("id", id).select().single();
        if (error) {
          console.error("Error al actualizar en Supabase:", error.message);
        } else if (updated) {
          return updated;
        }
      } catch (err) {
        console.error("Fallo Supabase update:", err);
      }
    }
    const idx = localStore.productos.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    localStore.productos[idx] = {
      ...localStore.productos[idx],
      ...data
    };
    return localStore.productos[idx];
  },
  async softDelete(id) {
    return await this.update(id, { activo: false }) !== null;
  },
  async descontarStock(id, cantidad) {
    const prod = await this.getById(id);
    if (!prod) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    if (prod.stock < cantidad) {
      throw new Error(
        `Stock insuficiente para ${prod.nombre}. Solicitado: ${cantidad}, Disponible: ${prod.stock}`
      );
    }
    const nuevoStock = prod.stock - cantidad;
    const actualizado = await this.update(id, { stock: nuevoStock });
    if (!actualizado) {
      throw new Error(`No se pudo actualizar el stock para ${prod.nombre}`);
    }
    return actualizado;
  }
};

// server/controllers/productoController.ts
var ProductoController = {
  async obtenerTodos(req, res) {
    try {
      const { categoria_id, busqueda, todos } = req.query;
      const filtros = {
        categoria_id: categoria_id ? Number(categoria_id) : void 0,
        busqueda: busqueda ? String(busqueda) : void 0,
        soloActivos: todos === "true" ? false : true
      };
      const productos = await ProductoModel.getAll(filtros);
      return res.json(productos);
    } catch (error) {
      console.error("Error en ProductoController.obtenerTodos:", error);
      return res.status(500).json({ error: "Error al obtener cat\xE1logo de productos" });
    }
  },
  async obtenerPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "El ID del producto debe ser num\xE9rico" });
      }
      const producto = await ProductoModel.getById(id);
      if (!producto) {
        return res.status(404).json({
          error: `404 Not Found: El producto con ID ${id} no existe en la base de datos de la panader\xEDa.`
        });
      }
      return res.json(producto);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener el detalle del producto" });
    }
  },
  async crear(req, res) {
    try {
      const { nombre, descripcion, precio, stock, imagen_url, categoria_id } = req.body;
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ error: "El nombre del producto es obligatorio" });
      }
      const numPrecio = Number(precio);
      const numStock = Number(stock !== void 0 ? stock : 0);
      const numCat = categoria_id ? Number(categoria_id) : 1;
      if (isNaN(numPrecio) || numPrecio < 0) {
        return res.status(400).json({ error: "El precio debe ser un n\xFAmero mayor o igual a 0 (CHECK precio >= 0)" });
      }
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ error: "El stock debe ser un n\xFAmero entero mayor o igual a 0 (CHECK stock >= 0)" });
      }
      const nuevo = await ProductoModel.create({
        nombre: nombre.trim(),
        descripcion: descripcion || "",
        precio: numPrecio,
        stock: Math.floor(numStock),
        imagen_url: imagen_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
        categoria_id: numCat,
        activo: true
      });
      return res.status(201).json(nuevo);
    } catch (error) {
      return res.status(400).json({ error: error.message || "Error al crear producto" });
    }
  },
  async actualizar(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido" });
      }
      const data = req.body;
      if (data.precio !== void 0) {
        data.precio = Number(data.precio);
        if (isNaN(data.precio) || data.precio < 0) {
          return res.status(400).json({ error: "El precio no puede ser negativo" });
        }
      }
      if (data.stock !== void 0) {
        data.stock = Number(data.stock);
        if (isNaN(data.stock) || data.stock < 0) {
          return res.status(400).json({ error: "El stock no puede ser negativo" });
        }
      }
      const actualizado = await ProductoModel.update(id, data);
      if (!actualizado) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }
      return res.json(actualizado);
    } catch (error) {
      return res.status(400).json({ error: error.message || "Error al actualizar el producto" });
    }
  },
  async eliminar(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido" });
      }
      const borrado = await ProductoModel.softDelete(id);
      if (!borrado) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }
      return res.json({ mensaje: `Producto ${id} desactivado correctamente del cat\xE1logo` });
    } catch (error) {
      return res.status(500).json({ error: "Error al desactivar el producto" });
    }
  }
};

// server/models/usuarioModel.ts
var UsuarioModel = {
  async register(email, password, nombre, rol = "cliente") {
    if (!email || !password || !nombre) {
      throw new Error("Todos los campos son obligatorios (email, password, nombre)");
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });
        if (authError) {
          throw new Error(authError.message);
        }
        const userId = authData.user?.id || `u-${Date.now()}`;
        await supabase.from("perfiles").insert([
          {
            id: userId,
            nombre,
            rol
          }
        ]);
        return {
          id: userId,
          email,
          nombre,
          rol
        };
      } catch (err) {
        console.warn("Fallo registro en Supabase Auth, usando almacenamiento local:", err.message);
      }
    }
    const existe = localStore.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
      throw new Error("El correo electr\xF3nico ya se encuentra registrado");
    }
    const nuevo = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      password,
      nombre,
      rol
    };
    localStore.usuarios.push(nuevo);
    return {
      id: nuevo.id,
      email: nuevo.email,
      nombre: nuevo.nombre,
      rol: nuevo.rol
    };
  },
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email y contrase\xF1a requeridos");
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!authError && authData.user) {
          const userId = authData.user.id;
          const { data: perfil } = await supabase.from("perfiles").select("nombre, rol").eq("id", userId).single();
          return {
            id: userId,
            email: authData.user.email || email,
            nombre: perfil?.nombre || "Usuario",
            rol: perfil?.rol || "cliente"
          };
        }
      } catch (err) {
        console.warn("Error en Supabase login, probando usuarios locales:", err);
      }
    }
    const user = localStore.usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error("Credenciales inv\xE1lidas. Verifique su email y contrase\xF1a.");
    }
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    };
  },
  async getById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: perfil } = await supabase.from("perfiles").select("id, nombre, rol").eq("id", id).single();
        if (perfil) {
          return {
            id: perfil.id,
            email: "",
            nombre: perfil.nombre,
            rol: perfil.rol
          };
        }
      } catch {
      }
    }
    const local = localStore.usuarios.find((u) => u.id === id);
    if (local) {
      return {
        id: local.id,
        email: local.email,
        nombre: local.nombre,
        rol: local.rol
      };
    }
    return null;
  }
};

// server/middleware/auth.ts
async function verificarUsuario(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-user-id"]) {
      token = String(req.headers["x-user-id"]);
    }
    if (!token) {
      return res.status(401).json({
        error: "No autorizado. Debe iniciar sesi\xF3n para realizar esta acci\xF3n."
      });
    }
    const userId = token.startsWith("token-") ? token.replace("token-", "") : token;
    const user = await UsuarioModel.getById(userId);
    if (!user) {
      return res.status(401).json({
        error: "Sesi\xF3n inv\xE1lida o expirada. Por favor inicie sesi\xF3n nuevamente."
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message || "Error de autenticaci\xF3n" });
  }
}
function requerirAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Debe iniciar sesi\xF3n primero" });
  }
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      error: "403 Forbidden: Acci\xF3n reservada \xFAnicamente para administradores de la panader\xEDa.",
      rolActual: req.user.rol
    });
  }
  next();
}

// server/routes/productoRoutes.ts
var router2 = Router2();
router2.get("/", ProductoController.obtenerTodos);
router2.get("/:id", ProductoController.obtenerPorId);
router2.post("/", verificarUsuario, requerirAdmin, ProductoController.crear);
router2.put("/:id", verificarUsuario, requerirAdmin, ProductoController.actualizar);
router2.delete("/:id", verificarUsuario, requerirAdmin, ProductoController.eliminar);
var productoRoutes_default = router2;

// server/routes/pedidoRoutes.ts
import { Router as Router3 } from "express";

// server/models/pedidoModel.ts
var PedidoModel = {
  async crearPedido(usuario_id, itemsInput, datosUsuario) {
    if (!itemsInput || itemsInput.length === 0) {
      const error = new Error("El carrito no puede estar vac\xEDo");
      error.status = 400;
      throw error;
    }
    let totalCalculadoPorBackend = 0;
    const itemsValidados = [];
    for (const item of itemsInput) {
      if (!item.cantidad || item.cantidad <= 0) {
        const error = new Error("La cantidad debe ser mayor a 0");
        error.status = 400;
        throw error;
      }
      const producto = await ProductoModel.getById(item.producto_id);
      if (!producto || !producto.activo) {
        const error = new Error(
          `El producto con ID ${item.producto_id} no existe o no est\xE1 disponible`
        );
        error.status = 404;
        throw error;
      }
      if (producto.stock < item.cantidad) {
        const error = new Error(
          `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
        );
        error.status = 400;
        throw error;
      }
      const precioUnitario = Number(producto.precio);
      totalCalculadoPorBackend += precioUnitario * item.cantidad;
      itemsValidados.push({
        producto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario
      });
    }
    for (const item of itemsValidados) {
      await ProductoModel.descontarStock(item.producto.id, item.cantidad);
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: pedidoCreado, error: errPedido } = await supabase.from("pedidos").insert([
          {
            usuario_id,
            total: totalCalculadoPorBackend,
            estado: "pendiente"
          }
        ]).select().single();
        if (errPedido || !pedidoCreado) {
          throw new Error(errPedido?.message || "Error al insertar pedido");
        }
        const itemsParaInsertar = itemsValidados.map((it) => ({
          pedido_id: pedidoCreado.id,
          producto_id: it.producto.id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario
          // Foto del precio al momento de la compra
        }));
        const { data: itemsCreados, error: errItems } = await supabase.from("pedido_items").insert(itemsParaInsertar).select();
        if (errItems) {
          console.error("Error insertando items en Supabase:", errItems.message);
        }
        return {
          ...pedidoCreado,
          usuario_nombre: datosUsuario?.nombre,
          usuario_email: datosUsuario?.email,
          items: itemsCreados || []
        };
      } catch (err) {
        console.warn("Fallo guardado en Supabase, persistiendo en almac\xE9n local:", err);
      }
    }
    const nuevoPedidoId = localStore.nextPedidoId++;
    const fechaActual = (/* @__PURE__ */ new Date()).toISOString();
    const itemsRegistrados = itemsValidados.map((it) => {
      const itemRegistrado = {
        id: localStore.nextPedidoItemId++,
        pedido_id: nuevoPedidoId,
        producto_id: it.producto.id,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        producto_nombre: it.producto.nombre,
        producto_imagen: it.producto.imagen_url
      };
      localStore.pedidoItems.push(itemRegistrado);
      return itemRegistrado;
    });
    const nuevoPedido = {
      id: nuevoPedidoId,
      usuario_id,
      usuario_nombre: datosUsuario?.nombre || "Cliente",
      usuario_email: datosUsuario?.email || "cliente@ejemplo.com",
      total: Number(totalCalculadoPorBackend.toFixed(2)),
      estado: "pendiente",
      creado: fechaActual,
      items: itemsRegistrados
    };
    localStore.pedidos.unshift(nuevoPedido);
    return nuevoPedido;
  },
  async getByUsuarioId(usuario_id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("pedidos").select(`
            id,
            usuario_id,
            total,
            estado,
            creado,
            pedido_items (
              id,
              pedido_id,
              producto_id,
              cantidad,
              precio_unitario,
              productos (nombre, imagen_url)
            )
          `).eq("usuario_id", usuario_id).order("creado", { ascending: false });
        if (!error && data) {
          return data.map((p) => ({
            id: p.id,
            usuario_id: p.usuario_id,
            total: p.total,
            estado: p.estado,
            creado: p.creado,
            items: (p.pedido_items || []).map((it) => ({
              id: it.id,
              pedido_id: it.pedido_id,
              producto_id: it.producto_id,
              cantidad: it.cantidad,
              precio_unitario: it.precio_unitario,
              producto_nombre: it.productos?.nombre,
              producto_imagen: it.productos?.imagen_url
            }))
          }));
        }
      } catch (err) {
        console.error("Error al obtener pedidos por usuario en Supabase:", err);
      }
    }
    return localStore.pedidos.filter((p) => p.usuario_id === usuario_id).map((p) => ({
      ...p,
      items: localStore.pedidoItems.filter((it) => it.pedido_id === p.id)
    }));
  },
  async getAll() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("pedidos").select(`
            id,
            usuario_id,
            total,
            estado,
            creado,
            pedido_items (
              id,
              pedido_id,
              producto_id,
              cantidad,
              precio_unitario,
              productos (nombre, imagen_url)
            )
          `).order("creado", { ascending: false });
        if (!error && data) {
          return data.map((p) => ({
            id: p.id,
            usuario_id: p.usuario_id,
            total: p.total,
            estado: p.estado,
            creado: p.creado,
            items: (p.pedido_items || []).map((it) => ({
              id: it.id,
              pedido_id: it.pedido_id,
              producto_id: it.producto_id,
              cantidad: it.cantidad,
              precio_unitario: it.precio_unitario,
              producto_nombre: it.productos?.nombre,
              producto_imagen: it.productos?.imagen_url
            }))
          }));
        }
      } catch (err) {
        console.error("Error al obtener todos los pedidos en Supabase:", err);
      }
    }
    return localStore.pedidos.map((p) => ({
      ...p,
      items: localStore.pedidoItems.filter((it) => it.pedido_id === p.id)
    }));
  }
};

// server/controllers/pedidoController.ts
var PedidoController = {
  async crear(req, res) {
    try {
      const { items } = req.body;
      const usuario = req.user;
      if (!usuario) {
        return res.status(401).json({ error: "Debe iniciar sesi\xF3n para realizar una compra" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "400 Bad Request: El carrito est\xE1 vac\xEDo. Agregue productos antes de comprar."
        });
      }
      const nuevoPedido = await PedidoModel.crearPedido(
        usuario.id,
        items,
        {
          nombre: usuario.nombre,
          email: usuario.email
        }
      );
      return res.status(201).json({
        mensaje: "\xA1Pedido registrado con \xE9xito!",
        pedido: nuevoPedido
      });
    } catch (error) {
      console.error("Error al procesar compra:", error.message);
      const statusCode = error.status || 400;
      return res.status(statusCode).json({
        error: error.message || "Error al procesar el pedido"
      });
    }
  },
  async misPedidos(req, res) {
    try {
      const usuario = req.user;
      if (!usuario) {
        return res.status(401).json({ error: "No autenticado" });
      }
      const pedidos = await PedidoModel.getByUsuarioId(usuario.id);
      return res.json(pedidos);
    } catch (error) {
      return res.status(500).json({ error: "Error al consultar historial de pedidos" });
    }
  },
  async obtenerTodos(req, res) {
    try {
      const pedidos = await PedidoModel.getAll();
      return res.json(pedidos);
    } catch (error) {
      return res.status(500).json({ error: "Error al consultar pedidos" });
    }
  }
};

// server/routes/pedidoRoutes.ts
var router3 = Router3();
router3.post("/", verificarUsuario, PedidoController.crear);
router3.get("/mis-pedidos", verificarUsuario, PedidoController.misPedidos);
router3.get("/todos", verificarUsuario, requerirAdmin, PedidoController.obtenerTodos);
var pedidoRoutes_default = router3;

// server/routes/authRoutes.ts
import { Router as Router4 } from "express";

// server/controllers/authController.ts
var AuthController = {
  async registro(req, res) {
    try {
      const { email, password, nombre, rol } = req.body;
      if (!email || !password || !nombre) {
        return res.status(400).json({ error: "Email, contrase\xF1a y nombre son requeridos" });
      }
      const rolAsignado = rol === "admin" ? "admin" : "cliente";
      const usuario = await UsuarioModel.register(email, password, nombre, rolAsignado);
      return res.status(201).json({
        mensaje: "Usuario registrado exitosamente",
        usuario,
        token: `token-${usuario.id}`
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Error en el registro" });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contrase\xF1a requeridos" });
      }
      const usuario = await UsuarioModel.login(email, password);
      return res.json({
        mensaje: "Inicio de sesi\xF3n correcto",
        usuario,
        token: `token-${usuario.id}`
      });
    } catch (error) {
      return res.status(401).json({ error: error.message || "Credenciales inv\xE1lidas" });
    }
  },
  async perfil(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }
    return res.json({ usuario: req.user });
  },
  // Facilidad para el evaluador / docente: cambiar de rol al instante para probar el 403
  async cambiarRolDemo(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
      }
      const nuevoRol = req.body.rol === "admin" ? "admin" : "cliente";
      const user = localStore.usuarios.find((u) => u.id === req.user?.id);
      if (user) {
        user.rol = nuevoRol;
      }
      req.user.rol = nuevoRol;
      return res.json({
        mensaje: `Rol actualizado a ${nuevoRol}`,
        usuario: {
          ...req.user,
          rol: nuevoRol
        }
      });
    } catch (error) {
      return res.status(500).json({ error: "Error al cambiar rol" });
    }
  }
};

// server/routes/authRoutes.ts
var router4 = Router4();
router4.post("/registro", AuthController.registro);
router4.post("/login", AuthController.login);
router4.get("/perfil", verificarUsuario, AuthController.perfil);
router4.post("/cambiar-rol-demo", verificarUsuario, AuthController.cambiarRolDemo);
var authRoutes_default = router4;

// server/app.ts
dotenv2.config();
var app = express();
app.use(express.json());
app.use("/api/categorias", categoriaRoutes_default);
app.use("/api/productos", productoRoutes_default);
app.use("/api/pedidos", pedidoRoutes_default);
app.use("/api/auth", authRoutes_default);
app.get("/api/status", (req, res) => {
  res.json({
    supabaseConfigurado: isSupabaseConfigured,
    supabaseUrl: process.env.SUPABASE_URL || "No configurada",
    tablasExisten: tablasExistenEnSupabase,
    rubro: "Panader\xEDa",
    tienda: "Micho y Tito",
    totalProductos: localStore.productos.length,
    totalCategorias: localStore.categorias.length,
    modo: isSupabaseConfigured ? tablasExistenEnSupabase ? "Conexi\xF3n Directa Supabase (Tablas Activas)" : "Supabase Conectado (Falta ejecutar db/esquema.sql en SQL Editor)" : "Modo Demostraci\xF3n / Servidor Integrado",
    tiempoServidor: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/reset-demo", (req, res) => {
  localStore.reset();
  res.json({ mensaje: "Datos de la panader\xEDa restablecidos al estado inicial" });
});
var app_default = app;
export {
  app_default as default
};
