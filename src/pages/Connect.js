import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://soloquest.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ConnectTravelers = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [requestsReceived, setRequestsReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchFriends(),
      fetchRequests()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error.response?.data || error.message);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/my_friends/`, {
        headers: getAuthHeaders(),
      });
      setFriends(response.data);
    } catch (error) {
      console.error("❌ Error fetching friends:", error.response?.data || error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/friend-requests/`, {
        headers: getAuthHeaders(),
      });
      const userId = loggedInUser?.id;
      const sent = response.data.filter(req => req.sender.id === userId && req.status === "pending");
      const received = response.data.filter(req => req.receiver.id === userId && req.status === "pending");
      setRequestsSent(sent);
      setRequestsReceived(received);
    } catch (error) {
      console.error("❌ Error fetching friend requests:", error.response?.data || error.message);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      if (loggedInUser?.id === receiverId) return;

      await axios.post(`${API_BASE_URL}/api/send-friend-request/${receiverId}/`, {}, {
        headers: getAuthHeaders(),
      });
      fetchRequests();
      setSuccessMessage("Request sent!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error sending friend request:", error.response?.data || error.message);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/accept-friend-request/${requestId}/`, {}, {
        headers: getAuthHeaders(),
      });
      fetchFriends();
      fetchRequests();
      setSuccessMessage("Friend request accepted!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error accepting friend request:", error.response?.data || error.message);
    }
  };

  const deleteFriendRequest = async (requestId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-friend-request/${requestId}/`, {
        headers: getAuthHeaders(),
      });
      fetchRequests();
    } catch (error) {
      console.error("❌ Error deleting friend request:", error.response?.data || error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.id !== loggedInUser?.id &&
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading travelers...</p>;

  return (
    <div style={styles.container}>
      <h2>Connect with Travelers</h2>

      <div style={styles.tabs}>
        <button style={activeTab === "users" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("users")}>All Users</button>
        <button style={activeTab === "requests-sent" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("requests-sent")}>Sent Requests {requestsSent.length > 0 && <span style={styles.badge}>{requestsSent.length}</span>}</button>
        <button style={activeTab === "requests-received" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("requests-received")}>Received Requests {requestsReceived.length > 0 && <span style={styles.badge}>{requestsReceived.length}</span>}</button>
        <button style={activeTab === "friends" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("friends")}>Friends {friends.length > 0 && <span style={styles.badge}>{friends.length}</span>}</button>
      </div>

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

      {activeTab === "users" && (
        <>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <ul style={styles.list}>
            {filteredUsers.map(user => (
              <li key={user.id} style={styles.userCard}>
                {user.first_name} {user.last_name} ({user.email})
                <div>
                  <button onClick={() => sendFriendRequest(user.id)} style={styles.button}>Add Friend</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === "requests-sent" && (
        <ul style={styles.list}>
          {requestsSent.map(request => (
            <li key={request.id} style={styles.userCard}>
              {request.receiver.first_name} {request.receiver.last_name} ({request.receiver.email})
              <div>
                <span style={styles.pendingLabel}>Pending</span>
                <button onClick={() => deleteFriendRequest(request.id)} style={styles.deleteButton}>Cancel Request</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {activeTab === "requests-received" && (
        <ul style={styles.list}>
          {requestsReceived.map(request => (
            <li key={request.id} style={styles.userCard}>
              {request.sender.first_name} {request.sender.last_name} ({request.sender.email})
              <div>
                <button onClick={() => acceptFriendRequest(request.id)} style={styles.button}>Accept</button>
                <button onClick={() => deleteFriendRequest(request.id)} style={styles.deleteButton}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {activeTab === "friends" && (
        <ul style={styles.list}>
          {friends.map(friend => (
            <li key={friend.id} style={styles.userCard}>
              {friend.first_name} {friend.last_name} ({friend.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px" },
  tabs: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  tab: { padding: "10px", cursor: "pointer", background: "#444", color: "white", border: "none", borderRadius: "5px" },
  activeTab: { padding: "10px", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "5px" },
  badge: { backgroundColor: "#dc3545", color: "white", padding: "2px 8px", borderRadius: "50%", fontSize: "0.8rem", marginLeft: "8px" },
  list: { listStyleType: "none", padding: 0 },
  userCard: { padding: "10px", borderBottom: "1px solid #ccc", marginBottom: "10px" },
  button: { background: "#007bff", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  deleteButton: { background: "#dc3545", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  pendingLabel: { background: "#6c757d", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "5px", marginRight: "5px" },
  searchInput: { padding: "10px", marginBottom: "20px", width: "60%", borderRadius: "5px", border: "1px solid #ccc" },
  successMessage: { backgroundColor: "#28a745", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "15px" }
};

export default ConnectTravelers;
