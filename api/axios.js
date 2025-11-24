import axios from 'axios';

const BASE_URL = 'http://192.168.1.205:4000/ecoparking'; 

export const api = axios.create({
baseURL: BASE_URL,
headers: {
    'Content-Type': 'application/json',
},
});