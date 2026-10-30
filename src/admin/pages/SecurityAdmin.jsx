import React, { useState } from 'react';
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
  CheckCircle2
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
    email: storedUser.email || '',
    currentPassword: ''
  });

  const [passwordForm, setPasswordForm] = useState({ ...emptyPasswordForm });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const name = profile.name.trim();
    const email = profile.email.trim().toLowerCase();

    if (!name || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'El nombre y el correo electrónico son obligatorios.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    if (!profile.currentPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Confirma tu contraseña',
        text: 'Ingresa tu contraseña actual para guardar los cambios de la cuenta.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    if (name === account.name && email === account.email.toLowerCase()) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No modificaste el nombre ni el correo electrónico.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    try {
      setSavingProfile(true);
      const result = await apiService.updateCredentials({
        name,
        email,
        currentPassword: profile.currentPassword
      });

      setAccount((prev) => ({ ...prev, ...(result.user || {}) }));
      setProfile((prev) => ({ ...prev, name, email, currentPassword: '' }));

      Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        text: result.message || 'Tus datos de acceso se guardaron correctamente.',
        confirmButtonColor: '#B22222'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudieron guardar los datos',
        text: error.message || 'Verifica tu contraseña actual e intenta de nuevo.',
        confirmButtonColor: '#B22222'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Completa la contraseña actual, la nueva y su confirmación.',
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

    try {
      setSavingPassword(true);
      const result = await apiService.updateCredentials({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPasswordForm({ ...emptyPasswordForm });

      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: result.message || 'Tu contraseña se cambió correctamente.',
        confirmButtonColor: '#B22222'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar la contraseña',
        text: error.message || 'Verifica tu contraseña actual e intenta de nuevo.',
        confirmButtonColor: '#B22222'
      });
    } finally {
      setSavingPassword(false);
    }
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
          <div className="col-12 col-lg-6">
            <div className="admin-card h-100">
              <div className="admin-card-header">
                <h5 className="admin-card-title d-flex align-items-center gap-2">
                  <User size={20} className="text-danger" />
                  Datos de la cuenta
                </h5>
              </div>

              <form onSubmit={handleProfileSubmit} autoComplete="off">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Nombre completo</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><User size={16} /></span>
                    <input
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

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Correo electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Mail size={16} /></span>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={profile.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Contraseña actual (para confirmar)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><KeyRound size={16} /></span>
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      name="currentPassword"
                      className="form-control"
                      value={profile.currentPassword}
                      onChange={handleProfileChange}
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
                </div>

                <button type="submit" className="btn btn-danger d-flex align-items-center gap-2" disabled={savingProfile}>
                  <Save size={16} />
                  {savingProfile ? 'Guardando...' : 'Guardar datos'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="admin-card h-100">
              <div className="admin-card-header">
                <h5 className="admin-card-title d-flex align-items-center gap-2">
                  <KeyRound size={20} className="text-danger" />
                  Cambiar contraseña
                </h5>
              </div>

              <form onSubmit={handlePasswordSubmit} autoComplete="off">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small">Nueva contraseña</label>
                  <div className="input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
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

                {passwordForm.newPassword && (
                  <div className="mb-3">
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

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Confirmar nueva contraseña</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
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

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${passwordForm.newPassword.length >= 8 ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                    <CheckCircle2 size={12} className="me-1" /> 8+ caracteres
                  </span>
                  <span className={`badge ${/[A-Za-z]/.test(passwordForm.newPassword) && /\d/.test(passwordForm.newPassword) ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                    <CheckCircle2 size={12} className="me-1" /> Letras y números
                  </span>
                </div>

                <button type="submit" className="btn btn-danger d-flex align-items-center gap-2" disabled={savingPassword}>
                  <KeyRound size={16} />
                  {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
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
