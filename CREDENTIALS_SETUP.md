# Configuración de Credenciales - WaveResearch

## 📋 Resumen de Seguridad

✅ **VERIFICADO**: Todas las variables sensibles han sido removidas del frontend
✅ **VERIFICADO**: Los archivos `.gitignore` están correctamente configurados
✅ **VERIFICADO**: La interconexión frontend-backend funciona correctamente
✅ **VERIFICADO**: CORS y endpoints están bien configurados

## 🔐 Dónde Colocar las Credenciales Reales

### 1. Backend (Servidor Node.js)

**Archivo**: `WaveResearchFront/backend/.env`

```bash
# ⚠️ CREAR ESTE ARCHIVO - NO EXISTE AÚN
# Copiar desde .env.example y completar con valores reales

# === CONFIGURACIÓN DEL SERVIDOR ===
PROXY_PORT=3000
NODE_ENV=production
CORS_ORIGINS=http://localhost:5173,https://tu-dominio.com

# === N8N CONFIGURACIÓN ===
N8N_BASE_URL=https://tu-n8n-instance.com
N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook
N8N_API_KEY=tu_api_key_real_aqui
N8N_BASIC_AUTH_USERNAME=tu_usuario_n8n
N8N_BASIC_AUTH_PASSWORD=tu_password_n8n

# === SUPABASE CONFIGURACIÓN ===
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
SUPABASE_ANON_KEY=tu_anon_key_aqui

# === AUTENTICACIÓN ===
AUTH_ENABLED=true
AUTH_PROVIDER=supabase
AUTH_REDIRECT_URL=http://localhost:5173/auth/callback
AUTH_SESSION_DURATION=3600

# === BASE DE DATOS ===
DATABASE_ENV=production
SUPABASE_TABLE_NAME=grants_production

# === APIs EXTERNAS ===
BOE_API_URL=https://boe.es/api
EUROPA_API_URL=https://ec.europa.eu/api
CDTI_API_URL=https://cdti.es/api

# === CONFIGURACIÓN DE IA ===
AI_EVALUATION_ENABLED=true
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-4
AI_API_KEY=tu_openai_api_key_aqui

# === NOTIFICACIONES ===
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_CHECK_INTERVAL=300000

# === FILTROS POR DEFECTO ===
DEFAULT_AMOUNT_MIN=1000
DEFAULT_AMOUNT_MAX=1000000
DEFAULT_SEARCH_RADIUS=50
```

### 2. Frontend (Aplicación React)

**Archivo**: `WaveResearchFront/.env`

```bash
# ⚠️ CREAR ESTE ARCHIVO - NO EXISTE AÚN
# Copiar desde .env.production.example y completar con valores reales

# === CONFIGURACIÓN DE PROXY ===
VITE_PROXY_BASE_URL=http://localhost:3000
VITE_PROXY_TIMEOUT=30000
VITE_PROXY_RETRIES=3

# === SUPABASE (SOLO URL Y TABLAS - NO KEYS) ===
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_TABLE_GRANTS_TEST=grants_test
VITE_SUPABASE_TABLE_GRANTS_PRODUCTION=grants_production
VITE_SUPABASE_TABLE_USERS=users
VITE_SUPABASE_TABLE_PROFILES=profiles

# === N8N (SOLO URLs Y IDs - NO CREDENCIALES) ===
VITE_N8N_BASE_URL=https://tu-n8n-instance.com
VITE_N8N_WEBHOOK_ENDPOINT=/webhook
VITE_N8N_API_ENDPOINT=/api/v1
VITE_N8N_WORKFLOW_BOE_RESEARCH=workflow_id_boe
VITE_N8N_WORKFLOW_DATA_PROCESSING=workflow_id_processing

# === APIs EXTERNAS (URLs PÚBLICAS) ===
VITE_BOE_API_URL=https://boe.es/api
VITE_EUROPA_API_URL=https://ec.europa.eu/api
VITE_CDTI_API_URL=https://cdti.es/api

# === CONFIGURACIÓN DE UI ===
VITE_PAGINATION_DEFAULT_SIZE=20
VITE_PAGINATION_MAX_SIZE=100
VITE_TOAST_DURATION=5000
VITE_DEBOUNCE_DELAY=300

# === CONFIGURACIÓN DE DESARROLLO ===
VITE_DEBUG_MODE=false
VITE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true

# Resto de configuraciones no sensibles...
```

## 🚨 Variables Sensibles Removidas del Frontend

Las siguientes variables **YA NO DEBEN** estar en el frontend:

- ❌ `VITE_SUPABASE_ANON_KEY`
- ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY`
- ❌ `VITE_N8N_API_KEY`
- ❌ `VITE_N8N_BASIC_AUTH_USERNAME`
- ❌ `VITE_N8N_BASIC_AUTH_PASSWORD`
- ❌ `VITE_N8N_WEBHOOK_URL`
- ❌ `VITE_AI_API_KEY`

## 📁 Estructura de Archivos de Configuración

```
WaveResearchFront/
├── .env                          # ← CREAR: Variables del frontend
├── .env.production.example       # ✅ Plantilla del frontend
├── backend/
│   ├── .env                      # ← CREAR: Variables del backend
│   └── .env.example              # ✅ Plantilla del backend
└── CREDENTIALS_SETUP.md          # ← Este archivo
```

## 🔒 Seguridad Implementada

1. **Separación de Responsabilidades**:
   - Frontend: Solo URLs públicas y configuraciones de UI
   - Backend: Todas las credenciales y keys sensibles

2. **Protección en .gitignore**:
   - ✅ `.env` excluido en ambos directorios
   - ✅ Solo archivos `.example` en el repositorio

3. **Proxy de Seguridad**:
   - ✅ Frontend se comunica con backend via proxy
   - ✅ Backend maneja todas las llamadas a APIs externas
   - ✅ Credenciales nunca expuestas al cliente

## 🚀 Pasos para Despliegue

1. **Desarrollo Local**:
   ```bash
   # Crear archivos .env basados en los .example
   cp .env.production.example .env
   cp backend/.env.example backend/.env
   
   # Completar con credenciales reales
   # Iniciar backend: cd backend && npm start
   # Iniciar frontend: npm run dev
   ```

2. **Producción**:
   - Configurar variables de entorno en el servidor
   - Usar secretos seguros (AWS Secrets Manager, etc.)
   - Nunca commitear archivos `.env` reales

## ✅ Estado Actual

- 🟢 **Frontend**: Limpio de variables sensibles
- 🟢 **Backend**: Configurado para manejar credenciales
- 🟢 **Interconexión**: Funcionando correctamente
- 🟢 **Seguridad**: Implementada y verificada
- 🟢 **Documentación**: Completa y actualizada