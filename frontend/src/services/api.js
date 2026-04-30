import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // hide this?
    withCredentials: true
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
}

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

            const res = await API.post("/auth/refresh");

            setAccessToken(res.data.accessToken);

            originalRequest.headers.Authorization =
                `Bearer ${res.data.accessToken}`;

            return API(originalRequest);
        }

        return Promise.reject(err);
    }
);

export default API;