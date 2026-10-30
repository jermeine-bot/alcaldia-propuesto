import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, LogOut, User, Menu, X, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/apiService';

const defaultUser = {
  name: 'Administrador General',
  email: 'admin@alcaldaleon.gob.ni',
  role: 'superadmin'
};

const AdminHeader = ({ title, toggleSidebar, isSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => apiService.getCurrentUser()?.user || defaultUser);

  useEffect(() => {
    const syncUser = () => {
      setUser(apiService.getCurrentUser()?.user || defaultUser);
    };
    window.addEventListener('alcaldia-auth-updated', syncUser);
    return () => window.removeEventListener('alcaldia-auth-updated', syncUser);
  }, []);

  const roleLabel = user.role === 'superadmin'
    ? 'SuperAdministrador'
    : user.role === 'editor'
      ? 'Editor'
      : 'Usuario';

  const handleLogout = async () => {
    await apiService.logout();
    window.location.href = '/admin/login';
  };

  return (
    <header className="admin-topbar">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="admin-header-toggle-btn d-lg-none" 
          onClick={toggleSidebar}
          aria-label="Alternar menú"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="admin-page-title">{title || 'Panel Administrativo'}</h1>
      </div>

      <div className="d-flex align-items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          title="Ver Landing Page en nueva pestaña"
        >
          <ExternalLink size={15} />
          <span className="d-none d-md-inline">Ver Sitio Público</span>
        </a>

        <div className="dropdown position-relative">
          <button
            className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center gap-2 border"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div
              className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 32, height: 32, fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              <User size={18} />
            </div>
            <div className="text-start d-none d-md-block" style={{ lineHeight: 1.2 }}>
              <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{user.name}</div>
              <small className="text-muted" style={{ fontSize: '0.72rem' }}>{roleLabel}</small>
            </div>
          </button>
          
          {dropdownOpen && (
            <ul
              className="dropdown-menu dropdown-menu-end shadow-sm show position-absolute"
              style={{ 
                top: '100%', 
                right: '0px', 
                left: 'auto',
                marginTop: '0.5rem', 
                zIndex: 1050,
                width: '220px',
                maxWidth: 'calc(100vw - 2rem)'
              }}
            >
              <li className="px-3 py-2 border-bottom">
                <div className="fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>{user.name}</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user.email}</div>
              </li>
              <li>
                <Link
                  to="/admin/seguridad"
                  className="dropdown-item d-flex align-items-center gap-2 py-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Mi seguridad</span>
                </Link>
              </li>
              <li>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 w-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;