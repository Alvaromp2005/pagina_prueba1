
import express from 'express';
import n8nService from '../services/n8nService.js';
import { requestLogger } from '../middleware/auth.js';

const router = express.Router();

// Aplicar logging a todas las rutas de N8N
router.use(requestLogger);


/**
 * PATCH /api/n8n/workflows/:id/activate
 * Activar o desactivar un workflow
 */
router.patch('/workflows/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    // Log incoming headers and body for debugging
    console.log('PATCH /workflows/:id/activate headers:', req.headers);
    console.log('PATCH /workflows/:id/activate body:', req.body);
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'El campo "active" debe ser booleano', received: req.body });
    }
    const result = await n8nService.setWorkflowActive(id, active);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ success: false, error: result.error || 'No se pudo cambiar el estado del workflow' });
    }
  } catch (error) {
    console.error('Error en ruta PATCH /workflows/:id/activate:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});


/**
 * GET /api/n8n/workflows
 * Obtener lista de workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const result = await n8nService.getWorkflows();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        message: `${result.total} workflows encontrados`
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        data: []
      });
    }
  } catch (error) {
    console.error('Error en ruta /workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      data: []
    });
  }
});

/**
 * GET /api/n8n/health
 * Probar conexión con N8N (ruta esperada por el frontend)
 */
router.get('/health', async (req, res) => {
  try {
    const result = await n8nService.testConnection();
    
    const statusCode = result.connected ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error en ruta /health:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/n8n/test-connection
 * Probar conexión con N8N (ruta alternativa)
 */
router.get('/test-connection', async (req, res) => {
  try {
    const result = await n8nService.testConnection();
    
    const statusCode = result.connected ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error en ruta /test-connection:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/n8n/workflows/:id
 * Obtener detalles de un workflow específico
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await n8nService.getWorkflowById(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Workflow no encontrado'
      });
    }
  } catch (error) {
    console.error('Error en ruta /workflows/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/n8n/workflows/:id
 * Actualizar workflow
 */
router.put('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflowData = req.body;
    
    const result = await n8nService.updateWorkflow(id, workflowData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Error al actualizar workflow'
      });
    }
  } catch (error) {
    console.error('Error en ruta PUT /workflows/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/execute
 * Ejecutar workflow con parámetros
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const inputData = req.body;
    
    console.log(`📥 Recibiendo solicitud de ejecución para workflow ${id}:`, inputData);
    
    // Validar que el ID del workflow sea válido
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        error: 'ID de workflow inválido'
      });
    }
    
    // Ejecutar workflow usando el servicio actualizado
    const result = await n8nService.executeWorkflow(id, inputData);
    
    console.log(`✅ Workflow ${id} ejecutado exitosamente`);
    res.json(result);
    
  } catch (error) {
    console.error('Error en ruta POST /workflows/:id/execute:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
      details: error.stack
    });
  }
});

/**
 * POST /api/n8n/webhook
 * Ejecutar workflow por webhook (método usado por el frontend)
 */
router.post('/webhook', async (req, res) => {
  try {
    const inputData = req.body;
    
    console.log('📥 Recibiendo solicitud de webhook:', inputData);
    
    // Validar que se proporcione un workflowId
    if (!inputData.workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId es requerido'
      });
    }
    
    // Ejecutar workflow usando el servicio
    const result = await n8nService.executeWorkflow(inputData.workflowId, inputData);
    
    console.log(`✅ Webhook ejecutado exitosamente para workflow ${inputData.workflowId}`);
    res.json(result);
    
  } catch (error) {
    console.error('Error en ruta POST /webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
      details: error.stack
    });
  }
});

export default router;