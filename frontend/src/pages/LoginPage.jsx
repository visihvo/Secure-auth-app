import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../services/authService";
import { setUser } from "../redux/authSlice";
import { setAccessToken } from "../services/api";
import { log } from "../utils/logger";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            log("[LOGIN] before request");
            const data = await loginUser(
                { username, password }
            );
            log("[LOGIN] response:", data);

            setAccessToken(data.accessToken);

            log("[LOGIN SUCCESS]", data);
            dispatch(setUser({ username: data.username }));


            navigate("/");

        } catch (err) {
            const status = err.response?.status;

            if (status === 400) {
                setError("Invalid credentials");
            } else {
                setError("Login failed");
            }
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>

                {error && <p>{error}</p>}

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Click here to register</Link>
                </p>
            </form>
        </div>
    );
}