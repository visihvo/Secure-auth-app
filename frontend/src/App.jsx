import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout, authChecked } from "./redux/authSlice";
import { getProfile } from "./services/authService"
import { setAccessToken } from "./services/api";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    console.log("[APP] render - loading =", loading);

    useEffect(() => {
        console.log("[APP] useEffect triggered - checking auth...");
        const checkAuth = async () => {
            try {
                const res = await getProfile();
                console.log("[AUTH] profile SUCCESS:", res.data);

                dispatch(setUser(res.data));
                console.log("[AUTH] Redux setUser dispatched");
            } catch (err) {
                console.log("[AUTH] profile FAILED");
                console.log("[AUTH] error:", err);

                dispatch(logout());
                console.log("[AUTH] Redux logout dispatched");
            } finally {
                console.log("[AUTH] finished auth check");
                dispatch(authChecked());
                setLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);

    if (loading) {
        console.log("[APP] still loading → blocking UI");
        return <p>Loading...</p>
    }

    console.log("[APP] loading finished → rendering routes");

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<LoginPage />} />

                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<LoginPage />} />

            </Routes>
        </BrowserRouter>
    )
}

export default App;