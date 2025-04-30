import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import countryList from './countryCodes';
import { Circles } from 'react-loader-spinner';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePassword";
import Favourites from './pages/Favourites';
import AddBlog from './pages/AddBlog';
import BlogPage from './pages/BlogPage';
import ConnectTravelers from './pages/Connect';
import CreateItinerary from "./pages/CreateItinerary";
import MyItinerariesPage from './pages/MyItineraries';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [safetyData, setSafetyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showGeneralAdvisory, setShowGeneralAdvisory] = useState(true);
  const [showRegionalAdvisories, setShowRegionalAdvisories] = useState(true);
  const [showClimateInfo, setShowClimateInfo] = useState(true);
  const [showHealthInfo, setShowHealthInfo] = useState(true);
  const [favouriteMessage, setFavouriteMessage] = useState('');
  const [favourites, setFavourites] = useState([]);
  const [fallbackAdvisories, setFallbackAdvisories] = useState(null);

  useEffect(() => {
    fetch('/safety_advisories.json')
      .then(res => res.json())
      .then(data => setFallbackAdvisories(data));

    const last = localStorage.getItem('lastSafetyData');
    if (last) setSafetyData(JSON.parse(last));
  }, []);

  useEffect(() => {
    if (safetyData) {
      localStorage.setItem('lastSafetyData', JSON.stringify(safetyData));
    }
  }, [safetyData]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCountrySearchChange = (event) => setCountrySearch(event.target.value);
  const handleCountrySelect = (code) => {
    setSearchTerm(code);
    setShowCountryList(false);
  };

  const getAdvisoryColor = (state) => {
    switch (state) {
      case 1:
        return { color: 'green', label: 'Low Risk' };
      case 2:
        return { color: 'orange', label: 'Moderate Risk' };
      case 3:
        return { color: 'red', label: 'High Risk' };
      default:
        return { color: 'gray', label: 'Unknown' };
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (!searchTerm) {
      setError('Please enter a valid country code.');
      setSafetyData(null);
      return;
    }
    setLoading(true);
    setError(null);
    setSafetyData(null);

    if (!navigator.onLine && fallbackAdvisories) {
      const countryData = fallbackAdvisories[searchTerm.toUpperCase()];
      if (countryData) {
        setSafetyData({
          name: countryData.country,
          advisoryState: countryData.advisory_state,
          advisoryText: countryData.general_advisory
        });
      } else {
        setError('No fallback data found for that country code.');
      }
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await axios.get(
        `https://api.tugo.com/v1/travelsafe/countries/${searchTerm.toUpperCase()}`,
        {
          headers: { "X-Auth-API-Key": 'v22uy5a2jc576a8svsyufatn' },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      setSafetyData(response.data);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('API failed, trying fallback...');
      const countryData = fallbackAdvisories?.[searchTerm.toUpperCase()];
      if (countryData) {
        setSafetyData({
          name: countryData.country,
          advisoryState: countryData.advisory_state,
          advisoryText: countryData.general_advisory
        });
      } else {
        setError('Failed to retrieve safety data. Please check the country code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavourite = () => {
    if (!searchTerm) {
      setFavouriteMessage('Please enter a country code first.');
      setTimeout(() => setFavouriteMessage(''), 3000);
      return;
    }
    const newFavourite = searchTerm.toUpperCase();
    if (!favourites.includes(newFavourite)) {
      setFavourites([...favourites, newFavourite]);
      setFavouriteMessage(`${newFavourite} added to favourites!`);
    } else {
      setFavouriteMessage(`${newFavourite} is already a favourite.`);
    }
    setTimeout(() => setFavouriteMessage(''), 3000);
  };

  const filteredCountries = countryList.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/">Home</Link> | <Link to="/signin">Sign In</Link> | <Link to="/signup">Sign Up</Link> | <Link to="/safety-advisories">Safety Advisories</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/blogpage">Blogs</Link>
          </nav>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/add-blog" element={<AddBlog />} />
            <Route path="/blogpage" element={<BlogPage />} />
            <Route path="/connect" element={<ConnectTravelers />} />
            <Route path="/create-itinerary" element={<CreateItinerary />} />
            <Route path="/my-itineraries" element={<MyItinerariesPage />} />

            <Route path="/safety-advisories" element={
              <div>
                <h1>SoloQuest</h1>
                <p>A website by a traveller, for travellers</p>
                <p>Use the search bar below to look up the safety advisories for different countries. Please use country codes in capital letters.</p>

                <form onSubmit={handleSearchSubmit}>
                  <input type="text" placeholder="Enter country code (e.g., US, FR, IN)" value={searchTerm} onChange={handleSearchChange} />
                  <button type="submit">Search</button>
                </form>
                <button onClick={() => setShowCountryList(true)}>View Country Codes</button>
                {loading && <div className="loading-spinner"><Circles height="80" width="80" color="#4fa94d" ariaLabel="loading" /></div>}
                {safetyData && (
                  <div className="safety-data">
                    <h2>Safety Information for {safetyData.name}</h2>
                    <div className="advisory-section">
                      <h3 onClick={() => setShowGeneralAdvisory(!showGeneralAdvisory)}>
                        General Advisory {showGeneralAdvisory ? '▲' : '▼'}
                      </h3>
                      {showGeneralAdvisory && (
                        <>
                          <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong>Advisory State:</strong>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                borderRadius: '50%',
                                backgroundColor: getAdvisoryColor(safetyData.advisoryState).color,
                                animation: 'pulse 1.5s infinite'
                              }}
                              title={getAdvisoryColor(safetyData.advisoryState).label}
                            ></span>
                            {safetyData.advisoryState}
                            <span style={{ marginLeft: '5px', fontSize: '0.9em' }}>
                              ({getAdvisoryColor(safetyData.advisoryState).label})
                            </span>
                          </p>
                          <p><strong>General Advisory:</strong> {safetyData.advisoryText}</p>
                        </>
                      )}
                    </div>
                    {safetyData.advisories?.regionalAdvisories && (
                      <div className="regional-advisories-section">
                        <h3 onClick={() => setShowRegionalAdvisories(!showRegionalAdvisories)}>
                          Regional Advisories {showRegionalAdvisories ? '▲' : '▼'}
                        </h3>
                        {showRegionalAdvisories && safetyData.advisories.regionalAdvisories.map((advisory, index) => (
                          <div key={index}><p><strong>{advisory.category}:</strong> {advisory.description}</p></div>
                        ))}
                      </div>
                    )}
                    {safetyData.climate && (
                      <div className="climate-section">
                        <h3 onClick={() => setShowClimateInfo(!showClimateInfo)}>
                          Climate Information {showClimateInfo ? '▲' : '▼'}
                        </h3>
                        {showClimateInfo && safetyData.climate.climateInfo.map((climate, index) => (
                          <div key={index}><p><strong>{climate.category}:</strong> {climate.description}</p></div>
                        ))}
                      </div>
                    )}
                    {safetyData.health && (
                      <div className="health-section">
                        <h3 onClick={() => setShowHealthInfo(!showHealthInfo)}>
                          Health Information {showHealthInfo ? '▲' : '▼'}
                        </h3>
                        {showHealthInfo && safetyData.health.healthInfo.map((health, index) => (
                          <div key={index}><p><strong>{health.category}:</strong> {health.description}</p></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {error && <p className="error-message">{error}</p>}
                {showCountryList && (
                  <div className="country-list-modal">
                    <button onClick={() => setShowCountryList(false)}>Close</button>
                    <h3>Country Codes</h3>
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={handleCountrySearchChange}
                    />
                    <ul>
                      {filteredCountries.map((country) => (
                        <li key={country.code}>
                          <button onClick={() => handleCountrySelect(country.code)}>
                            {country.name} ({country.code})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            } />
          </Routes>
        </header>
      </div>
      <style>{`
          @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }

        .App-header {
          min-height: 100vh;
          background-color: #1f2937; /* dark blue-gray */
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
          padding-top: 2rem;
        }

        nav {
          margin-bottom: 2rem;
        }

      a {
        color: #61dafb;
        text-decoration: none;
        margin: 0 0.5rem;
      }

      a:hover {
        text-decoration: underline;
      }
`}</style>



    </Router>
  );
}

export default App;
