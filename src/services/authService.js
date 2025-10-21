import { appConfig } from '../config/index.js';
import { supabaseService } from './supabaseService.js';
import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';

/**
 * Servicio de Autenticación Stateless
 * Funciones puras para manejo de autenticación sin estado interno
 */

/**
 * Verifica si hay una sesión existente en el almacenamiento local
 */
export const checkExistingSession = () => {
  try {
    const sessionData =
      localStorage.getItem('supabase_session') ||
      sessionStorage.getItem('supabase_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);

      // Verificar si la sesión no ha expirado
      if (new Date(session.expires_at) > new Date()) {
        return ErrorHandler.createSuccessResponse(session);
      } else {
        // Sesión expirada, limpiar
        localStorage.removeItem('supabase_session');
        sessionStorage.removeItem('supabase_session');
        ErrorHandler.logInfo('Sesión expirada, limpiando almacenamiento');
      }
    }
    return ErrorHandler.createSuccessResponse(null);
  } catch (error) {
    ErrorHandler.logError('Error verificando sesión existente:', error);
    localStorage.removeItem('supabase_session');
    sessionStorage.removeItem('supabase_session');
    return ErrorHandler.createErrorResponse(
      'Error al verificar sesión existente',
      ERROR_TYPES.UNKNOWN,
      error
    );
  }
};

/**
 * Registra un nuevo usuario
 */
export const signUp = async userData => {
  try {
    const { email, password, fullName, companyName, companyType, sector } =
      userData;

    const { data, error } = await supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          company_type: companyType,
          sector,
        },
      },
    });

    if (error) {
      ErrorHandler.logError('Error de Supabase en signUp:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error en el registro',
        ERROR_TYPES.AUTHENTICATION,
        error
      );
    }

    ErrorHandler.logInfo('Respuesta exitosa de Supabase signUp');

    if (data.session) {
      // Usuario confirmado automáticamente
      const sessionData = createSessionData(data);
      return ErrorHandler.createSuccessResponse({
        session: sessionData,
        user: data.user,
        requiresConfirmation: false,
      });
    } else if (data.user && !data.session) {
      // Usuario creado pero requiere confirmación
      return ErrorHandler.createSuccessResponse(
        {
          user: data.user,
          requiresConfirmation: true,
        },
        'Registro exitoso. Revisa tu email para confirmar tu cuenta.'
      );
    } else {
      return ErrorHandler.createErrorResponse(
        'Respuesta inesperada del servidor',
        ERROR_TYPES.SERVER
      );
    }
  } catch (error) {
    ErrorHandler.logError('Error en registro:', error);
    return ErrorHandler.createErrorResponse(
      error.message || 'Error desconocido en el registro',
      ERROR_TYPES.UNKNOWN,
      error
    );
  }
};

/**
 * Inicia sesión con email y contraseña
 */
export const signIn = async (email, password, rememberMe = false) => {
  try {
    const { data, error } = await supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      ErrorHandler.logError('Error de Supabase en signIn:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Credenciales inválidas',
        ERROR_TYPES.AUTHENTICATION,
        error
      );
    }

    if (data.session) {
      const sessionData = createSessionData(data);
      saveSession(sessionData, rememberMe);

      ErrorHandler.logInfo('Inicio de sesión exitoso');
      return ErrorHandler.createSuccessResponse({
        session: sessionData,
        user: data.user,
      });
    }

    return ErrorHandler.createErrorResponse(
      'No se recibió sesión válida',
      ERROR_TYPES.AUTHENTICATION
    );
  } catch (error) {
    ErrorHandler.logError('Error en login:', error);
    return ErrorHandler.createErrorResponse(
      error.message || 'Error desconocido en el login',
      ERROR_TYPES.UNKNOWN,
      error
    );
  }
};

/**
 * Cierra la sesión del usuario
 */
export const signOut = async () => {
  try {
    const { error } = await supabaseService.getClient().auth.signOut();

    if (error) {
      console.error('Error cerrando sesión:', error);
    }

    // Limpiar almacenamiento local
    localStorage.removeItem('supabase_session');
    sessionStorage.removeItem('supabase_session');

    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Carga el perfil del usuario desde la base de datos
 */
export const loadUserProfile = async (userId, accessToken) => {
  try {
    if (!userId || !accessToken) {
      throw new Error('ID de usuario y token de acceso requeridos');
    }

    const tableName = appConfig.isTestEnvironment
      ? 'user_profiles_test'
      : 'user_profiles';

    const response = await fetch(
      `${appConfig.supabaseConfig.url}/rest/v1/${tableName}?id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: appConfig.supabaseConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const profiles = await response.json();
      if (profiles.length > 0) {
        return profiles[0];
      } else {
        // Crear perfil si no existe
        return await createUserProfile(userId, accessToken);
      }
    } else {
      console.warn('No se pudo cargar el perfil del usuario');
      return null;
    }
  } catch (error) {
    console.error('Error cargando perfil de usuario:', error);
    return null;
  }
};

/**
 * Crea un nuevo perfil de usuario
 */
export const createUserProfile = async (userId, accessToken, userData = {}) => {
  try {
    const tableName = appConfig.isTestEnvironment
      ? 'user_profiles_test'
      : 'user_profiles';

    const profileData = {
      id: userId,
      full_name: userData.full_name || '',
      company_name: userData.company_name || '',
      company_type: userData.company_type || '',
      sector: userData.sector || '',
      role: 'USER',
      subscription_type: 'FREE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(
      `${appConfig.supabaseConfig.url}/rest/v1/${tableName}`,
      {
        method: 'POST',
        headers: {
          apikey: appConfig.supabaseConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(profileData),
      }
    );

    if (response.ok) {
      const profiles = await response.json();
      return profiles[0];
    } else {
      console.error('Error creando perfil de usuario');
      return null;
    }
  } catch (error) {
    console.error('Error creando perfil de usuario:', error);
    return null;
  }
};

/**
 * Actualiza el perfil del usuario
 */
export const updateProfile = async (userId, accessToken, updates) => {
  try {
    const tableName = appConfig.isTestEnvironment
      ? 'user_profiles_test'
      : 'user_profiles';

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(
      `${appConfig.supabaseConfig.url}/rest/v1/${tableName}?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: appConfig.supabaseConfig.anonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (response.ok) {
      const profiles = await response.json();
      return profiles[0];
    } else {
      console.error('Error actualizando perfil de usuario');
      return null;
    }
  } catch (error) {
    console.error('Error actualizando perfil de usuario:', error);
    return null;
  }
};

/**
 * Refresca el token de acceso
 */
export const refreshToken = async refreshTokenValue => {
  try {
    const { data, error } = await supabaseService
      .getClient()
      .auth.refreshSession({
        refresh_token: refreshTokenValue,
      });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      const sessionData = createSessionData(data);
      return {
        success: true,
        session: sessionData,
      };
    }

    throw new Error('No se pudo refrescar la sesión');
  } catch (error) {
    console.error('Error refrescando token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Funciones auxiliares

/**
 * Crea datos de sesión estandarizados
 */
const createSessionData = authData => {
  return {
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
    expires_at: new Date(
      Date.now() + authData.session.expires_in * 1000
    ).toISOString(),
    user: authData.user || authData.session.user,
  };
};

/**
 * Guarda la sesión en el almacenamiento apropiado
 */
const saveSession = (sessionData, rememberMe = false) => {
  const sessionString = JSON.stringify(sessionData);

  if (rememberMe) {
    localStorage.setItem('supabase_session', sessionString);
  } else {
    sessionStorage.setItem('supabase_session', sessionString);
  }
};

// Mantener compatibilidad con el código existente
export const authService = {
  signUp,
  signIn,
  signOut,
  loadUserProfile,
  createUserProfile,
  updateProfile,
  refreshToken,
  checkExistingSession,

  // Métodos legacy para compatibilidad
  logout: signOut,
  login: signIn,
  register: signUp,
};

export default authService;
