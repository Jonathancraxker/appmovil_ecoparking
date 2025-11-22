import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ----------------------------------------------------------
// 🔵 BASE URL DEL BACKEND
// ----------------------------------------------------------
const BASE_URL = 'http://10.13.11.255:4000/ecoparking';

// ----------------------------------------------------------
// 🔵 AXIOS PRINCIPAL (CON INTERCEPTORES)
// ----------------------------------------------------------
export const api = axios.create({
  baseURL: BASE_URL,
});

// ----------------------------------------------------------
// 🔄 INTERCEPTOR PARA REFRESCAR TOKEN AUTOMÁTICO
// ----------------------------------------------------------
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401, refrescar token solo 1 vez
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefresh = await AsyncStorage.getItem('refreshToken');
      if (!storedRefresh) return Promise.reject(error);

      try {
        const res = await axios.post(`${BASE_URL}/usuarios/refresh`, {
          refreshToken: storedRefresh,
        });

        const newToken = res.data?.token;
        if (!newToken) return Promise.reject(error);

        // Guardar nuevo token
        await AsyncStorage.setItem('accessToken', newToken);

        // Aplicar token al interceptor
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Reintentar petición original
        return api(originalRequest);

      } catch (err) {
        console.log("❌ Error al refrescar token:", err.response?.data || err.message);
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------------------------------------------
// 🔵 LOGIN (CARGA BIEN EL TOKEN AL INTERCEPTOR)
// ----------------------------------------------------------
export const loginUser = async (correo, contrasena, codigo) => {
  try {
    const response = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo, contrasena, codigo
    });

    const { user, token, refreshToken } = response.data;

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    // 🔥 IMPORTANTE: asignar token al interceptor
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return { user, token, refreshToken };

  } catch (error) {
    console.log("❌ Error loginUser:", error.response?.data || error.message);
    const message = error.response?.data?.message || "Error de conexión.";
    return { message };
  }
};

// ----------------------------------------------------------
// 🔵 GET PROFILE
// ----------------------------------------------------------
export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) return { message: "No hay token disponible" };

    // Aplicar token al interceptor si no estaba
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const response = await api.get("/usuarios/perfil");

    return response.data;

  } catch (error) {
    console.log("❌ Error getProfile:", error.response?.data || error);
    return error.response?.data || { message: "Error desconocido" };
  }
};

// ----------------------------------------------------------
// 🟢 EDITAR PERFIL (PATCH)
// ----------------------------------------------------------
export const updateProfile = async (id, data) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const response = await api.patch(`/usuarios/update/${id}`, data);

    return response.data;

  } catch (error) {
    console.log("❌ Error updateProfile:", error.response?.data || error);
    return error.response?.data || { message: "Error al actualizar perfil" };
  }
};

// ----------------------------------------------------------
// 🔴 CAMBIAR CONTRASEÑA (PUT)
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 🟢 REGISTRAR CITA
// ----------------------------------------------------------
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
// ----------------------------------------------------------
// 🔵 OBTENER TODAS LAS CITAS (ADMIN)
// ----------------------------------------------------------

// Obtener todas las citas (ya tenías)
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

// Obtener una cita por ID
export const getCitaPorIdService = async (id) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get(`/citas/${id}`);
    return response.data;
  } catch (error) {
    console.log("❌ Error getCitaPorIdService:", error.response?.data || error);
    return null;
  }
};

// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 🟢 USUARIOS – ACTUALIZAR POR ID
// ----------------------------------------------------------
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


// ----------------------------------------------------------
// 🔴 USUARIOS – ELIMINAR POR ID
// ----------------------------------------------------------
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
