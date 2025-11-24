import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/axios';

// ----------------------------------------------------------
// 🔵 CITAS – GET MIS CITAS
// ----------------------------------------------------------
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

// ELIMINAR CITA
export const deleteCitaService = async (id) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.delete(`/citas/${id}`);
    return response.data;
  } catch (error) {
    console.log("❌ Error deleteCita:", error.response?.data || error);
  }
};

// REGISTRAR CITA
export const registrarCitaService = async (data) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post("/citas/", data);
    return response.data;
  } catch (error) {
    console.log("❌ Error registrarCita:", error.response?.data || error);
    throw error.response?.data || { message: "Error al registrar cita" };
  }
};

// ACTUALIZAR CITA
export const updateCitaService = async (id, data) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.patch(`/citas/${id}`, data);
    return response.data;
  } catch (error) {
    console.log("❌ Error updateCita:", error.response?.data || error);
    return error.response?.data || { message: "Error al actualizar cita" };
  }
};
