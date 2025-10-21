import { useState, useEffect } from 'react';
import { authService } from '../../services/authService.js';
import { TOAST_TYPES } from '../../types/index.js';
import useFormHandlers from '../../hooks/useFormHandlers.js';
import { FormInput, FormSelect } from '../forms/index.js';
import { COMPANY_TYPES } from '../../constants/formConstants.js';

/**
 * Componente de Perfil de Usuario
 * @param {Object} user - Datos del usuario
 * @param {Function} onUpdate - Callback cuando se actualiza el perfil
 * @param {Function} onShowToast - Función para mostrar notificaciones
 */
const UserProfile = ({ user, onUpdate, onShowToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
    company_type: user?.company_type || 'PYME',
    sector: user?.sector || '',
    location: user?.location || '',
    phone: user?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { handleInputChange } = useFormHandlers(formData, setFormData);

  useEffect(() => {
    if (user) {
      const userData = {
        full_name: user.full_name || '',
        company_name: user.company_name || '',
        company_type: user.company_type || 'PYME',
        sector: user.sector || '',
        location: user.location || '',
        phone: user.phone || '',
      };
      setFormData(userData);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const result = await authService.updateProfile(formData);

      if (result.success) {
        onShowToast('Perfil actualizado exitosamente', TOAST_TYPES.SUCCESS);
        onUpdate(result.user);
        setIsEditing(false);
      } else {
        onShowToast(result.error, TOAST_TYPES.ERROR);
      }
    } catch (error) {
      onShowToast('Error actualizando perfil', TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const userData = {
      full_name: user?.full_name || '',
      company_name: user?.company_name || '',
      company_type: user?.company_type || 'PYME',
      sector: user?.sector || '',
      location: user?.location || '',
      phone: user?.phone || '',
    };
    setFormData(userData);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mi Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ✏️ Editar
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '⏳' : '💾'} Guardar
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información básica */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          {isEditing ? (
            <FormInput
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="mb-0"
            />
          ) : (
            <p className="text-gray-900">
              {user.full_name || 'No especificado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-500">El email no se puede cambiar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          {isEditing ? (
            <FormInput
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="mb-0"
            />
          ) : (
            <p className="text-gray-900">
              {user.company_name || 'No especificado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Empresa
          </label>
          {isEditing ? (
            <FormSelect
              name="company_type"
              value={formData.company_type}
              onChange={handleInputChange}
              options={COMPANY_TYPES}
              disabled={isLoading}
              className="mb-0"
            />
          ) : (
            <p className="text-gray-900">
              {user.company_type || 'No especificado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          {isEditing ? (
            <FormInput
              name="sector"
              value={formData.sector}
              onChange={handleInputChange}
              disabled={isLoading}
              className="mb-0"
            />
          ) : (
            <p className="text-gray-900">{user.sector || 'No especificado'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          {isEditing ? (
            <FormInput
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={isLoading}
              className="mb-0"
            />
          ) : (
            <p className="text-gray-900">
              {user.location || 'No especificado'}
            </p>
          )}
        </div>
      </div>

      {/* Información de cuenta */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información de Cuenta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'ADMIN'
                  ? 'bg-red-100 text-red-800'
                  : user.role === 'PREMIUM'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {user.role}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suscripción
            </label>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.subscription_type === 'PREMIUM'
                  ? 'bg-yellow-100 text-yellow-800'
                  : user.subscription_type === 'BASIC'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {user.subscription_type}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miembro desde
            </label>
            <p className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
