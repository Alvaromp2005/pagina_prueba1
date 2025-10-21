#!/usr/bin/env node

/**
 * Validador de Despliegue para WaveResearchFront
 * Verifica que todo esté listo para despliegue en LocalStack o AWS
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const terraformRoot = path.resolve(__dirname, '../..');

// Configuración
const CONFIG = {
    timeout: 15000,
    requiredEnvVars: {
        frontend: [
            'VITE_API_BASE_URL',
            'VITE_SUPABASE_URL',
            'VITE_SUPABASE_ANON_KEY'
        ],
        backend: [
            'N8N_API_KEY',
            'N8N_BASE_URL',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'API_SECRET_KEY'
        ],
        terraform: [
            'n8n_api_url',
            'n8n_api_key',
            'supabase_url',
            'supabase_anon_key',
            'supabase_service_role_key',
            'api_secret_key'
        ]
    }
};

// Colores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class DeploymentValidator {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.deploymentType = 'unknown'; // 'localstack' | 'aws' | 'unknown'
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    recordValidation(category, item, status, details = '', recommendation = '') {
        const result = {
            category,
            item,
            status,
            details,
            recommendation,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
        
        let message = `${icon} ${item}`;
        if (details) message += ` - ${details}`;
        
        this.log(message, color);
        
        if (recommendation && status !== 'pass') {
            this.log(`   💡 ${recommendation}`, 'cyan');
        }
        
        return result;
    }

    async validateEnvironmentFiles() {
        this.log('\n📁 VALIDANDO ARCHIVOS DE CONFIGURACIÓN', 'bright');
        
        // Validar archivos .env.example
        const envExampleFiles = [
            { path: path.join(projectRoot, '.env.example'), name: 'Frontend .env.example' },
            { path: path.join(projectRoot, '.env.production.example'), name: 'Frontend .env.production.example' },
            { path: path.join(projectRoot, 'backend/.env.example'), name: 'Backend .env.example' }
        ];
        
        for (const file of envExampleFiles) {
            if (fs.existsSync(file.path)) {
                const content = fs.readFileSync(file.path, 'utf8');
                const hasRequiredVars = file.name.includes('Frontend') 
                    ? CONFIG.requiredEnvVars.frontend.some(v => content.includes(v))
                    : CONFIG.requiredEnvVars.backend.some(v => content.includes(v));
                
                this.recordValidation(
                    'Environment Files',
                    file.name,
                    hasRequiredVars ? 'pass' : 'warn',
                    hasRequiredVars ? 'Variables requeridas presentes' : 'Algunas variables pueden faltar',
                    'Verificar que todas las variables necesarias estén documentadas'
                );
            } else {
                this.recordValidation(
                    'Environment Files',
                    file.name,
                    'fail',
                    'Archivo no encontrado',
                    `Crear ${file.name} con las variables necesarias`
                );
            }
        }
        
        // Verificar que no existan archivos .env reales en el repo
        const realEnvFiles = [
            path.join(projectRoot, '.env'),
            path.join(projectRoot, '.env.production'),
            path.join(projectRoot, 'backend/.env')
        ];
        
        for (const envFile of realEnvFiles) {
            const exists = fs.existsSync(envFile);
            this.recordValidation(
                'Security',
                `${path.basename(envFile)} not in repo`,
                !exists ? 'pass' : 'fail',
                !exists ? 'Archivo .env no está en repositorio' : 'PELIGRO: Archivo .env en repositorio',
                exists ? 'Eliminar archivo .env del repositorio y agregarlo a .gitignore' : ''
            );
        }
    }

    async validateTerraformConfiguration() {
        this.log('\n🏗️ VALIDANDO CONFIGURACIÓN DE TERRAFORM', 'bright');
        
        // Verificar archivos de Terraform
        const terraformFiles = [
            'provider.tf',
            'backend_ecs.tf',
            'frontend_s3.tf',
            'ecr.tf',
            'iam.tf',
            'outputs.tf'
        ];
        
        for (const file of terraformFiles) {
            const filePath = path.join(terraformRoot, file);
            if (fs.existsSync(filePath)) {
                this.recordValidation(
                    'Terraform Files',
                    file,
                    'pass',
                    'Archivo encontrado'
                );
            } else {
                this.recordValidation(
                    'Terraform Files',
                    file,
                    'fail',
                    'Archivo no encontrado',
                    `Crear archivo ${file} con la configuración necesaria`
                );
            }
        }
        
        // Verificar terraform.tfvars.example
        const tfvarsExamplePath = path.join(terraformRoot, 'terraform.tfvars.example');
        if (fs.existsSync(tfvarsExamplePath)) {
            const content = fs.readFileSync(tfvarsExamplePath, 'utf8');
            const hasRequiredVars = CONFIG.requiredEnvVars.terraform.every(v => content.includes(v));
            
            this.recordValidation(
                'Terraform Configuration',
                'terraform.tfvars.example',
                hasRequiredVars ? 'pass' : 'warn',
                hasRequiredVars ? 'Todas las variables requeridas presentes' : 'Algunas variables pueden faltar',
                'Verificar que todas las variables de terraform.tfvars.example estén definidas'
            );
        } else {
            this.recordValidation(
                'Terraform Configuration',
                'terraform.tfvars.example',
                'fail',
                'Archivo no encontrado',
                'Crear terraform.tfvars.example con todas las variables necesarias'
            );
        }
        
        // Verificar si terraform.tfvars existe (para despliegue)
        const tfvarsPath = path.join(terraformRoot, 'terraform.tfvars');
        const tfvarsExists = fs.existsSync(tfvarsPath);
        this.recordValidation(
            'Deployment Readiness',
            'terraform.tfvars',
            tfvarsExists ? 'pass' : 'warn',
            tfvarsExists ? 'Archivo de variables listo' : 'Archivo de variables no encontrado',
            'Copiar terraform.tfvars.example a terraform.tfvars y llenar con valores reales'
        );
        
        // Validar sintaxis de Terraform (si está instalado)
        try {
            execSync('terraform version', { stdio: 'pipe', cwd: terraformRoot });
            
            try {
                execSync('terraform validate', { stdio: 'pipe', cwd: terraformRoot });
                this.recordValidation(
                    'Terraform Validation',
                    'Syntax Check',
                    'pass',
                    'Sintaxis de Terraform válida'
                );
            } catch (validateError) {
                this.recordValidation(
                    'Terraform Validation',
                    'Syntax Check',
                    'fail',
                    'Errores de sintaxis encontrados',
                    'Ejecutar "terraform validate" para ver errores específicos'
                );
            }
        } catch (error) {
            this.recordValidation(
                'Terraform Validation',
                'Terraform Installation',
                'warn',
                'Terraform no instalado o no disponible',
                'Instalar Terraform para validar configuración'
            );
        }
    }

    async validateDockerConfiguration() {
        this.log('\n🐳 VALIDANDO CONFIGURACIÓN DE DOCKER', 'bright');
        
        // Verificar docker-compose.yml
        const dockerComposePath = path.join(terraformRoot, 'docker-compose.yml');
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');
            
            // Verificar servicios esenciales
            const hasLocalStack = content.includes('localstack');
            const hasCorrectPorts = content.includes('4566:4566');
            const hasServices = content.includes('SERVICES=');
            
            this.recordValidation(
                'Docker Configuration',
                'docker-compose.yml',
                (hasLocalStack && hasCorrectPorts && hasServices) ? 'pass' : 'warn',
                `LocalStack: ${hasLocalStack}, Ports: ${hasCorrectPorts}, Services: ${hasServices}`,
                'Verificar configuración completa de LocalStack'
            );
        } else {
            this.recordValidation(
                'Docker Configuration',
                'docker-compose.yml',
                'fail',
                'Archivo no encontrado',
                'Crear docker-compose.yml para LocalStack'
            );
        }
        
        // Verificar que Docker esté disponible
        try {
            execSync('docker --version', { stdio: 'pipe' });
            this.recordValidation(
                'Docker Installation',
                'Docker Engine',
                'pass',
                'Docker disponible'
            );
            
            // Verificar Docker Compose
            try {
                execSync('docker-compose --version', { stdio: 'pipe' });
                this.recordValidation(
                    'Docker Installation',
                    'Docker Compose',
                    'pass',
                    'Docker Compose disponible'
                );
            } catch (composeError) {
                this.recordValidation(
                    'Docker Installation',
                    'Docker Compose',
                    'warn',
                    'Docker Compose no disponible',
                    'Instalar Docker Compose para usar LocalStack'
                );
            }
        } catch (error) {
            this.recordValidation(
                'Docker Installation',
                'Docker Engine',
                'fail',
                'Docker no disponible',
                'Instalar Docker para usar LocalStack'
            );
        }
    }

    async validateApplicationBuild() {
        this.log('\n🏗️ VALIDANDO BUILD DE LA APLICACIÓN', 'bright');
        
        // Verificar package.json del frontend
        const frontendPackagePath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(frontendPackagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
            
            // Verificar scripts necesarios
            const hasDevScript = packageJson.scripts?.dev;
            const hasBuildScript = packageJson.scripts?.build;
            const hasPreviewScript = packageJson.scripts?.preview;
            
            this.recordValidation(
                'Frontend Build',
                'Package Scripts',
                (hasDevScript && hasBuildScript) ? 'pass' : 'warn',
                `Dev: ${!!hasDevScript}, Build: ${!!hasBuildScript}, Preview: ${!!hasPreviewScript}`,
                'Verificar que todos los scripts necesarios estén definidos'
            );
            
            // Verificar dependencias críticas
            const criticalDeps = ['react', 'vite', 'axios'];
            const missingDeps = criticalDeps.filter(dep => 
                !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
            );
            
            this.recordValidation(
                'Frontend Dependencies',
                'Critical Dependencies',
                missingDeps.length === 0 ? 'pass' : 'fail',
                missingDeps.length === 0 ? 'Todas las dependencias críticas presentes' : `Faltan: ${missingDeps.join(', ')}`,
                'Instalar dependencias faltantes con npm install'
            );
        } else {
            this.recordValidation(
                'Frontend Build',
                'package.json',
                'fail',
                'Archivo no encontrado',
                'Crear package.json con configuración de proyecto'
            );
        }
        
        // Verificar package.json del backend
        const backendPackagePath = path.join(projectRoot, 'backend/package.json');
        if (fs.existsSync(backendPackagePath)) {
            const backendPackageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
            
            const hasStartScript = backendPackageJson.scripts?.start;
            const hasDevScript = backendPackageJson.scripts?.dev;
            
            this.recordValidation(
                'Backend Build',
                'Package Scripts',
                (hasStartScript || hasDevScript) ? 'pass' : 'warn',
                `Start: ${!!hasStartScript}, Dev: ${!!hasDevScript}`,
                'Verificar scripts de inicio del backend'
            );
        } else {
            this.recordValidation(
                'Backend Build',
                'package.json',
                'fail',
                'Archivo no encontrado',
                'Crear package.json para el backend'
            );
        }
        
        // Intentar build del frontend (si node_modules existe)
        const nodeModulesExists = fs.existsSync(path.join(projectRoot, 'node_modules'));
        if (nodeModulesExists) {
            try {
                this.log('   Ejecutando build de prueba...', 'cyan');
                execSync('npm run build', { 
                    stdio: 'pipe', 
                    cwd: projectRoot,
                    timeout: 60000 
                });
                
                const distExists = fs.existsSync(path.join(projectRoot, 'dist'));
                this.recordValidation(
                    'Frontend Build',
                    'Build Test',
                    distExists ? 'pass' : 'fail',
                    distExists ? 'Build exitoso' : 'Build falló',
                    'Revisar errores de build y dependencias'
                );
            } catch (buildError) {
                this.recordValidation(
                    'Frontend Build',
                    'Build Test',
                    'fail',
                    'Error en build',
                    'Revisar errores de compilación y dependencias'
                );
            }
        } else {
            this.recordValidation(
                'Frontend Build',
                'Dependencies Installation',
                'warn',
                'node_modules no encontrado',
                'Ejecutar "npm install" para instalar dependencias'
            );
        }
    }

    async validateLocalStackReadiness() {
        this.log('\n🚀 VALIDANDO PREPARACIÓN PARA LOCALSTACK', 'bright');
        
        // Verificar si LocalStack está corriendo
        try {
            const response = await axios.get('http://localhost:4566/_localstack/health', {
                timeout: CONFIG.timeout
            });
            
            if (response.status === 200) {
                const services = response.data.services || {};
                const runningServices = Object.keys(services).filter(service => 
                    services[service] === 'running' || services[service] === 'available'
                );
                
                this.recordValidation(
                    'LocalStack Status',
                    'Service Health',
                    'pass',
                    `${runningServices.length} servicios activos: ${runningServices.join(', ')}`
                );
                
                this.deploymentType = 'localstack';
                
                // Verificar servicios específicos necesarios
                const requiredServices = ['s3', 'ecs', 'ecr', 'iam'];
                const availableRequired = requiredServices.filter(service => 
                    runningServices.includes(service)
                );
                
                this.recordValidation(
                    'LocalStack Services',
                    'Required Services',
                    availableRequired.length === requiredServices.length ? 'pass' : 'warn',
                    `${availableRequired.length}/${requiredServices.length} servicios requeridos disponibles`,
                    'Verificar configuración de servicios en docker-compose.yml'
                );
            } else {
                this.recordValidation(
                    'LocalStack Status',
                    'Service Health',
                    'fail',
                    `HTTP ${response.status}`,
                    'Verificar estado de LocalStack'
                );
            }
        } catch (error) {
            this.recordValidation(
                'LocalStack Status',
                'Availability',
                'warn',
                'LocalStack no disponible',
                'Iniciar LocalStack con "docker-compose up -d" antes del despliegue'
            );
        }
    }

    async validateAWSReadiness() {
        this.log('\n☁️ VALIDANDO PREPARACIÓN PARA AWS', 'bright');
        
        // Verificar AWS CLI
        try {
            const awsVersion = execSync('aws --version', { encoding: 'utf8', stdio: 'pipe' });
            this.recordValidation(
                'AWS Tools',
                'AWS CLI',
                'pass',
                `Instalado: ${awsVersion.trim()}`
            );
            
            // Verificar configuración de AWS
            try {
                execSync('aws configure list', { stdio: 'pipe' });
                this.recordValidation(
                    'AWS Configuration',
                    'Credentials',
                    'pass',
                    'Credenciales configuradas'
                );
                
                this.deploymentType = this.deploymentType === 'localstack' ? 'both' : 'aws';
            } catch (configError) {
                this.recordValidation(
                    'AWS Configuration',
                    'Credentials',
                    'warn',
                    'Credenciales no configuradas',
                    'Ejecutar "aws configure" para configurar credenciales'
                );
            }
        } catch (error) {
            this.recordValidation(
                'AWS Tools',
                'AWS CLI',
                'warn',
                'AWS CLI no instalado',
                'Instalar AWS CLI para despliegue en AWS real'
            );
        }
    }

    async validateSecurityConfiguration() {
        this.log('\n🔒 VALIDANDO CONFIGURACIÓN DE SEGURIDAD', 'bright');
        
        // Verificar .gitignore
        const gitignorePath = path.join(projectRoot, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            
            const securityPatterns = ['.env', 'node_modules', 'dist', '.terraform'];
            const missingPatterns = securityPatterns.filter(pattern => 
                !gitignoreContent.includes(pattern)
            );
            
            this.recordValidation(
                'Security Configuration',
                '.gitignore',
                missingPatterns.length === 0 ? 'pass' : 'warn',
                missingPatterns.length === 0 ? 'Patrones de seguridad presentes' : `Faltan: ${missingPatterns.join(', ')}`,
                'Agregar patrones faltantes a .gitignore'
            );
        } else {
            this.recordValidation(
                'Security Configuration',
                '.gitignore',
                'fail',
                'Archivo no encontrado',
                'Crear .gitignore con patrones de seguridad'
            );
        }
        
        // Buscar posibles credenciales hardcodeadas
        try {
            const sensitiveSearch = execSync(
                'grep -r -i "password\\|secret\\|key.*=" src/ backend/src/ --exclude-dir=node_modules || true',
                { encoding: 'utf8', cwd: projectRoot }
            );
            
            if (sensitiveSearch.trim()) {
                this.recordValidation(
                    'Security Scan',
                    'Hardcoded Credentials',
                    'warn',
                    'Posibles credenciales encontradas en código',
                    'Revisar y mover credenciales a variables de entorno'
                );
            } else {
                this.recordValidation(
                    'Security Scan',
                    'Hardcoded Credentials',
                    'pass',
                    'No se encontraron credenciales hardcodeadas'
                );
            }
        } catch (error) {
            this.recordValidation(
                'Security Scan',
                'Credential Search',
                'warn',
                'No se pudo ejecutar búsqueda de seguridad'
            );
        }
    }

    generateDeploymentReport() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warn').length;
        
        const totalValidations = this.results.length;
        const readinessScore = totalValidations > 0 ? Math.round((passed / totalValidations) * 100) : 0;
        
        this.log('\n' + '='.repeat(60), 'bright');
        this.log('📊 DEPLOYMENT VALIDATION REPORT', 'bright');
        this.log('='.repeat(60), 'bright');
        
        this.log(`✅ Validaciones exitosas: ${passed}`, 'green');
        this.log(`❌ Validaciones fallidas: ${failed}`, 'red');
        this.log(`⚠️  Advertencias: ${warnings}`, 'yellow');
        this.log(`📈 Puntuación de preparación: ${readinessScore}%`, readinessScore >= 80 ? 'green' : readinessScore >= 60 ? 'yellow' : 'red');
        this.log(`🎯 Tipo de despliegue detectado: ${this.deploymentType}`, 'cyan');
        this.log(`⏱️  Duración: ${duration}s`, 'cyan');
        
        // Mostrar problemas críticos
        const criticalIssues = this.results.filter(r => r.status === 'fail');
        if (criticalIssues.length > 0) {
            this.log('\n❌ PROBLEMAS CRÍTICOS QUE BLOQUEAN EL DESPLIEGUE:', 'red');
            criticalIssues.forEach(issue => {
                this.log(`   • ${issue.item}: ${issue.details}`, 'red');
                if (issue.recommendation) {
                    this.log(`     💡 ${issue.recommendation}`, 'cyan');
                }
            });
        }
        
        // Mostrar advertencias importantes
        const importantWarnings = this.results.filter(r => r.status === 'warn');
        if (importantWarnings.length > 0) {
            this.log('\n⚠️  ADVERTENCIAS (RECOMENDADO RESOLVER):', 'yellow');
            importantWarnings.forEach(issue => {
                this.log(`   • ${issue.item}: ${issue.details}`, 'yellow');
                if (issue.recommendation) {
                    this.log(`     💡 ${issue.recommendation}`, 'cyan');
                }
            });
        }
        
        // Recomendaciones de despliegue
        this.log('\n🚀 RECOMENDACIONES DE DESPLIEGUE:', 'bright');
        if (readinessScore >= 80) {
            this.log('   ✅ Sistema listo para despliegue', 'green');
            if (this.deploymentType === 'localstack') {
                this.log('   🐳 Proceder con despliegue en LocalStack', 'cyan');
            } else if (this.deploymentType === 'aws') {
                this.log('   ☁️  Proceder con despliegue en AWS', 'cyan');
            } else if (this.deploymentType === 'both') {
                this.log('   🔄 Opciones: LocalStack (desarrollo) o AWS (producción)', 'cyan');
            }
        } else if (readinessScore >= 60) {
            this.log('   ⚠️  Sistema parcialmente listo - resolver advertencias', 'yellow');
        } else {
            this.log('   ❌ Sistema NO listo - resolver problemas críticos', 'red');
        }
        
        this.log('\n' + '='.repeat(60), 'bright');
        
        // Guardar reporte detallado
        const reportPath = path.join(projectRoot, 'deployment-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            duration,
            readinessScore,
            deploymentType: this.deploymentType,
            summary: { passed, failed, warnings },
            results: this.results
        }, null, 2));
        
        this.log(`📄 Reporte detallado guardado en: ${reportPath}`, 'cyan');
        
        return {
            ready: failed === 0,
            score: readinessScore,
            deploymentType: this.deploymentType,
            criticalIssues: failed
        };
    }

    async run() {
        this.log('🔍 INICIANDO VALIDACIÓN DE DESPLIEGUE', 'bright');
        this.log(`⏰ Iniciado: ${new Date().toLocaleString()}`, 'cyan');
        
        try {
            await this.validateEnvironmentFiles();
            await this.validateTerraformConfiguration();
            await this.validateDockerConfiguration();
            await this.validateApplicationBuild();
            await this.validateLocalStackReadiness();
            await this.validateAWSReadiness();
            await this.validateSecurityConfiguration();
            
            const report = this.generateDeploymentReport();
            
            if (report.ready) {
                this.log('\n🎉 ¡SISTEMA LISTO PARA DESPLIEGUE!', 'green');
                process.exit(0);
            } else if (report.criticalIssues === 0) {
                this.log('\n⚠️  SISTEMA PARCIALMENTE LISTO - REVISAR ADVERTENCIAS', 'yellow');
                process.exit(0);
            } else {
                this.log('\n💥 PROBLEMAS CRÍTICOS IMPIDEN EL DESPLIEGUE', 'red');
                process.exit(1);
            }
            
        } catch (error) {
            this.log(`\n💥 ERROR CRÍTICO: ${error.message}`, 'red');
            process.exit(1);
        }
    }
}

// Ejecutar si es llamado directamente
if (process.argv[1] && process.argv[1].endsWith('deployment-validator.js')) {
    const validator = new DeploymentValidator();
    validator.run();
}

export default DeploymentValidator;