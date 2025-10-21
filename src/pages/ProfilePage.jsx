import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // Redirigir si no está autenticado
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando perfil...
          </h2>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Sesión cerrada correctamente');
    } catch (error) {
      showError('Error al cerrar sesión');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 Mi Perfil</h1>
        <p>Gestiona tu información personal</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="avatar-placeholder w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '👤'}
              </div>
            )}
          </div>

          <div className="profile-info mt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.full_name || 'Usuario'}
            </h2>
            <p className="email text-gray-600 mt-1">{user?.email}</p>

            <div className="profile-badges mt-3 flex space-x-2">
              <span className="badge role px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user?.role || 'USER'}
              </span>
              <span className="badge subscription px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {user?.subscription_type || 'FREE'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stats mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card bg-white p-6 rounded-lg shadow-sm border">
            <div className="stat-icon text-3xl mb-2">🔬</div>
            <div className="stat-value text-2xl font-bold text-gray-900">
              {user?.total_research_projects || 0}
            </div>
            <div className="stat-label text-gray-600">
              Proyectos de Investigación
            </div>
          </div>

          <div className="stat-card bg-white p-6 rounded-lg shadow-sm border">
            <div className="stat-icon text-3xl mb-2">🔍</div>
            <div className="stat-value text-2xl font-bold text-gray-900">
              {user?.total_searches || 0}
            </div>
            <div className="stat-label text-gray-600">Búsquedas Realizadas</div>
          </div>

          <div className="stat-card bg-white p-6 rounded-lg shadow-sm border">
            <div className="stat-icon text-3xl mb-2">⭐</div>
            <div className="stat-value text-2xl font-bold text-gray-900">
              {user?.total_evaluations || 0}
            </div>
            <div className="stat-label text-gray-600">Evaluaciones</div>
          </div>
        </div>

        {/* Información adicional del perfil */}
        <div className="profile-details mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información de la Cuenta
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha de registro:</span>
              <span className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('es-ES')
                  : 'No disponible'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Último acceso:</span>
              <span className="font-medium">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES')
                  : 'No disponible'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Estado de la cuenta:</span>
              <span className="font-medium text-green-600">Activa</span>
            </div>
          </div>
        </div>

        {/* Acciones del perfil */}
        <div className="profile-actions mt-8 flex space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Editar Perfil
          </button>

          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Cambiar Contraseña
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
