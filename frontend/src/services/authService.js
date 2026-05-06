import API from "./api";

export const getCsrfToken = async() => {
    const res = await API.get("/csrf-token");
    return res.data.csrfToken;
};

export const registerUser = (data, csrfToken) => {
    return API.post("/auth/register", data, {
        headers: {
            "CSRF-Token": csrfToken
        },
        withCredentials: true
    });
};

export const loginUser = async(data, csrfToken) => {
    try {
        const res = await API.post("/auth/login", data, {
            headers: { "CSRF-Token": csrfToken }
        });
        return res.data;
    } catch (err) {
        if (err.response?.status === 400) {
            throw new Error("Invalid credentials");
        }
        throw err;
    }
};

export const checkUserAvailability = (username, email) => {
    return API.get("/auth/check-user", {
        params: { username, email }
    });
};

export const getProfile = () => {
    return API.get("/user/profile");
};

export const logOutUser = () => {
    return API.post("/auth/logout");
};