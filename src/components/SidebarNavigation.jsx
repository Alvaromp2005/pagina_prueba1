import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SidebarNavigation = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      description: 'Vista general y estadísticas',
      protected: true,
    },
    {
      path: '/research',
      label: 'Investigaciones',
      icon: '🔬',
      description: 'Proyectos de investigación',
      protected: true,
    },
    {
      path: '/workflows',
      label: 'Workflows',
      icon: '⚙️',
      description: 'Gestionar y ejecutar workflows de N8N',
      protected: true,
    },
    {
      path: '/grants',
      label: 'Subvenciones',
      icon: '💰',
      description: 'Explorar subvenciones disponibles',
      protected: true,
    },
    {
      path: '/evaluations',
      label: 'Evaluaciones',
      icon: '⭐',
      description: 'Mis evaluaciones personalizadas',
      protected: true,
    },
    {
      path: '/notifications',
      label: 'Notificaciones',
      icon: '🔔',
      description: 'Alertas y avisos',
      protected: true,
    },
    {
      path: '/settings',
      label: 'Configuración',
      icon: '⚙️',
      description: 'Preferencias y ajustes',
      protected: true,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo">🌊</div>
          {!isCollapsed && (
            <div className="brand-info">
              <h3>WaveResearch</h3>
              <span className="version">v2.0</span>
            </div>
          )}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {isCollapsed ? '▶️' : '◀️'}
        </button>
      </div>

      {/* Información del Usuario */}
      <div className="user-section">
        <div
          className="user-info"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="user-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '👤'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">{user?.full_name || 'Usuario'}</div>
              <div className="user-role">
                {user?.role || 'USER'} • {user?.subscription_type || 'FREE'}
              </div>
            </div>
          )}
          {!isCollapsed && (
            <div className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</div>
          )}
        </div>

        {/* Menú desplegable del usuario */}
        {showUserMenu && !isCollapsed && (
          <div className="user-dropdown">
            <Link
              to="/profile"
              className="dropdown-item"
              onClick={() => setShowUserMenu(false)}
            >
              👤 Mi Perfil
            </Link>
            <Link
              to="/settings"
              className="dropdown-item"
              onClick={() => setShowUserMenu(false)}
            >
              ⚙️ Configuración
            </Link>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      {/* Navegación Principal */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-title">
            {!isCollapsed && 'Navegación Principal'}
          </div>
          {navigationItems.map(item => {
            // No mostrar páginas protegidas si no está autenticado
            if (item.protected && !isAuthenticated) return null;

            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                {isActive && <div className="active-indicator"></div>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Estadísticas Rápidas */}
      {!isCollapsed && user && (
        <div className="sidebar-stats">
          <div className="stats-title">Estadísticas</div>
          <div className="stat-item">
            <span className="stat-icon">🔬</span>
            <div className="stat-info">
              <div className="stat-value">
                {user.total_research_projects || 0}
              </div>
              <div className="stat-label">Proyectos</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔍</span>
            <div className="stat-info">
              <div className="stat-value">{user.total_searches || 0}</div>
              <div className="stat-label">Búsquedas</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <div className="stat-value">{user.total_evaluations || 0}</div>
              <div className="stat-label">Evaluaciones</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer del Sidebar */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="footer-info">
            <div className="last-activity">
              Última actividad:{' '}
              {user?.last_activity_at
                ? new Date(user.last_activity_at).toLocaleDateString()
                : 'Hoy'}
            </div>
            <div className="app-version">
              WaveResearch v2.0 • {new Date().getFullYear()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNavigation;
