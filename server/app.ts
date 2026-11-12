import express from 'express';
import dotenv from 'dotenv';
import categoriaRoutes from './routes/categoriaRoutes';
import productoRoutes from './routes/productoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import authRoutes from './routes/authRoutes';
import { isSupabaseConfigured, localStore, tablasExistenEnSupabase } from './db/supabaseClient';

dotenv.config();

// App de Express con toda la API. Se reutiliza en:
//  - server.ts (desarrollo local y servidor tradicional)
//  - api/index.js (función serverless de Vercel, generada en el build)
const app = express();

app.use(express.json());

// Rutas de la API del TP Integrador
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/auth', authRoutes);

// Endpoint de estado y diagnóstico de Supabase
app.get('/api/status', (req, res) => {
  res.json({
    supabaseConfigurado: isSupabaseConfigured,
    supabaseUrl: process.env.SUPABASE_URL || 'No configurada',
    tablasExisten: tablasExistenEnSupabase,
    rubro: 'Panadería',
    tienda: 'Micho y Tito',
    totalProductos: localStore.productos.length,
    totalCategorias: localStore.categorias.length,
    modo: isSupabaseConfigured
      ? (tablasExistenEnSupabase ? 'Conexión Directa Supabase (Tablas Activas)' : 'Supabase Conectado (Falta ejecutar db/esquema.sql en SQL Editor)')
      : 'Modo Demostración / Servidor Integrado',
    tiempoServidor: new Date().toISOString(),
  });
});

// Endpoint para resetear datos de demostración
app.post('/api/reset-demo', (req, res) => {
  localStore.reset();
  res.json({ mensaje: 'Datos de la panadería restablecidos al estado inicial' });
});

export default app;
