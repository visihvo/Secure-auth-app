import { createSlice } from "@reduxjs/toolkit";

import { log } from "../utils/logger";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true
    },
    reducers: {
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
        logout(state) {
            state.user= null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        authChecked(state) {
            state.loading = false;
        }
    }
});

export const { setUser, logout, authChecked } = authSlice.actions;
export default authSlice.reducer;