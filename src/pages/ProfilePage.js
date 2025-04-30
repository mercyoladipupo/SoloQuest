import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h2>Profile</h2>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            
            {/* Change Password Button */}
            <button
                onClick={() => navigate("/change-password")}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#f39c12",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                Change Password
            </button>

            {/* Back to Dashboard Button */}
            <button 
                onClick={() => navigate("/dashboard")} 
                style={{
                    marginTop: "20px",
                    marginLeft: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default ProfilePage;
