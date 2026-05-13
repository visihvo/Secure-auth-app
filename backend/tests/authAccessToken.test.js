const jwt = require("jsonwebtoken");
const authenticateAccessToken = require("../middleware/authAccessToken");

jest.mock("jsonwebtoken");

describe("authenticateAccessToken middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {},
            sessionID: "sess123"
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        process.env.ACCESS_SECRET = "test_secret";
        process.env.NODE_ENV = "test";
    });

    it("returns 403 if Authorization header is missing", () => {
        authenticateAccessToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing access token"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 if token format is invalid", () => {
        req.headers.authorization = "Bearer";

        authenticateAccessToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid token format"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 if jwt.verify fails", () => {
        req.headers.authorization = "Bearer badtoken";

        jwt.verify.mockImplementation(() => {
            throw new Error("invalid token");
        });

        authenticateAccessToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            "badtoken",
            "test_secret"
        );

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid access token"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next and attaches user on valid token", () => {
        req.headers.authorization = "Bearer goodtoken";

        jwt.verify.mockReturnValue({
            id: 1,
            username: "john"
        });

        authenticateAccessToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            "goodtoken",
            "test_secret"
        );

        expect(req.user).toEqual({
            id: 1,
            username: "john"
        });

        expect(next).toHaveBeenCalled();
    });

    it("extracts token correctly from Bearer header", () => {
        req.headers.authorization = "Bearer abc.def.ghi";

        jwt.verify.mockReturnValue({ id: 1 });

        authenticateAccessToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            "abc.def.ghi",
            "test_secret"
        );
    });

    it("returns 401 when header has no token part", () => {
        req.headers.authorization = "Bearer ";

        authenticateAccessToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid token format"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("attaches user and calls next on success", () => {
        req.headers.authorization = "Bearer validtoken";

        jwt.verify.mockReturnValue({
            id: 123,
            role: "user"
        });

        authenticateAccessToken(req, res, next);

        expect(req.user).toEqual({
            id: 123,
            role: "user"
        });

        expect(next).toHaveBeenCalledTimes(1);
    });
});