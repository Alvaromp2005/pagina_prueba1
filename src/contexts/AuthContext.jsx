// Librerías externas
import { createContext, useContext, useState, useEffect } from 'react';

// Servicios
import {
  checkExistingSession,
  signIn,
  signUp,
  signOut,
  loadUserProfile,
} from '../services/authService';
import {
  resendConfirmationEmail,
  needsEmailConfirmation,
} from '../services/emailConfirmationService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay una sesión existente
        const sessionResult = checkExistingSession();
        if (sessionResult.success && sessionResult.data) {
          const existingSession = sessionResult.data;
          setSession(existingSession);

          // Cargar perfil del usuario
          const userProfile = await loadUserProfile(
            existingSession.user?.id,
            existingSession.access_token
          );

          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);

            // Verificar si necesita confirmación de email
            setNeedsConfirmation(needsEmailConfirmation(existingSession.user));
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        // Limpiar datos en caso de error
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const result = await signIn(email, password, rememberMe);

      if (result.success) {
        setSession(result.session);

        // Cargar perfil del usuario
        const userProfile = await loadUserProfile(
          result.user.id,
          result.session.access_token
        );

        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);

          // Verificar si necesita confirmación de email
          setNeedsConfirmation(needsEmailConfirmation(result.user));
        }

        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async userData => {
    setLoading(true);
    try {
      const result = await signUp(userData);

      if (result.success) {
        if (result.session) {
          // Usuario confirmado automáticamente
          setSession(result.session);

          // Cargar perfil del usuario
          const userProfile = await loadUserProfile(
            result.user.id,
            result.session.access_token
          );

          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
            setNeedsConfirmation(false);
          }
        } else if (result.requiresConfirmation) {
          // Usuario creado pero requiere confirmación
          setNeedsConfirmation(true);
          setIsAuthenticated(false);
        }
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setNeedsConfirmation(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async email => {
    setResendingEmail(true);
    try {
      const result = await resendConfirmationEmail(email);
      return result;
    } catch (error) {
      console.error('Error reenviando confirmación:', error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setResendingEmail(false);
    }
  };

  // Función de desarrollo para simular autenticación
  const simulateAuth = () => {
    const mockUser = {
      id: 'dev-user-123',
      email: 'developer@test.com',
      full_name: 'Usuario de Desarrollo',
      email_confirmed_at: new Date().toISOString(),
    };

    const mockSession = {
      access_token: 'dev-token-123',
      user: mockUser,
      expires_at: Date.now() + 3600000, // 1 hora
    };

    setUser(mockUser);
    setSession(mockSession);
    setIsAuthenticated(true);
    setNeedsConfirmation(false);

    console.log('🧪 Autenticación simulada activada para desarrollo');
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    needsConfirmation,
    resendingEmail,
    login,
    register,
    logout,
    resendConfirmation,
    simulateAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
