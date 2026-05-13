import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../src/components/ProtectedRoute";
import { useSelector } from "react-redux";

vi.mock("react-redux", () => ({
  useSelector: vi.fn()
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("shows loading state when loading = true", () => {
    useSelector.mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useSelector.mockReturnValue({
      isAuthenticated: false,
      loading: false
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Redirected to /login")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useSelector.mockReturnValue({
      isAuthenticated: true,
      loading: false
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
  });
});
