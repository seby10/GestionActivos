import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const mantenimientosServices = {
  getMaintenances: async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/mantenimientos`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      throw error;
    }
  },

  getAvailableAssets: async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/mantenimientos/getActivosByEstado`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available assets:", error);
      throw error;
    }
  },

  getMaintenanceDetails: async (maintenanceId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/mantenimientos/detalles/${maintenanceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenance details:", error);
      throw error;
    }
  },

  createMaintenance: async (maintenanceData) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/mantenimientos/addMantenimiento`,
        maintenanceData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating maintenance:", error);
      throw error;
    }
  },

  addAssetsToMaintenance: async (data) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/mantenimientos/addDetallesMantenimiento`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error adding assets to maintenance:", error);
      throw error;
    }
  },

  changeStatusAssets: async (assetId) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/mantenimientos/updateEstadoActivo/${assetId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error changing assets status to in mainteinance:", error);
      throw error;
    }
  },

  finishMaintenance: async (maintenanceId) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/mantenimientos/finalizar/${maintenanceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error finishing maintenance:", error);
      throw error;
    }
  },

  // Nuevos servicios añadidos
  getExternalProviders: async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/proveedores`);
      return response.data;
    } catch (error) {
      console.error("Error fetching external providers:", error);
      throw error;
    }
  },

  getInternalUsers: async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/auth/getUser`
      );
      const loggedInUser = localStorage.getItem("user");
      return response.data;
    } catch (error) {
      console.error("Error fetching internal users:", error);
      throw error;
    }
  },

  getInternalUsers: async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching internal users:", error);
      throw error;
    }
  },

  getLoggedInUser: async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        throw new Error("No user logged in");
      }
      const response = await axios.get(`http://localhost:3000/api/auth/${user.ID_USU}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching logged in user:", error);
      throw error;
    }
  },
};
