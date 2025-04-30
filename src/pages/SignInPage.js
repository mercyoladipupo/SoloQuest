import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE_URL}/api/signin/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Sign-in successful!");
        navigate("/dashboard", { state: { user: data.user } });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "60px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Sign In</h2>
      <p style={{ fontSize: "1.25rem", marginBottom: "30px" }}>
        Sign in to your SoloQuest account
      </p>
      {errorMessage && (
        <p style={{ color: "red", fontSize: "1.1rem", marginBottom: "25px" }}>{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="email" style={{ display: "block", fontSize: "1.2rem", marginBottom: "10px" }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="password" style={{ display: "block", fontSize: "1.2rem", marginBottom: "10px" }}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "16px",
            fontSize: "1.2rem",
            width: "100%",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Sign up link */}
      <p style={{ marginTop: "25px", fontSize: "2rem" }}>
        Not a member?{" "}
        <a href="/signup" style={{ color: "#007bff", textDecoration: "underline" }}>
          Sign up here
        </a>
      </p>
    </div>
  );
};

export default SignInPage;
