import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaHeart,
  FaUsers,
  FaPlus,
  FaList,
  FaPen,
  FaTrash,
  FaSignOutAlt,
} from "react-icons/fa";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        try {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser && parsedUser.first_name && parsedUser.email) {
            setUser(parsedUser);
            console.log("✅ User loaded:", parsedUser);
            setLoading(false);
          } else {
            console.warn("⚠️ Incomplete user object, redirecting...");
            localStorage.removeItem("user");
            navigate("/signin");
          }
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
          localStorage.removeItem("user");
          navigate("/signin");
        }
      } else {
        console.warn("⚠️ No user found, retrying...");
        // Retry once after a short delay in case localStorage is being written
        setTimeout(() => {
          const retryUser = localStorage.getItem("user");
          if (retryUser && retryUser !== "undefined") {
            try {
              const parsedRetryUser = JSON.parse(retryUser);
              if (parsedRetryUser?.email) {
                setUser(parsedRetryUser);
                setLoading(false);
                return;
              }
            } catch {}
          }

          navigate("/signin");
        }, 300); // Retry in 300ms
      }
    };

    checkUser();
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

  if (loading) return <p>Loading user data...</p>;
  if (!user) return null;

  return (
    <div style={containerStyle}>
      <h2>Welcome, {user.first_name} {user.last_name}!</h2>
      <p style={{ fontSize: "18px", color: "#ccc" }}>
        We’re glad to have you on <strong>SoloQuest</strong>.
      </p>

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
