import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

const mockDispatch = vi.fn();

vi.mock("../src/redux/store", () => ({
    default: {
        dispatch: mockDispatch
    }
}));

vi.mock("../src/redux/authSlice", () => ({
    logout: vi.fn(() => ({ type: "auth/logout" })),
    setUser: vi.fn()
}));

vi.mock("../src/utils/logger", () => ({
    log: vi.fn()
}));

describe("api.js", () => {
    let mockAxiosInstance;
    let mockCsrfInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        mockAxiosInstance = vi.fn();

        mockAxiosInstance.interceptors = {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        };

        mockAxiosInstance.get = vi.fn();
        mockAxiosInstance.post = vi.fn();

        mockCsrfInstance = {
            get: vi.fn()
        };

        axios.create
            .mockReturnValueOnce(mockAxiosInstance)
            .mockReturnValueOnce(mockCsrfInstance);
    });

    it("setAccessToken stores token", async () => {
        const apiModule = await import("../src/services/api");
        const { setAccessToken, getAccessToken } = apiModule;

        setAccessToken("abc123");

        expect(getAccessToken()).toBe("abc123");
    });

    it("loadCsrfToken fetches and stores token", async () => {
        mockCsrfInstance.get.mockResolvedValue({
            data: { csrfToken: "csrf123" }
        });

        const apiModule = await import("../src/services/api");
        const { loadCsrfToken } = apiModule;

        const token = await loadCsrfToken();

        expect(token).toBe("csrf123");
        expect(mockCsrfInstance.get).toHaveBeenCalledWith("/csrf-token");
    });

    it("adds Authorization header when access token exists", async () => {
        let requestInterceptor;

        mockAxiosInstance.interceptors.request.use.mockImplementation((fn) => {
            requestInterceptor = fn;
        });

        const apiModule = await import("../src/services/api");
        const { setAccessToken } = apiModule;

        setAccessToken("abc123");

        const config = {
            headers: {},
            method: "get",
            url: "/user/profile"
        };

        const result = requestInterceptor(config);

        expect(result.headers.Authorization).toBe("Bearer abc123");
    });

    it("adds CSRF token for POST requests", async () => {
        let requestInterceptor;

        mockAxiosInstance.interceptors.request.use.mockImplementation((fn) => {
            requestInterceptor = fn;
        });

        mockCsrfInstance.get.mockResolvedValue({
            data: { csrfToken: "csrf123" }
        });

        const apiModule = await import("../src/services/api");
        const { loadCsrfToken } = apiModule;

        await loadCsrfToken();

        const config = {
            headers: {},
            method: "post",
            url: "/user/update"
        };

        const result = requestInterceptor(config);

        expect(result.headers["X-CSRF-Token"]).toBe("csrf123");
    });

    it("does NOT add CSRF token for exempt routes", async () => {
        let requestInterceptor;

        mockAxiosInstance.interceptors.request.use.mockImplementation((fn) => {
            requestInterceptor = fn;
        });

        await import("../src/services/api");

        const config = {
            headers: {},
            method: "post",
            url: "/auth/login"
        };

        const result = requestInterceptor(config);

        expect(result.headers["X-CSRF-Token"]).toBeUndefined();
    });

    it("retries request on 401 and refresh success", async () => {
        let responseInterceptor;

        mockAxiosInstance.interceptors.response.use.mockImplementation(
            (_, errHandler) => {
                responseInterceptor = errHandler;
            }
        );

        const apiModule = await import("../src/services/api");
        const { getAccessToken } = apiModule;

        mockAxiosInstance.post.mockResolvedValue({
            data: { accessToken: "newToken" }
        });

        mockAxiosInstance.mockResolvedValue({
            data: "ok"
        });

        const originalRequest = {
            _retry: false,
            headers: {},
            url: "/user/profile"
        };

        await responseInterceptor({
            config: originalRequest,
            response: { status: 401 }
        });

        expect(mockAxiosInstance.post)
            .toHaveBeenCalledWith("/auth/refresh");

        expect(originalRequest.headers.Authorization)
            .toBe("Bearer newToken");

        expect(getAccessToken()).toBe("newToken");
    });

    it("logs out when refresh fails", async () => {
        let responseInterceptor;

        mockAxiosInstance.interceptors.response.use.mockImplementation(
            (_, errHandler) => {
                responseInterceptor = errHandler;
            }
        );

        const { logout } = await import("../src/redux/authSlice");

        await import("../src/services/api");

        mockAxiosInstance.post.mockRejectedValue(
            new Error("refresh failed")
        );

        const originalRequest = {
            _retry: false,
            headers: {},
            url: "/user/profile"
        };

        await expect(
            responseInterceptor({
                config: originalRequest,
                response: { status: 401 }
            })
        ).rejects.toThrow("refresh failed");

        expect(mockDispatch).toHaveBeenCalledWith(logout());
    });
});