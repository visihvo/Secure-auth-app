import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true
    },
    reducers: {
        setUser(state, action) {
            console.log("[REDUX] setUser fired", action.payload);
            state.user = action.payload;
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