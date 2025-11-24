import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/axios';

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
        const res = await api.post(`/usuarios/refresh`, {
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
export const loginUser = async (correo: string, contrasena: string, codigo: string) => {
  try {
    const response = await api.post(`/usuarios/login`, {
      correo, contrasena, codigo
    });

    const { user, token, refreshToken } = response.data;

    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    await AsyncStorage.setItem('rol', user.tipo_usuario);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { success: true, user, token, refreshToken };

  } catch (error: any) {
    console.log("❌ Error loginUser:", error.response?.data || error.message);
    
    let message = "Error de conexión.";
    if (error.response?.data) {
        const data = error.response.data;
        if (Array.isArray(data) && data.length > 0) {
            message = data[0];
        } else if (data.message) {
            message = data.message;
        }
    }
    
    return { success: false, message };
  }
};

// GET PROFILE
export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return { message: "No hay token disponible" };

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get("/usuarios/perfil");
    return response.data;

  } catch (error) {
    console.log("❌ Error getProfile:", error.response?.data || error);
    return error.response?.data || { message: "Error desconocido" };
  }
};

// EDITAR PERFIL (PATCH)
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

// CAMBIAR CONTRASEÑA (PUT)
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

// 🔴 CERRAR SESIÓN (LOGOUT)
export const logoutUser = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.post('/logout'); 
    }
  } catch (error) {
    console.log("⚠️ Error al avisar logout al backend (no crítico):", error);
  } finally {
    // SIEMPRE borramos los datos locales, pase lo que pase
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('rol');
    delete api.defaults.headers.common['Authorization'];
    return { success: true };
  }
};
