import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/services/api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn()
    },
    loadCsrfToken: vi.fn(),
    setAccessToken: vi.fn()
}));

describe("authService", () => {
    let API;
    let loadCsrfToken;
    let setAccessToken;

    let registerUser;
    let loginUser;
    let checkUserAvailability;
    let getProfile;
    let logOutUser;
    let getCsrfToken;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        const apiModule = await import("../src/services/api");

        API = apiModule.default;
        loadCsrfToken = apiModule.loadCsrfToken;
        setAccessToken = apiModule.setAccessToken;

        const authService = await import("../src/services/authService");

        registerUser = authService.registerUser;
        loginUser = authService.loginUser;
        checkUserAvailability = authService.checkUserAvailability;
        getProfile = authService.getProfile;
        logOutUser = authService.logOutUser;
        getCsrfToken = authService.getCsrfToken;
    });

    describe("registerUser", () => {
        it("registers user successfully", async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        id: 1,
                        username: "john"
                    }
                }
            };

            API.post.mockResolvedValue(mockResponse);

            const result = await registerUser({
                username: "john",
                password: "123"
            });

            expect(API.post).toHaveBeenCalledWith(
                "/auth/register",
                {
                    username: "john",
                    password: "123"
                },
                {
                    withCredentials: true
                }
            );

            expect(result).toEqual({
                id: 1,
                username: "john"
            });
        });

        it("throws when registration fails", async () => {
            API.post.mockResolvedValue({
                data: {
                    success: false,
                    error: "Registration failed"
                }
            });

            await expect(
                registerUser({})
            ).rejects.toThrow("Registration failed");
        });
    });

    describe("loginUser", () => {
        it("logs in user successfully", async () => {
            const mockUser = {
                accessToken: "abc123",
                user: {
                    id: 1,
                    username: "john"
                }
            };

            API.post.mockResolvedValue({
                data: {
                    success: true,
                    data: mockUser
                }
            });

            const result = await loginUser({
                email: "john@test.com",
                password: "123"
            });

            expect(API.post).toHaveBeenCalledWith(
                "/auth/login",
                {
                    email: "john@test.com",
                    password: "123"
                },
                {
                    withCredentials: true
                }
            );

            expect(setAccessToken)
                .toHaveBeenCalledWith("abc123");

            expect(loadCsrfToken)
                .toHaveBeenCalled();

            expect(result).toEqual(mockUser);
        });

        it("throws when login fails", async () => {
            API.post.mockResolvedValue({
                data: {
                    success: false,
                    error: "Invalid credentials"
                }
            });

            await expect(
                loginUser({})
            ).rejects.toThrow("Invalid credentials");

            expect(setAccessToken).not.toHaveBeenCalled();
            expect(loadCsrfToken).not.toHaveBeenCalled();
        });
    });

    describe("checkUserAvailability", () => {
        it("checks username/email availability", async () => {
            API.get.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        usernameAvailable: true,
                        emailAvailable: false
                    }
                }
            });

            const result = await checkUserAvailability(
                "john",
                "john@test.com"
            );

            expect(API.get).toHaveBeenCalledWith(
                "/auth/check-user",
                {
                    params: {
                        username: "john",
                        email: "john@test.com"
                    }
                }
            );

            expect(result).toEqual({
                usernameAvailable: true,
                emailAvailable: false
            });
        });
    });

    describe("getProfile", () => {
        it("gets user profile", async () => {
            API.get.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        id: 1,
                        username: "john"
                    }
                }
            });

            const result = await getProfile();

            expect(API.get).toHaveBeenCalledWith(
                "/user/profile"
            );

            expect(result).toEqual({
                id: 1,
                username: "john"
            });
        });
    });

    describe("logOutUser", () => {
        it("logs out user", async () => {
            API.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        message: "Logged out"
                    }
                }
            });

            const result = await logOutUser();

            expect(API.post).toHaveBeenCalledWith(
                "/auth/logout"
            );

            expect(result).toEqual({
                message: "Logged out"
            });
        });
    });

    describe("getCsrfToken", () => {
        it("gets csrf token", async () => {
            API.get.mockResolvedValue({
                data: {
                    csrfToken: "csrf123"
                }
            });

            const result = await getCsrfToken();

            expect(API.get).toHaveBeenCalledWith(
                "/csrf-token"
            );

            expect(result).toBe("csrf123");
        });
    });

    describe("unwrap error handling", () => {
        it("uses default error message", async () => {
            API.get.mockResolvedValue({
                data: {
                    success: false
                }
            });

            await expect(
                getProfile()
            ).rejects.toThrow("Request failed");
        });
    });
});