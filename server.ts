import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import categoriaRoutes from './server/routes/categoriaRoutes';
import productoRoutes from './server/routes/productoRoutes';
import pedidoRoutes from './server/routes/pedidoRoutes';
import authRoutes from './server/routes/authRoutes';
import { isSupabaseConfigured, localStore, tablasExistenEnSupabase } from './server/db/supabaseClient';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

  // Configuración de Vite para desarrollo y producción
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🥖 Servidor de Panadería Micho y Tito iniciado en http://localhost:${PORT}`);
    console.log(`📦 Estado Supabase: ${isSupabaseConfigured ? 'Conectado a ' + process.env.SUPABASE_URL : 'Modo Local Activo (Configurar .env para Supabase Cloud)'}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
