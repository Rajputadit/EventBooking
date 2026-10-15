import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "https://djhgd-jkshb-fhsjddsjh.onrender.com").replace(/\/+$/, "");

const api = axios.create({
    baseURL: `${apiUrl}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;