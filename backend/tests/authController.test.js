jest.mock("../services/authService", () => ({
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    checkUser: jest.fn()
}));

const authService = require("../services/authService");
const authController = require("../controllers/authController");

describe("authController", () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            query: {},
            cookies: {},
            sessionID: "session123",
            sessionStore: {
                destroy: jest.fn((id, cb) => cb(null))
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
            end: jest.fn()
        };
    });

    describe("register", () => {
        it("registers user successfully", async () => {
            req.body = {
                username: "john",
                password: "123"
            };

            authService.register.mockResolvedValue({
                id: 1,
                username: "john"
            });

            await authController.register(req, res);

            expect(authService.register)
                .toHaveBeenCalledWith(req.body);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: 1,
                    username: "john"
                }
            });
        });

        it("returns 400 on registration failure", async () => {
            authService.register.mockRejectedValue(
                new Error("fail")
            );

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Registration failed"
            });
        });
    });

    describe("login", () => {
        it("logs in successfully", async () => {
            req.body = {
                email: "john@test.com",
                password: "123"
            };

            authService.login.mockResolvedValue({
                accessToken: "access123",
                refreshToken: "refresh123",
                username: "john"
            });

            await authController.login(req, res);

            expect(authService.login)
                .toHaveBeenCalledWith(req.body);

            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh123",
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/"
                })
            );

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    accessToken: "access123",
                    username: "john"
                }
            });
        });

        it("returns 400 on invalid credentials", async () => {
            authService.login.mockRejectedValue(
                new Error("invalid")
            );

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Invalid credentials"
            });
        });
    });

    describe("logout", () => {
        it("returns 204 if no refresh token exists", async () => {
            req.cookies = {};

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalled();
        });

        it("logs out successfully", async () => {
            req.cookies = {
                refreshToken: "refresh123"
            };

            await authController.logout(req, res);

            expect(res.clearCookie)
                .toHaveBeenCalledWith(
                    "refreshToken",
                    expect.objectContaining({
                        sameSite: "lax",
                        path: "/"
                    })
                );

            expect(req.sessionStore.destroy)
                .toHaveBeenCalledWith(
                    "session123",
                    expect.any(Function)
                );

            expect(res.clearCookie)
                .toHaveBeenCalledWith("sid");

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    message: "Logged out"
                }
            });
        });

        it("returns 500 if session destroy fails", async () => {
            req.cookies = {
                refreshToken: "refresh123"
            };

            req.sessionStore.destroy = jest.fn((id, cb) =>
                cb(new Error("destroy failed"))
            );

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                error: "Failed to destroy session"
            });
        });
    });

    describe("refresh", () => {
        it("refreshes access token successfully", async () => {
            req.cookies = {
                refreshToken: "refresh123"
            };

            authService.refresh.mockResolvedValue("newAccess");

            await authController.refresh(req, res);

            expect(authService.refresh)
                .toHaveBeenCalledWith("refresh123");

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    accessToken: "newAccess"
                }
            });
        });

        it("returns 401 if no token exists", async () => {
            req.cookies = {};

            await authController.refresh(req, res);

            expect(res.status).toHaveBeenCalledWith(401);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "No token"
            });
        });

        it("returns 403 if refresh fails", async () => {
            req.cookies = {
                refreshToken: "badtoken"
            };

            authService.refresh.mockRejectedValue(
                new Error("invalid")
            );

            await authController.refresh(req, res);

            expect(res.status).toHaveBeenCalledWith(403);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Invalid token"
            });
        });
    });

    describe("checkUser", () => {
        it("checks user successfully", async () => {
            req.query = {
                username: "john",
                email: "john@test.com"
            };

            authService.checkUser.mockResolvedValue({
                usernameAvailable: true,
                emailAvailable: false
            });

            await authController.checkUser(req, res);

            expect(authService.checkUser)
                .toHaveBeenCalledWith(req.query);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    usernameAvailable: true,
                    emailAvailable: false
                }
            });
        });

        it("returns 500 if checkUser fails", async () => {
            authService.checkUser.mockRejectedValue(
                new Error("fail")
            );

            await authController.checkUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Request failed"
            });
        });
    });
});