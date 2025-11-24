import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/axios';

// Obtener todas las citas
export const getCitasAdminService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return [];

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get("/citas/"); // Trae todas las citas
    return response.data;
  } catch (error) {
    console.log("❌ Error getCitasAdminService:", error.response?.data || error);
    return [];
  }
};

//Mis citas
export const getMisCitasService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get("/citas/mis-citas");
    return response.data;

  } catch (error) {
    console.log("❌ Error getMisCitas:", error.response?.data || error);
    return [];
  }
};

// 🔵 OBTENER REPORTES (TABLA HISTORIAL)
// ----------------------------------------------------------
export const getReportesService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return [];

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get("/optener-reportes");
    return response.data;

  } catch (error: any) {
    console.log("❌ Error getReportes:", error.response?.data || error);
    return [];
  }
};

// ----------------------------------------------------------
// 🔵 OBTENER ESTADÍSTICAS (DASHBOARD)
// ----------------------------------------------------------
export const getEstadisticasService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get("/reportes/estadisticas");
    return response.data;

  } catch (error: any) {
    console.log("❌ Error getEstadisticas:", error.response?.data || error);
    return null;
  }
};

// ----------------------------------------------------------
// 🔵 OBTENER PREDICCIÓN (HEADER AZUL)
// ----------------------------------------------------------
export const getPrediccionService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get("/reportes/prediccion-siguiente-mes");
    return response.data;

  } catch (error: any) {
    console.log("❌ Error getPrediccion:", error.response?.data || error);
    return null;
  }
};

// ----------------------------------------------------------
// 🟢 CREAR REPORTE MANUAL
// ----------------------------------------------------------
export const crearReporteService = async (id_cita: string | number) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response = await api.post("/dar-reportes", { id_cita });
    return response.data;

  } catch (error: any) {
    console.log("❌ Error crearReporte:", error.response?.data || error);
    throw error.response?.data || { message: "Error al crear el reporte" };
  }
};

// ----------------------------------------------------------
// ⬇️ GENERAR PDF (ENDPOINT URL)
// ----------------------------------------------------------
// En móvil, usaremos FileSystem.downloadAsync, así que necesitamos la URL completa
export const getPdfUrl = (id_reporte: string | number) => {
    return `${api.defaults.baseURL}/reportes/generar-pdf/${id_reporte}`;
};