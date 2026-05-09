import axios from "axios";
import store from "../redux/store";
import { logout, setUser } from "../redux/authSlice";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // hide this?
    withCredentials: true
});

const csrfClient = axios.create({
    baseURL: "http://localhost:5000/api", 
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
        console.log("[CSRF] loading...");

        const res = await csrfClient.get("/csrf-token");
        console.log("[CSRF] response:", res.data);

        csrfToken = res.data.csrfToken;
        console.log("[CSRF] stored in memory:", csrfToken);

        return csrfToken;
    } catch (err) {
        console.log("API - CSRF token load failed", err);
        throw err;
    }
};

const getCsrfToken = () => { return csrfToken; };


API.interceptors.request.use((config) => {
    const token = getAccessToken();
    console.log("inter req");

    if (token) {
        console.log(token)
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if HTTP request is considered to require CSRF TOKEN,
    // GET is considered safe (as its read only)
    console.log("METHOD:", config.method);
    console.log("URL:", config.url);

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
    console.log("is exempt", isExempt);
    console.log("csrf token", csrfToken);
    console.log("needs csrf", needsCsrf);

    if (needsCsrf && !isExempt) {
        if (csrfToken) {
            console.log("inside if");
            config.headers["X-CSRF-Token"] = csrfToken;
        } else {
            console.log("API - CSRF was needed but token does not exist");
        }
    }

    console.log("config to be returned", config);
    return config;
});

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        console.log("inter res");
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