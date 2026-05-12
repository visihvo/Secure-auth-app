import axios from "axios";
import store from "../redux/store";
import { logout, setUser } from "../redux/authSlice";
import { log } from "../utils/logger";

const API = axios.create({
    baseURL: "/api",
    withCredentials: true
});

const csrfClient = axios.create({
    baseURL: "/api",
    withCredentials: true
});

let accessToken = null;
let csrfToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

export const setCsrfToken = (token) => {
    csrfToken = token;
};

export const loadCsrfToken = async () => {
    try {
        log("[CSRF] loading...");

        const res = await csrfClient.get("/csrf-token");
        log("[CSRF] response:", res.data);

        csrfToken = res.data.csrfToken;
        log("[CSRF] stored in memory:", csrfToken);

        return csrfToken;
    } catch (err) {
        log("API - CSRF token load failed", err);
        throw err;
    }
};

const getCsrfToken = () => { return csrfToken; };


API.interceptors.request.use((config) => {
    const token = getAccessToken();
    log("inter req");

    if (token) {
        log(token)
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if HTTP request is considered to require CSRF TOKEN,
    // GET is considered safe (as its read only)
    log("METHOD:", config.method);
    log("URL:", config.url);

    const method = config.method?.toLowerCase();
    const needsCsrf = ["post", "put", "patch", "delete"].includes(method);
    
    const csrfExemptRoutes = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
        "/csrf-token"
    ];

    const isExempt = csrfExemptRoutes.some(route =>
        config.url?.includes(route)
    );
    log("is exempt", isExempt);
    log("csrf token", csrfToken);
    log("needs csrf", needsCsrf);

    if (needsCsrf && !isExempt) {
        if (csrfToken) {
            log("inside if");
            config.headers["X-CSRF-Token"] = csrfToken;
        } else {
            log("API - CSRF was needed but token does not exist");
        }
    }

    log("config to be returned", config);
    return config;
});

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        log("inter res");
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
                log("[AUTH] refresh failed -> logout");
                setAccessToken(null);
                store.dispatch(logout());

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(err);
    }
);

export default API;