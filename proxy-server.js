import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS usando variables de entorno
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:8000', 'http://localhost:8001'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json());

// Configuración del puerto usando variable de entorno
const PORT = process.env.PROXY_PORT || 3002;

// Configuración N8N desde variables de entorno
const N8N_BASE_URL = process.env.VITE_N8N_BASE_URL;
const N8N_API_KEY = process.env.VITE_N8N_API_KEY;
const N8N_BASIC_AUTH_USERNAME = process.env.VITE_N8N_BASIC_AUTH_USERNAME?.replace(/"/g, '');
const N8N_BASIC_AUTH_PASSWORD = process.env.VITE_N8N_BASIC_AUTH_PASSWORD?.replace(/"/g, '');

console.log('🔧 Configuración del proxy:');
console.log('- N8N Base URL:', N8N_BASE_URL);
console.log('- Tiene API Key:', !!N8N_API_KEY);
console.log('- Tiene credenciales básicas:', !!(N8N_BASIC_AUTH_USERNAME && N8N_BASIC_AUTH_PASSWORD));

// Función para crear headers de autenticación
function createAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Usar tanto autenticación básica como API Key si están disponibles
  if (N8N_BASIC_AUTH_USERNAME && N8N_BASIC_AUTH_PASSWORD) {
    const credentials = Buffer.from(`${N8N_BASIC_AUTH_USERNAME}:${N8N_BASIC_AUTH_PASSWORD}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
    console.log('✅ Usando autenticación básica');
  }
  
  if (N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_API_KEY;
    console.log('✅ Usando API Key');
  }
  
  if (!N8N_BASIC_AUTH_USERNAME && !N8N_BASIC_AUTH_PASSWORD && !N8N_API_KEY) {
    console.warn('⚠️ No se encontraron credenciales de autenticación');
  }

  return headers;
}

// Ruta para obtener workflows
app.get('/api/n8n/workflows', async (req, res) => {
  try {
    console.log('📡 Solicitando workflows de N8N...');
    
    const response = await fetch(`${N8N_BASE_URL}api/v1/workflows`, {
      method: 'GET',
      headers: createAuthHeaders()
    });

    console.log('📊 Respuesta N8N:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de N8N:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `N8N API Error: ${response.status} - ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Workflows obtenidos:', data.data?.length || 0);
    
    res.json({
      success: true,
      data: data.data || []
    });
  } catch (error) {
    console.error('❌ Error en proxy:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'PROXY_ERROR'
    });
  }
});

// Ruta para probar conexión
app.get('/api/n8n/test-connection', async (req, res) => {
  try {
    console.log('🔍 Probando conexión con N8N...');
    
    const response = await fetch(`${N8N_BASE_URL}api/v1/workflows`, {
      method: 'GET',
      headers: createAuthHeaders()
    });

    const authMethod = (N8N_BASIC_AUTH_USERNAME && N8N_BASIC_AUTH_PASSWORD) ? 'Autenticación Básica' : 'API Key';
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa');
      
      res.json({
        success: true,
        data: {
          connected: true,
          method: authMethod,
          workflowsCount: data.data?.length || 0,
          status: response.status
        }
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Error de conexión:', response.status, errorText);
      
      res.json({
        success: false,
        error: `Conexión fallida: ${response.status} - ${response.statusText}`,
        details: errorText,
        method: authMethod
      });
    }
  } catch (error) {
    console.error('❌ Error en test de conexión:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'CONNECTION_ERROR'
    });
  }
});

// Ruta para activar/desactivar workflows
app.put('/api/n8n/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    console.log(`🔄 ${active ? 'Activando' : 'Desactivando'} workflow ${id}...`);
    
    // Usar los endpoints oficiales de N8N
    const endpoint = active ? 'activate' : 'deactivate';
    const response = await fetch(`${N8N_BASE_URL}api/v1/workflows/${id}/${endpoint}`, {
      method: 'POST',
      headers: createAuthHeaders()
    });

    console.log('📊 Respuesta activación N8N:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error activando workflow:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `Error activando workflow: ${response.status} - ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`✅ Workflow ${active ? 'activado' : 'desactivado'} exitosamente`);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error en activación:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'ACTIVATION_ERROR'
    });
  }
});

// Ruta para ejecutar workflows
app.post('/api/n8n/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const inputData = req.body;
    
    console.log(`🚀 Ejecutando workflow ${id}...`);
    
    const response = await fetch(`${N8N_BASE_URL}api/v1/workflows/${id}/execute`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        ...inputData,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error ejecutando workflow:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `Error ejecutando workflow: ${response.status} - ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Workflow ejecutado exitosamente');
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Error en ejecución:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'EXECUTION_ERROR'
    });
  }
});

// Ruta de salud del proxy
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    config: {
      n8nBaseUrl: N8N_BASE_URL,
      hasApiKey: !!N8N_API_KEY,
      hasBasicAuth: !!(N8N_BASIC_AUTH_USERNAME && N8N_BASIC_AUTH_PASSWORD)
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Proxy server iniciado en http://localhost:${PORT}`);
  console.log('📡 Redirigiendo peticiones a:', N8N_BASE_URL);
  console.log('🔐 Método de autenticación:', (N8N_BASIC_AUTH_USERNAME && N8N_BASIC_AUTH_PASSWORD) ? 'Básica' : 'API Key');
  console.log('\n📋 Rutas disponibles:');
  console.log('  GET  /health - Estado del proxy');
  console.log('  GET  /api/n8n/test-connection - Probar conexión');
  console.log('  GET  /api/n8n/workflows - Obtener workflows');
  console.log('  PUT /api/n8n/workflows/:id - Activar/desactivar workflow');
  console.log('  POST /api/n8n/workflows/:id/execute - Ejecutar workflow');
  console.log('\n');
});