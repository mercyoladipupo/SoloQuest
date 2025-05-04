import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
  });

  const [csrfToken, setCsrfToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch("https://soloquest.onrender.com/api/get-csrf-token/", {
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const token = data.csrftoken;

        if (token) setCsrfToken(token);
        else console.error("CSRF token not found in response.");
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCSRFToken();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!csrfToken) {
      alert("CSRF token not yet available. Please try again.");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    if (formData.profilePicture) {
      formDataToSend.append("profile_picture", formData.profilePicture);
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || "https://soloquest.onrender.com";
      const response = await fetch(`${API_BASE_URL}/api/signup/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
        },
        body: formDataToSend,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect to dashboard (NO reload needed)
        navigate("/dashboard", { state: { user: data.user } });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "An error occurred during sign-up.");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Sign Up</h2>
      <p style={{ fontSize: "2rem" }}>
        Create an account to join the SoloQuest community!
      </p>
      {csrfToken && (
        <>
          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {Object.keys(errors).length > 0 && (
              <div style={{ color: "red" }}>
                {Object.values(errors).map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              onChange={handleChange}
              required
              style={{ fontSize: "1.1rem", padding: "16px" }}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              onChange={handleChange}
              required
              style={{ fontSize: "1.1rem", padding: "16px" }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              style={{ fontSize: "1.1rem", padding: "16px" }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              style={{ fontSize: "1.1rem", padding: "16px" }}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
              style={{ fontSize: "1.1rem", padding: "16px" }}
            />
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleChange}
              style={{ fontSize: "1.1rem" }}
            />
            <button
              type="submit"
              disabled={loading || !csrfToken}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "16px",
                fontSize: "1.2rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p style={{ marginTop: "25px", fontSize: "2rem" }}>
            Already a member?{" "}
            <a href="/signin" style={{ color: "#007bff", textDecoration: "underline" }}>
              Sign in here
            </a>
          </p>
        </>
      )}
      {!csrfToken && <p>Loading signup form...</p>}
    </div>
  );
};

export default SignUpPage;
