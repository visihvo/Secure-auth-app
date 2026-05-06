import { useState, useEffect } from "react";
import { registerUser, checkUserAvailability } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { validatePassword } from "../../validators/password";
import UsernameUsed from "../components/errors/UsernameUsed"
import EmailUsed from "../components/errors/EmailUsed";
import NotMatchingPassword from "../components/errors/NotMatchingPassword";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getCsrfToken } from "../services/authService";

const registerSchema = Yup.object({
    username: Yup.string()
    .min(3)
    .max(40)
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores")
    .required(),

    email: Yup.string()
        .email("Invalid email format")
        .required(),

    password: Yup.string()
        .min(12, "Minimum 12 characters")
        .matches(/[A-Z]/, "Must include uppercase")
        .matches(/[a-z]/, "Must include lowercase")
        .matches(/[0-9]/, "Must include number")
        .matches(/[^A-Za-z0-9]/, "Must include special character")
        .required(),

    password2: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
});

function RegisterPage() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            password2: ""
        },

        validationSchema: registerSchema,

        onSubmit: async (values, { setErrors, setSubmitting }) => {
            try {
                const username = values.username.trim().toLowerCase();
                const email = values.email.trim().toLowerCase();

                const csrf = await getCsrfToken();
                console.log(csrf);

                const res = await checkUserAvailability(username, email);

                if (res.data.usernameExists || res.data.emailExists) {
                    setErrors({
                        username: res.data.usernameExists
                            ? "Username already in use"
                            : undefined,
                        email: res.data.emailExists
                            ? "Email already in use"
                            : undefined
                    });
                    return;
                }

                await registerUser(
                    {
                    username,
                    email,
                    password: values.password
                    },
                    csrf
                );

                navigate("/login");
            } catch(err) {
                console.log(err);
                setErrors({ general: "Registration failed" });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <form id="registration-form" onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap:"2px"}}>
            <>
                <label>Username</label>
                <input
                    name="username"
                    required
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    
                    style={{width: "fit-content"}}  
                    required     
                    placeholder="Username"
                />

                {formik.touched.username && formik.errors.username && (
                    <p>{formik.errors.username}</p>
                )}
            </>
            
            <>
                <label>Email</label>
                <input 
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}

                    style={{width: "fit-content"}}
                    required
                    placeholder="Email"
                />
                
                {formik.touched.email && formik.errors.email && (
                    <p>{formik.errors.email}</p>
                )}
            </>

            <>
                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required

                    style={{width: "fit-content"}} 
                    placeholder="Password"
                />

                {formik.touched.password && formik.errors.password && (
                    <p>{formik.errors.password}</p>
                )}
            </>
            
            <>
                <label>Repeat password</label>
                <input 
                    name="password2"
                    type="password"
                    value={formik.values.password2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required

                    style={{width: "fit-content"}}
                    placeholder="Repeat password"
                />
                
                {formik.touched.password2 && formik.errors.password2 && (
                    <p>{formik.errors.password2}</p>
                )}
            </>

            <>
                {formik.errors.general && <p>{formik.errors.general}</p>}
            </>

            <button 
                type="submit" 
                disabled={formik.isSubmitting} 
                style={{width: "fit-content", marginTop: "2px"}}>
                    {formik.isSubmitting ? "Registering..." : "Register"}
            </button>
            
            <p style={{marginTop: "2px"}}>
                Already have an account?{" "}
                <Link to="/login">Click here to enter login page</Link>
            </p>
        </form>
    );

    /*
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showNameError, setNameState] = useState(false);
    const [showEmailError, setEmailState] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [matchingPasswords, setMatchingPasswords] = useState(true);
    const [formErrors, setFormErrors] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        if (password.length > 0 && password2.length > 0) {
            setPasswordErrors(validatePassword(password));
            setMatchingPasswords(password === password2);
        }
    }, [password, password2]);

    const handleRegistration = async (e) => {
        e.preventDefault();

        let credentialRes;

        try {
            credentialRes = await checkUserAvailability(username, email);
        } catch(err) {
            console.log("Availability check failed", err);
            return;
        }

        const usernameExists = credentialRes.data.usernameExists;
        const emailExists = credentialRes.data.emailExists;

        if (usernameExists || 
            emailExists || 
            passwordErrors.length > 0 || 
            !matchingPasswords) {
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
            await registerSchema.validate(
                { username, email, password, password2 },
                { abortEarly: false }
            );
        } catch (validationErr) {
            const errors = {};

            validationErr.inner.forEach((err) => {
                errors[err.path] = err.message;
            });

            setFormErrors(errors);
            console.log(validationErr.errors);
            return;
        }
    };

    /*
    return (
        <form id="registration-form"onSubmit={handleRegistration} style={{ display: "flex", flexDirection: "column", gap:"2px"}}>
            <>
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

                {formErrors.username && <p>{formErrors.username}</p>}
            </>
            
            <>
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
                
                {formErrors.email && <p>{formErrors.email}</p>}
            </>

            <>
                <label>Password</label>
                <input
                    style={{width: "fit-content"}} 
                    required
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                {formErrors.password && <p>{formErrors.password}</p>}
            </>
            
            <>
                <label>Repeat password</label>
                <input 
                    style={{width: "fit-content"}}
                    required
                    type="password"
                    placeholder="Repeat password"
                    onChange={(e) => setPassword2(e.target.value)}
                />
                
                {formErrors.password2 && <p>{formErrors.password2}</p>}
            </>

            <button type="submit" style={{width: "fit-content", marginTop: "2px"}}>Register</button>
            
            <p style={{marginTop: "2px"}}>
                Already have an account?{" "}
                <Link to="/login">Click here to enter login page</Link>
            </p>
        </form>
    ); */
}

export default RegisterPage;