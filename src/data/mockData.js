// Datos mock para fallback y desarrollo
export const mockGrants = [
  {
    id: '1',
    title: 'Programa de Innovación Digital 2024',
    description: 'Subvención para proyectos de transformación digital en PYMES',
    source: 'BOE',
    amount_min: 10000,
    amount_max: 50000,
    deadline_date: '2024-12-31',
    sector: 'Tecnología',
    category: 'Innovación',
    geographic_scope: 'NACIONAL',
    status: 'ACTIVE',
  },
  {
    id: '2',
    title: 'Ayudas I+D+i Comunidad de Madrid',
    description: 'Apoyo a proyectos de investigación y desarrollo',
    source: 'REGIONAL',
    amount_min: 25000,
    amount_max: 100000,
    deadline_date: '2024-11-15',
    sector: 'I+D+i',
    category: 'Investigación',
    geographic_scope: 'REGIONAL',
    status: 'ACTIVE',
  },
  {
    id: '3',
    title: 'Horizonte Europa 2024',
    description: 'Programa marco de investigación e innovación de la UE',
    source: 'EUROPA',
    amount_min: 100000,
    amount_max: 2000000,
    deadline_date: '2024-10-30',
    sector: 'Investigación',
    category: 'Europeo',
    geographic_scope: 'EUROPEO',
    status: 'ACTIVE',
  },
];

// Datos mock adicionales para desarrollo
export const mockWorkflows = [
  {
    id: '1',
    name: 'Procesamiento de Subvenciones',
    description:
      'Workflow para procesar automáticamente las solicitudes de subvenciones',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Notificaciones Email',
    description: 'Sistema de notificaciones por email para usuarios',
    status: 'active',
    created_at: '2024-01-10T14:30:00Z',
  },
];

export const mockUser = {
  id: 'mock-user-1',
  email: 'usuario@ejemplo.com',
  name: 'Usuario Demo',
  created_at: '2024-01-01T00:00:00Z',
};
