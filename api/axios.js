import axios from 'axios';

const BASE_URL = 'https://ecoparking-api.onrender.com/ecoparking'; 

export const api = axios.create({
baseURL: BASE_URL,
headers: {
    'Content-Type': 'application/json',
},
});