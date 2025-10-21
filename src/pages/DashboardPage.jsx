import { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';

const DashboardPage = () => {
  const { grants, loading, error, isTestMode, toggleTableMode } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGrants = useMemo(() => {
    if (!grants || !Array.isArray(grants)) return [];
    if (!searchQuery.trim()) return grants;

    return grants.filter(
      grant =>
        grant.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [grants, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Subvenciones
          </h1>
          <button
            onClick={toggleTableMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isTestMode
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
            disabled={loading}
          >
            {loading
              ? 'Cambiando...'
              : isTestMode
                ? '🧪 Usando Tabla Test'
                : '📊 Usando Tabla Principal'}
          </button>
        </div>
        <p className="text-gray-600">
          Mostrando datos de la tabla:{' '}
          <strong>
            {isTestMode
              ? import.meta.env.VITE_SUPABASE_TABLE_GRANTS_TEST
              : import.meta.env.VITE_SUPABASE_TABLE_GRANTS_PRODUCTION}
          </strong>
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Subvenciones
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {grants?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {grants?.filter(g => g.status === 'ACTIVE').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-3xl">🔍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filtradas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredGrants?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <input
          type="text"
          placeholder="Buscar por título, descripción, organismo..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      {/* Estado de carga y error */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl animate-spin">🔄</div>
          <p className="mt-4 text-gray-600">
            Cargando datos, por favor espere...
          </p>
        </div>
      )}

      {error && !error.includes('demostración') && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8"
          role="alert"
        >
          <p className="font-bold">Error de Carga</p>
          <p>
            {typeof error === 'string'
              ? error
              : error?.message || 'Error desconocido'}
          </p>
        </div>
      )}

      {error && error.includes('demostración') && (
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8"
          role="alert"
        >
          <p className="font-bold">ℹ️ Modo Demostración</p>
          <p>{error}</p>
        </div>
      )}

      {/* Lista de subvenciones */}
      {!loading && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resultados</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredGrants.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🤷</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron subvenciones
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? 'Intenta con otros términos de búsqueda.'
                      : 'La tabla actual no contiene datos. Puedes cambiar de tabla o esperar nuevos datos.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredGrants.map(grant => (
                <div
                  key={grant.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {grant.title || 'Sin título'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {grant.description || 'Sin descripción'}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500">
                        {grant.source && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {grant.source}
                          </span>
                        )}
                        {grant.sector && <span>{grant.sector}</span>}
                        {grant.geographic_scope && (
                          <span>{grant.geographic_scope}</span>
                        )}
                        {(grant.amount_min || grant.amount_max) && (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {grant.amount_min?.toLocaleString() || 'N/A'}€ -{' '}
                            {grant.amount_max?.toLocaleString() || 'N/A'}€
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          grant.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : grant.status === 'EXPIRED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {grant.status?.toLowerCase() || 'desconocido'}
                      </span>
                      {grant.deadline_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Vence:{' '}
                          {new Date(grant.deadline_date).toLocaleDateString(
                            'es-ES'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
