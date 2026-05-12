import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useState, useEffect } from "react";
import { logOutUser } from "../services/authService";
import { setAccessToken, setCsrfToken } from "../services/api";
import { log } from "../utils/logger";

export default function MainPage() {
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false); 
    const [valid, setValid] = useState(true);

    const handleLogout = async () => {
        try {
            log("[LOGOUT] clicked");

            await logOutUser();

            log("[LOGOUT] request completed");

            setAccessToken(null);
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

    if (auth.loading) return <p>Loading...</p>;

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