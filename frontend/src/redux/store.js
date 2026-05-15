import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

/**
 * Redux store conf
 * 
 * - Combines all app reducers
 * - Enables Redux DevTools in development
 * - Provides global state management
 */
const store = configureStore({
   reducer: {
    auth: authReducer,
   },
   devTools: true,
});

export default store;