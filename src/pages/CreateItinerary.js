import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateItineraryPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [items, setItems] = useState([
        { date: "", time: "", location: "", activity: "", notes: "" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { date: "", time: "", location: "", activity: "", notes: "" }]);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://soloquest.onrender.com/api/itinerary/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
                body: JSON.stringify({ title, items }),
              });
              

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create itinerary.");
            }

            alert("✅ Itinerary created!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <h2 style={headingStyle}>Create a New Itinerary</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="text"
                    placeholder="Itinerary Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={inputStyle}
                />

                <h3 style={subheadingStyle}>Stops</h3>
                {items.map((item, index) => (
                    <div key={index} style={stopCard}>
                        <div style={stopFields}>
                            <input type="date" value={item.date} onChange={(e) => handleChange(index, "date", e.target.value)} required style={inputStyle} />
                            <input type="time" value={item.time} onChange={(e) => handleChange(index, "time", e.target.value)} style={inputStyle} />
                            <input type="text" placeholder="Location" value={item.location} onChange={(e) => handleChange(index, "location", e.target.value)} required style={inputStyle} />
                            <input type="text" placeholder="Activity" value={item.activity} onChange={(e) => handleChange(index, "activity", e.target.value)} style={inputStyle} />
                            <textarea placeholder="Notes" value={item.notes} onChange={(e) => handleChange(index, "notes", e.target.value)} style={textareaStyle} />
                        </div>
                        {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(index)} style={removeButton}>
                                Remove Stop
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={addItem} style={addButton}>+ Add Stop</button>

                <button type="submit" style={submitButton} disabled={loading}>
                    {loading ? "Saving..." : "Create Itinerary"}
                </button>

                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            </form>
        </div>
    );
};

// Styling
const pageStyle = {
    padding: "40px",
    maxWidth: "900px",
    margin: "auto",
    color: "#fff",
};

const headingStyle = {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "20px"
};

const subheadingStyle = {
    fontSize: "24px",
    marginBottom: "10px"
};

const formStyle = {
    backgroundColor: "#2c3e50",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
};

const inputStyle = {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc"
};

const textareaStyle = {
    ...inputStyle,
    height: "70px",
    resize: "vertical"
};

const stopCard = {
    backgroundColor: "#34495e",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};

const stopFields = {
    display: "flex",
    flexDirection: "column"
};

const addButton = {
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px"
};

const removeButton = {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    marginTop: "10px",
    cursor: "pointer",
    alignSelf: "flex-end"
};

const submitButton = {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "30px"
};

export default CreateItineraryPage;
