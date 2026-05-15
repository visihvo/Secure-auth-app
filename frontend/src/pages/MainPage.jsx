import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

import { logout } from "../redux/authSlice";
import { logOutUser } from "../services/authService";
import { setAccessToken } from "../services/api";
import { log } from "../utils/logger";
import { useState } from "react";

/**
 * MainPage component (Protected view)
 * 
 * - Displays authenticated user information
 * - Handles logout flow (API + client cleanup)
 * - Ensures only authenticated users have access
 * 
 * Security:
 * - Route is protected with redux auth state
 * - Access token cleared on logout
 * - Backend session + tokens invalidation handled via API
 * @returns 
 */
export default function MainPage() {
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Currently unused
    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(true);

    /**
     * Flow:
     * 1. Call backend logout endpoint (clears tokens/session)
     * 2. Clear frontend access token
     * 3. Reset redux auth state
     * 4. Redirect to login page
     * 
     * - If backend fails, frontend state is cleared
     *   to avoid stuck states
     */
    const handleLogout = async () => {
        try {
            // Request backend logout (session and refresh token invalidations)
            await logOutUser();

            //Remove access token from API layer
            setAccessToken(null);
            //Clear redux auth state
            dispatch(logout());
            navigate("/login");
            log("logged out")
        } catch (err) {
            log("MAIN - Logout failed", err)

            log("Fallback cleanup")
            setAccessToken(null);
            dispatch(logout());
            navigate("/login");
        }
    };

    // Show loading text while authentication resolves
    if (auth.loading) return <p>Loading...</p>;

    // Redirect unauthenticated users
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const username = auth.user?.username;

    return (
        <div>
            <p>Hello {username}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}