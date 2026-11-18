import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

const login = async (userData, accessToken, refreshToken) => {
  console.log('[Auth] Login iniciado:', { userData, accessToken, refreshToken });

  setUser(userData);
  setToken(accessToken);
  setIsAuthenticated(true);

  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('userData', JSON.stringify(userData));
  await AsyncStorage.setItem('refreshToken', refreshToken);
  await AsyncStorage.setItem('rol', userData.tipo_usuario || '');

  console.log('[Auth] Login completado, AsyncStorage actualizado');
};

const logout = async () => {
  console.log('[Auth] Logout iniciado');
  setUser(null);
  setToken(null);
  setIsAuthenticated(false);
  await AsyncStorage.clear();
  console.log('[Auth] Logout completado, AsyncStorage limpiado');
};

useEffect(() => {
  const checkLoginStatus = async () => {
    console.log('[Auth] Comprobando estado de login...');
    try {
      const refreshTokenStored = await AsyncStorage.getItem('refreshToken');
      console.log('[Auth] Refresh token almacenado:', refreshTokenStored);

      if (!refreshTokenStored) {
        setLoading(false);
        console.log('[Auth] No hay refresh token, usuario no autenticado');
        return;
      }

      const res = await api.post('/usuarios/refresh', { refreshToken: refreshTokenStored });
      console.log('[Auth] Respuesta del backend refresh:', res.data);

      const newAccessToken = res.data.token;
      const decodedUser = jwtDecode(newAccessToken);

      setToken(newAccessToken);
      setUser(decodedUser);
      setIsAuthenticated(true);

      console.log('[Auth] Token refrescado y usuario autenticado:', decodedUser);
    } catch (error) {
      console.error('[Auth] Error comprobando login:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
      console.log('[Auth] Comprobación de login finalizada');
    }
  };

  checkLoginStatus();
}, []);


  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
