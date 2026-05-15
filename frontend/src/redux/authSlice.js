import { createSlice } from "@reduxjs/toolkit";
import { log } from "../utils/logger";

/**
 * Auth Redux slice
 * 
 * - Stores user authentication state
 * - Tracks login/logout status
 * - Handles loading state during auth restoration
 * 
 * - Only represents UI/session state
 * - Real authentication is enforced via backend tokens
 */
const authSlice = createSlice({
    name: "auth",
    
    initialState: {
        user: null,             // Logged-in user data
        isAuthenticated: false, // User considered logged in
        loading: true           // Used during intial auth check / refresh
    },

    reducers: {

        // Sets authenticated user state after login or refresh
        setUser(state, action) {
            const data = action.payload;

            log(action, state)
            log("[REDUX] setUser fired", data);

            state.user = {
                username: data.username
            };
            
            state.isAuthenticated = true;
            state.loading = false;
        },

        // Clears authentication state on logout
        logout(state) {
            state.user= null;
            state.isAuthenticated = false;
            state.loading = false;
        },

        /**
         * Marks authentication check as complete
         * Used when app finished silent refresh attempt
         */
        authChecked(state) {
            state.loading = false;
        }
    }
});

export const { setUser, logout, authChecked } = authSlice.actions;
export default authSlice.reducer;