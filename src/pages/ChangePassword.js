import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    const API_BASE_URL = process.env.REACT_APP_API_URL || "https://soloquest.onrender.com";

    try {
      const accessToken = localStorage.getItem("access");

      const response = await fetch(`${API_BASE_URL}/api/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Password changed successfully!");
        setTimeout(() => navigate("/profile"), 2000);
      } else {
        setError(data.error || "An error occurred while changing the password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordFieldStyle = {
    padding: "12px",
    fontSize: "1.1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
  };

  const wrapperStyle = {
    position: "relative",
    width: "100%",
  };

  const iconStyle = {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#555",
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Change Password</h2>
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginBottom: "10px" }}>{success}</p>}

      <form
        onSubmit={handleChangePassword}
        style={{ maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* Current Password */}
        <div style={wrapperStyle}>
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={passwordFieldStyle}
          />
          <span onClick={() => setShowCurrent((prev) => !prev)} style={iconStyle}>
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* New Password */}
        <div style={wrapperStyle}>
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={passwordFieldStyle}
          />
          <span onClick={() => setShowNew((prev) => !prev)} style={iconStyle}>
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm New Password */}
        <div style={wrapperStyle}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={passwordFieldStyle}
          />
          <span onClick={() => setShowConfirm((prev) => !prev)} style={iconStyle}>
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#3498db",
            color: "white",
            padding: "12px",
            fontSize: "1.1rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>

      <button
        onClick={() => navigate("/profile")}
        style={{
          marginTop: "15px",
          backgroundColor: "#ff4d4d",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Back to Profile
      </button>
    </div>
  );
};

export default ChangePasswordPage;
