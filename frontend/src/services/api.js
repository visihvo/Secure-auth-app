import axios from "axios";
import store from "../redux/store";
import { logout, setUser } from "../redux/authSlice";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // hide this?
    withCredentials: true
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

API.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await API.post("/auth/refresh");

                const newToken = res.data.accessToken;

                setAccessToken(newToken);

                originalRequest.headers.Authorization = 
                    `Bearer ${newToken}`;

                return API(originalRequest);

            } catch (refreshError) {
                console.log("[AUTH] refresh failed -> logout");
                setAccessToken(null);
                store.dispatch(logout());

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(err);
    }
);

export default API;