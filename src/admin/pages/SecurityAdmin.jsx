import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  LockKeyhole,
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const SecurityAdmin = () => {
  const storedUser = apiService.getCurrentUser()?.user || {};

  const [account, setAccount] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    role: storedUser.role || 'admin'
  });

  const [profile, setProfile] = useState({
    name: storedUser.name || '',
    email: storedUser.email || ''
  });

  const [passwordForm, setPasswordForm] = useState({ ...emptyPasswordForm });
  const [saving, setSaving] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isActive = true;

    apiService.getMe()
      .then((user) => {
        if (!isActive || !user) return;
        setAccount((prev) => ({ ...prev, ...user }));
        setProfile((prev) => ({
          ...prev,
          name: user.name ?? prev.name,
          email: user.email ?? prev.email
        }));
      })
      .catch(() => {
        // Si el token ya no es válido, apiService limpia la sesión y redirige al login.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const roleLabel = account.role === 'superadmin'
    ? 'SuperAdministrador'
    : account.role === 'editor'
      ? 'Editor'
      : 'Usuario';

  const passwordStrength = (() => {
    const value = passwordForm.newPassword;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  })();

  const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim().toLowerCase();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!name || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'El nombre y el correo electrónico son obligatorios.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    if (!currentPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Confirma tu contraseña',
        text: 'Ingresa tu contraseña actual para guardar los cambios.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    const wantsPasswordChange = newPassword !== '' || confirmPassword !== '';

    if (wantsPasswordChange) {
      if (!newPassword || !confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Completa la nueva contraseña y su confirmación.',
          confirmButtonColor: '#B22222'
        });
        return;
      }

      if (newPassword.length < 8) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña muy corta',
          text: 'La nueva contraseña debe tener al menos 8 caracteres.',
          confirmButtonColor: '#B22222'
        });
        return;
      }

      if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña poco segura',
          text: 'La nueva contraseña debe incluir al menos una letra y un número.',
          confirmButtonColor: '#B22222'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Las contraseñas no coinciden',
          text: 'Verifica la nueva contraseña y su confirmación.',
          confirmButtonColor: '#B22222'
        });
        return;
      }

      if (newPassword === currentPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña repetida',
          text: 'La nueva contraseña debe ser diferente a la actual.',
          confirmButtonColor: '#B22222'
        });
        return;
      }
    }

    const hasProfileChanges = name !== account.name || email !== account.email.toLowerCase();

    if (!hasProfileChanges && !wantsPasswordChange) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No modificaste tus datos ni tu contraseña.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    try {
      setSaving(true);
      const payload = { name, email, currentPassword };
      if (wantsPasswordChange) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const result = await apiService.updateCredentials(payload);

      setAccount((prev) => ({ ...prev, ...(result.user || {}) }));
      setProfile({ name, email });
      setPasswordForm({ ...emptyPasswordForm });

      Swal.fire({
        icon: 'success',
        title: wantsPasswordChange ? 'Datos y contraseña actualizados' : 'Datos actualizados',
        text: wantsPasswordChange
          ? 'Tus datos y tu contraseña se guardaron correctamente.'
          : (result.message || 'Tus datos de acceso se guardaron correctamente.'),
        confirmButtonColor: '#B22222'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudieron guardar los cambios',
        text: error.message || 'Verifica tu contraseña actual e intenta de nuevo.',
        confirmButtonColor: '#B22222'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile({ name: account.name, email: account.email });
    setPasswordForm({ ...emptyPasswordForm });
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-xl-10">
        <div className="admin-card mb-4">
          <div className="admin-card-header">
            <h5 className="admin-card-title d-flex align-items-center gap-2">
              <ShieldCheck size={22} className="text-danger" />
              Seguridad y Credenciales del CMS
            </h5>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 p-1">
            <div
              className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 64, height: 64, fontSize: '1.4rem', fontWeight: 'bold' }}
            >
              {(account.name || 'A').trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="fw-bold text-dark text-truncate">{account.name || 'Administrador'}</div>
              <div className="text-muted small text-truncate">{account.email}</div>
              <span className="badge bg-danger-subtle text-danger mt-1">{roleLabel}</span>
            </div>
          </div>

          <div className="alert alert-light border d-flex align-items-start gap-2 mt-3 mb-0">
            <LockKeyhole size={18} className="text-danger mt-1 flex-shrink-0" />
            <div className="small text-muted">
              Por seguridad, cualquier cambio en tus datos de acceso requiere confirmar tu contraseña actual.
              Las contraseñas se almacenan cifradas y nunca se muestran.
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">
            <div className="admin-card">
              <div className="admin-card-header">
                <h5 className="admin-card-title d-flex align-items-center gap-2">
                  <User size={20} className="text-danger" />
                  Datos de la cuenta
                </h5>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small" htmlFor="account-name">Nombre completo</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><User size={16} /></span>
                      <input
                        id="account-name"
                        type="text"
                        name="name"
                        className="form-control"
                        value={profile.name}
                        onChange={handleProfileChange}
                        maxLength={150}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small" htmlFor="account-email">Correo electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><Mail size={16} /></span>
                      <input
                        id="account-email"
                        type="email"
                        name="email"
                        className="form-control"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold small" htmlFor="account-current-password">
                    Contraseña actual
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><KeyRound size={16} /></span>
                    <input
                      id="account-current-password"
                      type={showProfilePassword ? 'text' : 'password'}
                      name="currentPassword"
                      className="form-control"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowProfilePassword((value) => !value)}
                      aria-label={showProfilePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="form-text">
                    Necesaria para confirmar cualquier cambio en tu cuenta.
                  </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h6 className="mb-0 d-flex align-items-center gap-2 fw-semibold">
                    <KeyRound size={18} className="text-danger" />
                    Cambiar contraseña
                  </h6>
                  <span className="badge bg-light text-muted">Opcional</span>
                </div>
                <p className="small text-muted mb-3">
                  Déjalo en blanco si solo quieres actualizar tu nombre o correo.
                </p>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small" htmlFor="account-new-password">Nueva contraseña</label>
                    <div className="input-group">
                      <input
                        id="account-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        className="form-control"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword((value) => !value)}
                        aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small" htmlFor="account-confirm-password">Confirmar nueva contraseña</label>
                    <div className="input-group">
                      <input
                        id="account-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-control"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordForm.newPassword && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Seguridad de la contraseña</small>
                      <small className="fw-semibold" style={{ color: strengthColors[passwordStrength] }}>
                        {strengthLabels[passwordStrength]}
                      </small>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${(passwordStrength / 4) * 100}%`,
                          backgroundColor: strengthColors[passwordStrength]
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-3">
                  {[
                    { label: '8+ caracteres', met: passwordForm.newPassword.length >= 8 },
                    { label: 'Letras y números', met: /[A-Za-z]/.test(passwordForm.newPassword) && /\d/.test(passwordForm.newPassword) }
                  ].map(({ label, met }) => (
                    <span
                      key={label}
                      className={`badge d-inline-flex align-items-center ${met ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}
                    >
                      {met
                        ? <CheckCircle2 size={12} className="me-1" />
                        : <Circle size={12} className="me-1" />}
                      {label}
                    </span>
                  ))}
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" className="btn btn-danger d-flex align-items-center gap-2" disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    Descartar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="admin-card mt-4">
          <div className="admin-card-header">
            <h5 className="admin-card-title d-flex align-items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              Recomendaciones de seguridad
            </h5>
          </div>
          <ul className="mb-0 small text-muted ps-3">
            <li className="mb-1">Usa una contraseña única para el CMS, de al menos 8 caracteres con letras y números.</li>
            <li className="mb-1">No compartas tus credenciales por correo, mensajería ni documentos.</li>
            <li className="mb-1">Cierra sesión al terminar, especialmente en equipos compartidos.</li>
            <li>Si sospechas que alguien conoce tu contraseña, cámbiala de inmediato.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityAdmin;
