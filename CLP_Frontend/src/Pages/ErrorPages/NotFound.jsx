// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa', // Light background color
  };

  const contentStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffffff', // White background for content
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
    animation: 'fadeIn 0.6s ease-out',
  };

  const titleStyle = {
    fontSize: '6rem',
    margin: '0',
    color: '#dc3545', // Red color for title
  };

  const textStyle = {
    fontSize: '1.5rem',
    color: '#343a40', // Dark color for text
  };

  const buttonStyle = {
    backgroundColor: '#007bff', // Bootstrap primary button color
    color: '#ffffff', // White text
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3', // Darker shade on hover
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>404</h1>
        <p style={textStyle}>Page Not Found</p>
        <Link to="/" style={{ ...buttonStyle, ...buttonHoverStyle }}>Go Home</Link>
      </div>
    </div>
  );
}

export default NotFound;
