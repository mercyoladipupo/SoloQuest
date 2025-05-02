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
  const [requests, setRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
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
      fetchRequests(),
      fetchBlockedUsers(),
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
      const response = await axios.get(`${API_BASE_URL}/api/friends/`, {
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
      const filtered = response.data
        .filter(req => req.sender.id === userId || req.receiver.id === userId)
        .map(req => ({
          id: req.id,
          sender: req.sender,
          receiver: req.receiver,
        }));
      setRequests(filtered);
    } catch (error) {
      console.error("❌ Error fetching friend requests:", error.response?.data || error.message);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blocked-users/`, {
        headers: getAuthHeaders(),
      });
      setBlockedUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching blocked users:", error.response?.data || error.message);
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
    } catch (error) {
      console.error("❌ Error accepting friend request:", error.response?.data || error.message);
    }
  };

  const deleteFriendRequest = async (requestId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-friend-request/${requestId}/`, {
        headers: getAuthHeaders(),
      });
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("❌ Error deleting friend request:", error.response?.data || error.message);
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/block-user/${userId}/`, {}, {
        headers: getAuthHeaders(),
      });
      fetchBlockedUsers();
    } catch (error) {
      console.error("❌ Error blocking user:", error.response?.data || error.message);
    }
  };

  const unblockUser = async (blockedId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/unblock-user/${blockedId}/`, {}, {
        headers: getAuthHeaders(),
      });
      fetchBlockedUsers();
    } catch (error) {
      console.error("❌ Error unblocking user:", error.response?.data || error.message);
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
        <button style={activeTab === "requests" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("requests")}>Friend Requests</button>
        <button style={activeTab === "friends" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("friends")}>Friends</button>
        <button style={activeTab === "blocked" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("blocked")}>Blocked Users</button>
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
                  <button onClick={() => blockUser(user.id)} style={styles.blockButton}>Block</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === "requests" && (
        <ul style={styles.list}>
          {requests.map(request => {
            const isSender = request.sender.id === loggedInUser.id;
            const otherUser = isSender ? request.receiver : request.sender;
            return (
              <li key={request.id} style={styles.userCard}>
                {otherUser.first_name} {otherUser.last_name} ({otherUser.email})
                <div>
                  {isSender ? (
                    <>
                      <span style={styles.pendingLabel}>Pending</span>
                      <button onClick={() => deleteFriendRequest(request.id)} style={styles.deleteButton}>Cancel Request</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => acceptFriendRequest(request.id)} style={styles.button}>Accept</button>
                      <button onClick={() => deleteFriendRequest(request.id)} style={styles.deleteButton}>Delete</button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
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

      {activeTab === "blocked" && (
        <ul style={styles.list}>
          {blockedUsers.map(blocked => (
            <li key={blocked.id} style={styles.userCard}>
              {blocked.blocked.first_name} {blocked.blocked.last_name} ({blocked.blocked.email})
              <div>
                <button onClick={() => unblockUser(blocked.id)} style={styles.unblockButton}>Unblock</button>
              </div>
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
  list: { listStyleType: "none", padding: 0 },
  userCard: { padding: "10px", borderBottom: "1px solid #ccc", marginBottom: "10px" },
  button: { background: "#007bff", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  deleteButton: { background: "#dc3545", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  blockButton: { background: "#ff0000", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  unblockButton: { background: "#28a745", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "5px" },
  pendingLabel: { background: "#6c757d", color: "white", padding: "5px 10px", borderRadius: "5px", marginLeft: "5px", marginRight: "5px" },
  searchInput: { padding: "10px", marginBottom: "20px", width: "60%", borderRadius: "5px", border: "1px solid #ccc" },
  successMessage: { backgroundColor: "#28a745", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "15px" }
};

export default ConnectTravelers;
