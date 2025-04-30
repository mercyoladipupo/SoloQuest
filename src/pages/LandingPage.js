import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Import your images
import japan from '../assets/japan.jpg';
import capetown from '../assets/capetown.jpg';
import zanzibar from '../assets/zanzibar.jpg';
import sydney from '../assets/sydney.jpg';
import maldives from '../assets/maldives.jpg';

const travelImages = [
    { src: japan, caption: "Fushimi Inari Shrine, Japan" },
    { src: capetown, caption: "Table Mountain, Cape Town" },
    { src: zanzibar, caption: "Nungwi Beach, Zanzibar" },
    { src: sydney, caption: "Opera House, Sydney" },
    { src: maldives, caption: "Crystal Waters, Maldives" }
  
];

const LandingPage = () => {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#1f2937', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ color: '#fff', marginTop: '1rem', textAlign: 'center', fontSize: '2.5rem' }}>Welcome to SoloQuest</h1>
        <p style={{ color: '#ddd', textAlign: 'center', marginBottom: '2rem' , fontSize: '1.25rem'}}>
          Your ultimate travel companion for solo adventures...
        </p>

        {/* 🌍 Carousel Section */}
        <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "1rem" }}>
          🌍 Dream Destinations for Your Next Solo Quest
        </h2>

        <div className="carousel-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            interval={4000}
            transitionTime={600}
          >
            {travelImages.map((img, i) => (
              <div key={i}>
                <img
                  src={img.src}
                  alt={img.caption}
                  style={{
                    height: '600px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
                <p
                  className="legend"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                    fontSize: '1.2rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    bottom: '0'
                  }}
                >
                  {img.caption}
                </p>
              </div>
            ))}
          </Carousel>

          <div style={{ textAlign: 'center' }}>
            <Link to="/signup" className="cta-button" style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#38bdf8',
              color: 'white',
              borderRadius: '999px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'background 0.3s ease'
            }}
              onMouseOver={e => e.target.style.backgroundColor = '#0ea5e9'}
              onMouseOut={e => e.target.style.backgroundColor = '#38bdf8'}
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>

      {/* 👣 Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: '#9ca3af',
        textAlign: 'center',
        padding: '1rem',
        marginTop: '0',
        fontSize: '0.9rem',
        borderTop: '1px solid #374151'
      }}>
        © Mercy Wangari Oladipupo 2024 / 2025. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
