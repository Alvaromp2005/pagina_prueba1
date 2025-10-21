import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService.js';
import { n8nService } from '../services/n8nService.js';
import {
  RESEARCH_STATUS,
  EXECUTION_FREQUENCIES,
  GEOGRAPHIC_SCOPES,
  GRANT_SOURCES,
} from '../types/index.js';

/**
 * Página de Investigaciones
 * Permite crear, configurar y ejecutar investigaciones de subvenciones
 */
export const ResearchPage = () => {
  const [researchProjects, setResearchProjects] = useState([]);

  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [showExecutions, setShowExecutions] = useState(false);
  const [toast, setToast] = useState(null);

  // Formulario de nueva investigación
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    searchTerms: [],
    targetSectors: [],
    geographicScope: GEOGRAPHIC_SCOPES.NACIONAL,
    amountRangeMin: 0,
    amountRangeMax: 1000000,
    deadlineFrom: '',
    deadlineTo: '',
    sources: [GRANT_SOURCES.BOE, GRANT_SOURCES.EUROPA, GRANT_SOURCES.CDTI],
    executionFrequency: EXECUTION_FREQUENCIES.MANUAL,
  });

  const [searchTermInput, setSearchTermInput] = useState('');
  const [sectorInput, setSectorInput] = useState('');

  // Cargar proyectos de investigación al inicializar
  useEffect(() => {
    loadResearchProjects();
  }, []);

  const loadResearchProjects = async () => {
    try {
      const projects = await supabaseService.getResearchProjects();
      setResearchProjects(projects);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      showToast('Error cargando proyectos de investigación', 'error');
    }
  };

  const loadExecutions = async projectId => {
    try {
      const projectExecutions =
        await supabaseService.getResearchExecutions(projectId);
      setExecutions(projectExecutions);
      setShowExecutions(true);
    } catch (error) {
      console.error('Error cargando ejecuciones:', error);
      showToast('Error cargando ejecuciones', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSearchTerm = () => {
    if (
      searchTermInput.trim() &&
      !formData.searchTerms.includes(searchTermInput.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        searchTerms: [...prev.searchTerms, searchTermInput.trim()],
      }));
      setSearchTermInput('');
    }
  };

  const removeSearchTerm = term => {
    setFormData(prev => ({
      ...prev,
      searchTerms: prev.searchTerms.filter(t => t !== term),
    }));
  };

  const addSector = () => {
    if (
      sectorInput.trim() &&
      !formData.targetSectors.includes(sectorInput.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        targetSectors: [...prev.targetSectors, sectorInput.trim()],
      }));
      setSectorInput('');
    }
  };

  const removeSector = sector => {
    setFormData(prev => ({
      ...prev,
      targetSectors: prev.targetSectors.filter(s => s !== sector),
    }));
  };

  const toggleSource = source => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source],
    }));
  };

  const createResearchProject = async () => {
    if (!formData.name.trim()) {
      showToast('El nombre del proyecto es requerido', 'error');
      return;
    }

    if (formData.searchTerms.length === 0) {
      showToast('Debe agregar al menos un término de búsqueda', 'error');
      return;
    }

    setIsCreating(true);

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        search_terms: formData.searchTerms,
        target_sectors: formData.targetSectors,
        geographic_scope: formData.geographicScope,
        amount_range_min: formData.amountRangeMin,
        amount_range_max: formData.amountRangeMax,
        deadline_from: formData.deadlineFrom || null,
        deadline_to: formData.deadlineTo || null,
        execution_frequency: formData.executionFrequency,
        status: RESEARCH_STATUS.DRAFT,
        created_by: 'current_user', // TODO: Obtener usuario actual
      };

      await supabaseService.insertResearchProject(projectData);

      showToast('Proyecto de investigación creado exitosamente', 'success');
      setIsCreating(false);
      resetForm();
      loadResearchProjects();
    } catch (error) {
      console.error('Error creando proyecto:', error);
      showToast('Error creando proyecto de investigación', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const executeResearch = async project => {
    setIsExecuting(true);

    try {
      // Crear configuración para el workflow
      const researchConfig = {
        name: project.name,
        description: project.description,
        searchTerms: project.search_terms,
        targetSectors: project.target_sectors,
        geographicScope: project.geographic_scope,
        amountRange: {
          min: project.amount_range_min,
          max: project.amount_range_max,
        },
        deadlineRange: {
          from: project.deadline_from,
          to: project.deadline_to,
        },
        sources: formData.sources,
      };

      // Registrar inicio de ejecución
      const executionData = {
        research_project_id: project.id,
        status: 'RUNNING',
        config_snapshot: researchConfig,
      };

      const execution =
        await supabaseService.insertResearchExecution(executionData);

      // Ejecutar workflow de n8n
      const result = await n8nService.createAndExecuteResearch(researchConfig);

      if (result.success) {
        // Actualizar ejecución como completada
        await supabaseService.updateResearchExecution(execution[0].id, {
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          execution_log: JSON.stringify(result.data),
        });

        // Actualizar proyecto
        await supabaseService.updateResearchProject(project.id, {
          status: RESEARCH_STATUS.ACTIVE,
          last_execution_at: new Date().toISOString(),
        });

        showToast('Investigación ejecutada exitosamente', 'success');
      } else {
        // Actualizar ejecución como fallida
        await supabaseService.updateResearchExecution(execution[0].id, {
          status: 'FAILED',
          completed_at: new Date().toISOString(),
          error_message: result.error,
        });

        showToast(`Error en la investigación: ${result.message}`, 'error');
      }

      loadResearchProjects();
    } catch (error) {
      console.error('Error ejecutando investigación:', error);
      showToast('Error ejecutando investigación', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      searchTerms: [],
      targetSectors: [],
      geographicScope: GEOGRAPHIC_SCOPES.NACIONAL,
      amountRangeMin: 0,
      amountRangeMax: 1000000,
      deadlineFrom: '',
      deadlineTo: '',
      sources: [GRANT_SOURCES.BOE, GRANT_SOURCES.EUROPA, GRANT_SOURCES.CDTI],
      executionFrequency: EXECUTION_FREQUENCIES.MANUAL,
    });
    setSearchTermInput('');
    setSectorInput('');
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusBadge = status => {
    const colors = {
      [RESEARCH_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
      [RESEARCH_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
      [RESEARCH_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
      [RESEARCH_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
    };

    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Investigaciones de Subvenciones
        </h1>
        <p className="text-gray-600">
          Configura y ejecuta investigaciones automatizadas para encontrar
          subvenciones relevantes
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Nueva Investigación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Nueva Investigación</h2>

            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Investigación Tecnología 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe el objetivo de esta investigación..."
                />
              </div>

              {/* Términos de búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Términos de Búsqueda
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={searchTermInput}
                    onChange={e => setSearchTermInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSearchTerm()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar término..."
                  />
                  <button
                    onClick={addSearchTerm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.searchTerms.map(term => (
                    <span
                      key={term}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {term}
                      <button
                        onClick={() => removeSearchTerm(term)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sectores objetivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sectores Objetivo
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={sectorInput}
                    onChange={e => setSectorInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSector()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar sector..."
                  />
                  <button
                    onClick={addSector}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetSectors.map(sector => (
                    <span
                      key={sector}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {sector}
                      <button
                        onClick={() => removeSector(sector)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ámbito geográfico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ámbito Geográfico
                </label>
                <select
                  value={formData.geographicScope}
                  onChange={e =>
                    handleInputChange('geographicScope', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(GEOGRAPHIC_SCOPES).map(scope => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de cantidades */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Mínima (€)
                  </label>
                  <input
                    type="number"
                    value={formData.amountRangeMin}
                    onChange={e =>
                      handleInputChange(
                        'amountRangeMin',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Máxima (€)
                  </label>
                  <input
                    type="number"
                    value={formData.amountRangeMax}
                    onChange={e =>
                      handleInputChange(
                        'amountRangeMax',
                        parseInt(e.target.value) || 1000000
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Fuentes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuentes a Buscar
                </label>
                <div className="space-y-2">
                  {Object.values(GRANT_SOURCES).map(source => (
                    <label key={source} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sources.includes(source)}
                        onChange={() => toggleSource(source)}
                        className="mr-2"
                      />
                      <span className="text-sm">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Frecuencia de ejecución */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia de Ejecución
                </label>
                <select
                  value={formData.executionFrequency}
                  onChange={e =>
                    handleInputChange('executionFrequency', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(EXECUTION_FREQUENCIES).map(freq => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={createResearchProject}
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? '🔄 Creando...' : '📝 Crear Proyecto'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Proyectos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Proyectos de Investigación
            </h2>

            {researchProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Oops! Esto está muy vacío
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No hay proyectos de investigación creados. ¡Realicemos una
                    investigación para obtener resultados!
                  </p>
                  <p className="text-sm text-gray-500">
                    Crea tu primer proyecto usando el formulario de la izquierda
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {researchProjects.map(project => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {project.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {project.description}
                        </p>
                      </div>
                      <span className={getStatusBadge(project.status)}>
                        {project.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <strong>Términos:</strong>{' '}
                        {project.search_terms?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <strong>Sectores:</strong>{' '}
                        {project.target_sectors?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <strong>Ámbito:</strong> {project.geographic_scope}
                      </div>
                      <div>
                        <strong>Última ejecución:</strong>{' '}
                        {formatDate(project.last_execution_at)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => executeResearch(project)}
                        disabled={isExecuting}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isExecuting ? '🔄 Ejecutando...' : '▶️ Ejecutar'}
                      </button>
                      <button
                        onClick={() => loadExecutions(project.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        📊 Ver Ejecuciones
                      </button>
                      <button
                        onClick={() =>
                          console.log('Editar proyecto:', project.id)
                        }
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal de Ejecuciones */}
          {showExecutions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Historial de Ejecuciones
                  </h3>
                  <button
                    onClick={() => setShowExecutions(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {executions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay ejecuciones registradas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {executions.map(execution => (
                      <div
                        key={execution.id}
                        className="border border-gray-200 rounded p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              execution.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : execution.status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : execution.status === 'RUNNING'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {execution.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(execution.started_at)}
                          </span>
                        </div>

                        {execution.grants_found > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Resultados:</strong>{' '}
                            {execution.grants_found} subvenciones encontradas
                            {execution.new_grants > 0 &&
                              ` (${execution.new_grants} nuevas)`}
                          </div>
                        )}

                        {execution.error_message && (
                          <div className="text-sm text-red-600 mt-1">
                            <strong>Error:</strong> {execution.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
