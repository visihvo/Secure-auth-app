import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainPage from "../src/pages/MainPage";

import { useSelector, useDispatch } from "react-redux";
import { logOutUser } from "../src/services/authService";
import { setAccessToken } from "../src/services/api";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
    useDispatch: vi.fn()
}));

vi.mock("../src/services/authService", () => ({
    logOutUser: vi.fn()
}));

vi.mock("../src/services/api", () => ({
    setAccessToken: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Navigate: ({ to }) => <div>Redirected to {to}</div>
    };
});

describe("MainPage", () => {
    let mockDispatch;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);
    });

    const renderPage = () =>
        render(
            <MemoryRouter>
                <MainPage />
            </MemoryRouter>
        );

    it("shows loading state when auth.loading = true", () => {
        useSelector.mockReturnValue({
            loading: true,
            isAuthenticated: false
        });

        renderPage();

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("redirects to /login when not authenticated", () => {
        useSelector.mockReturnValue({
            loading: false,
            isAuthenticated: false
        });

        renderPage();

        expect(screen.getByText("Redirected to /login")).toBeInTheDocument();
    });

    it("renders username when authenticated", () => {
        useSelector.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            user: { username: "vili" }
        });

        renderPage();

        expect(screen.getByText("Hello vili")).toBeInTheDocument();
    });

    it("logs out successfully and navigates to /login", async () => {
        useSelector.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            user: { username: "vili" }
        });

        logOutUser.mockResolvedValue({});

        renderPage();

        fireEvent.click(screen.getByText("Logout"));

        await waitFor(() => {
            expect(logOutUser).toHaveBeenCalled();
            expect(setAccessToken).toHaveBeenCalledWith(null);
            expect(mockDispatch).toHaveBeenCalled(); // logout()
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("handles logout failure with fallback cleanup", async () => {
        useSelector.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            user: { username: "vili" }
        });

        logOutUser.mockRejectedValue(new Error("Server error"));

        renderPage();

        fireEvent.click(screen.getByText("Logout"));

        await waitFor(() => {
            expect(logOutUser).toHaveBeenCalled();
            expect(setAccessToken).toHaveBeenCalledWith(null);
            expect(mockDispatch).toHaveBeenCalled(); // logout()
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });
});
