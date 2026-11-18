import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { api, axiosPrivate } from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
