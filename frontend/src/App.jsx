import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout, authChecked } from "./redux/authSlice";

import { getProfile } from "./services/authService"
import { loadCsrfToken, setAccessToken } from "./services/api";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("[APP] init CSRF start");

        loadCsrfToken()
            .then(() => {
                console.log("[APP] CSRF ready");
            })
            .catch(err => {
                console.log("[APP] CSRF failed", err);
            });

    }, []);

    useEffect(() => {
        dispatch(logout());     
        dispatch(authChecked());    
        setLoading(false);
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