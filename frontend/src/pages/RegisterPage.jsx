import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";

import { registerUser, checkUserAvailability } from "../services/authService";
import { registerSchema } from "../utils/registerSchema";
import { log } from "../utils/logger";

/**
 * RegisterPage component
 * 
 * Handles user registration form UI and user 
 * registration calls
 * 
 * Security:
 * - Performs client side input validation (Formik + Yup)
 * - Checks username/email availability before submission
 * - Secure rules for user inputs
 * - Sends registration request to backend
 * - (Backend sanitizes and uses parametrized query)
 */
function RegisterPage() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            password2: ""
        },

        // Validation rules in utils/registerSchema.js
        validationSchema: registerSchema,

        /**
         * Flow:
         * 1. Normalize input (trim + lowercase)
         * 2. Check username/email availability
         * 3. Send registration request
         * 4a. Succesful registration -> redirects to login
         * 4b. Registration fail -> Generic error
         */
        onSubmit: async (values, { setErrors, setSubmitting }) => {
            try {
                const username = values.username.trim().toLowerCase();
                const email = values.email.trim().toLowerCase();

                // Availability pre-check
                const res = await checkUserAvailability(username, email);
                log(res);

                // Username or email already taken
                if (res.usernameExists || res.emailExists) {
                    setErrors({
                        general : "Username or email already in use"
                    });
                    return;
                }

                // Send final registration
                await registerUser(
                    {
                    username,
                    email,
                    password: values.password
                    }
                );

                navigate("/login");
            } catch(err) {
                log(err);
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
}

export default RegisterPage;