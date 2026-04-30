import { useState, useEffect } from "react";
import { registerUser, checkUserAvailability } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { validatePassword } from "../../validators/password";
import UsernameUsed from "../components/errors/UsernameUsed"
import EmailUsed from "../components/errors/EmailUsed";
import NotMatchingPassword from "../components/errors/NotMatchingPassword";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showNameError, setNameState] = useState(false);
    const [showEmailError, setEmailState] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [matchingPasswords, setMatchingPasswords] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (password.length > 0 && password2.length > 0) {
            setPasswordErrors(validatePassword(password));
            setMatchingPasswords(password === password2);
        }
    }, [password, password2]);

    const handleRegistration = async (e) => {
        e.preventDefault();

        const credentialRes = await checkUserAvailability(username, email);

        const usernameExists = credentialRes.data.usernameExists;
        const emailExists = credentialRes.data.emailExists;

        if (usernameExists || emailExists || passwordErrors.length > 0 || matchingPasswords) {
            if (usernameExists && emailExists) {
                setNameState(usernameExists);
                setEmailState(emailExists);
                console.log("Username and email alr in use");
            } else if (usernameExists) {
                setNameState(true);
                console.log("Username alr in use");
            } else if (emailExists) {
                setEmailState(true);
                console.log("Email alr in use");
            }
            if (passwordErrors.length > 0) {
                console.log(passwordErrors);
            }
            if (!matchingPasswords) {
                console.log("passwords dont match")
            }
            return;
        }

        try {            
            console.log({ usernameExists, emailExists, passwordErrors, matchingPasswords });
            await registerUser({ 
                username, 
                email,
                password
            });
            alert("Registration successful");
        } catch (err) {
            console.log(err.response?.data || err.message);
            alert("Registration failed");
        }
    };

    return (
        <form id="registration-form"onSubmit={handleRegistration} style={{ display: "flex", flexDirection: "column", gap:"2px"}}>
            <label>Username</label>
            <input
                style={{width: "fit-content"}}  
                required     
                placeholder="Username"
                onChange={(e) => {
                    setUsername(e.target.value);
                    if (showNameError) setNameState(false);
                }}
            />
            {showNameError && (
                <UsernameUsed />
            )}

            <label>Email</label>
            <input 
                style={{width: "fit-content"}}
                required
                type="email"
                placeholder="Email"
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (showEmailError) setEmailState(false);
                }}
            />
            {showEmailError && (
                <EmailUsed />
            )}


            <label>Password</label>
            <input
                style={{width: "fit-content"}} 
                required
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            
            <label>Repeat password</label>
            <input 
                style={{width: "fit-content"}}
                required
                type="password"
                placeholder="Repeat password"
                onChange={(e) => setPassword2(e.target.value)}
            />
            {!matchingPasswords && password.length > 0 && password2.length > 0 && (
                <NotMatchingPassword />
            )}


            <button type="submit" style={{width: "fit-content", marginTop: "2px"}}>Register</button>
            
            <p style={{marginTop: "2px"}}>
                Already have an account? 
                <Link to="/login">Login</Link>
            </p>
        </form>
    );
}

export default RegisterPage;