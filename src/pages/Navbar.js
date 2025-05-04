import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // create this next to keep it modular

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="logo">SoloQuest</div>

      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link></li>
        <li><Link to="/signin" onClick={() => setIsOpen(false)}>Sign In</Link></li>
        <li><Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link></li>
        <li><Link to="/safety" onClick={() => setIsOpen(false)}>Safety Advisories</Link></li>
        <li><Link to="/myitineraries" onClick={() => setIsOpen(false)}>My Itineraries</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
