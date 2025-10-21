# Solución para Ejecución de Workflows de N8N

## Problema Identificado

Durante el desarrollo de la interfaz WaveResearch, se identificó que **N8N no proporciona un endpoint público de REST API para ejecutar workflows arbitrarios**. El endpoint `/api/v1/workflows/{id}/execute` que se intentaba usar inicialmente **no existe** en la API pública de N8N.

### Errores Encontrados

1. **Error 404**: Al intentar usar `/api/v1/workflows/{id}/execute`
2. **Documentación oficial**: Confirma que no hay endpoint público para ejecución directa
3. **Endpoint privado**: `/rest/workflows/run` existe pero es solo para uso interno de la interfaz de N8N

## Solución Implementada: Webhooks

### ¿Por qué Webhooks?

N8N recomienda oficialmente usar **webhooks** como la forma estándar de ejecutar workflows desde aplicaciones externas:

- ✅ **Método oficial y soportado**
- ✅ **No requiere autenticación especial**
- ✅ **Funciona con workflows activos**
- ✅ **Permite pasar datos de entrada**

### Implementación

#### 1. Detección Automática del Webhook

El backend ahora:
1. Obtiene los detalles del workflow usando la API REST
2. Busca automáticamente el nodo webhook en el workflow
3. Extrae el path del webhook y el método HTTP
4. Construye la URL correcta del webhook

```javascript
// Buscar el nodo webhook en el workflow
const webhookNode = workflowDetails.data.nodes?.find(node => 
  node.type === 'n8n-nodes-base.webhook'
);

const webhookPath = webhookNode.parameters?.path;
const webhookUrl = `${this.baseUrl}/webhook/${webhookPath}`;
```

#### 2. Soporte para Diferentes Métodos HTTP

- **GET**: Datos enviados como query parameters
- **POST/PUT/PATCH**: Datos enviados en el body JSON

#### 3. Ejemplo de Workflow Funcional

**Workflow ID**: `d784iqHFClsSvQoj` (WaveResearchBOE Parametrizado)
- **Webhook Path**: `124b8ef1-3725-4bb3-86e0-195022897ae5`
- **Método**: GET
- **URL Completa**: `https://n8n.wavext.es:8443/webhook/124b8ef1-3725-4bb3-86e0-195022897ae5`

### Código Actualizado

#### Backend (n8nService.js)

```javascript
async executeWorkflow(workflowId, inputData = {}) {
  // 1. Obtener detalles del workflow
  const workflowDetails = await this.getWorkflowById(workflowId);
  
  // 2. Encontrar el webhook
  const webhookNode = workflowDetails.data.nodes?.find(node => 
    node.type === 'n8n-nodes-base.webhook'
  );
  
  // 3. Construir URL y ejecutar
  const webhookUrl = `${this.baseUrl}/webhook/${webhookPath}`;
  const response = await fetch(webhookUrl, { /* ... */ });
}
```

## Resultados

### ✅ Antes vs Después

| Aspecto | Antes (API REST) | Después (Webhooks) |
|---------|------------------|-------------------|
| **Status** | ❌ Error 404 | ✅ Status 200 |
| **Respuesta** | `"not found"` | `{"message":"Workflow was started"}` |
| **Método** | No soportado | ✅ Oficial |
| **Autenticación** | Requerida | No requerida |

### 🧪 Prueba Exitosa

```bash
# Comando de prueba
Invoke-WebRequest -Uri "http://localhost:3002/api/n8n/workflows/d784iqHFClsSvQoj/execute" -Method POST

# Respuesta exitosa
{
  "success": true,
  "data": {"message": "Workflow was started"},
  "workflowId": "d784iqHFClsSvQoj",
  "webhookPath": "124b8ef1-3725-4bb3-86e0-195022897ae5",
  "method": "GET",
  "timestamp": "2025-09-23T14:46:32.240Z"
}
```

## Consideraciones Importantes

### 🔒 Seguridad

- Los webhooks son **públicos por diseño**
- No requieren autenticación API
- Considerar implementar validación adicional si es necesario

### 📋 Requisitos

1. **Workflow debe estar activo**
2. **Debe tener un nodo webhook configurado**
3. **El webhook debe tener un path definido**

### 🚀 Beneficios

- **Rendimiento**: Ejecución directa sin proxy
- **Simplicidad**: No requiere autenticación compleja
- **Escalabilidad**: Método oficial soportado por N8N
- **Flexibilidad**: Soporte para diferentes métodos HTTP

## Conclusión

La migración de la API REST inexistente a webhooks resolvió completamente el problema de ejecución de workflows. Esta es la **solución oficial y recomendada** por N8N para integrar workflows en aplicaciones externas.

**Estado**: ✅ **RESUELTO**
**Fecha**: 23 de septiembre de 2025
**Versión**: 1.0.0