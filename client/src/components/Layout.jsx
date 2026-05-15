// === Layout Component ===
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, LogIn, X } from 'lucide-react';

export function Layout({ children }) {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="layout">
      <Sidebar isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu} />}
      <main className="main">
        <div className="mobile-top">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <div className="brand-mark">
              <img src="/assets/logo.jpg" alt="Заводыч" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div>
              <div className="brand-title">Заводыч</div>
            </div>
          </Link>
          {user ? (
            <Link to="/profile" className="avatar">
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--primary)' }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn primary small">
              <LogIn size={16} />
              Войти
            </Link>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}