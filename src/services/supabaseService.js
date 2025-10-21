import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config/index.js';
import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';

/**
 * Servicio para interactuar con Supabase
 * Maneja automáticamente el entorno (TEST/PRODUCTION) y las tablas correspondientes
 */
class SupabaseService {
  constructor() {
    this.config = null;
    this.client = null;
  }

  /**
   * Inicializa el servicio con la configuración actual
   */
  initialize() {
    if (!appConfig.initialized) {
      throw new Error(
        'AppConfig debe ser inicializado antes de usar SupabaseService'
      );
    }
    const config = appConfig.supabaseConfig;
    console.log('🔧 Configurando cliente Supabase:', {
      url: config.url,
      hasKey: !!config.key,
      hasServiceKey: !!config.serviceRoleKey,
    });

    this.config = config;
    // Usar siempre la clave anon para operaciones básicas de lectura
    const keyToUse = config.key;
    console.log('🔑 Usando clave anon para conexión');

    // Crear cliente de Supabase para autenticación
    if (!this.client) {
      this.client = createClient(config.url, keyToUse, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
        },
      });
    }

    console.log('✅ Cliente Supabase inicializado con clave anon');
  }

  /**
   * Obtiene el cliente de Supabase para operaciones de autenticación
   */
  getClient() {
    if (!this.client) {
      this.initialize();
    }
    return this.client;
  }

  /**
   * Realiza una petición HTTP a Supabase
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.config) {
      ErrorHandler.logInfo(
        '🔧 [SupabaseService] Inicializando configuración...'
      );
      // Asegurar que appConfig esté inicializado
      if (!appConfig.initialized) {
        ErrorHandler.logInfo(
          '⏳ [SupabaseService] Esperando inicialización de appConfig...'
        );
        await appConfig.initialize();
        if (!appConfig.initialized) {
          ErrorHandler.logError(
            '❌ [SupabaseService] Error: No se pudo inicializar appConfig',
            appConfig
          );
          throw new Error('Error: No se pudo inicializar appConfig');
        }
      }
      this.initialize();
      ErrorHandler.logInfo(
        '✅ [SupabaseService] Configuración inicializada correctamente'
      );
    }

    const url = `${this.config.url}/rest/v1/${endpoint}`;
    ErrorHandler.logInfo('🌐 URL construida:', url);

    const defaultHeaders = {
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
    };

    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    ErrorHandler.logInfo('📋 Opciones de petición:', {
      url,
      method: requestOptions.method || 'GET',
      headers: {
        ...requestOptions.headers,
        apikey: '[HIDDEN]',
        Authorization: '[HIDDEN]',
      },
    });

    try {
      ErrorHandler.logInfo('🚀 Enviando petición a Supabase...');
      const response = await fetch(url, requestOptions);
      ErrorHandler.logInfo(
        '📡 Respuesta recibida:',
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        ErrorHandler.logError(
          `❌ Supabase HTTP error! status: ${response.status}, response: ${errorText}`
        );
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      ErrorHandler.logInfo(
        '✅ Datos parseados correctamente, cantidad de registros:',
        Array.isArray(data) ? data.length : 'No es array'
      );
      return data;
    } catch (error) {
      ErrorHandler.logError('❌ Error en petición a Supabase:', error);
      ErrorHandler.logError('❌ Stack trace completo:', error.stack);
      throw error;
    }
  }

  /**
   * Mapea los datos de Supabase (español) al formato esperado por la interfaz (inglés)
   * Es más robusto, buscando tanto claves en español como en inglés.
   */
  mapGrantData(rawGrant, index = 0) {
    const get = (es_key, en_key, default_val = null) => {
      if (rawGrant[es_key] !== undefined) return rawGrant[es_key];
      if (rawGrant[en_key] !== undefined) return rawGrant[en_key];
      return default_val;
    };

    const mapped = {
      id: rawGrant.id,
      title: get('Título', 'title', 'Sin título'),
      description: get('Resumen', 'description', 'Sin descripción'),
      source: get('Tipo Convocatoria', 'source', 'BOE'),
      sector: get('Sector', 'sector', 'General'),
      geographic_scope: get(
        'Ámbito Geográfico',
        'geographic_scope',
        'Nacional'
      ),
      amount_min: parseFloat(get('Cuantía Mínima', 'amount_min', 0)),
      amount_max: parseFloat(get('Cuantía', 'amount_max', 0)),
      status: get('Estado', 'status', 'PENDING'),
      deadline_date: get('Plazos', 'deadline_date'),
      pdf_link: get('Link PDF', 'pdf_link'),
      milestones: get('Hitos Relevantes', 'milestones'),
      requirements: get('Requisitos', 'requirements'),
      iso_requirements: get('Requerimientos ISO', 'iso_requirements'),
      created_at: rawGrant.created_at,
      updated_at: rawGrant.updated_at,
    };

    // Lógica adicional para manejar cuantías
    if (isNaN(mapped.amount_min) && !isNaN(mapped.amount_max)) {
      mapped.amount_min = mapped.amount_max;
    }

    if (mapped.amount_max === 0 && rawGrant['Cuantía']) {
      const amount = parseFloat(rawGrant['Cuantía']);
      if (!isNaN(amount)) {
        mapped.amount_max = amount;
        mapped.amount_min = amount;
      }
    }

    if (index === 0) {
      console.log('🔍 [SupabaseService] Mapeo del primer registro:');
      console.log('  - Datos crudos:', rawGrant);
      console.log('  - Datos mapeados:', mapped);
    }

    return mapped;
  }

  /**
   * Obtiene subvenciones con filtros opcionales, usando el makeRequest centralizado.
   * @param {Object} _filters - Filtros opcionales (no implementado aún)
   * @param {boolean} isTestMode - Si usar tabla de prueba o producción
   */
  async getGrants(_filters = {}, isTestMode = false) {
    // Usar variables de entorno para nombres de tablas
    const tableName = isTestMode
      ? import.meta.env.VITE_SUPABASE_TABLE_GRANTS_TEST
      : import.meta.env.VITE_SUPABASE_TABLE_GRANTS_PRODUCTION;
    ErrorHandler.logInfo(
      `[SupabaseService] Obteniendo grants desde la tabla: ${tableName} (isTestMode: ${isTestMode})`
    );
    try {
      const endpoint = `${tableName}?select=*`;
      const rawGrants = await this.makeRequest(endpoint);

      if (!Array.isArray(rawGrants)) {
        ErrorHandler.logError(
          `[SupabaseService] La respuesta de Supabase para la tabla ${tableName} no es un array:`,
          rawGrants
        );
        return ErrorHandler.createErrorResponse(
          'La respuesta de Supabase no es válida',
          ERROR_TYPES.DATA_VALIDATION,
          { tableName, response: rawGrants }
        );
      }

      ErrorHandler.logInfo(
        `[SupabaseService] Datos crudos obtenidos de ${tableName}:`,
        rawGrants.length,
        'registros'
      );
      const grants = rawGrants.map((grant, index) =>
        this.mapGrantData(grant, index)
      );
      ErrorHandler.logInfo(
        `[SupabaseService] Mapeo completado para ${tableName}. ${grants.length} grants procesadas.`
      );

      return ErrorHandler.createSuccessResponse(grants);
    } catch (error) {
      ErrorHandler.logError(
        `Error obteniendo grants de la tabla ${tableName}:`,
        error
      );
      return ErrorHandler.createErrorResponse(
        error.message || `Error obteniendo grants de la tabla ${tableName}`,
        ERROR_TYPES.DATABASE,
        error
      );
    }
  }

  /**
   * Inserta una nueva subvención
   */
  async insertGrant(grantData) {
    try {
      const response = await this.makeRequest(this.config.tables.grants, {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(grantData),
      });

      return ErrorHandler.createSuccessResponse(response);
    } catch (error) {
      ErrorHandler.logError('Error insertando grant:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error insertando grant',
        ERROR_TYPES.DATABASE,
        error
      );
    }
  }

  /**
   * Actualiza una subvención existente
   */
  async updateGrant(id, grantData) {
    try {
      const response = await this.makeRequest(
        `${this.config.tables.grants}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify(grantData),
        }
      );

      return ErrorHandler.createSuccessResponse(response);
    } catch (error) {
      ErrorHandler.logError('Error actualizando grant:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error actualizando grant',
        ERROR_TYPES.DATABASE,
        error
      );
    }
  }

  /**
   * Elimina una subvención
   */
  async deleteGrant(id) {
    try {
      await this.makeRequest(`${this.config.tables.grants}?id=eq.${id}`, {
        method: 'DELETE',
      });

      return ErrorHandler.createSuccessResponse({ deleted: true, id });
    } catch (error) {
      ErrorHandler.logError('Error eliminando grant:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error eliminando grant',
        ERROR_TYPES.DATABASE,
        error
      );
    }
  }

  /**
   * Obtiene proyectos de investigación
   */
  async getResearchProjects(filters = {}) {
    let query = `${this.config.tables.researchProjects}?select=*`;

    if (filters.status) {
      query += `&status=eq.${filters.status}`;
    }
    if (filters.created_by) {
      query += `&created_by=eq.${filters.created_by}`;
    }

    query += '&order=created_at.desc';

    return await this.makeRequest(query);
  }

  /**
   * Inserta un nuevo proyecto de investigación
   */
  async insertResearchProject(projectData) {
    const response = await this.makeRequest(
      this.config.tables.researchProjects,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(projectData),
      }
    );

    return response;
  }

  /**
   * Actualiza un proyecto de investigación
   */
  async updateResearchProject(id, projectData) {
    const response = await this.makeRequest(
      `${this.config.tables.researchProjects}?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(projectData),
      }
    );

    return response;
  }

  /**
   * Obtiene ejecuciones de investigación
   */
  async getResearchExecutions(projectId = null) {
    let query = `${this.config.tables.researchExecutions}?select=*`;

    if (projectId) {
      query += `&research_project_id=eq.${projectId}`;
    }

    query += '&order=started_at.desc';

    return await this.makeRequest(query);
  }

  /**
   * Inserta una nueva ejecución de investigación
   */
  async insertResearchExecution(executionData) {
    const response = await this.makeRequest(
      this.config.tables.researchExecutions,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(executionData),
      }
    );

    return response;
  }

  /**
   * Actualiza una ejecución de investigación
   */
  async updateResearchExecution(id, executionData) {
    const response = await this.makeRequest(
      `${this.config.tables.researchExecutions}?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(executionData),
      }
    );

    return response;
  }

  /**
   * Obtiene usuarios
   */
  async getUsers(filters = {}) {
    let query = `${this.config.tables.users}?select=*`;

    if (filters.role) {
      query += `&role=eq.${filters.role}`;
    }

    query += '&order=created_at.desc';

    return await this.makeRequest(query);
  }

  /**
   * Prueba la conectividad con Supabase
   */
  async testConnection() {
    try {
      ErrorHandler.logInfo(
        '🔧 [SupabaseService] Probando conexión con Supabase...'
      );

      // Asegurar que el servicio esté inicializado
      if (!this.config) {
        ErrorHandler.logInfo(
          '🔧 [SupabaseService] Inicializando servicio antes de probar conexión...'
        );
        this.initialize();
      }

      ErrorHandler.logInfo(
        '📡 [SupabaseService] Realizando prueba de conexión a:',
        this.config.tables.grants
      );
      const response = await this.makeRequest(
        `${this.config.tables.grants}?select=count&limit=1`
      );
      ErrorHandler.logInfo(
        '✅ [SupabaseService] Conexión con Supabase exitosa'
      );
      return ErrorHandler.createSuccessResponse({ connected: true, response });
    } catch (error) {
      ErrorHandler.logError(
        '❌ [SupabaseService] Error probando Supabase:',
        error
      );
      return ErrorHandler.createErrorResponse(
        error.message || 'Error probando conexión con Supabase',
        ERROR_TYPES.DATABASE,
        error
      );
    }
  }

  /**
   * Obtiene información del entorno actual
   */
  getEnvironmentInfo() {
    return {
      environment: appConfig.environment,
      isTest: appConfig.isTestEnvironment,
      tables: this.config?.tables,
      supabaseUrl: this.config?.url,
    };
  }
}

// Instancia global del servicio
export const supabaseService = new SupabaseService();
