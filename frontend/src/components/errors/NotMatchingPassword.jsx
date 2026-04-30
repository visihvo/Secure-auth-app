function NotMatchingPassword() {
    return(
        <div style={{border: "1px solid black", width: "fit-content"}}>
            <p style={{margin: "2px"}}>
                Entered passwords do not match. Try again.
            </p>
        </div>
    )
}

export default NotMatchingPassword;