import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/', // Change this URL if your Django backend is deployed
  withCredentials: true, // Include this if your backend requires authentication cookies
});

export default api;