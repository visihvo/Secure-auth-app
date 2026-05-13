import { describe, it, expect } from "vitest";
import authReducer, { setUser, logout, authChecked } from "../src/redux/authSlice";

describe("authSlice", () => {
    const initialState = {
        user: null,
        isAuthenticated: false,
        loading: true
    };

    it("returns initial state when passed an empty action", () => {
        const result = authReducer(undefined, { type: "" });
        expect(result).toEqual(initialState);
    });

    it("setUser sets user, marks authenticated, and stops loading", () => {
        const action = setUser({ username: "vili" });

        const result = authReducer(initialState, action);

        expect(result).toEqual({
            user: { username: "vili" },
            isAuthenticated: true,
            loading: false
        });
    });

    it("logout clears user, marks unauthenticated, and stops loading", () => {
        const loggedInState = {
            user: { username: "vili" },
            isAuthenticated: true,
            loading: false
        };

        const result = authReducer(loggedInState, logout());

        expect(result).toEqual({
            user: null,
            isAuthenticated: false,
            loading: false
        });
    });

    it("authChecked sets loading to false but keeps other state", () => {
        const state = {
            user: null,
            isAuthenticated: false,
            loading: true
        };

        const result = authReducer(state, authChecked());

        expect(result).toEqual({
            user: null,
            isAuthenticated: false,
            loading: false
        });
    });
});
