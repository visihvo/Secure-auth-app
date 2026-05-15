import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../services/authService";
import { setUser } from "../redux/authSlice";
import { setAccessToken } from "../services/api";
import { log } from "../utils/logger";

/**
 * LoginPage component
 * 
 * Handles user authentication via username/login.
 * Communicates with backend authentication API and
 * stores resulting access token for authenticated
 * requsts.
 * 
 * Security:
 * - Credentials are sent safely over HTTPS via API
 * - Access token is stored in memory
 * - Backend enforces authentication and rate limiting
 * - Generic error messages dont leak sensitive data
 * - Refresh token handled via HTTP-only cookie
 * - Access token used for Authorization headers
 * 
 * Flow:
 * 1. User enters username and password
 * 2. Credentials are sent to backend via loginUser()
 * 3. Backend validates and returns access token + username
 * 4. Access token is stored for API requests
 * 5. Redux state is updated with authenticated user
 * 6. User is redirected to protected main page.
 * @returns Login form UI
 */
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
            const data = await loginUser( { username, password } );
            log("[LOGIN] response:", data);

            // Stores access token in memory
            setAccessToken(data.accessToken);
            
            // Store user info in redux state
            dispatch(setUser({ username: data.username }));

            // Redirect to protected main page after succesful login
            navigate("/");

        } catch (err) {
            const status = err.response?.status;

            // Error doesn't reveal whether username or password wrong
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