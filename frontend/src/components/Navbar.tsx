import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
  };

  const linkStyle: React.CSSProperties = {
    margin: '0 1rem',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
  };

  return (
    <nav style={navStyle}>
      <Link to="/strategy-management" style={linkStyle}>Strategy Management</Link>
      <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      <Link to="/analysis" style={linkStyle}>Analysis</Link>
      <Link to="/builder" style={linkStyle}>Strategy Builder</Link>
    </nav>
  );
};

export default Navbar;
