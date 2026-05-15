// === Sidebar Component ===
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Briefcase, Building2, Calendar, MapPin,
  User, HelpCircle, Settings, LogOut, QrCode, LogIn, UserPlus
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const publicItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/professions', icon: Briefcase, label: 'Профессии' },
    { path: '/enterprises', icon: Building2, label: 'Предприятия' },
    { path: '/map', icon: MapPin, label: 'Карта' },
  ];

  const authItems = [
    { path: '/bookings', icon: Calendar, label: 'Мои записи' },
    { path: '/help', icon: HelpCircle, label: 'Помощь' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  const enterpriseLinks = [
    { path: '/enterprise-panel', icon: Settings, label: 'Панель предприятия' },
  ];

  const adminLinks = [
    { path: '/admin', icon: Settings, label: 'Администрирование' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <img src="/assets/logo.jpg" alt="Заводыч" onError={(e) => { e.target.style.display = 'none' }} />
        </div>
        <div>
          <div className="brand-title">Заводыч</div>
          <div className="brand-sub">Профориентация</div>
        </div>
      </div>

      <nav className="nav">
        {publicItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={handleNavClick}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}

        {user && authItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={handleNavClick}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}

        {user && user.role !== 'user' && (
          <Link
            key="/qr"
            to="/qr"
            className={isActive('/qr') ? 'active' : ''}
            onClick={handleNavClick}
          >
            <QrCode />
            QR-сканер
          </Link>
        )}

        {user?.role === 'enterprise' && enterpriseLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={handleNavClick}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}

        {user?.role === 'admin' && adminLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={handleNavClick}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '8px 0' }} />

        {user ? (
          <button onClick={() => { logout(); handleNavClick(); }} className="nav-link" style={{ width: '100%', textAlign: 'left' }}>
            <LogOut />
            Выйти
          </button>
        ) : (
          <>
            <Link to="/login" className={isActive('/login') ? 'active' : ''} onClick={handleNavClick}>
              <LogIn />
              Войти
            </Link>
            <Link to="/register" className={isActive('/register') ? 'active' : ''} onClick={handleNavClick}>
              <UserPlus />
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}