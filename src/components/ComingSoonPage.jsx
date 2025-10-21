const ComingSoonPage = ({
  title = 'Próximamente',
  subtitle = 'Esta sección estará disponible en la próxima actualización',
  icon = '🚧',
  description,
  features = [],
  estimatedDate,
}) => {
  return (
    <div className="page-container">
      <div className="coming-soon-container flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="coming-soon-icon text-8xl mb-6">{icon}</div>

        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl">{subtitle}</p>

        {description && (
          <div className="description bg-blue-50 p-6 rounded-lg mb-8 max-w-3xl">
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {features.length > 0 && (
          <div className="features mb-8 max-w-4xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Características que incluirá:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{feature.icon || '✨'}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {feature.title}
                      </h4>
                      {feature.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {estimatedDate && (
          <div className="estimated-date bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-yellow-600">📅</span>
              <span className="text-yellow-800 font-medium">
                Fecha estimada de lanzamiento: {estimatedDate}
              </span>
            </div>
          </div>
        )}

        <div className="actions space-y-4">
          <div className="text-gray-500 text-sm">
            Mientras tanto, puedes explorar las otras secciones disponibles
          </div>

          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

// Componentes específicos para cada sección
export const GrantsComingSoon = () => (
  <ComingSoonPage
    title="💰 Explorar Subvenciones"
    subtitle="Descubre todas las subvenciones disponibles"
    icon="💰"
    description="Esta sección te permitirá explorar un catálogo completo de subvenciones disponibles, con filtros avanzados y recomendaciones personalizadas."
    features={[
      {
        icon: '🔍',
        title: 'Búsqueda Avanzada',
        description: 'Filtra por sector, región, monto y más',
      },
      {
        icon: '🎯',
        title: 'Recomendaciones IA',
        description: 'Sugerencias personalizadas basadas en tu perfil',
      },
      {
        icon: '📊',
        title: 'Análisis Detallado',
        description: 'Información completa de cada subvención',
      },
    ]}
    estimatedDate="Q2 2024"
  />
);

export const EvaluationsComingSoon = () => (
  <ComingSoonPage
    title="⭐ Mis Evaluaciones"
    subtitle="Gestiona tus evaluaciones personalizadas"
    icon="⭐"
    description="Herramientas para evaluar y comparar diferentes oportunidades de subvenciones de manera sistemática."
    features={[
      {
        icon: '📝',
        title: 'Criterios Personalizados',
        description: 'Define tus propios criterios de evaluación',
      },
      {
        icon: '📈',
        title: 'Scoring Automático',
        description: 'Puntuación automática basada en IA',
      },
      {
        icon: '📋',
        title: 'Informes Detallados',
        description: 'Reportes completos de evaluación',
      },
    ]}
    estimatedDate="Q3 2024"
  />
);

export const NotificationsComingSoon = () => (
  <ComingSoonPage
    title="🔔 Notificaciones"
    subtitle="Mantente al día con alertas y avisos"
    icon="🔔"
    description="Sistema de notificaciones inteligente para no perderte ninguna oportunidad importante."
    features={[
      {
        icon: '⚡',
        title: 'Alertas en Tiempo Real',
        description: 'Notificaciones instantáneas de nuevas oportunidades',
      },
      {
        icon: '📅',
        title: 'Recordatorios de Fechas',
        description: 'Avisos de fechas límite importantes',
      },
      {
        icon: '🎯',
        title: 'Filtros Inteligentes',
        description: 'Solo recibe lo que realmente te interesa',
      },
    ]}
    estimatedDate="Q2 2024"
  />
);

export const SettingsComingSoon = () => (
  <ComingSoonPage
    title="⚙️ Configuración"
    subtitle="Personaliza tu experiencia"
    icon="⚙️"
    description="Panel de configuración completo para personalizar la plataforma según tus necesidades."
    features={[
      {
        icon: '🎨',
        title: 'Temas Personalizados',
        description: 'Modo oscuro y temas de color',
      },
      {
        icon: '🔧',
        title: 'Preferencias Avanzadas',
        description: 'Configura comportamientos específicos',
      },
      {
        icon: '🔐',
        title: 'Seguridad',
        description: 'Gestión de privacidad y seguridad',
      },
    ]}
    estimatedDate="Q3 2024"
  />
);

export default ComingSoonPage;
