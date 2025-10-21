# 🧪 Sistema de Testing Completo - Wave Research Front

Este documento describe el sistema de testing integral desarrollado para el proyecto Wave Research Front, que incluye verificaciones básicas, health checks avanzados, tests de integración y validación de despliegue.

## 📋 Índice

- [Descripción General](#descripción-general)
- [Scripts Disponibles](#scripts-disponibles)
- [Uso Rápido](#uso-rápido)
- [Tests Individuales](#tests-individuales)
- [Configuración Avanzada](#configuración-avanzada)
- [Interpretación de Resultados](#interpretación-de-resultados)
- [Solución de Problemas](#solución-de-problemas)

## 🎯 Descripción General

El sistema de testing está compuesto por 4 módulos principales:

1. **Test System** (`test-system.js`) - Verificaciones básicas del sistema
2. **Health Checks** (`health-checks.js`) - Monitoreo de salud de servicios
3. **Integration Tests** (`integration-tests.js`) - Tests de integración entre componentes
4. **Deployment Validator** (`deployment-validator.js`) - Validación de preparación para despliegue

Todos estos módulos están orquestados por el **Test Runner** (`test-runner.js`) que los ejecuta secuencialmente.

## 🚀 Scripts Disponibles

### Scripts Principales

```bash
# Ejecutar todos los tests (recomendado)
npm run test

# Ejecutar con output detallado
npm run test:verbose

# Tests rápidos (sin integración ni despliegue)
npm run test:quick

# Tests completos con log guardado
npm run test:full
```

### Scripts Individuales

```bash
# Tests básicos del sistema
npm run test:basic

# Health checks de servicios
npm run test:health

# Tests de integración
npm run test:integration

# Validación de despliegue
npm run test:deployment
```

## ⚡ Uso Rápido

### Para Desarrollo Diario
```bash
# Tests rápidos durante desarrollo
npm run test:quick
```

### Para Pre-Commit
```bash
# Tests completos antes de commit
npm run test:verbose
```

### Para Pre-Despliegue
```bash
# Validación completa antes de desplegar
npm run test:full
```

## 🔍 Tests Individuales

### 1. Test System (`test-system.js`)
**Propósito**: Verificaciones básicas del sistema

**Verifica**:
- ✅ Archivos de configuración (.env.example)
- ✅ Salud del backend (endpoints /health, /api/status)
- ✅ Build del frontend
- ✅ Dependencias instaladas
- ✅ Configuración de infraestructura
- ✅ Configuración de seguridad

**Uso**:
```bash
npm run test:basic
# o directamente
node scripts/test-system.js
```

### 2. Health Checks (`health-checks.js`)
**Propósito**: Monitoreo avanzado de salud de todos los servicios

**Verifica**:
- 🏥 Salud del backend y endpoints
- 🔗 Conexiones a N8N y Supabase
- 🌐 Configuración del proxy frontend
- 💾 Recursos del sistema (disco, memoria)
- 🐳 Estado de LocalStack

**Uso**:
```bash
npm run test:health
# o directamente
node scripts/health-checks.js
```

### 3. Integration Tests (`integration-tests.js`)
**Propósito**: Tests de integración entre componentes

**Verifica**:
- 🔄 Funcionalidad básica del backend
- 🤖 Integración con N8N (workflows, ejecución)
- 🗄️ Integración con Supabase (conexión, CRUD)
- 🌉 Comunicación frontend-backend
- 🔄 Flujo end-to-end completo

**Uso**:
```bash
npm run test:integration
# o directamente
node scripts/integration-tests.js
```

### 4. Deployment Validator (`deployment-validator.js`)
**Propósito**: Validación de preparación para despliegue

**Verifica**:
- 📁 Archivos de configuración
- 🏗️ Configuración de Terraform
- 🐳 Configuración de Docker
- 🏗️ Build de la aplicación
- 🚀 Preparación para LocalStack
- ☁️ Preparación para AWS
- 🔒 Configuración de seguridad

**Uso**:
```bash
npm run test:deployment
# o directamente
node scripts/deployment-validator.js
```

## ⚙️ Configuración Avanzada

### Test Runner - Opciones de Línea de Comandos

```bash
# Mostrar ayuda
node scripts/test-runner.js --help

# Saltar tests específicos
node scripts/test-runner.js --skip-integration
node scripts/test-runner.js --skip-deployment
node scripts/test-runner.js --skip-build

# Output detallado
node scripts/test-runner.js --verbose

# Guardar log en archivo
node scripts/test-runner.js --output-file mi-test.log

# Continuar aunque fallen tests requeridos
node scripts/test-runner.js --continue-on-failure

# Combinaciones
node scripts/test-runner.js --verbose --skip-integration --output-file quick-test.log
```

### Variables de Entorno para Tests

Los tests respetan las siguientes variables de entorno:

```bash
# Timeouts personalizados
TEST_TIMEOUT=30000

# URLs personalizadas para testing
TEST_BACKEND_URL=http://localhost:3000
TEST_N8N_URL=http://localhost:5678
TEST_LOCALSTACK_URL=http://localhost:4566

# Configuración de Supabase para tests
TEST_SUPABASE_URL=your-test-supabase-url
TEST_SUPABASE_ANON_KEY=your-test-anon-key
```

## 📊 Interpretación de Resultados

### Códigos de Estado

- ✅ **PASS** - Test exitoso
- ❌ **FAIL** - Test fallido (problema crítico)
- ⚠️ **WARN** - Advertencia (problema menor)
- 💥 **ERROR** - Error en la ejecución del test

### Puntuaciones de Salud

- **90-100%** - 🎉 Excelente, sistema en perfecto estado
- **70-89%** - ✅ Bueno, revisar advertencias menores
- **50-69%** - ⚠️ Regular, requiere atención
- **0-49%** - 💥 Crítico, requiere intervención inmediata

### Archivos de Reporte

Los tests generan archivos de reporte detallados:

- `test-results.json` - Reporte completo del test runner
- `health-report.json` - Reporte de health checks
- `integration-report.json` - Reporte de tests de integración
- `deployment-validation-report.json` - Reporte de validación de despliegue

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. "Backend no disponible"
```bash
# Verificar que el backend esté corriendo
npm run backend:dev

# O verificar manualmente
curl http://localhost:3000/health
```

#### 2. "N8N no disponible"
```bash
# Verificar configuración de N8N
echo $N8N_BASE_URL
echo $N8N_API_KEY

# Verificar conectividad
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/api/v1/workflows
```

#### 3. "LocalStack no disponible"
```bash
# Iniciar LocalStack
docker-compose up -d

# Verificar estado
curl http://localhost:4566/_localstack/health
```

#### 4. "Build falló"
```bash
# Limpiar e instalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar variables de entorno
cp .env.example .env
# Editar .env con valores correctos
```

#### 5. "Tests de integración fallan"
```bash
# Verificar que todos los servicios estén corriendo
npm run test:health

# Verificar configuración de variables
node -e "console.log(process.env)" | grep -E "(N8N|SUPABASE|API)"
```

### Debugging Avanzado

#### Ejecutar con máximo detalle
```bash
node scripts/test-runner.js --verbose --continue-on-failure --output-file debug.log
```

#### Verificar logs específicos
```bash
# Ver logs del backend
tail -f backend/logs/app.log

# Ver logs de Docker
docker-compose logs -f

# Ver logs de tests
tail -f test-results.log
```

#### Tests individuales con debug
```bash
# Debug de health checks
DEBUG=* node scripts/health-checks.js

# Debug de integración
NODE_ENV=test node scripts/integration-tests.js
```

## 📈 Mejores Prácticas

### Flujo de Desarrollo Recomendado

1. **Durante desarrollo**: `npm run test:quick`
2. **Antes de commit**: `npm run test:verbose`
3. **Antes de PR**: `npm run test:full`
4. **Antes de despliegue**: `npm run test:deployment`

### Automatización con Git Hooks

Agregar a `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run test:quick
if [ $? -ne 0 ]; then
  echo "Tests fallaron, commit cancelado"
  exit 1
fi
```

### Integración con CI/CD

Ejemplo para GitHub Actions:
```yaml
- name: Run Tests
  run: |
    npm run test:full
    
- name: Upload Test Results
  uses: actions/upload-artifact@v2
  with:
    name: test-results
    path: test-results.json
```

## 🆘 Soporte

Si encuentras problemas con el sistema de testing:

1. Ejecuta `npm run test:verbose` para obtener información detallada
2. Revisa los archivos de reporte generados
3. Verifica que todos los servicios estén corriendo
4. Consulta la sección de solución de problemas
5. Revisa los logs de cada componente

---

**¡El sistema de testing está diseñado para ser tu compañero confiable en el desarrollo!** 🚀