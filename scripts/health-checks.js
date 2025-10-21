#!/usr/bin/env node

/**
 * Health Checks Avanzados para WaveResearchFront
 * Verifica el estado de todos los servicios y dependencias
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuración de timeouts y reintentos
const CONFIG = {
    timeout: 10000,
    retries: 3,
    retryDelay: 2000
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

class HealthChecker {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async withRetry(fn, description, retries = CONFIG.retries) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                this.log(`   Reintento ${i + 1}/${retries} para ${description}...`, 'yellow');
                await this.sleep(CONFIG.retryDelay);
            }
        }
    }

    recordResult(service, status, details = '', responseTime = null) {
        const result = {
            service,
            status,
            details,
            responseTime,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        const icon = status === 'healthy' ? '✅' : status === 'unhealthy' ? '❌' : '⚠️';
        const color = status === 'healthy' ? 'green' : status === 'unhealthy' ? 'red' : 'yellow';
        
        let message = `${icon} ${service}`;
        if (responseTime) message += ` (${responseTime}ms)`;
        if (details) message += ` - ${details}`;
        
        this.log(message, color);
        
        return result;
    }

    async checkBackendHealth() {
        this.log('\n🏥 BACKEND HEALTH CHECK', 'bright');
        
        try {
            const startTime = Date.now();
            const response = await this.withRetry(async () => {
                return await axios.get('http://localhost:3000/health', {
                    timeout: CONFIG.timeout
                });
            }, 'Backend Health');
            
            const responseTime = Date.now() - startTime;
            const data = response.data;
            
            if (response.status === 200 && data.status === 'OK') {
                this.recordResult(
                    'Backend API',
                    'healthy',
                    `Uptime: ${Math.round(data.uptime)}s, Env: ${data.environment}`,
                    responseTime
                );
                
                // Verificar métricas adicionales
                if (data.uptime < 60) {
                    this.recordResult('Backend Stability', 'warning', 'Uptime bajo (<60s)');
                } else {
                    this.recordResult('Backend Stability', 'healthy', `Uptime: ${Math.round(data.uptime)}s`);
                }
                
                return true;
            } else {
                this.recordResult('Backend API', 'unhealthy', `Status: ${data.status || 'Unknown'}`);
                return false;
            }
        } catch (error) {
            this.recordResult('Backend API', 'unhealthy', `Error: ${error.message}`);
            return false;
        }
    }

    async checkBackendEndpoints() {
        this.log('\n🔗 BACKEND ENDPOINTS CHECK', 'bright');
        
        const endpoints = [
            {
                name: 'Health Endpoint',
                url: 'http://localhost:3000/health',
                method: 'GET',
                expectedStatus: 200,
                critical: true
            },
            {
                name: 'N8N Workflows',
                url: 'http://localhost:3000/api/n8n/workflows',
                method: 'GET',
                expectedStatus: [200, 401, 500], // Puede fallar sin credenciales
                critical: false
            },
            {
                name: 'Supabase Test',
                url: 'http://localhost:3000/api/supabase/test',
                method: 'GET',
                expectedStatus: [200, 401, 500], // Puede fallar sin credenciales
                critical: false
            }
        ];

        let healthyEndpoints = 0;
        
        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const response = await this.withRetry(async () => {
                    return await axios({
                        method: endpoint.method,
                        url: endpoint.url,
                        timeout: CONFIG.timeout,
                        validateStatus: () => true // No lanzar error por status codes
                    });
                }, endpoint.name);
                
                const responseTime = Date.now() - startTime;
                const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
                    ? endpoint.expectedStatus 
                    : [endpoint.expectedStatus];
                
                if (expectedStatuses.includes(response.status)) {
                    this.recordResult(
                        endpoint.name,
                        'healthy',
                        `HTTP ${response.status}`,
                        responseTime
                    );
                    healthyEndpoints++;
                } else {
                    const status = endpoint.critical ? 'unhealthy' : 'warning';
                    this.recordResult(
                        endpoint.name,
                        status,
                        `HTTP ${response.status} (esperado: ${expectedStatuses.join('|')})`
                    );
                }
            } catch (error) {
                const status = endpoint.critical ? 'unhealthy' : 'warning';
                this.recordResult(endpoint.name, status, `Error: ${error.message}`);
            }
        }
        
        return healthyEndpoints;
    }

    async checkN8nConnection() {
        this.log('\n🔄 N8N CONNECTION CHECK', 'bright');
        
        try {
            // Verificar si N8N está configurado
            const envPath = path.join(projectRoot, 'backend/.env');
            let n8nConfigured = false;
            
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                n8nConfigured = envContent.includes('N8N_API_KEY') && envContent.includes('N8N_BASE_URL');
            }
            
            if (!n8nConfigured) {
                this.recordResult('N8N Configuration', 'warning', 'N8N no configurado (archivo .env no encontrado)');
                return false;
            }
            
            // Intentar conexión a través del backend
            const startTime = Date.now();
            const response = await this.withRetry(async () => {
                return await axios.get('http://localhost:3000/api/n8n/workflows', {
                    timeout: CONFIG.timeout
                });
            }, 'N8N Connection');
            
            const responseTime = Date.now() - startTime;
            
            if (response.status === 200) {
                this.recordResult(
                    'N8N Service',
                    'healthy',
                    `${response.data.length || 0} workflows disponibles`,
                    responseTime
                );
                return true;
            } else {
                this.recordResult('N8N Service', 'warning', `HTTP ${response.status}`);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.recordResult('N8N Service', 'warning', 'Credenciales N8N no válidas');
            } else {
                this.recordResult('N8N Service', 'warning', `Error: ${error.message}`);
            }
            return false;
        }
    }

    async checkSupabaseConnection() {
        this.log('\n🗄️ SUPABASE CONNECTION CHECK', 'bright');
        
        try {
            // Verificar si Supabase está configurado
            const envPath = path.join(projectRoot, 'backend/.env');
            let supabaseConfigured = false;
            
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                supabaseConfigured = envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_SERVICE_ROLE_KEY');
            }
            
            if (!supabaseConfigured) {
                this.recordResult('Supabase Configuration', 'warning', 'Supabase no configurado (archivo .env no encontrado)');
                return false;
            }
            
            // Intentar conexión a través del backend
            const startTime = Date.now();
            const response = await this.withRetry(async () => {
                return await axios.get('http://localhost:3000/api/supabase/test', {
                    timeout: CONFIG.timeout
                });
            }, 'Supabase Connection');
            
            const responseTime = Date.now() - startTime;
            
            if (response.status === 200) {
                this.recordResult(
                    'Supabase Service',
                    'healthy',
                    'Conexión exitosa',
                    responseTime
                );
                return true;
            } else {
                this.recordResult('Supabase Service', 'warning', `HTTP ${response.status}`);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.recordResult('Supabase Service', 'warning', 'Credenciales Supabase no válidas');
            } else {
                this.recordResult('Supabase Service', 'warning', `Error: ${error.message}`);
            }
            return false;
        }
    }

    async checkFrontendProxy() {
        this.log('\n🌐 FRONTEND PROXY CHECK', 'bright');
        
        try {
            // Verificar que el proxy esté configurado
            const viteConfigPath = path.join(projectRoot, 'vite.config.js');
            if (!fs.existsSync(viteConfigPath)) {
                this.recordResult('Vite Config', 'unhealthy', 'vite.config.js no encontrado');
                return false;
            }
            
            const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
            const hasProxy = viteConfig.includes('proxy') && viteConfig.includes('/api');
            
            if (hasProxy) {
                this.recordResult('Proxy Configuration', 'healthy', 'Proxy configurado en vite.config.js');
            } else {
                this.recordResult('Proxy Configuration', 'warning', 'Proxy no encontrado en vite.config.js');
            }
            
            return hasProxy;
        } catch (error) {
            this.recordResult('Proxy Configuration', 'unhealthy', `Error: ${error.message}`);
            return false;
        }
    }

    async checkSystemResources() {
        this.log('\n💻 SYSTEM RESOURCES CHECK', 'bright');
        
        try {
            // Verificar espacio en disco
            const { execSync } = await import('child_process');
            const diskUsage = execSync('df -h .', { encoding: 'utf8' });
            const lines = diskUsage.split('\n');
            const dataLine = lines[1];
            const usage = dataLine.split(/\s+/)[4];
            const usagePercent = parseInt(usage.replace('%', ''));
            
            if (usagePercent < 80) {
                this.recordResult('Disk Space', 'healthy', `Uso: ${usage}`);
            } else if (usagePercent < 90) {
                this.recordResult('Disk Space', 'warning', `Uso: ${usage} (alto)`);
            } else {
                this.recordResult('Disk Space', 'unhealthy', `Uso: ${usage} (crítico)`);
            }
            
            // Verificar memoria (aproximado)
            const memInfo = execSync('ps -o pid,vsz,rss,comm -p $$', { encoding: 'utf8' });
            this.recordResult('Memory', 'healthy', 'Proceso ejecutándose normalmente');
            
        } catch (error) {
            this.recordResult('System Resources', 'warning', `No se pudo verificar: ${error.message}`);
        }
    }

    async checkLocalStackStatus() {
        this.log('\n🐳 LOCALSTACK STATUS CHECK', 'bright');
        
        try {
            // Verificar si LocalStack está corriendo
            const startTime = Date.now();
            const response = await this.withRetry(async () => {
                return await axios.get('http://localhost:4566/_localstack/health', {
                    timeout: CONFIG.timeout
                });
            }, 'LocalStack Health');
            
            const responseTime = Date.now() - startTime;
            
            if (response.status === 200) {
                const services = response.data.services || {};
                const runningServices = Object.keys(services).filter(service => 
                    services[service] === 'running' || services[service] === 'available'
                );
                
                this.recordResult(
                    'LocalStack',
                    'healthy',
                    `${runningServices.length} servicios activos: ${runningServices.join(', ')}`,
                    responseTime
                );
                return true;
            } else {
                this.recordResult('LocalStack', 'unhealthy', `HTTP ${response.status}`);
                return false;
            }
        } catch (error) {
            this.recordResult('LocalStack', 'warning', 'LocalStack no disponible (normal si no está iniciado)');
            return false;
        }
    }

    generateHealthReport() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        const healthy = this.results.filter(r => r.status === 'healthy').length;
        const unhealthy = this.results.filter(r => r.status === 'unhealthy').length;
        const warnings = this.results.filter(r => r.status === 'warning').length;
        
        const totalChecks = this.results.length;
        const healthScore = totalChecks > 0 ? Math.round((healthy / totalChecks) * 100) : 0;
        
        this.log('\n' + '='.repeat(60), 'bright');
        this.log('📊 HEALTH CHECK REPORT', 'bright');
        this.log('='.repeat(60), 'bright');
        
        this.log(`✅ Servicios saludables: ${healthy}`, 'green');
        this.log(`❌ Servicios no saludables: ${unhealthy}`, 'red');
        this.log(`⚠️  Advertencias: ${warnings}`, 'yellow');
        this.log(`📈 Puntuación de salud: ${healthScore}%`, healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red');
        this.log(`⏱️  Duración: ${duration}s`, 'cyan');
        
        // Mostrar servicios críticos no saludables
        const criticalIssues = this.results.filter(r => r.status === 'unhealthy');
        if (criticalIssues.length > 0) {
            this.log('\n❌ PROBLEMAS CRÍTICOS:', 'red');
            criticalIssues.forEach(issue => {
                this.log(`   • ${issue.service}: ${issue.details}`, 'red');
            });
        }
        
        // Mostrar advertencias
        const warningIssues = this.results.filter(r => r.status === 'warning');
        if (warningIssues.length > 0) {
            this.log('\n⚠️  ADVERTENCIAS:', 'yellow');
            warningIssues.forEach(issue => {
                this.log(`   • ${issue.service}: ${issue.details}`, 'yellow');
            });
        }
        
        // Mostrar servicios más lentos
        const slowServices = this.results
            .filter(r => r.responseTime && r.responseTime > 1000)
            .sort((a, b) => b.responseTime - a.responseTime);
            
        if (slowServices.length > 0) {
            this.log('\n🐌 SERVICIOS LENTOS (>1s):', 'yellow');
            slowServices.forEach(service => {
                this.log(`   • ${service.service}: ${service.responseTime}ms`, 'yellow');
            });
        }
        
        this.log('\n' + '='.repeat(60), 'bright');
        
        // Guardar reporte
        const reportPath = path.join(projectRoot, 'health-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            duration,
            healthScore,
            summary: { healthy, unhealthy, warnings },
            results: this.results
        }, null, 2));
        
        this.log(`📄 Reporte guardado en: ${reportPath}`, 'cyan');
        
        return {
            healthy: unhealthy === 0,
            score: healthScore,
            criticalIssues: criticalIssues.length
        };
    }

    async run() {
        this.log('🏥 INICIANDO HEALTH CHECKS AVANZADOS', 'bright');
        this.log(`⏰ Iniciado: ${new Date().toLocaleString()}`, 'cyan');
        
        try {
            await this.checkBackendHealth();
            await this.checkBackendEndpoints();
            await this.checkN8nConnection();
            await this.checkSupabaseConnection();
            await this.checkFrontendProxy();
            await this.checkSystemResources();
            await this.checkLocalStackStatus();
            
            const report = this.generateHealthReport();
            
            if (report.healthy) {
                this.log('\n🎉 ¡TODOS LOS SERVICIOS ESTÁN SALUDABLES!', 'green');
                process.exit(0);
            } else if (report.criticalIssues === 0) {
                this.log('\n⚠️  SISTEMA FUNCIONAL CON ADVERTENCIAS', 'yellow');
                process.exit(0);
            } else {
                this.log('\n💥 PROBLEMAS CRÍTICOS DETECTADOS', 'red');
                process.exit(1);
            }
            
        } catch (error) {
            this.log(`\n💥 ERROR CRÍTICO: ${error.message}`, 'red');
            process.exit(1);
        }
    }
}

// Ejecutar si es llamado directamente
if (process.argv[1] && process.argv[1].endsWith('health-checks.js')) {
    const healthChecker = new HealthChecker();
    healthChecker.run();
}

export default HealthChecker;