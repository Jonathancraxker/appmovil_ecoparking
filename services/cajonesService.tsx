import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/axios';

/**
 * Obtiene todos los cajones
 */
export const getCajonesService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const response = await api.get("/api/cajones", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error getCajonesService:", error.response?.data || error.message);
    return [];
  }
};
export const getCajonesDisponiblesService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const response = await api.get("/api/cajones/disponibles", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error getCajonesDisponibles:", error.response?.data || error.message);
    return [];
  }
};
export const filtrarCajonesService = async (data: {
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  id_cita?: number;
}) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const response = await api.post("/api/cajones/filtrar-disponibles", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Error filtrarCajones:", error.response?.data || error.message);
    return [];
  }
};