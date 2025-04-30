import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

        try {
            const accessToken = localStorage.getItem("access_token");

            const response = await fetch(`${API_BASE_URL}/api/change-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Password changed successfully!");
                setTimeout(() => navigate("/profile"), 2000); // Redirect after success
            } else {
                setError(data.error || "An error occurred while changing the password.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h2>Change Password</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <form onSubmit={handleChangePassword} style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} style={{ backgroundColor: "#3498db", color: "white", padding: "10px", border: "none", cursor: "pointer" }}>
                    {loading ? "Updating..." : "Change Password"}
                </button>
            </form>

            {/* Back Button */}
            <button onClick={() => navigate("/profile")} style={{ marginTop: "15px", backgroundColor: "#ff4d4d", color: "white", padding: "10px", border: "none", cursor: "pointer" }}>
                Back to Profile
            </button>
        </div>
    );
};

export default ChangePasswordPage;
