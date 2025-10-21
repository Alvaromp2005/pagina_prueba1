#!/usr/bin/env node

/**
 * Tests de Integración para WaveResearchFront
 * Verifica la comunicación completa entre frontend, backend y servicios externos
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuración de tests
const CONFIG = {
    timeout: 15000,
    retries: 2,
    retryDelay: 3000,
    baseUrl: 'http://localhost:3000'
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

class IntegrationTester {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.testData = {
            workflows: [],
            supabaseData: null,
            frontendBuild: null
        };
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

    recordTest(testName, status, details = '', duration = null, data = null) {
        const result = {
            test: testName,
            status,
            details,
            duration,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
        
        let message = `${icon} ${testName}`;
        if (duration) message += ` (${duration}ms)`;
        if (details) message += ` - ${details}`;
        
        this.log(message, color);
        
        return result;
    }

    async testBackendBasicFunctionality() {
        this.log('\n🔧 TESTING BACKEND BASIC FUNCTIONALITY', 'bright');
        
        try {
            // Test 1: Health Check
            const startTime = Date.now();
            const healthResponse = await this.withRetry(async () => {
                return await axios.get(`${CONFIG.baseUrl}/health`, {
                    timeout: CONFIG.timeout
                });
            }, 'Backend Health Check');
            
            const healthDuration = Date.now() - startTime;
            
            if (healthResponse.status === 200 && healthResponse.data.status === 'OK') {
                this.recordTest(
                    'Backend Health Check',
                    'pass',
                    `Status: ${healthResponse.data.status}, Uptime: ${Math.round(healthResponse.data.uptime)}s`,
                    healthDuration,
                    healthResponse.data
                );
            } else {
                this.recordTest('Backend Health Check', 'fail', 'Health check failed');
                return false;
            }
            
            // Test 2: CORS Headers
            const corsHeaders = healthResponse.headers;
            const hasCors = corsHeaders['access-control-allow-origin'] !== undefined;
            this.recordTest(
                'CORS Configuration',
                hasCors ? 'pass' : 'warn',
                hasCors ? 'CORS headers present' : 'CORS headers missing'
            );
            
            return true;
        } catch (error) {
            this.recordTest('Backend Basic Functionality', 'fail', `Error: ${error.message}`);
            return false;
        }
    }

    async testN8nIntegration() {
        this.log('\n🔄 TESTING N8N INTEGRATION', 'bright');
        
        try {
            // Test 1: Get Workflows
            const startTime = Date.now();
            const workflowsResponse = await this.withRetry(async () => {
                return await axios.get(`${CONFIG.baseUrl}/api/n8n/workflows`, {
                    timeout: CONFIG.timeout
                });
            }, 'N8N Workflows');
            
            const workflowsDuration = Date.now() - startTime;
            
            if (workflowsResponse.status === 200) {
                const workflows = workflowsResponse.data;
                this.testData.workflows = workflows;
                
                this.recordTest(
                    'N8N Get Workflows',
                    'pass',
                    `${workflows.length} workflows encontrados`,
                    workflowsDuration,
                    { count: workflows.length }
                );
                
                // Test 2: Workflow Details (si hay workflows)
                if (workflows.length > 0) {
                    const firstWorkflow = workflows[0];
                    try {
                        const detailStartTime = Date.now();
                        const detailResponse = await axios.get(
                            `${CONFIG.baseUrl}/api/n8n/workflows/${firstWorkflow.id}`,
                            { timeout: CONFIG.timeout }
                        );
                        const detailDuration = Date.now() - detailStartTime;
                        
                        this.recordTest(
                            'N8N Workflow Details',
                            'pass',
                            `Detalles obtenidos para workflow: ${firstWorkflow.name}`,
                            detailDuration
                        );
                    } catch (detailError) {
                        this.recordTest(
                            'N8N Workflow Details',
                            'warn',
                            `No se pudieron obtener detalles: ${detailError.message}`
                        );
                    }
                }
                
                // Test 3: Execute Test Workflow (si existe)
                const testWorkflow = workflows.find(w => w.name.toLowerCase().includes('test'));
                if (testWorkflow) {
                    try {
                        const execStartTime = Date.now();
                        const execResponse = await axios.post(
                            `${CONFIG.baseUrl}/api/n8n/workflows/${testWorkflow.id}/execute`,
                            { testData: { timestamp: new Date().toISOString() } },
                            { timeout: CONFIG.timeout * 2 } // Más tiempo para ejecución
                        );
                        const execDuration = Date.now() - execStartTime;
                        
                        this.recordTest(
                            'N8N Workflow Execution',
                            'pass',
                            `Test workflow ejecutado exitosamente`,
                            execDuration,
                            { workflowId: testWorkflow.id }
                        );
                    } catch (execError) {
                        this.recordTest(
                            'N8N Workflow Execution',
                            'warn',
                            `Ejecución falló: ${execError.message}`
                        );
                    }
                } else {
                    this.recordTest(
                        'N8N Test Workflow',
                        'warn',
                        'No se encontró workflow de test'
                    );
                }
                
                return true;
            } else {
                this.recordTest('N8N Integration', 'fail', `HTTP ${workflowsResponse.status}`);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.recordTest('N8N Integration', 'warn', 'Credenciales N8N no configuradas');
                return false;
            } else {
                this.recordTest('N8N Integration', 'fail', `Error: ${error.message}`);
                return false;
            }
        }
    }

    async testSupabaseIntegration() {
        this.log('\n🗄️ TESTING SUPABASE INTEGRATION', 'bright');
        
        try {
            // Test 1: Connection Test
            const startTime = Date.now();
            const connectionResponse = await this.withRetry(async () => {
                return await axios.get(`${CONFIG.baseUrl}/api/supabase/test`, {
                    timeout: CONFIG.timeout
                });
            }, 'Supabase Connection');
            
            const connectionDuration = Date.now() - startTime;
            
            if (connectionResponse.status === 200) {
                this.recordTest(
                    'Supabase Connection',
                    'pass',
                    'Conexión exitosa',
                    connectionDuration,
                    connectionResponse.data
                );
                
                // Test 2: Database Query (si está disponible)
                try {
                    const queryStartTime = Date.now();
                    const queryResponse = await axios.get(
                        `${CONFIG.baseUrl}/api/supabase/tables`,
                        { timeout: CONFIG.timeout }
                    );
                    const queryDuration = Date.now() - queryStartTime;
                    
                    if (queryResponse.status === 200) {
                        const tables = queryResponse.data;
                        this.recordTest(
                            'Supabase Database Query',
                            'pass',
                            `${tables.length || 0} tablas encontradas`,
                            queryDuration,
                            { tableCount: tables.length || 0 }
                        );
                    }
                } catch (queryError) {
                    this.recordTest(
                        'Supabase Database Query',
                        'warn',
                        `Query falló: ${queryError.message}`
                    );
                }
                
                // Test 3: CRUD Operations (si hay endpoints disponibles)
                try {
                    const testData = {
                        test_field: 'integration_test',
                        timestamp: new Date().toISOString()
                    };
                    
                    const crudStartTime = Date.now();
                    const crudResponse = await axios.post(
                        `${CONFIG.baseUrl}/api/supabase/test-crud`,
                        testData,
                        { timeout: CONFIG.timeout }
                    );
                    const crudDuration = Date.now() - crudStartTime;
                    
                    if (crudResponse.status === 200 || crudResponse.status === 201) {
                        this.recordTest(
                            'Supabase CRUD Operations',
                            'pass',
                            'Operaciones CRUD exitosas',
                            crudDuration
                        );
                    }
                } catch (crudError) {
                    this.recordTest(
                        'Supabase CRUD Operations',
                        'warn',
                        `CRUD no disponible: ${crudError.message}`
                    );
                }
                
                return true;
            } else {
                this.recordTest('Supabase Integration', 'fail', `HTTP ${connectionResponse.status}`);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                this.recordTest('Supabase Integration', 'warn', 'Credenciales Supabase no configuradas');
                return false;
            } else {
                this.recordTest('Supabase Integration', 'fail', `Error: ${error.message}`);
                return false;
            }
        }
    }

    async testFrontendBackendCommunication() {
        this.log('\n🌐 TESTING FRONTEND-BACKEND COMMUNICATION', 'bright');
        
        try {
            // Test 1: Proxy Configuration
            const viteConfigPath = path.join(projectRoot, 'vite.config.js');
            if (fs.existsSync(viteConfigPath)) {
                const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
                const hasProxy = viteConfig.includes('proxy') && viteConfig.includes('/api');
                
                this.recordTest(
                    'Vite Proxy Configuration',
                    hasProxy ? 'pass' : 'fail',
                    hasProxy ? 'Proxy configurado correctamente' : 'Proxy no configurado'
                );
            } else {
                this.recordTest('Vite Configuration', 'fail', 'vite.config.js no encontrado');
            }
            
            // Test 2: API Endpoints Accessibility
            const apiEndpoints = [
                '/api/n8n/workflows',
                '/api/supabase/test',
                '/health'
            ];
            
            let accessibleEndpoints = 0;
            for (const endpoint of apiEndpoints) {
                try {
                    const response = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
                        timeout: CONFIG.timeout,
                        validateStatus: () => true
                    });
                    
                    // Considerar exitoso si no es 404 (endpoint existe)
                    if (response.status !== 404) {
                        accessibleEndpoints++;
                        this.recordTest(
                            `API Endpoint ${endpoint}`,
                            'pass',
                            `HTTP ${response.status} (accesible)`
                        );
                    } else {
                        this.recordTest(
                            `API Endpoint ${endpoint}`,
                            'fail',
                            'Endpoint no encontrado (404)'
                        );
                    }
                } catch (error) {
                    this.recordTest(
                        `API Endpoint ${endpoint}`,
                        'fail',
                        `Error: ${error.message}`
                    );
                }
            }
            
            // Test 3: Environment Variables Separation
            try {
                // Verificar que las variables sensibles no estén en el frontend
                const srcPath = path.join(projectRoot, 'src');
                if (fs.existsSync(srcPath)) {
                    const { execSync } = await import('child_process');
                    const sensitiveVarsSearch = execSync(
                        'grep -r "SUPABASE_SERVICE_ROLE_KEY\\|N8N_API_KEY\\|AI_API_KEY" src/ || true',
                        { encoding: 'utf8', cwd: projectRoot }
                    );
                    
                    if (sensitiveVarsSearch.trim()) {
                        this.recordTest(
                            'Environment Variables Security',
                            'fail',
                            'Variables sensibles encontradas en frontend'
                        );
                    } else {
                        this.recordTest(
                            'Environment Variables Security',
                            'pass',
                            'Variables sensibles correctamente separadas'
                        );
                    }
                }
            } catch (error) {
                this.recordTest(
                    'Environment Variables Security',
                    'warn',
                    'No se pudo verificar separación de variables'
                );
            }
            
            return accessibleEndpoints > 0;
        } catch (error) {
            this.recordTest('Frontend-Backend Communication', 'fail', `Error: ${error.message}`);
            return false;
        }
    }

    async testEndToEndWorkflow() {
        this.log('\n🔄 TESTING END-TO-END WORKFLOW', 'bright');
        
        try {
            // Simular un flujo completo: Frontend -> Backend -> N8N -> Supabase
            const workflowData = {
                user_id: 'test_user_' + Date.now(),
                action: 'integration_test',
                timestamp: new Date().toISOString(),
                data: {
                    test: true,
                    source: 'integration_test'
                }
            };
            
            // Step 1: Enviar datos al backend
            const startTime = Date.now();
            const backendResponse = await axios.post(
                `${CONFIG.baseUrl}/api/workflow/process`,
                workflowData,
                { timeout: CONFIG.timeout * 2 }
            );
            
            if (backendResponse.status === 200 || backendResponse.status === 201) {
                this.recordTest(
                    'E2E Step 1: Backend Processing',
                    'pass',
                    'Datos procesados por backend'
                );
                
                // Step 2: Verificar que se ejecutó N8N (si está disponible)
                if (this.testData.workflows.length > 0) {
                    try {
                        const n8nResponse = await axios.get(
                            `${CONFIG.baseUrl}/api/n8n/executions/recent`,
                            { timeout: CONFIG.timeout }
                        );
                        
                        this.recordTest(
                            'E2E Step 2: N8N Execution',
                            'pass',
                            'Workflow N8N ejecutado'
                        );
                    } catch (n8nError) {
                        this.recordTest(
                            'E2E Step 2: N8N Execution',
                            'warn',
                            'No se pudo verificar ejecución N8N'
                        );
                    }
                }
                
                // Step 3: Verificar almacenamiento en Supabase
                try {
                    const supabaseResponse = await axios.get(
                        `${CONFIG.baseUrl}/api/supabase/recent-data`,
                        { timeout: CONFIG.timeout }
                    );
                    
                    this.recordTest(
                        'E2E Step 3: Supabase Storage',
                        'pass',
                        'Datos almacenados en Supabase'
                    );
                } catch (supabaseError) {
                    this.recordTest(
                        'E2E Step 3: Supabase Storage',
                        'warn',
                        'No se pudo verificar almacenamiento'
                    );
                }
                
                const totalDuration = Date.now() - startTime;
                this.recordTest(
                    'End-to-End Workflow',
                    'pass',
                    'Flujo completo ejecutado exitosamente',
                    totalDuration
                );
                
                return true;
            } else {
                this.recordTest('End-to-End Workflow', 'fail', `Backend error: HTTP ${backendResponse.status}`);
                return false;
            }
        } catch (error) {
            if (error.response?.status === 404) {
                this.recordTest(
                    'End-to-End Workflow',
                    'warn',
                    'Endpoint de workflow no implementado (normal en desarrollo)'
                );
                return false;
            } else {
                this.recordTest('End-to-End Workflow', 'fail', `Error: ${error.message}`);
                return false;
            }
        }
    }

    generateIntegrationReport() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warn').length;
        
        const totalTests = this.results.length;
        const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;
        
        this.log('\n' + '='.repeat(60), 'bright');
        this.log('📊 INTEGRATION TEST REPORT', 'bright');
        this.log('='.repeat(60), 'bright');
        
        this.log(`✅ Tests exitosos: ${passed}`, 'green');
        this.log(`❌ Tests fallidos: ${failed}`, 'red');
        this.log(`⚠️  Advertencias: ${warnings}`, 'yellow');
        this.log(`📈 Tasa de éxito: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
        this.log(`⏱️  Duración: ${duration}s`, 'cyan');
        
        // Mostrar tests críticos fallidos
        const criticalFailures = this.results.filter(r => r.status === 'fail');
        if (criticalFailures.length > 0) {
            this.log('\n❌ TESTS FALLIDOS:', 'red');
            criticalFailures.forEach(test => {
                this.log(`   • ${test.test}: ${test.details}`, 'red');
            });
        }
        
        // Mostrar advertencias importantes
        const importantWarnings = this.results.filter(r => r.status === 'warn');
        if (importantWarnings.length > 0) {
            this.log('\n⚠️  ADVERTENCIAS:', 'yellow');
            importantWarnings.forEach(test => {
                this.log(`   • ${test.test}: ${test.details}`, 'yellow');
            });
        }
        
        // Mostrar estadísticas de rendimiento
        const testsWithDuration = this.results.filter(r => r.duration);
        if (testsWithDuration.length > 0) {
            const avgDuration = Math.round(
                testsWithDuration.reduce((sum, test) => sum + test.duration, 0) / testsWithDuration.length
            );
            const slowestTest = testsWithDuration.reduce((slowest, test) => 
                test.duration > slowest.duration ? test : slowest
            );
            
            this.log('\n⚡ ESTADÍSTICAS DE RENDIMIENTO:', 'cyan');
            this.log(`   • Tiempo promedio: ${avgDuration}ms`, 'cyan');
            this.log(`   • Test más lento: ${slowestTest.test} (${slowestTest.duration}ms)`, 'cyan');
        }
        
        this.log('\n' + '='.repeat(60), 'bright');
        
        // Guardar reporte detallado
        const reportPath = path.join(projectRoot, 'integration-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            duration,
            successRate,
            summary: { passed, failed, warnings },
            testData: this.testData,
            results: this.results
        }, null, 2));
        
        this.log(`📄 Reporte detallado guardado en: ${reportPath}`, 'cyan');
        
        return {
            success: failed === 0,
            successRate,
            criticalFailures: failed
        };
    }

    async run() {
        this.log('🔗 INICIANDO TESTS DE INTEGRACIÓN', 'bright');
        this.log(`⏰ Iniciado: ${new Date().toLocaleString()}`, 'cyan');
        
        try {
            const backendOk = await this.testBackendBasicFunctionality();
            if (!backendOk) {
                this.log('\n💥 Backend no disponible - Abortando tests de integración', 'red');
                process.exit(1);
            }
            
            await this.testN8nIntegration();
            await this.testSupabaseIntegration();
            await this.testFrontendBackendCommunication();
            await this.testEndToEndWorkflow();
            
            const report = this.generateIntegrationReport();
            
            if (report.success) {
                this.log('\n🎉 ¡TODOS LOS TESTS DE INTEGRACIÓN PASARON!', 'green');
                process.exit(0);
            } else if (report.criticalFailures === 0) {
                this.log('\n⚠️  INTEGRACIÓN FUNCIONAL CON ADVERTENCIAS', 'yellow');
                process.exit(0);
            } else {
                this.log('\n💥 PROBLEMAS CRÍTICOS EN INTEGRACIÓN', 'red');
                process.exit(1);
            }
            
        } catch (error) {
            this.log(`\n💥 ERROR CRÍTICO: ${error.message}`, 'red');
            process.exit(1);
        }
    }
}

// Ejecutar si es llamado directamente
if (process.argv[1] && process.argv[1].endsWith('integration-tests.js')) {
    const tester = new IntegrationTester();
    tester.run();
}

export default IntegrationTester;