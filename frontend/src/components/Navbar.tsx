import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: '#1f2937', // 다크 모드 배경
    borderBottom: '1px solid #374151',
  };

  const linkStyle = {
    margin: '0 1rem',
    textDecoration: 'none',
    color: '#d1d5db', // 기본 텍스트 색상
    fontWeight: 'bold',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'background-color 0.3s, color 0.3s',
  };

  const activeLinkStyle = {
    backgroundColor: '#4f46e5', // 활성 링크 배경
    color: '#ffffff', // 활성 링크 텍스트
  };

  return (
    <nav style={navStyle}>
      <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
        전략 빌더
      </NavLink>
      <NavLink to="/strategies" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
        전략 관리
      </NavLink>
      <NavLink to="/dashboard" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
        대시보드
      </NavLink>
      <NavLink to="/trading" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
        매매 관리
      </NavLink>
    </nav>
  );
};

export default Navbar;
