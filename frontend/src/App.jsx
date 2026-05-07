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

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const refreshRes = await API.post("/auth/refresh");
                const newToken = refreshRes.data.accessToken;
                setAccessToken(newToken);

                await API.post("/auth/refresh");

                const profileRes = await getProfile();
                
                console.log("APP - dispatching", profileRes)
                dispatch(setUser(profileRes.data));
            } catch(err) {
                console.log("[AUTH] bootstrap failed");

                dispatch(logout());
            } finally {
                dispatch(authChecked());
                setLoading(false);
            }
        };

        bootstrapAuth();
    }, [dispatch]);    

    if (loading) {
        return <p>Loading...</p>
    }

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