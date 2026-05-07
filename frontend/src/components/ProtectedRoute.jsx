import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useSelector(state => state.auth);

    console.log("[PROTECTED] auth state:", isAuthenticated, loading);

    if (loading) {
        return <p>Loading...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
}

export default ProtectedRoute;