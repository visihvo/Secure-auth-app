export function validateCredentials(credentialRes) {
    const usernameExists = credentialRes.data.usernameExists;
    const emailExists = credentialRes.data.emailExists;

    return {
        usernameExists: usernameExists,
        emailExists: emailExists
    }
}