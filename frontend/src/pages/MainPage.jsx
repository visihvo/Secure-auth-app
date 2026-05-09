import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useState, useEffect } from "react";
import { logOutUser } from "../services/authService";
import { setAccessToken, setCsrfToken } from "../services/api";

export default function MainPage() {
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false); 
    const [valid, setValid] = useState(true);

    const handleLogout = async () => {
        try {
            console.log("[LOGOUT] clicked");

            await logOutUser();

            console.log("[LOGOUT] request completed");

            setAccessToken(null);
            dispatch(logout());
            navigate("/login");
            console.log("logged out")
        } catch (err) {
            console.log("MAIN - Logout failed", err)

            console.log("Fallback cleanup")
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

/*import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useState, useEffect } from "react";
import { getProfile } from "../services/authService";

export default function MainPage() {
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);

    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();   
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await getProfile();
                setValid(true);
            } catch {
                setValid(false);
                navigate("/login");
            } finally {
                setLoading(false);
            }

            checkAuth();
        }
    }, []);

    if (loading) return <p>Loading</p>;

    if (!valid) return <Navigate to="/login" />

    return (
        <div>
            <p>Hello {auth.user?.username}</p>

            <button onClick={() => dispatch(logout())}>
                Logout
            </button>
        </div>
    )
}*/