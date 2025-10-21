# WaveResearch - Interfaz de Monitoreo de Subvenciones

**Estado del Proyecto**: ✅ Aplicación React completamente funcional - Código optimizado y sin errores  
**Versión Actual**: 2.1.0  
**Última Actualización**: Enero 2025 - Corrección completa de errores ESLint

Aplicación React moderna con Vite para monitoreo de subvenciones, integración completa con n8n workflows y Supabase, sistema de autenticación y arquitectura modular escalable.

## 🚀 Estado Actual del Proyecto

### 🔧 **Mejoras de Calidad de Código (v2.1.0)**

#### ✅ **Corrección Completa de Errores ESLint**
- ✅ **Eliminados todos los errores críticos**: De 4 errores a 0 errores
- ✅ **Corregidos bloques try-catch innecesarios**: Eliminados 2 bloques `no-useless-catch` en `src/config/index.js`
- ✅ **Variables no utilizadas**: Corregida importación no utilizada de `login` en `EmailConfirmationPage.jsx`
- ✅ **Errores de formato Prettier**: Solucionado error de salto de línea final en archivos
- ✅ **Estado final**: 0 errores, 25 advertencias (solo console.log para debugging)
- ✅ **Funcionalidad preservada**: Todas las características siguen operativas tras las correcciones

#### 🛠️ **Optimizaciones Técnicas**
- ✅ **Código más limpio**: Eliminación de bloques try-catch redundantes
- ✅ **Mejor mantenibilidad**: Código más legible y estructurado
- ✅ **Estándares de calidad**: Cumplimiento completo con reglas ESLint
- ✅ **Performance**: Eliminación de imports y variables innecesarias

### ✅ **Funcionalidades Operativas**

#### 🏗️ **Arquitectura React Moderna**
- ✅ Aplicación React 18.3.1 con Vite 5.4.20
- ✅ Arquitectura modular con contextos: AuthContext, DataContext, ToastContext
- ✅ Sistema de rutas protegidas con React Router 7.8.2
- ✅ Componentes reutilizables y escalables
- ✅ Gestión de estado global con Context API

#### 🔍 **Interfaz de Subvenciones**
- ✅ Dashboard principal con datos reales de Supabase
- ✅ Sistema de filtros avanzado por categoría, región, fecha y monto
- ✅ Búsqueda en tiempo real funcional
- ✅ Estadísticas dinámicas del dashboard
- ✅ Tarjetas de subvenciones con información completa
- ✅ Alternancia entre modo TEST y PRODUCTION

#### 🔐 **Sistema de Autenticación**
- ✅ Autenticación completa con Supabase Auth
- ✅ Páginas de login, registro y confirmación de email
- ✅ Rutas protegidas y gestión de sesiones
- ✅ Perfil de usuario y configuraciones
- ✅ Recuperación de contraseña

#### 🔔 **Sistema de Notificaciones**
- ✅ ToastContext para notificaciones globales
- ✅ Notificaciones toast con diferentes tipos (success, error, warning, info)
- ✅ Gestión automática de notificaciones con auto-dismiss
- ✅ Integración con acciones del sistema

#### ⚙️ **Integración n8n**
- ✅ **Workflow "WaveResearch Interface Webhook" activo**
- ✅ **Función de activación de webhook funcional**
- ✅ **Configuración de variables de entorno (.env)**
- ✅ **URLs de webhook de test y producción configuradas**
- ✅ **Envío de datos JSON al webhook sin errores de CORS**

#### 🗄️ **Base de Datos Supabase**
- ✅ **Conexión completa con Supabase PostgreSQL**
- ✅ **SupabaseService: Clase singleton para operaciones CRUD**
- ✅ **Tablas operativas: subvenciones_wavext (producción), subvenciones_wavext_test (desarrollo)**
- ✅ **Sistema dual TEST/PRODUCTION con variables VITE_**
- ✅ **Mapeo automático de datos con SupabaseService.mapGrantData()**
- ✅ **Variables de entorno configuradas y validadas**

#### 🛠️ **Sistema de Debugging**
- ✅ **DebugTestPanel para alternar entre tablas TEST/PRODUCTION**
- ✅ **Logs detallados en servicios con prefijos identificadores**
- ✅ **Indicadores visuales de tabla actual en UI**
- ✅ **Sistema toggleTableMode() con limpieza de estado**
- ✅ **Estados de carga y error visibles durante transiciones**

#### 📋 **Documentación y Planificación**
- ✅ **Plan estratégico de integración n8n** (PLAN_ESTRATEGICO_N8N.md)
- ✅ **Arquitectura de workflows definida** (N8N_WORKFLOW_ARCHITECTURE.md)
- ✅ **Prioridades de integración API** (API_INTEGRATION_PRIORITY.md)
- ✅ **Sistema de filtros inteligentes** (INTELLIGENT_FILTERS_SYSTEM.md)
- ✅ **Tareas pendientes documentadas** (INTEGRACION_PENDIENTE.md)

### 🔄 **Funcionalidades en Desarrollo**

#### 🔗 **Integración Supabase**
- 🔄 Conexión real con base de datos Supabase
- 🔄 Sincronización de datos en tiempo real
- 🔄 Sistema de autenticación de usuarios

#### 📊 **Workflows Especializados**
- 🔄 Workflow BOE (Boletín Oficial del Estado)
- 🔄 Workflow Europa (Fondos Europeos)
- 🔄 Workflow CDTI (Centro para el Desarrollo Tecnológico Industrial)

### ⏳ **Funcionalidades Planificadas**
- ⏳ Sistema de perfiles de usuario personalizados
- ⏳ Evaluación con IA para scoring de subvenciones
- ⏳ Sistema de monitoreo y métricas avanzadas
- ⏳ Dashboard personalizable por usuario
- ⏳ Alertas automáticas por email/SMS

## 🏗️ Arquitectura del Sistema

### **Arquitectura React Moderna**

#### Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
│   ├── Navigation.jsx      # Navegación principal
│   ├── SidebarNavigation.jsx  # Navegación lateral
│   ├── SupabaseTest.jsx    # Panel de debugging
│   ├── ErrorBoundary.jsx   # Manejo de errores
│   └── auth/              # Componentes de autenticación
├── contexts/            # Contextos React
│   ├── AuthContext.jsx     # Gestión de autenticación
│   ├── DataContext.jsx     # Estado global de datos
│   └── ToastContext.jsx    # Notificaciones globales
├── pages/               # Páginas de la aplicación
│   ├── DashboardPage.jsx   # Dashboard principal
│   ├── ResearchPage.jsx    # Página de investigaciones
│   ├── LoginPage.jsx       # Página de login
│   └── ProfilePage.jsx     # Perfil de usuario
├── services/            # Servicios de datos
│   ├── supabaseService.js  # Servicio de Supabase
│   ├── n8nService.js       # Servicio de n8n
│   └── authService.js      # Servicio de autenticación
├── config/              # Configuración
│   └── environment.js      # Gestión de entornos
└── hooks/               # Hooks personalizados
```

#### Patrones de Diseño Implementados
1. **Context Pattern**: AuthContext, DataContext, ToastContext para estado global
2. **Service Layer Pattern**: SupabaseService, N8nService como singletons
3. **Protected Routes Pattern**: ProtectedRoute wrapper para autenticación
4. **Environment Configuration Pattern**: appConfig centralizado
5. **Error Boundary Pattern**: ErrorBoundary component para manejo de errores
6. **Loading States Pattern**: Estados de loading en contextos y componentes

### **Integración n8n**

#### Workflow Activo
- **Nombre**: "WaveResearch Interface Webhook"
- **ID**: p7ki0Mr0y1NjjkT5
- **Estado**: ✅ Activo
- **Trigger**: Webhook POST en `/waveresearch-trigger`
- **Funcionalidad**: Recibe datos de la interfaz web

#### URLs Configuradas
- **Test**: `https://n8n.wavext.es:8443/webhook-test/waveresearch-trigger`
- **Producción**: `https://n8n.wavext.es:8443/webhook/waveresearch-trigger`

### **Base de Datos Supabase (Preparada)**

#### Tablas Diseñadas
1. **grants**: Almacenamiento de subvenciones
2. **users**: Gestión de usuarios y perfiles
3. **notifications**: Sistema de notificaciones
4. **user_preferences**: Configuraciones personalizadas
5. **grant_applications**: Seguimiento de aplicaciones

## ⚙️ Configuración e Instalación

### **Requisitos Previos**
- Node.js 18+ (para React y Vite)
- npm o yarn (gestor de paquetes)
- Acceso a instancia n8n en `https://n8n.wavext.es:8443`
- Cuenta de Supabase configurada

### **Instalación Local**

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Aguimoda/WaveResearchFront.git
   cd interfazN8N
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   
   # Tablas de Base de Datos
   VITE_SUPABASE_TABLE_GRANTS_PRODUCTION=subvenciones_wavext
   VITE_SUPABASE_TABLE_GRANTS_TEST=subvenciones_wavext_test
   
   # n8n Configuration
   VITE_N8N_WEBHOOK_URL=https://n8n.wavext.es:8443/webhook-test/waveresearch-trigger
   VITE_N8N_API_URL=https://n8n.wavext.es:8443/api/v1
   VITE_N8N_API_KEY=tu_api_key_aqui
   
   # Environment
   VITE_ENVIRONMENT=TEST
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   
   Acceder a: `http://localhost:8000` (o `http://localhost:8001` si el puerto está ocupado)

### **Configuración n8n**

1. **Verificar workflow activo**
   - Acceder a n8n: `https://n8n.wavext.es:8443`
   - Confirmar que "WaveResearch Interface Webhook" está activo

2. **Activar webhook de test**
   - Abrir el workflow en n8n
   - Hacer clic en "Execute Workflow" para activar el webhook de test
   - El webhook estará disponible para una ejecución

3. **Probar integración**
   - En la interfaz web, hacer clic en "Activar Workflow n8n"
   - Verificar en n8n que se recibieron los datos en "Executions"

## 📖 Guía de Uso

### **Dashboard Principal**

#### Vista General
- **Estadísticas**: Tarjetas superiores con métricas de subvenciones
  - Total de subvenciones disponibles
  - Subvenciones activas
  - Próximas a vencer (< 30 días)
- **Lista de Subvenciones**: Tarjetas con información detallada
- **Datos Actuales**: Sistema funcionando con datos mock para desarrollo

#### Sistema de Filtros
1. **Filtros Laterales** (siempre visibles):
   - Categorías: I+D+i, Digitalización, Sostenibilidad, etc.
   - Regiones: Nacional, Autonómico, Local, Europeo
   - Fecha límite: Próximos 30 días, 3 meses, 6 meses
   - Monto mínimo: Slider de 0€ a 500,000€

2. **Búsqueda en Tiempo Real**:
   - Barra de búsqueda en el header
   - Busca en títulos y descripciones
   - Resultados instantáneos

#### Integración n8n
1. **Botón "Activar Workflow n8n"** en el header
2. **Funcionalidad**:
   - Envía datos actuales de la interfaz al workflow
   - Incluye query de búsqueda, filtros aplicados y estadísticas
   - Muestra notificaciones de confirmación o error
3. **Datos Enviados**:
   ```json
   {
     "action": "test_workflow",
     "timestamp": "2025-01-XX",
     "source": "waveresearch_interface",
     "data": {
       "search_query": "término de búsqueda",
       "filters": {...},
       "grants_count": 15
     }
   }
   ```

### **Sistema de Notificaciones**

#### Tipos de Notificaciones
- ✅ **Éxito**: Confirmaciones de acciones (verde)
- ⚠️ **Advertencia**: Información importante (amarillo)
- ❌ **Error**: Problemas de conexión o configuración (rojo)
- ℹ️ **Información**: Instrucciones y ayuda (azul)

#### Gestión
- **Aparición**: Toast notifications en la esquina superior derecha
- **Duración**: Auto-dismiss después de 5 segundos
- **Interacción**: Click para cerrar manualmente

## 🔧 Arquitectura Técnica

### **Frontend**
- **Framework**: React 18.3.1 con JSX
- **Build Tool**: Vite 5.4.20 para desarrollo y build optimizado
- **Routing**: React Router DOM 7.8.2 para navegación SPA
- **Estilos**: Tailwind CSS para diseño responsivo
- **Estado**: Context API de React para estado global
- **Componentes**: Arquitectura modular con componentes funcionales
- **TypeScript**: Configurado para desarrollo (opcional)

### **Backend Services**
- **Base de Datos**: Supabase PostgreSQL con APIs REST automáticas
- **Autenticación**: Supabase Auth con JWT tokens
- **Tiempo Real**: Supabase Realtime para subscripciones en vivo
- **Workflows**: n8n para automatización y procesamiento de datos

### **Integración n8n**
- **Método**: Webhook HTTP POST directo
- **URL Test**: `https://n8n.wavext.es:8443/webhook-test/waveresearch-trigger`
- **URL Producción**: `https://n8n.wavext.es:8443/webhook/waveresearch-trigger`
- **Formato**: JSON con estructura definida
- **Autenticación**: No requerida para webhooks (seguridad por URL)

### **Base de Datos (Preparada)**
- **Supabase**: PostgreSQL con APIs REST automáticas
- **Esquema**: Completamente diseñado y documentado
- **Tiempo Real**: Preparado para subscripciones en vivo
- **Autenticación**: Sistema de usuarios preparado

### **Configuración**
- **Variables de Entorno**: Archivo `.env` para configuración
- **Separación**: Desarrollo (.env) y ejemplo (.env.example)
- **Seguridad**: Credenciales no incluidas en el código

## 🔄 Flujo de Datos Actual

### **Estado Actual (Datos Mock)**
1. **Interfaz Web**: Muestra datos de ejemplo para desarrollo
2. **Filtros y Búsqueda**: Funcionan sobre datos mock
3. **Integración n8n**: Envía datos de la interfaz al workflow
4. **Notificaciones**: Sistema toast funcional

### **Flujo Planificado (Producción)**
1. **Recolección**: Workflows n8n especializados (BOE, Europa, CDTI)
2. **Procesamiento**: Evaluación y scoring con IA
3. **Almacenamiento**: Datos en Supabase con esquema definido
4. **Sincronización**: Tiempo real entre n8n y Supabase
5. **Notificaciones**: Alertas automáticas para nuevas oportunidades
6. **Visualización**: Interfaz web con datos reales

### **Workflows Especializados (En Desarrollo)**
- **BOE Workflow**: Monitoreo del Boletín Oficial del Estado
- **Europa Workflow**: Fondos y programas europeos
- **CDTI Workflow**: Centro para el Desarrollo Tecnológico Industrial

## 🛠️ Desarrollo y Personalización

### **Estructura de Archivos**
```
interfazN8N/
├── .env                          # Variables de entorno (no incluido en repo)
├── .env.example                  # Plantilla de variables de entorno
├── package.json                  # Dependencias y scripts de npm
├── vite.config.js               # Configuración de Vite
├── index.html                    # Punto de entrada HTML
├── README.md                     # Esta documentación
├── src/                          # Código fuente React
│   ├── App.jsx                   # Componente principal
│   ├── main.jsx                  # Punto de entrada React
│   ├── components/               # Componentes reutilizables
│   ├── contexts/                 # Contextos React
│   ├── pages/                    # Páginas de la aplicación
│   ├── services/                 # Servicios de datos
│   ├── config/                   # Configuración
│   ├── hooks/                    # Hooks personalizados
│   ├── types/                    # Definiciones de tipos
│   └── utils/                    # Utilidades
├── public/                       # Archivos públicos estáticos
├── dist/                         # Build de producción
├── devdocs/                      # Documentación técnica
│   ├── ARQUITECTURA_MODULAR.md   # Arquitectura del proyecto
│   ├── PLAN_ESTRATEGICO_N8N.md   # Estrategia de integración
│   ├── BOE_WORKFLOW_ANALYSIS.md  # Análisis de workflows BOE
│   └── ...                       # Otros documentos técnicos
└── assets/                       # Recursos adicionales
```

### **Desarrollo con React**

#### **Crear Nuevos Componentes**
```jsx
// src/components/NuevoComponente.jsx
import React from 'react';

export const NuevoComponente = ({ prop1, prop2 }) => {
  return (
    <div className="p-4">
      {/* Contenido del componente */}
    </div>
  );
};
```

#### **Usar Contextos**
```jsx
// Usar DataContext
import { useData } from '../contexts/DataContext';

const MiComponente = () => {
  const { grants, loading, toggleTableMode } = useData();
  
  return (
    <div>
      {loading ? 'Cargando...' : `${grants.length} subvenciones`}
    </div>
  );
};
```

#### **Crear Nuevas Páginas**
```jsx
// src/pages/NuevaPagina.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const NuevaPagina = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1>Nueva Página</h1>
      {/* Contenido */}
    </div>
  );
};
```

#### **Modificar Servicios**
```javascript
// src/services/nuevoServicio.js
import { appConfig } from '../config/environment.js';

class NuevoServicio {
  async metodoEjemplo() {
    // Implementación
  }
}

export const nuevoServicio = new NuevoServicio();
```

## 🔍 Solución de Problemas

### **Problemas Comunes**

#### Error 404 en Webhook n8n
**Síntoma**: "waveresearch-trigger webhook is not registered"

**Solución**:
1. Acceder a n8n: `https://n8n.wavext.es:8443`
2. Abrir workflow "WaveResearch Interface Webhook"
3. Hacer clic en "Execute Workflow" (botón play)
4. Probar nuevamente desde la interfaz web

#### Notificaciones No Aparecen
**Causas Posibles**:
- JavaScript deshabilitado en el navegador
- Errores en la consola del navegador

**Solución**:
1. Abrir DevTools (F12)
2. Revisar la pestaña Console para errores
3. Verificar que las funciones de notificación estén cargadas

#### Filtros No Funcionan
**Verificar**:
1. Datos mock cargados correctamente
2. Función `applyFilters()` sin errores
3. Estructura de datos consistente

### **Debugging**

#### Logs de n8n
1. Acceder a n8n web interface
2. Ir a "Executions" para ver logs de workflows
3. Revisar datos recibidos en el webhook

#### Logs del Navegador
1. Abrir DevTools (F12)
2. Pestaña Console para errores JavaScript
3. Pestaña Network para problemas de conectividad

#### Variables de Entorno
1. Verificar que `.env` existe y tiene las variables correctas
2. Comprobar que las URLs de n8n son accesibles
3. Validar formato de las credenciales

## 🚀 Roadmap y Desarrollo Futuro

### **Próximas Implementaciones (Orden de Prioridad)**

#### Fase 1: Integración Completa (2-4 semanas)
1. **Conexión Supabase Real**
   - Implementar cliente Supabase en la interfaz
   - Migrar de datos mock a datos reales
   - Sistema de autenticación básico

2. **Workflows Especializados**
   - Workflow BOE completamente funcional
   - Workflow Europa para fondos europeos
   - Workflow CDTI para I+D+i

#### Fase 2: Funcionalidades Avanzadas (4-6 semanas)
1. **Sistema de Perfiles de Usuario** (ver INTEGRACION_PENDIENTE.md)
2. **Evaluación con IA para Scoring** (ver INTEGRACION_PENDIENTE.md)
3. **Toggle Mock/Real Data** (implementación inmediata)

#### Fase 3: Optimización (2-3 semanas)
1. **Sistema de Monitoreo** (ver INTEGRACION_PENDIENTE.md)
2. **Dashboard personalizable**
3. **Exportación de datos**

### **Documentación Técnica Disponible**
- 📋 **INTEGRACION_PENDIENTE.md**: Tareas detalladas con estimaciones
- 🏗️ **N8N_WORKFLOW_ARCHITECTURE.md**: Arquitectura de workflows
- 📊 **PLAN_ESTRATEGICO_N8N.md**: Estrategia de integración
- 🎯 **API_INTEGRATION_PRIORITY.md**: Prioridades de APIs externas
- 🧠 **INTELLIGENT_FILTERS_SYSTEM.md**: Sistema de filtros inteligentes
- 🗄️ **SUPABASE_SCHEMA.sql**: Esquema completo de base de datos

### **Contribuir al Proyecto**

#### Configuración de Desarrollo
1. Clonar repositorio y configurar `.env`
2. Revisar documentación técnica en archivos .md
3. Probar integración n8n local
4. Implementar cambios siguiendo la arquitectura existente

#### Áreas de Contribución
- **Frontend**: Mejoras de UI/UX
- **Workflows n8n**: Nuevas fuentes de datos
- **Base de Datos**: Optimizaciones de esquema
- **Documentación**: Mejoras y actualizaciones

## 📞 Soporte y Recursos

### **Documentación Externa**
- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Estado del Proyecto**
- **Repositorio**: Activo y en desarrollo
- **Integración n8n**: ✅ Funcional
- **Base de Datos**: ✅ Esquema preparado
- **Interfaz Web**: ✅ Operativa con datos mock
- **Documentación**: ✅ Completa y actualizada

---

**Versión**: 2.0.0  
**Estado**: ✅ Aplicación React completamente funcional  
**Tecnologías**: React 18.3.1, Vite 5.4.20, Supabase 2.57.4, React Router 7.8.2  
**Próximo Milestone**: Optimización y nuevas funcionalidades  
**Última Actualización**: Enero 2025

## 📊 Resumen de Cambios Recientes

### ✅ **Migración Completa a React**
- Migración de HTML/JS vanilla a React 18.3.1 con Vite
- Implementación de arquitectura modular con contextos
- Sistema de rutas protegidas con React Router
- Integración completa con Supabase Auth

### ✅ **Correcciones Críticas Implementadas**
- Corregido ReferenceError: process is not defined (variables VITE_)
- Corregidos nombres de tablas usando MCP PostgreSQL
- Corregido bug de alternancia entre tablas TEST/PRODUCTION
- Implementado sistema de debugging con DebugTestPanel

### ✅ **Funcionalidades Operativas**
- Dashboard con datos reales de Supabase
- Sistema de autenticación completo
- Alternancia entre modo TEST y PRODUCTION
- Logs detallados y sistema de debugging
- Notificaciones toast globales

### 🎯 **Arquitectura Documentada**
- Patrones de diseño almacenados en memoria persistente
- Decisiones técnicas documentadas para desarrollo futuro
- Estructura modular escalable implementada
- Configuración de entorno dual (TEST/PRODUCTION)