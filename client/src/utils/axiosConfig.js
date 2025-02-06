import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
        let token = localStorage.getItem('token');
        if (!token) {
            token = sessionStorage.getItem('token');
        }
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use((response) => response, (error) => {
        const originalRequest = error.config;

        if (error.response) {
            switch (error.response.status) {
                case 401: // Unauthorized
                    if (originalRequest.url.includes('/auth/login')) {
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                    break;
                case 403: // Forbidden
                    console.error('Access denied');
                    break;
                case 404: // Not Found
                    console.error('Resource not found');
                    break;
                case 500: // Server Error
                    console.error('Internal server error');
                    break;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
