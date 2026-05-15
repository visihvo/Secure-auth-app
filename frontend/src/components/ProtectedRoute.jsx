import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { log } from "../utils/logger";

/**
 * ProtectedRoute component
 * 
 * Protects frontend routes that require authentication
 * Acts as a client side access control layer
 * 
 * Security:
 * - Reads authentication state from Redux store
 * - Prevents UI rendering if user is not authenticated
 * - Redirects unauthenticated users to login
 * @param {React.ReactNode} children 
 * @returns Either protected content or redirect to login page
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useSelector(state => state.auth);

    log("[PROTECTED] auth state:", isAuthenticated, loading);

    if (loading) {
        return <p>Loading...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
}

export default ProtectedRoute;