import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const mantenimientosServices = {
  getMaintenances: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/mantenimientos`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      throw error;
    }
  },

  getAvailableAssets: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/mantenimientos/getActivosByEstado`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available assets:', error);
      throw error;
    }
  },

  getMaintenanceDetails: async (maintenanceId) => {
    try {
      const response = await axios.get(`${BASE_URL}/mantenimientos/detalles/${maintenanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance details:', error);
      throw error;
    }
  },

  createMaintenance: async (maintenanceData) => {
    try {
      const response = await axios.post(`${BASE_URL}/mantenimientos/addMantenimiento`, maintenanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance:', error);
      throw error;
    }
  },

  addAssetsToMaintenance: async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/mantenimientos/addDetallesMantenimiento`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding assets to maintenance:', error);
      throw error;
    }
  },

  finishMaintenance: async (maintenanceId) => {
    try {
      const response = await axios.put(`${BASE_URL}/mantenimientos/finalizar/${maintenanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error finishing maintenance:', error);
      throw error;
    }
  },

  // Nuevos servicios añadidos
  getExternalProviders: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/proveedores`);
      return response.data;
    } catch (error) {
      console.error('Error fetching external providers:', error);
      throw error;
    }
  },

  getInternalUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getUser`);
      return response.data;
    } catch (error) {
      console.error('Error fetching internal users:', error);
      throw error;
    }
  }
};