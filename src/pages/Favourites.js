import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import countryList from "../countryCodes.js"; 

const Favourites = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedCountryCode, setSelectedCountryCode] = useState(""); 
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const token = localStorage.getItem("access");

    // ✅ Fetch user's favorite countries
    const fetchFavorites = useCallback(async () => {
        if (!token) return;

        try {
            console.log("🔍 Token being sent:", token);
            const response = await axios.get("https://soloquest.onrender.com/country-favorites/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFavorites(response.data);

            if (response.data.length > 0) {
                setSelectedCountryCode(response.data[0].country_code); // ✅ Default to first favorite
                const country = countryList.find(c => c.code === response.data[0].country_code);
                setSelectedCountryName(country ? country.name : ""); // ✅ Get full country name
            }
        } catch (error) {
            console.error("🚨 Error fetching favorites:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setSearchResults(
            countryList.filter((country) =>
                country.name.toLowerCase().includes(event.target.value.toLowerCase())
            )
        );
    };

    const handleAddFavorite = async (countryCode) => {
        if (!token) return;

        try {
            await axios.post("https://soloquest.onrender.com/favorites/add/", { country_code: countryCode }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("✅ Favorite added!");
            fetchFavorites();
        } catch (error) {
            console.error("🚨 Error adding favorite:", error);
            setMessage("Error adding favorite.");
        }
    };

    const handleRemoveFavorite = async (countryCode) => {
        if (!token) return;

        try {
            await axios.delete(`https://soloquest.onrender.com/favorites/remove/${countryCode}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("✅ Favorite removed!");
            fetchFavorites();
        } catch (error) {
            console.error("🚨 Error removing favorite:", error);
            setMessage("Error removing favorite.");
        }
    };

    // ✅ Handle dropdown change
    const handleCountryChange = (e) => {
        const code = e.target.value;
        setSelectedCountryCode(code);
        const country = countryList.find(c => c.code === code);
        setSelectedCountryName(country ? country.name : ""); // ✅ Get country name
    };

    return (
        <div style={pageStyle}>
            <h2>Your Favourite Countries</h2>
            {!token && <p style={{ color: "red" }}>⚠️ You need to sign in to view favorites.</p>}
            {favorites.length === 0 && token && <p>No favorites added yet.</p>}

            {/* Search and Add */}
            <div>
                <input type="text" placeholder="Search countries..." value={searchTerm} onChange={handleSearchChange} />
                <ul>
                    {searchResults.map((country) => (
                        <li key={country.code}>
                            {country.name}
                            <button onClick={() => handleAddFavorite(country.code)}>Add</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Display Favorites */}
            <div>
                <h3>Your Favorite Countries:</h3>
                <ul>
                    {favorites.map((fav) => (
                        <li key={fav.country_code}>
                            {fav.country_code}
                            <button onClick={() => handleRemoveFavorite(fav.country_code)}>Remove</button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ✅ Dropdown to Select Country */}
            {favorites.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <label>Select a country for bookings: </label>
                    <select
                        value={selectedCountryCode}
                        onChange={handleCountryChange}
                        style={selectStyle}
                    >
                        {favorites.map((fav) => (
                            <option key={fav.country_code} value={fav.country_code}>
                                {fav.country_code}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* ✅ Dynamic Booking Links */}
            {favorites.length > 0 && (
                <div style={buttonsContainer}>
                    <a
                        href="https://www.skyscanner.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                    >
                        ✈️ Book Flights
                    </a>
                    <a
                        href={`https://www.booking.com/search.html?ss=${encodeURIComponent(selectedCountryName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                    >
                        🏨 Book Hotels in {selectedCountryName}
                    </a>
                    <a
                        href={`https://www.getyourguide.com/s/?q=${selectedCountryName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                    >
                        🎟️ Book Activities in {selectedCountryName}
                    </a>
                    <a
                        href={`https://www.tripadvisor.com/Search?q=${encodeURIComponent(selectedCountryName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                    >
                        🍽️ Food & Hotel Reviews for {selectedCountryName}
                    </a>
                </div>
            )}

            {/* Messages */}
            {message && <p>{message}</p>}
        </div>
    );
};

// 🎨 Styles
const pageStyle = { textAlign: "center", padding: "50px" };
const selectStyle = { padding: "8px", fontSize: "16px", marginLeft: "10px", borderRadius: "4px" };
const buttonsContainer = { display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center", marginTop: "20px" };
const linkStyle = { background: "#3498db", color: "white", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "16px" };

export default Favourites;
