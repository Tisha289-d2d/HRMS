import axios from "axios";

const isDev = import.meta.env.DEV;
const envBase = import.meta.env.VITE_API_URL;

const baseURL = isDev ? '/api' : (envBase || "http://127.0.0.1:8000/api");

const API = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 20000,
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            // Let the browser set the correct Content-Type with boundary
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }
        // don't auto-logout on 403; let pages handle permission errors
        return Promise.reject(error);
    }
);

export default API;