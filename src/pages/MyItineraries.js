import React, { useEffect, useState } from "react";
import moment from "moment-timezone";

const MyItinerariesPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [editedItinerary, setEditedItinerary] = useState({ title: "", timezone: "UTC", items: [] });
  const timezones = moment.tz.names();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/my-itineraries/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Unexpected response from server: " + text.substring(0, 100));
      }

      const data = await response.json();
      setItineraries(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/delete-itinerary/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (response.ok) {
        setItineraries((prev) => prev.filter((item) => item.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete itinerary.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting.");
    }
  };

  const handleEditClick = (itinerary) => {
    setEditingItinerary(itinerary);
    setEditedItinerary({
      title: itinerary.title,
      timezone: itinerary.timezone || "UTC",
      items: itinerary.items.map((item) => ({ ...item }))
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editedItinerary.items];
    updatedItems[index][field] = value;
    setEditedItinerary({ ...editedItinerary, items: updatedItems });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/update-itinerary/${editingItinerary.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          title: editedItinerary.title,
          timezone: editedItinerary.timezone,
          items: editedItinerary.items,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItineraries((prev) => prev.map((item) => item.id === updated.id ? updated : item));
        setEditingItinerary(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update itinerary.");
      }
    } catch (err) {
      console.error("Edit error:", err);
      alert("Something went wrong while updating.");
    }
  };

  const formatTime = (date, time, timezone) => {
    const datetime = moment.tz(`${date} ${time}`, timezone || "UTC");
    const userTime = datetime.clone().local().format("ddd, MMM D · h:mm A z");
    const destTime = datetime.format("ddd, MMM D · h:mm A z");
    return { userTime, destTime };
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>My Itineraries</h2>

      {loading && <p>Loading itineraries...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && itineraries.length === 0 && (
        <p style={{ textAlign: "center" }}>You haven't created any itineraries yet.</p>
      )}

      <div style={gridStyle}>
        {itineraries.map((itinerary) => (
          <div key={itinerary.id} style={cardStyle}>
            <h3>{itinerary.title}</h3>
            <p><em>Created on: {itinerary.created_at}</em></p>
            <ul>
              {itinerary.items.map((item, index) => {
                const { userTime, destTime } = formatTime(item.date, item.time, itinerary.timezone);
                return (
                  <li key={index}>
                    <strong>{item.date}</strong> {item.time && `@ ${item.time}`}<br />
                    {item.location} — {item.activity}<br />
                    <small><em>Your Time: {userTime}</em></small><br />
                    <small><em>{itinerary.timezone} Time: {destTime}</em></small><br />
                    {item.notes && (
                      <small><em>Notes: {item.notes}</em></small>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => handleDelete(itinerary.id)} style={deleteBtnStyle}>Delete Itinerary</button>
            <button onClick={() => handleEditClick(itinerary)} style={editBtnStyle}>Edit Itinerary</button>
          </div>
        ))}
      </div>

      {editingItinerary && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h3>Edit Itinerary</h3>
            <input
              type="text"
              value={editedItinerary.title}
              onChange={(e) => setEditedItinerary({ ...editedItinerary, title: e.target.value })}
              style={{ padding: '10px', width: '100%', borderRadius: '6px', marginBottom: '15px' }}
            />
            <select
              value={editedItinerary.timezone}
              onChange={(e) => setEditedItinerary({ ...editedItinerary, timezone: e.target.value })}
              style={{ padding: '10px', width: '100%', borderRadius: '6px', marginBottom: '15px' }}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            {editedItinerary.items.map((item, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <input
                  type="date"
                  value={item.date || ''}
                  onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                  style={{ marginBottom: '5px', width: '100%' }}
                />
                <input
                  type="time"
                  value={item.time || ''}
                  onChange={(e) => handleItemChange(index, 'time', e.target.value)}
                  style={{ marginBottom: '5px', width: '100%' }}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={item.location || ''}
                  onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                  style={{ marginBottom: '5px', width: '100%' }}
                />
                <input
                  type="text"
                  placeholder="Activity"
                  value={item.activity || ''}
                  onChange={(e) => handleItemChange(index, 'activity', e.target.value)}
                  style={{ marginBottom: '5px', width: '100%' }}
                />
                <textarea
                  placeholder="Notes"
                  value={item.notes || ''}
                  onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
            <button onClick={handleEditSubmit} style={{ ...editBtnStyle, marginRight: '10px' }}>Save</button>
            <button onClick={() => setEditingItinerary(null)} style={deleteBtnStyle}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = {
  padding: "40px",
  maxWidth: "1400px",
  margin: "0 auto",
  color: "#fff",
};

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "30px",
};

const cardStyle = {
  backgroundColor: "#2c3e50",
  borderRadius: "10px",
  padding: "20px",
  width: "300px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const deleteBtnStyle = {
  marginTop: "15px",
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
};

const editBtnStyle = {
  marginTop: "10px",
  backgroundColor: "#3498db",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "10px",
  maxWidth: "500px",
  width: "100%",
  color: "#000",
  overflowY: "auto",
  maxHeight: "90vh"
};

export default MyItinerariesPage;
