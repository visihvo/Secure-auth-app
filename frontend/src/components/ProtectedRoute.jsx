import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const auth = useSelector(state => state.auth);

    console.log("[PROTECTED] auth state:", useSelector(s => s.auth));

    if (auth.loading) {
        return <p>Loading...</p>
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return children;
}

export default ProtectedRoute;