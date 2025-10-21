/**
 * Utilidades para extraer y procesar metadatos de UI desde workflows de N8N
 */

// Cache para evitar procesamiento repetitivo
const metadataCache = new Map();

/**
 * Extrae metadatos de UI desde un workflow de N8N
 * Busca sticky notes que contengan UI_METADATA y parsea su contenido JSON
 * @param {Object} workflowJson - El JSON completo del workflow desde la API de N8N
 * @returns {Object|null} - Los metadatos parseados o null si no se encuentran
 */
export const extractMetadata = workflowJson => {
  try {
    // Crear una clave única para el cache basada en el ID y la versión del workflow
    const cacheKey = `${workflowJson?.id || 'no-id'}-${workflowJson?.versionId || workflowJson?.updatedAt || 'no-version'}`;
    
    // Verificar si ya tenemos el resultado en cache
    if (metadataCache.has(cacheKey)) {
      return metadataCache.get(cacheKey);
    }

    // Solo mostrar logs detallados en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '🔍 extractMetadata - Procesando workflow:',
        workflowJson?.name || 'Sin nombre'
      );
    }

    if (
      !workflowJson ||
      !workflowJson.nodes ||
      !Array.isArray(workflowJson.nodes)
    ) {
      console.warn('Workflow JSON inválido o sin nodos');
      const result = {
        success: false,
        parameters: [],
        message: 'Workflow JSON inválido o sin nodos',
      };
      metadataCache.set(cacheKey, result);
      return result;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '📋 extractMetadata - Nodos encontrados:',
        workflowJson.nodes.length
      );
    }

    // Buscar sticky notes en los nodos del workflow
    const stickyNotes = workflowJson.nodes.filter(
      node =>
        node.type === 'n8n-nodes-base.stickyNote' &&
        node.parameters &&
        node.parameters.content
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '📝 extractMetadata - Sticky notes encontrados:',
        stickyNotes.length
      );
    }

    if (stickyNotes.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.info('No se encontraron sticky notes en el workflow');
      }
      const result = {
        success: false,
        parameters: [],
        message: 'No se encontraron sticky notes',
      };
      metadataCache.set(cacheKey, result);
      return result;
    }

    // Buscar el sticky note que contiene UI_METADATA
    for (const stickyNote of stickyNotes) {
      const content = stickyNote.parameters.content;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '🔍 extractMetadata - Analizando sticky note:',
          stickyNote.name || 'Sin nombre'
        );
        console.log(
          '📄 extractMetadata - Contenido:',
          content.substring(0, 200) + '...'
        );
      }

      // Buscar el patrón UI_METADATA seguido de JSON
      let metadataMatch = content.match(/UI_METADATA\s*({[\s\S]*})/);

      // Si no encuentra UI_METADATA, intentar parsear todo el contenido como JSON
      if (!metadataMatch) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🔄 extractMetadata - No se encontró UI_METADATA, intentando parsear como JSON directo'
          );
        }
        // Verificar si el contenido completo es un JSON válido
        const trimmedContent = content.trim();
        if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
          metadataMatch = [null, trimmedContent]; // Simular el match
        }
      }

      if (metadataMatch) {
        try {
          const metadataJson = metadataMatch[1];
          const parsedMetadata = JSON.parse(metadataJson);

          // Validar estructura básica - soportar tanto 'parameters' como 'fields'
          const hasParameters =
            parsedMetadata.parameters &&
            Array.isArray(parsedMetadata.parameters);
          const hasFields =
            parsedMetadata.fields && Array.isArray(parsedMetadata.fields);

          if (hasParameters || hasFields) {
            // Normalizar el formato - convertir 'fields' a 'parameters' si es necesario
            if (hasFields && !hasParameters) {
              parsedMetadata.parameters = parsedMetadata.fields;
            }

            if (process.env.NODE_ENV === 'development') {
              console.info(
                '✅ Metadatos UI extraídos exitosamente:',
                parsedMetadata
              );
            }
            const result = {
              success: true,
              ...parsedMetadata,
              _source: {
                nodeId: stickyNote.id,
                nodeName: stickyNote.name || 'Sticky Note',
                rawContent: content,
              },
            };
            metadataCache.set(cacheKey, result);
            return result;
          } else {
            console.warn(
              'Estructura de metadatos inválida - falta array de parameters o fields'
            );
          }
        } catch (parseError) {
          console.error('Error parseando JSON de metadatos:', parseError);
          console.error('Contenido problemático:', metadataMatch[1]);
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.info(
        'No se encontraron metadatos UI_METADATA válidos en los sticky notes'
      );
    }
    const result = {
      success: false,
      parameters: [],
      message: 'No se encontraron metadatos UI_METADATA válidos',
    };
    metadataCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error extrayendo metadatos del workflow:', error);
    const result = {
      success: false,
      parameters: [],
      message: 'Error extrayendo metadatos',
      error: error.message,
    };
    // No cachear errores para permitir reintentos
    return result;
  }
};

/**
 * Valida la estructura de un parámetro de metadatos
 * @param {Object} parameter - El parámetro a validar
 * @returns {boolean} - true si es válido, false en caso contrario
 */
export const validateParameter = parameter => {
  if (!parameter || typeof parameter !== 'object') {
    return false;
  }

  // Campos requeridos
  const requiredFields = ['name', 'type', 'label'];
  for (const field of requiredFields) {
    if (!parameter[field] || typeof parameter[field] !== 'string') {
      console.warn(`Parámetro inválido - falta campo requerido: ${field}`);
      return false;
    }
  }

  // Tipos de campo soportados
  const supportedTypes = [
    'text',
    'textarea',
    'email',
    'tel',
    'url',
    'password',
    'number',
    'range',
    'percentage',
    'date',
    'datetime-local',
    'time',
    'select',
    'radio',
    'checkbox',
    'checkboxGroup',
    'file',
    'color',
    'hidden',
  ];

  if (!supportedTypes.includes(parameter.type)) {
    console.warn(`Tipo de campo no soportado: ${parameter.type}`);
    return false;
  }

  // Validaciones específicas por tipo
  if (['select', 'radio', 'checkboxGroup'].includes(parameter.type)) {
    if (!parameter.options || !Array.isArray(parameter.options)) {
      console.warn(`Tipo ${parameter.type} requiere array de options`);
      return false;
    }
  }

  return true;
};

/**
 * Procesa y normaliza los parámetros extraídos
 * @param {Array} parameters - Array de parámetros desde los metadatos
 * @returns {Array} - Array de parámetros procesados y validados
 */
export const processParameters = parameters => {
  if (!Array.isArray(parameters)) {
    console.warn('Parameters debe ser un array');
    return [];
  }

  return parameters
    .filter(param => validateParameter(param))
    .map(param => ({
      // Campos básicos
      name: param.name,
      type: param.type,
      label: param.label,

      // Campos opcionales con valores por defecto
      required: param.required || false,
      placeholder: param.placeholder || '',
      defaultValue: param.defaultValue || '',

      // Agrupación y ordenamiento
      group: param.group || 'default',
      order: param.order || 0,

      // Configuración de UI
      ui: {
        width: param.ui?.width || 'full',
        icon: param.ui?.icon || null,
        rows: param.ui?.rows || 3,
        helpText: param.ui?.helpText || '',
        ...param.ui,
      },

      // Validaciones
      validation: {
        pattern: param.validation?.pattern || null,
        message: param.validation?.message || '',
        min: param.validation?.min || null,
        max: param.validation?.max || null,
        minLength: param.validation?.minLength || null,
        maxLength: param.validation?.maxLength || null,
        minSelected: param.validation?.minSelected || null,
        maxSelected: param.validation?.maxSelected || null,
        maxFiles: param.validation?.maxFiles || null,
        maxSize: param.validation?.maxSize || null,
        ...param.validation,
      },

      // Opciones para selects, radios, etc.
      options: param.options || [],

      // Campo original para referencia
      _original: param,
    }))
    .sort((a, b) => {
      // Ordenar por group primero, luego por order
      if (a.group !== b.group) {
        return a.group.localeCompare(b.group);
      }
      return a.order - b.order;
    });
};

/**
 * Función principal que combina extracción y procesamiento
 * @param {Object} workflowJson - El JSON del workflow desde N8N
 * @returns {Object} - Objeto con metadatos procesados y parámetros listos para usar
 */
export const extractAndProcessMetadata = workflowJson => {
  const rawMetadata = extractMetadata(workflowJson);

  if (!rawMetadata) {
    return {
      success: false,
      error: 'No se encontraron metadatos UI_METADATA en el workflow',
      parameters: [],
      groups: [],
    };
  }

  const processedParameters = processParameters(rawMetadata.parameters);

  // Agrupar parámetros por grupo
  const groups = [...new Set(processedParameters.map(p => p.group))].map(
    groupName => ({
      name: groupName,
      label: groupName === 'default' ? 'Parámetros' : groupName,
      parameters: processedParameters.filter(p => p.group === groupName),
    })
  );

  return {
    success: true,
    metadata: rawMetadata,
    parameters: processedParameters,
    groups: groups,
    _source: rawMetadata._source,
  };
};

export default {
  extractMetadata,
  validateParameter,
  processParameters,
  extractAndProcessMetadata,
};
