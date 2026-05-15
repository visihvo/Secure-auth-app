import axios from "axios";
import store from "../redux/store";
import { logout, setUser } from "../redux/authSlice";
import { log } from "../utils/logger";

/**
 * Main API client used for authenticated requests
 */
const API = axios.create({
    baseURL: "/api",
    withCredentials: true
});

/**
 * Separate client used for CSRF token fetching
 */
const csrfClient = axios.create({
    baseURL: "/api",
    withCredentials: true
});

// In-memory tokens
let accessToken = null;
let csrfToken = null;

// Set and get current access token
export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

/**
 * Manually set CSRF token (usually from server response)
 */
export const setCsrfToken = (token) => {
    csrfToken = token;
};

/**
 * Fetch CSRF token from backend and store it in memory
 * @returns CSRF token
 * @throws CSRF token fetch error
 */
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

// Internal CSRF token getter used in interceptor
const getCsrfToken = () => { return csrfToken; };

/**
 * Request interceptor
 * Runs before every outgoing API client request
 */
API.interceptors.request.use((config) => {
    const token = getAccessToken();
    log("inter req");

    // Attach Authorization header if access token exists
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
    
    // Routes that don't require CSRF
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

    // Attach CSRF token if required for the REQ and its endpoint
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

/**
 * Response interceptor
 * Handles global API errors eg. token expiration
 */
API.interceptors.response.use(
    (res) => res,
    async (err) => {
        log("inter res");
        const originalRequest = err.config;

        // If 401 = unauthorized, attempt token refresh once
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt refresh
                const res = await API.post("/auth/refresh");

                const newToken = res.data.accessToken;
                setAccessToken(newToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = 
                    `Bearer ${newToken}`;

                return API(originalRequest);

            } catch (refreshError) {
                // If refresh fails -> force logout
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