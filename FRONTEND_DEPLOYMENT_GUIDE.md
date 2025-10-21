# 🚀 Guía de Despliegue del Frontend - WaveResearch

## 📋 Resumen

Esta guía explica cómo adaptar y desplegar el frontend de WaveResearch para trabajar con la infraestructura de AWS desplegada mediante Terraform, incluyendo la gestión segura de variables de entorno y la integración con el backend.

## 🔄 Cambios Realizados para el Despliegue

### 1. Scripts de Build Actualizados

Se han añadido nuevos scripts en `package.json`:

```json
{
  "scripts": {
    "build:production": "vite build --mode production",
    "build:staging": "vite build --mode staging", 
    "build:with-env": "echo 'Building with environment variables...' && vite build"
  }
}
```

### 2. Template de Variables de Producción

Se ha creado `.env.production.example` con las variables necesarias para producción:

- **`VITE_PROXY_BASE_URL`**: URL del Application Load Balancer (ALB) del backend
- **`VITE_SUPABASE_URL`** y **`VITE_SUPABASE_ANON_KEY`**: Credenciales de Supabase
- **Variables de autenticación y configuración de entorno**

### 3. Outputs de Terraform

Se ha creado `outputs.tf` para exponer información crítica de la infraestructura:

- **`backend_alb_url`**: URL completa del ALB del backend
- **`backend_ecr_repository_url`**: URL del repositorio ECR
- **Información de ECS, VPC y Secrets Manager**

## 🔧 Proceso de Despliegue

### Paso 1: Preparar Variables de Entorno

```bash
# 1. Copiar el template de producción
cp .env.production.example .env.production

# 2. Obtener la URL del backend desde Terraform
BACKEND_URL=$(terraform output -raw backend_alb_url)

# 3. Editar .env.production con valores reales
# - VITE_PROXY_BASE_URL=$BACKEND_URL
# - VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# - VITE_SUPABASE_ANON_KEY=tu_clave_anonima_real
```

### Paso 2: Build del Frontend

```bash
# Opción 1: Build con archivo .env.production
npm run build:production

# Opción 2: Build con variables de entorno inline
VITE_PROXY_BASE_URL=$BACKEND_URL \
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co \
VITE_SUPABASE_ANON_KEY=tu_clave_anonima \
npm run build
```

### Paso 3: Despliegue a S3

```bash
# Subir archivos al bucket S3 (configurado en frontend_s3.tf)
aws s3 sync dist/ s3://tu-bucket-frontend --delete
```

## 🔐 Gestión de Variables de Entorno

### Variables Críticas para el Despliegue

| Variable | Descripción | Fuente |
|----------|-------------|---------|
| `VITE_PROXY_BASE_URL` | URL del ALB del backend | `terraform output -raw backend_alb_url` |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | Panel de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Panel de Supabase |
| `VITE_AUTH_REDIRECT_URL` | URL de callback de autenticación | Tu dominio frontend |

### ⚠️ Consideraciones de Seguridad

1. **Variables VITE_**: Se "queman" en el bundle durante el build
2. **Nunca incluir claves sensibles**: Solo usar claves públicas/anónimas
3. **No commitear archivos .env.production**: Añadir a `.gitignore`
4. **Comunicación con n8n**: Siempre a través del backend, nunca directa

## 🔄 Pipeline de CI/CD Recomendado

### Ejemplo con GitHub Actions

```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
          
      - name: Get backend URL from Terraform
        run: |
          cd terraform
          echo "BACKEND_URL=$(terraform output -raw backend_alb_url)" >> $GITHUB_ENV
          
      - name: Build frontend
        env:
          VITE_PROXY_BASE_URL: ${{ env.BACKEND_URL }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build:production
        
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete
```

## 🔍 Verificación del Despliegue

### 1. Verificar Variables en el Bundle

```bash
# Buscar variables en el bundle generado
grep -r "VITE_PROXY_BASE_URL" dist/
```

### 2. Probar Conectividad

```bash
# Verificar que el ALB responde
curl -I $(terraform output -raw backend_alb_url)

# Verificar el frontend
curl -I https://tu-dominio-frontend.com
```

### 3. Logs y Debugging

```bash
# Ver logs del servicio ECS
aws logs tail /ecs/waveresearch-backend --follow

# Ver métricas del ALB
aws elbv2 describe-target-health --target-group-arn $(terraform output -raw target_group_arn)
```

## 🚨 Troubleshooting

### Problema: Frontend no puede conectar con el backend

**Solución:**
1. Verificar que `VITE_PROXY_BASE_URL` apunta al ALB correcto
2. Comprobar que el ALB está funcionando: `curl $(terraform output -raw backend_alb_url)`
3. Verificar configuración CORS en el backend

### Problema: Variables de entorno no se aplican

**Solución:**
1. Asegurar que las variables tienen prefijo `VITE_`
2. Verificar que se establecen ANTES del `vite build`
3. Limpiar cache: `rm -rf dist/ && npm run build:production`

### Problema: Errores de autenticación con Supabase

**Solución:**
1. Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son correctos
2. Comprobar configuración de dominios permitidos en Supabase
3. Verificar `VITE_AUTH_REDIRECT_URL`

## 📚 Referencias

- [Documentación de Vite - Variables de Entorno](https://vitejs.dev/guide/env-and-mode.html)
- [AWS ECS - Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Supabase - Configuración de Cliente](https://supabase.com/docs/reference/javascript/initializing)
- [Terraform - Output Values](https://www.terraform.io/language/values/outputs)

## 📝 Checklist de Despliegue

- [ ] Infraestructura desplegada con Terraform
- [ ] Variables de entorno configuradas correctamente
- [ ] Build del frontend completado sin errores
- [ ] Archivos subidos a S3
- [ ] ALB del backend respondiendo correctamente
- [ ] Frontend accesible desde el dominio público
- [ ] Autenticación funcionando con Supabase
- [ ] Comunicación frontend-backend operativa
- [ ] Logs monitoreados y sin errores críticos