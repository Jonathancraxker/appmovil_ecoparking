import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.205:4000/ecoparking'; // tu IP local

export const api = axios.create({
  baseURL: BASE_URL,
});

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

// ----------------------------------------------------------
// 🔴 ELIMINAR CITA
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 🟡 ACTUALIZAR CITA
// ----------------------------------------------------------
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

//Registrar Cita
export const registrarCitaService = async (body: any) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error("No hay token");

    const response = await axios.post(
      `${BASE_URL}/citas/registrar`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("❌ Error creando cita:", error.response?.data || error.message);
    throw error;
  }
};
