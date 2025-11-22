import { useEffect } from 'react';
<<<<<<< HEAD
import { axiosPrivate } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.js';

const useAxiosPrivate = () => {
    const { token, logout, refreshAccessToken } = useAuth();

    useEffect(() => {
        // Interceptor de Petición (adjunta el token)
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (token && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor de Respuesta (maneja el 401)
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // Si el Access Token expiró (401)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(originalRequest); // Reintenta
                    } catch (refreshError) {
                        logout(); // Si el refresh falla, desloguea
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };

    }, [token, logout, refreshAccessToken]);

    return axiosPrivate;
};

export default useAxiosPrivate;
=======
import { api, axiosPrivate } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAxiosPrivate = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      async (config) => {
        const storedToken = token || (await AsyncStorage.getItem('accessToken'));
        if (storedToken && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const refreshRes = await api.post('/usuarios/refresh', { refreshToken });
            const newAccessToken = refreshRes.data.token;

            await AsyncStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [token, logout]);

  return axiosPrivate;
};

export default useAxiosPrivate;
>>>>>>> 98ee1a2876fe820e0ac4f823cda077cd395387ba
