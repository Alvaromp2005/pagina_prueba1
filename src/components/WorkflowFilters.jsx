import React from 'react';
import { Search, Filter, BarChart3 } from 'lucide-react';

const WorkflowFilters = ({
  filters,
  onFiltersChange,
  stats = {},
  className = '',
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSearchChange = e => {
    handleFilterChange('search', e.target.value);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >


      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar workflows por nombre, ID o tags..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
            {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Filtros de Workflows
        </h3>
      </div>

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado del Workflow
          </label>
          <select
            value={filters.status || 'todos'}
            onChange={e => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">
              Solo Activos {stats.active ? `(${stats.active})` : ''}
            </option>
            <option value="inactivos">
              Solo Inactivos {stats.inactive ? `(${stats.inactive})` : ''}
            </option>
          </select>
        </div>

        {/* Execution Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Ejecución
          </label>
          <select
            value={filters.executionType || 'todos'}
            onChange={e => handleFilterChange('executionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los tipos</option>
            <option value="ejecutables">Ejecutables (Webhook/Manual)</option>
            <option value="no-ejecutables">No Ejecutables (Programados)</option>
            <option value="webhook">
              Solo Webhooks {stats.webhook ? `(${stats.webhook})` : ''}
            </option>
            <option value="manual">
              Solo Manuales {stats.manual ? `(${stats.manual})` : ''}
            </option>
            <option value="scheduled">
              Solo Programados {stats.scheduled ? `(${stats.scheduled})` : ''}
            </option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy || 'name'}
            onChange={e => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="created">Fecha de Creación (Más reciente)</option>
            <option value="created-desc">Fecha de Creación (Más antigua)</option>
            <option value="updated">Última Modificación (Más reciente)</option>
            <option value="updated-desc">Última Modificación (Más antigua)</option>
            <option value="status">Estado (Activos primero)</option>
            <option value="status-desc">Estado (Inactivos primero)</option>
            <option value="execution-type">Tipo de Ejecución</option>
          </select>
        </div>
      </div>

      {/* Archived Workflows Checkbox */}
      <div className="mt-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showArchived || false}
            onChange={e => handleFilterChange('showArchived', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Mostrar workflows archivados
          </span>
        </label>
      </div>

      {/* Stats Summary */}
      {stats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Resumen</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-600">
                {stats.total}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-green-600">
                {stats.active || 0}
              </div>
              <div className="text-gray-600">Activos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-orange-600">
                {stats.webhook || 0}
              </div>
              <div className="text-gray-600">Webhooks</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-purple-600">
                {stats.manual || 0}
              </div>
              <div className="text-gray-600">Manuales</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.status !== 'todos' ||
        filters.executionType !== 'todos' ||
        filters.search ||
        filters.showArchived) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {filters.status && filters.status !== 'todos' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Estado: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'todos')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.executionType && filters.executionType !== 'todos' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Tipo: {filters.executionType}
                <button
                  onClick={() => handleFilterChange('executionType', 'todos')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Búsqueda: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.showArchived && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Archivados incluidos
                <button
                  onClick={() => handleFilterChange('showArchived', false)}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() =>
                onFiltersChange({
                  status: 'todos',
                  executionType: 'todos',
                  search: '',
                  showArchived: false,
                })
              }
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowFilters;
