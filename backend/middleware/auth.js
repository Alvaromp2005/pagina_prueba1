import { AUTH_CONFIG, N8N_BACKEND_CONFIG } from '../config/environment.js';

/**
 * Middleware para crear headers de autenticación para N8N
 * Replica exactamente la lógica de proxy-server.js
 */
export function createN8nAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Usar tanto autenticación básica como API Key si están disponibles (igual que proxy-server.js)
  if (N8N_BACKEND_CONFIG.BASIC_AUTH.USERNAME && N8N_BACKEND_CONFIG.BASIC_AUTH.PASSWORD) {
    const credentials = Buffer.from(`${N8N_BACKEND_CONFIG.BASIC_AUTH.USERNAME}:${N8N_BACKEND_CONFIG.BASIC_AUTH.PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
    console.log('✅ Usando autenticación básica');
  }
  
  if (N8N_BACKEND_CONFIG.API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_BACKEND_CONFIG.API_KEY;
    console.log('✅ Usando API Key');
  }
  
  if (!N8N_BACKEND_CONFIG.BASIC_AUTH.USERNAME && !N8N_BACKEND_CONFIG.BASIC_AUTH.PASSWORD && !N8N_BACKEND_CONFIG.API_KEY) {
    console.warn('⚠️ No se encontraron credenciales de autenticación');
  }

  return headers;
}

/**
 * Middleware para validar autenticación en rutas protegidas
 */
export function requireAuth(req, res, next) {
  if (!AUTH_CONFIG.ENABLED) {
    return next();
  }

  // Aquí se puede implementar validación de tokens JWT, sesiones, etc.
  // Por ahora, permitimos todas las requests si la auth está habilitada
  // En producción, esto debería validar tokens reales
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido'
    });
  }

  // Validación básica del token (implementar validación real en producción)
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Formato de token inválido'
    });
  }

  next();
}

/**
 * Middleware para logging de requests
 */
export function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
}

/**
 * Middleware para manejo de errores
 */
export function errorHandler(err, req, res, next) {
  console.error('Error en el servidor:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}