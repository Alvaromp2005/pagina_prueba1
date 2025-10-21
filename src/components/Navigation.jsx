import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Componente de Navegación
 * Maneja la navegación entre diferentes páginas de la aplicación usando React Router
 */
const Navigation = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pages = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Vista principal con subvenciones y filtros',
    },
    {
      path: '/research',
      name: 'Investigaciones',
      icon: '🔬',
      description: 'Crear y ejecutar investigaciones automatizadas',
      protected: true,
    },
    {
      path: '/workflows',
      name: 'Workflows',
      icon: '⚙️',
      description: 'Gestionar y ejecutar workflows de N8N',
      protected: true,
    },
    {
      path: '/grants',
      name: 'Subvenciones',
      icon: '💰',
      description: 'Explorar subvenciones disponibles',
    },
    {
      path: '/evaluations',
      name: 'Evaluaciones',
      icon: '⭐',
      description: 'Gestionar evaluaciones',
    },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            {/* Botón menú móvil */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden mr-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                SubvencionesAI
              </h1>
            </div>
          </div>

          {/* Navegación principal - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {pages.map(page => {
              // No mostrar páginas protegidas si no está autenticado
              if (page.protected && !isAuthenticated) return null;

              const isActive = location.pathname === page.path;

              return (
                <Link
                  key={page.path}
                  to={page.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={page.description}
                >
                  <span className="mr-2">{page.icon}</span>
                  {page.name}
                </Link>
              );
            })}
          </div>

          {/* Usuario y entorno */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Información del usuario */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.company_name || user?.role}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    <span>👤</span>
                    <span className="hidden sm:inline">▼</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        👤 Mi Perfil
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ⚙️ Configuración
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                🔐 Iniciar Sesión
              </Link>
            )}

            <EnvironmentIndicator />
          </div>
        </div>
      </div>

      {/* Navegación móvil - Menú desplegable */}
      {showMobileMenu && (
        <div className="sm:hidden mobile-menu-container">
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
            {pages.map(page => {
              // No mostrar páginas protegidas si no está autenticado
              if (page.protected && !isAuthenticated) return null;

              const isActive = location.pathname === page.path;

              return (
                <Link
                  key={page.path}
                  to={page.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{page.icon}</span>
                  {page.name}
                </Link>
              );
            })}
          </div>

          {/* Usuario en móvil */}
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4 mb-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '👤'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.full_name || 'Usuario'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100"
                >
                  👤 Mi Perfil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100"
                >
                  ⚙️ Configuración
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-700 hover:text-red-800 hover:bg-red-50"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
              
              {/* Indicador de entorno en móvil */}
              <div className="px-4 pt-3">
                <EnvironmentIndicator />
              </div>
            </div>
          )}

          {/* Login en móvil si no está autenticado */}
          {!isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200 px-4">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
              >
                🔐 Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

/**
 * Componente indicador de entorno
 */
const EnvironmentIndicator = () => {
  const [isTest, setIsTest] = useState(true);

  useEffect(() => {
    // Obtener información del entorno desde la configuración global
    if (window.appConfig && window.appConfig.initialized) {
      setIsTest(window.appConfig.isTestEnvironment);
    }
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isTest
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}
      >
        {isTest ? '🧪 TEST' : '🚀 PROD'}
      </div>
    </div>
  );
};

export default Navigation;
