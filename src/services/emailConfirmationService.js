import { supabaseService } from './supabaseService.js';
import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';

/**
 * Servicio para manejar confirmación de emails
 * Funciones para envío, validación y reenvío de confirmaciones
 */

/**
 * Confirma el email del usuario usando el token de confirmación
 * @param {string} token - Token de confirmación del email
 * @returns {Object} Resultado de la confirmación
 */
export const confirmEmail = async token => {
  try {
    const { data, error } = await supabaseService.getClient().auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      ErrorHandler.logError('Error confirmando email:', error);
      return ErrorHandler.createErrorResponse(
        error.message,
        ERROR_TYPES.AUTHENTICATION,
        error
      );
    }

    ErrorHandler.logInfo('Email confirmado exitosamente');
    return ErrorHandler.createSuccessResponse({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    ErrorHandler.logError('Error en confirmación de email:', error);
    return ErrorHandler.createErrorResponse(
      error.message || 'Error desconocido en confirmación de email',
      ERROR_TYPES.UNKNOWN,
      error
    );
  }
};

/**
 * Reenvía el email de confirmación al usuario
 * @param {string} email - Email del usuario
 * @returns {Object} Resultado del reenvío
 */
export const resendConfirmationEmail = async email => {
  try {
    const { error } = await supabaseService.getClient().auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      ErrorHandler.logError('Error reenviando email:', error);
      return ErrorHandler.createErrorResponse(
        error.message,
        ERROR_TYPES.AUTHENTICATION,
        error
      );
    }

    ErrorHandler.logInfo('Email de confirmación reenviado exitosamente');
    return ErrorHandler.createSuccessResponse({
      message: 'Email de confirmación reenviado exitosamente',
    });
  } catch (error) {
    ErrorHandler.logError('Error reenviando email de confirmación:', error);
    return ErrorHandler.createErrorResponse(
      error.message || 'Error desconocido reenviando email',
      ERROR_TYPES.UNKNOWN,
      error
    );
  }
};

/**
 * Verifica si un usuario necesita confirmar su email
 * @param {Object} user - Objeto usuario de Supabase
 * @returns {boolean} True si necesita confirmación
 */
export const needsEmailConfirmation = user => {
  return user && !user.email_confirmed_at;
};

/**
 * Obtiene el estado de confirmación del usuario actual
 * @returns {Object} Estado de confirmación
 */
export const getConfirmationStatus = async () => {
  try {
    const {
      data: { user },
    } = await supabaseService.getClient().auth.getUser();

    if (!user) {
      return ErrorHandler.createSuccessResponse({
        isLoggedIn: false,
        needsConfirmation: false,
      });
    }

    return ErrorHandler.createSuccessResponse({
      isLoggedIn: true,
      needsConfirmation: needsEmailConfirmation(user),
      email: user.email,
      confirmedAt: user.email_confirmed_at,
    });
  } catch (error) {
    ErrorHandler.logError('Error obteniendo estado de confirmación:', error);
    return ErrorHandler.createErrorResponse(
      error.message || 'Error obteniendo estado de confirmación',
      ERROR_TYPES.AUTHENTICATION,
      error
    );
  }
};

export const emailConfirmationService = {
  confirmEmail,
  resendConfirmationEmail,
  needsEmailConfirmation,
  getConfirmationStatus,
};

export default emailConfirmationService;
