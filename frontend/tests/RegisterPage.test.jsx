import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../src/pages/RegisterPage";

import { registerUser, checkUserAvailability } from "../src/services/authService";

vi.mock("../src/services/authService", () => ({
    registerUser: vi.fn(),
    checkUserAvailability: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function setup() {
        return render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
    }

    it("Registers with correct input", async () => {
        setup();

        checkUserAvailability.mockResolvedValue({
            usernameExists: false,
            emailExists: false
        });

        registerUser.mockResolvedValue({});

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "Vili_123" }
        });

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "TEST@MAIL.COM" }
        });

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(checkUserAvailability).toHaveBeenCalledWith(
                "vili_123",
                "test@mail.com"
            );

            expect(registerUser).toHaveBeenCalledWith({
                username: "vili_123",
                email: "test@mail.com",
                password: "StrongPass123!"
            });

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("does NOT submit when username is too short", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "ab" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Username"));

        await waitFor(() => {
            expect(screen.getByText("username must be at least 3 characters")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when username is too long", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "a".repeat(41) }
        });

        fireEvent.blur(screen.getByPlaceholderText("Username"));

        await waitFor(() => {
            expect(screen.getByText("username must be at most 40 characters")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when email is invalid", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "not-an-email" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Email"));

        await waitFor(() => {
            expect(screen.getByText("Invalid email format")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when password is too short", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "Short1!" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Password"));

        await waitFor(() => {
            expect(screen.getByText("Minimum 12 characters")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when password has no uppercase letter", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "lowercase123!" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Password"));

        await waitFor(() => {
            expect(screen.getByText("Must include uppercase")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when password has no number", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "NoNumberHere!" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Password"));

        await waitFor(() => {
            expect(screen.getByText("Must include number")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when password has no special character", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "ValidPassword123" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Password"));

        await waitFor(() => {
            expect(screen.getByText("Must include special character")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("does NOT submit when passwords do not match", async () => {
        setup();

        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "ValidPassword123!" }
        });

        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "DifferentPassword!" }
        });

        fireEvent.blur(screen.getByPlaceholderText("Repeat password"));

        await waitFor(() => {
            expect(screen.getByText("Passwords must match")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
        });
    });

    it("shows error when username already exists", async () => {
        setup();

        checkUserAvailability.mockResolvedValue({
            usernameExists: true,
            emailExists: false
        });

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "Vili_123" }
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@mail.com" }
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "StrongPass123!" }
        });
        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(screen.getByText("Username or email already in use")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it("shows error when email already exists", async () => {
        setup();

        checkUserAvailability.mockResolvedValue({
            usernameExists: false,
            emailExists: true
        });

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "Vili_123" }
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@mail.com" }
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "StrongPass123!" }
        });
        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(screen.getByText("Username or email already in use")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it("shows error when both username and email already exist", async () => {
        setup();

        checkUserAvailability.mockResolvedValue({
            usernameExists: true,
            emailExists: true
        });

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "Vili_123" }
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@mail.com" }
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "StrongPass123!" }
        });
        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(screen.getByText("Username or email already in use")).toBeInTheDocument();
            expect(registerUser).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it("shows 'Registration failed' when backend throws", async () => {
        setup();

        checkUserAvailability.mockResolvedValue({
            usernameExists: false,
            emailExists: false
        });

        registerUser.mockRejectedValue(new Error("Server error"));

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "Vili_123" }
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@mail.com" }
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "StrongPass123!" }
        });
        fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
            target: { value: "StrongPass123!" }
        });

        fireEvent.click(screen.getByText("Register"));

        await waitFor(() => {
            expect(screen.getByText("Registration failed")).toBeInTheDocument();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});