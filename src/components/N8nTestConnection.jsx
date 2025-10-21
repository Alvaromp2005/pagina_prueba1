import { useState } from 'react';
import { n8nService } from '../services/n8nService';
import { n8nProxyService } from '../services/n8nProxyService';

const N8nTestConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('Iniciando prueba de conexión N8N...');

      // Verificar estado del proxy primero
      const proxyHealth = await n8nProxyService.checkProxyHealth();
      console.log('Estado del proxy:', proxyHealth);

      let connectionTest, workflowsTest;

      if (proxyHealth.success) {
        console.log('✅ Usando servidor proxy para evitar CORS');
        // Usar servicio proxy
        connectionTest = await n8nProxyService.testConnection();
        workflowsTest = await n8nProxyService.getWorkflows();
      } else {
        console.log(
          '⚠️ Proxy no disponible, usando conexión directa (puede fallar por CORS)'
        );
        // Fallback al servicio directo
        connectionTest = await n8nService.testConnection();
        workflowsTest = await n8nService.getWorkflows();
      }

      console.log('Resultado test conexión:', connectionTest);
      console.log('Resultado test workflows:', workflowsTest);

      // Mostrar información de configuración
      const configInfo = n8nService.getConfigInfo();
      const proxyConfigInfo = n8nProxyService.getConfigInfo();
      console.log('Información de configuración:', configInfo);

      setTestResult({
        proxy: proxyHealth,
        connection: connectionTest,
        workflows: workflowsTest,
        config: {
          ...configInfo,
          proxy: proxyConfigInfo,
        },
      });
    } catch (error) {
      console.error('Error en prueba de conexión:', error);
      setTestResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Prueba de Conexión N8N</h3>

      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>

      {testResult && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Resultado:</h4>
          <pre className="bg-white p-3 rounded border text-sm overflow-auto max-h-96">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default N8nTestConnection;
