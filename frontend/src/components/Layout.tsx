import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '1rem',
  };

  return (
    <div style={layoutStyle}>
      <Navbar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
