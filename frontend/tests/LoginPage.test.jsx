import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";

import LoginPage from "../src/pages/LoginPage";
import authReducer from "../src/redux/authSlice";
import { loginUser } from "../src/services/authService";

vi.mock("../src/services/authService", () => ({
    loginUser: vi.fn(),
}));

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

function renderLogin() {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        </Provider>
    );
}

describe("LoginPage", () => {
    test("renders login form", () => {
        renderLogin();

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /login/i })
        ).toBeInTheDocument();
    });

    test("logs in user successfully", async () => {
        loginUser.mockResolvedValue({
            username: "testuser",
            accessToken: "fake-token",
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: "testuser" },
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith({
                username: "testuser",
                password: "password123",
            });
        });
    });

    test("shows error on failed login", async () => {
        loginUser.mockRejectedValue({
            response: { status: 400 },
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: "wrong" },
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "wrongpass" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        expect(
            await screen.findByText(/invalid credentials/i)
        ).toBeInTheDocument();
    });
});