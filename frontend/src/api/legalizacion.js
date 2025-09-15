// api/legalizaciones.js

const API_BASE = 'http://172.16.110.74:3004/api';

// Función helper para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Función helper para hacer requests con configuración común
const makeRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request error:', error);
    throw error;
  }
};

export const legalizacionesAPI = {
  // Obtener todas las legalizaciones con paginación
  getAll: async (page = 1, limit = 10) => {
    const url = `${API_BASE}/legalizacion?page=${page}&limit=${limit}`;
    return makeRequest(url);
  },

  // Obtener legalizaciones pendientes
  getPendientes: async () => {
    const url = `${API_BASE}/legalizacion/pendientes`;
    return makeRequest(url);
  },

  // Aprobar múltiples legalizaciones
  approveMultiple: async (legalizacionIds, almacenistaId, observaciones) => {
    const url = `${API_BASE}/legalizacions/multiple`;
    const body = {
      legalizacionIds,
      almacenistaId,
      observaciones,
    };

    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Obtener detalle de una legalización específica (si necesitas esta funcionalidad)
  getById: async (id) => {
    const url = `${API_BASE}/legalizacion/${id}`;
    return makeRequest(url);
  },
};

export default legalizacionesAPI;