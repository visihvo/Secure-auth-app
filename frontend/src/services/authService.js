import API, { loadCsrfToken, setAccessToken } from "./api";
import { log } from "../utils/logger";

/**
 * Standard response unwrapping helper
 * Assumes backend returns:
 * {
 *  success: boolean,
 *  data:, any,
 *  error?: string
 * }
 * @param {Object} res Backend response
 * @returns Unwrapped response
 * @throws Request failed error if request was not successful
 */
const unwrap = (res) => {
    if (!res.data.success) {
        throw new Error(res.data.error || "Request failed");
    }
    return res.data.data;
};

/**
 * Registers a new user 
 * @param {Object} data Registration payload
 * @returns Unwrapped registered user data
 */
export const registerUser = async (data) => {
    const res = await API.post("/auth/register", data, {
        withCredentials: true
    });

    return unwrap(res);
};

/**
 * Logs in a user
 * Stores access token in memory and loads CSRF token
 * @param {Object} data Login credentials
 * @returns Authentication reponse (accessToken, user, ...)
 */
export const loginUser = async (data) => {
    const res = await API.post("/auth/login", data, {
        withCredentials: true
    });

    const unwrappedRes = unwrap(res);

    //Store access token
    log("should be access token", unwrappedRes.accessToken);
    setAccessToken(unwrappedRes.accessToken);

    log(unwrappedRes)
    // Load CSRF token after successful authentication
    await loadCsrfToken();

    return unwrappedRes;
};

/**
 * Checks whether username or email is already taken.
 * @param {*} username 
 * @param {*} email 
 * @returns Availability result
 */
export const checkUserAvailability = async (username, email) => {
    const res = await API.get("/auth/check-user", {
        params: { username, email }
    });

    return unwrap(res);
};

/**
 * Fetches the authenticated user's profile
 * @returns  User profile data
 */
export const getProfile = async () => {
    const res = await API.get("/user/profile");
    return unwrap(res);
};

/**
 * Logs out the current user
 * @returns Logout response
 */
export const logOutUser = async () => {
    log("Auth service - logging out");
    const res = await API.post("/auth/logout");
    return unwrap(res);
};

/**
 * Fetches CSRF token from backend
 * @returns CSRF token
 */
export const getCsrfToken = async() => {
    const res = await API.get("/csrf-token"); //loadCSrfToken()?
    return res.data.csrfToken;
}; 