import express from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config/environment.js';
import { errorHandler, requestLogger } from './middleware/auth.js';
import n8nRoutes from './routes/n8nRoutes.js';

const app = express();

// Middleware global
app.use(cors({
  origin: SERVER_CONFIG.CORS_ORIGINS,
  credentials: true,
}));

app.use(express.json());
app.use(requestLogger);

// Rutas de la API
app.use('/api/n8n', n8nRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: SERVER_CONFIG.NODE_ENV,
    port: SERVER_CONFIG.PORT
  });
});

// Ruta de información del servidor
app.get('/api/info', (req, res) => {
  res.json({
    name: 'WaveResearch Backend API',
    version: '1.0.0',
    environment: SERVER_CONFIG.NODE_ENV,
    endpoints: {
      health: '/health',
      n8n: '/api/n8n/*',
      info: '/api/info'
    }
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
app.listen(SERVER_CONFIG.PORT, () => {
  console.log('🚀 Servidor backend iniciado');
  console.log(`📡 Puerto: ${SERVER_CONFIG.PORT}`);
  console.log(`🌍 Entorno: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`🔗 CORS habilitado para: ${SERVER_CONFIG.CORS_ORIGINS.join(', ')}`);
  console.log(`🏥 Health check: http://localhost:${SERVER_CONFIG.PORT}/health`);
  console.log(`📋 API Info: http://localhost:${SERVER_CONFIG.PORT}/api/info`);
  console.log('✅ Backend listo para recibir requests');
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

export default app;