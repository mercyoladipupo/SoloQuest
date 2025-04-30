import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaHeart, FaUsers, FaPlus, FaList, FaPen, FaTrash, FaSignOutAlt } from "react-icons/fa";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("✅ User loaded:", parsedUser);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        setUser(null);
      }
    } else {
      console.warn("⚠️ No user found, redirecting to sign-in...");
      navigate("/signin");
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log("🔴 Logging out...");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDelete) {
      console.log("🚨 Deleting account...");
      localStorage.removeItem("user");
      navigate("/signup");
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div style={containerStyle}>
      <h2>Welcome, {user.first_name} {user.last_name}!</h2>
      <p style={{ fontSize: "18px", color: "#ccc" }}>We’re glad to have you on <strong>SoloQuest</strong>.</p>

      <blockquote style={quoteStyle}>
        "Travel far, travel wide, and discover parts of yourself you never knew existed."
      </blockquote>

      <div style={buttonContainerStyle}>
        <button onClick={() => navigate("/profile")} style={buttonStyle("#3498db")}><FaUser /> Profile</button>
        <button onClick={() => navigate("/favourites")} style={buttonStyle("#f39c12")}><FaHeart /> Favourites</button>
        <button onClick={() => navigate("/connect")} style={buttonStyle("#2ecc71")}><FaUsers /> Connect with Travelers</button>
        <button onClick={() => navigate("/create-itinerary")} style={buttonStyle("#1abc9c")}><FaPlus /> Create Itinerary</button>
        <button onClick={() => navigate("/my-itineraries")} style={buttonStyle("#16a085")}><FaList /> My Itineraries</button>
        <button onClick={() => navigate("/add-blog")} style={buttonStyle("#8e44ad")}><FaPen /> Add Blog Post</button>
        <button onClick={handleDeleteAccount} style={buttonStyle("#e74c3c")}><FaTrash /> Delete Account</button>
        <button onClick={handleLogout} style={buttonStyle("#ff4d4d")}><FaSignOutAlt /> Logout</button>
      </div>
    </div>
  );
};

const containerStyle = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#fff",
};

const buttonContainerStyle = {
  marginTop: "40px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "20px",
};

const buttonStyle = (bgColor) => ({
  padding: "16px 32px",
  backgroundColor: bgColor,
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  border: "none",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  cursor: "pointer",
  transition: "transform 0.2s ease",
  minWidth: "200px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
});

const quoteStyle = {
  fontStyle: "italic",
  color: "#b0bec5",
  marginTop: "30px",
  marginBottom: "40px",
  fontSize: "20px",
  maxWidth: "700px",
  marginInline: "auto",
};

export default DashboardPage;
