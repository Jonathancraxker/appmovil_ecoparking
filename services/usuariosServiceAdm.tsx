import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/axios';

// Get usuarios
export const getUsersService = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return [];

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get("/usuarios"); // Trae todos los usuarios
    return response.data;
  } catch (error) {
    console.log("❌ Error getCitasAdminService:", error.response?.data || error);
    return [];
  }
};

// Crear usuario
export const createUserService = async (userData) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token disponible");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post("/usuarios", userData);
    return response.data;
  } catch (error) {
    console.log("❌ Error createUserService:", error.response?.data || error);
    return error.response?.data || { message: "Error al crear usuario" };
  }
};

// USUARIOS – ACTUALIZAR POR ID
export const updateUserByIdService = async (id, userData) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token disponible");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.patch(`/usuarios/${id}`, userData); // PATCH en vez de PUT
    return response.data;
  } catch (error) {
    console.log("❌ Error updateUserByIdService:", error.response?.data || error);
    return error.response?.data || { message: "Error al actualizar usuario" };
  }
};

export const updateUserPassword = async (id, password) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.put(`/usuarios/update/${id}`, {
      contrasena: password
    });
    return response.data;

  } catch (error) {
    console.log("❌ Error updateUserPassword:", error.response?.data || error);
    return error.response?.data || { message: "Error al actualizar contraseña" };
  }
};

// USUARIOS – ELIMINAR POR ID
export const deleteUserByIdService = async (id) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token disponible");

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.log("❌ Error deleteUserByIdService:", error.response?.data || error);
    return error.response?.data || { message: "Error al eliminar usuario" };
  }
};
