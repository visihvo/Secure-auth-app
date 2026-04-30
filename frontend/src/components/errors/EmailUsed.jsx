function EmailUsed() {
    return (
        <div style={{border: "1px solid black", width: "fit-content"}}>
            <p style={{margin: "2px"}}>
                Entered email is already in use! Enter another email.
            </p>
        </div>
    )
}

export default EmailUsed;