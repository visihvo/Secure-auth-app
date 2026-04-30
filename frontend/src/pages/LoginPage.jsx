import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser, getCsrfToken } from "../services/authService";
import { setAccessToken } from "../services/api";
import { setUser } from "../redux/authSlice";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const csrf = await getCsrfToken();

            const data = await loginUser(
                { username, password },
                csrf
            );

            console.log("[LOGIN SUCCESS]", data);

            console.log("[LOGIN] dispatching setUser");
            
            setAccessToken(data.accessToken);

            dispatch(setUser(data));
            console.log("[LOGIN] dispatched setUser");

            console.log("[LOGIN] navigating to /");
            navigate("/");
            console.log("[LOGIN] navigate called");

        } catch (err) {
            console.log("[LOGIN ERROR", err);
            setError("Login - failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>

                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

/* 
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await loginUser({ username, password});

            dispatch(loginSuccess(res.data));
            navigate("/");
        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <table>
                <tbody>
                    <tr style={{textAlign: "left"}}>
                    <td>Username</td>
                    <td>Password</td>
                </tr>

                <tr>
                    <td>
                        <input 
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </td>
                    <td>
                        <input 
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </td>
                    <td>
                        <button type="submit">Login</button>
                    </td>
                </tr>
                </tbody>
            </table>

            <p>
                Don't have an account?
                <Link to="/register">Register</Link>    
            </p>
        </form>
    );
}

export default LoginPage;
*/