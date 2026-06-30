import axios from 'axios';

const BASE_URL = 'http://192.168.1.137:4000/ecoparking/';
// const BASE_URL = 'https://ecoparking-api-prod.onrender.com/ecoparking';

export const api = axios.create({
baseURL: BASE_URL,
headers: {
    'Content-Type': 'application/json',
},
});