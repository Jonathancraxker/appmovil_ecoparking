import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.8.104:4000/ecoparking'; // tu IP local

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
