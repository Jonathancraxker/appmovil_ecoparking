import axios from 'axios';

const BASE_URL = 'http://10.13.11.255:4000/ecoparking';

// Instancia para peticiones públicas (Login, Registro, Refresh, etc)
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // importante para cookies
});

// Instancia para peticiones PRIVADAS (requieren autenticación)
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});
