import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for sessions
apiClient.interceptors.request.use((config) => {
    const admin = localStorage.getItem('psyq_admin');
    const student = localStorage.getItem('psyq_student');
    
    let token = null;
    if (admin) {
        token = JSON.parse(admin).token;
    } else if (student) {
        token = JSON.parse(student).token;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
