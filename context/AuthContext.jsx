<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios.js';
=======
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';
>>>>>>> 98ee1a2876fe820e0ac4f823cda077cd395387ba
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
<<<<<<< HEAD
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Access Token
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. LOGIN (llamado por la pantalla de Login)
    const login = async (userData, accessToken, newRefreshToken) => {
        setUser(userData);
        setToken(accessToken);
        setIsAuthenticated(true);
        // Guardamos el refresh token de forma segura en el teléfono
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
    };

    // 2. LOGOUT
    const logout = async () => {
        // (Opcional: llamar a /logout del backend)
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        // Borramos el token guardado
        await AsyncStorage.removeItem('refreshToken');
    };

    // 3. FUNCIÓN DE REFRESH (usada por el interceptor)
    const refreshAccessToken = async () => {
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
            // Si no hay token, deslogueamos
            logout(); 
            throw new Error("No refresh token");
        }

        // Llamamos a /refresh enviando el token en el BODY
        const res = await api.post('/usuarios/refresh', { 
            refreshToken: storedRefreshToken 
        });
        
        const newAccessToken = res.data.token;
        const decodedUser = jwtDecode(newAccessToken);

        setToken(newAccessToken);
        setUser(decodedUser);
        setIsAuthenticated(true);
        
        return newAccessToken; // Devolver el nuevo token
    };

    // 4. VERIFICAR SESIÓN AL CARGAR LA APP
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                await refreshAccessToken();
            } catch (error) {
                // No hay refresh token válido o falló
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout,
            refreshAccessToken // <-- Exponemos la función
        }}>
            {/* Solo muestra la app cuando la carga inicial de auth termina */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
=======
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
>>>>>>> 98ee1a2876fe820e0ac4f823cda077cd395387ba
