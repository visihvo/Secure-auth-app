import API from "./api";

const unwrap = (res) => {
    if (!res.data.success) {
        throw new Error(res.data.error || "Request failed");
    }
    return res.data.data;
};

export const registerUser = async (data) => {
    const res = await API.post("/auth/register", data, {
        withCredentials: true
    });

    return unwrap(res);
};

export const loginUser = async (data) => {
    const res = await API.post("/auth/login", data, {
        withCredentials: true
    });

    return unwrap(res);
};

export const checkUserAvailability = async (username, email) => {
    const res = await API.get("/auth/check-user", {
        params: { username, email }
    });

    return unwrap(res);
};

export const getProfile = async () => {
    const res = await API.get("/user/profile");
    return unwrap(res);
};

export const logOutUser = async () => {
    const res = await API.post("/auth/logout");
    return unwrap(res);
};

export const getCsrfToken = async() => {
    const res = await API.get("/csrf-token");
    console.log();
    return res.data.csrfToken;
}; 