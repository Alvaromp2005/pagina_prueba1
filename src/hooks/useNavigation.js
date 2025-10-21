import { useState, useEffect } from 'react';

/**
 * Hook para manejar la navegación
 */
export const useNavigation = (initialPage = 'dashboard') => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const navigateTo = pageId => {
    setCurrentPage(pageId);

    // Actualizar URL si es necesario (sin recargar la página)
    if (window.history && window.history.pushState) {
      window.history.pushState({ page: pageId }, '', `#${pageId}`);
    }
  };

  // Manejar navegación del navegador (botón atrás/adelante)
  useEffect(() => {
    const handlePopState = event => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Leer página inicial de la URL
    const hash = window.location.hash.substring(1);
    if (
      hash &&
      ['dashboard', 'research', 'workflows', 'settings'].includes(hash)
    ) {
      setCurrentPage(hash);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    currentPage,
    navigateTo,
  };
};

export default useNavigation;
