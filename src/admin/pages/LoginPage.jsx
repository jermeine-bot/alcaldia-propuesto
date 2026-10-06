import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { LogIn, Key, Mail } from 'lucide-react';
import { apiService } from '../../services/apiService';
import '../css/admin.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    apiService.logout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor ingresa tu correo y contraseña.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.login(email, password);
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso.',
        timer: 1500,
        showConfirmButton: false
      });
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: err.message || 'Credenciales incorrectas.',
        confirmButtonColor: '#B22222'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Capa de fondo con imagen institucional y efecto oscuro difuminado */}
      <div className="admin-login-bg-overlay"></div>

      <div className="admin-login-card position-relative z-1 shadow-lg">
        <div className="text-center mb-4">
          <img
            src="/img/nav_logo/leon2d.png"
            alt="Alcaldía de León"
            className="admin-login-logo mb-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/hero-bg.jpg';
            }}
            style={{ maxHeight: '80px', width: 'auto' }}
          />
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.4rem' }}>
            Alcaldía Municipal de León
          </h2>
          <p className="text-muted small">Panel Administrativo de Control Institucional</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small text-muted">Correo Electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="ejemplo@alcaldaleon.gob.ni"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small text-muted">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Key size={18} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-admin-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 text-center border-top">
          <a href="/" className="text-decoration-none small text-muted">
            &larr; Volver al Portal Ciudadano
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;