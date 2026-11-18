import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Circle,
  Users,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'editor'
};

const SecurityAdmin = () => {
  const queryClient = useQueryClient();
  const storedUser = apiService.getCurrentUser()?.user || {};

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'users'

  const [account, setAccount] = useState({
    id: storedUser.id || '',
    name: storedUser.name || '',
    email: storedUser.email || '',
    role: storedUser.role || 'superadmin'
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

  // Estados para gestión de usuarios
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ ...emptyUserForm });
  const [showModalUserPassword, setShowModalUserPassword] = useState(false);

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
        // Manejado por apiService
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Query de usuarios para superadmin
  const isSuperadmin = account.role === 'superadmin';
  const { data: usersList = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: apiService.getUsers,
    enabled: isSuperadmin
  });

  const saveUserMutation = useMutation({
    mutationFn: apiService.saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserModal(false);
      setUserFormData({ ...emptyUserForm });
      setEditingUser(null);
      Swal.fire({
        icon: 'success',
        title: 'Usuario Guardado',
        text: 'La cuenta de usuario ha sido registrada/actualizada.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar usuario',
        text: err?.message || 'No se pudo guardar la cuenta de usuario.',
        confirmButtonColor: '#B22222'
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: apiService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Swal.fire({
        icon: 'success',
        title: 'Usuario Eliminado',
        text: 'El usuario ha sido eliminado del sistema.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.message || 'No se pudo eliminar el usuario.',
        confirmButtonColor: '#B22222'
      });
    }
  });

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

  const handleSubmitProfile = async (event) => {
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

  const handleResetProfile = () => {
    setProfile({ name: account.name, email: account.email });
    setPasswordForm({ ...emptyPasswordForm });
  };

  // Manejadores para gestión de usuarios
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ ...emptyUserForm });
    setShowModalUserPassword(false);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (userItem) => {
    setEditingUser(userItem);
    setUserFormData({
      id: userItem.id,
      name: userItem.name || '',
      email: userItem.email || '',
      password: '',
      role: userItem.role || 'editor'
    });
    setShowModalUserPassword(false);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userItem) => {
    if (userItem.id === account.id || userItem.email === account.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propia cuenta de usuario conectada actualmente.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar Usuario?',
      text: `¿Estás seguro de eliminar al usuario "${userItem.name}" (${userItem.email})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B22222',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserMutation.mutate(userItem.id);
      }
    });
  };

  const handleSubmitUserForm = (e) => {
    e.preventDefault();
    const payload = {
      name: userFormData.name.trim(),
      role: userFormData.role
    };

    if (!editingUser) {
      payload.email = userFormData.email.trim().toLowerCase();
      payload.password = userFormData.password;
      if (!payload.name || !payload.email || !payload.password) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos requeridos',
          text: 'Nombre, correo electrónico y contraseña son obligatorios.',
          confirmButtonColor: '#B22222'
        });
        return;
      }
    } else {
      payload.id = editingUser.id;
      if (userFormData.password.trim()) {
        payload.password = userFormData.password;
      }
    }

    saveUserMutation.mutate(payload);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-xl-10">
        {/* Tarjeta de Encabezado Principal */}
        <div className="admin-card mb-4">
          <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="admin-card-title d-flex align-items-center gap-2 mb-0">
              <ShieldCheck size={22} className="text-danger" />
              Seguridad, Accesos y Usuarios del CMS
            </h5>
            {isSuperadmin && (
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${activeTab === 'profile' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={14} className="me-1" /> Mi Perfil
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'users' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={14} className="me-1" /> Usuarios ({usersList.length})
                </button>
              </div>
            )}
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
        </div>

        {/* PESTAÑA 1: MI PERFIL Y CONTRASEÑA */}
        {activeTab === 'profile' && (
          <div className="row g-4">
            <div className="col-12">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h5 className="admin-card-title d-flex align-items-center gap-2">
                    <User size={20} className="text-danger" />
                    Datos de la cuenta y contraseña personal
                  </h5>
                </div>

                <form onSubmit={handleSubmitProfile}>
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
                      Contraseña actual <span className="text-danger">*</span>
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
                        onClick={() => setShowProfilePassword((v) => !v)}
                        aria-label={showProfilePassword ? 'Ocultar' : 'Mostrar'}
                      >
                        {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="form-text">
                      Requerida para confirmar cualquier cambio en tus credenciales.
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h6 className="mb-0 d-flex align-items-center gap-2 fw-semibold">
                      <KeyRound size={18} className="text-danger" />
                      Cambiar contraseña personal
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
                          onClick={() => setShowNewPassword((v) => !v)}
                          aria-label={showNewPassword ? 'Ocultar' : 'Mostrar'}
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
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordForm.newPassword && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Fortaleza de contraseña</small>
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

                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button type="submit" className="btn btn-danger d-flex align-items-center gap-2" disabled={saving}>
                      <Save size={16} />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleResetProfile}
                      disabled={saving}
                    >
                      Descartar cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: GESTIÓN DE USUARIOS DEL CMS (SUPERADMIN) */}
        {activeTab === 'users' && isSuperadmin && (
          <div className="admin-card">
            <div className="admin-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="admin-card-title mb-0 d-flex align-items-center gap-2">
                  <Users size={20} className="text-danger" />
                  Usuarios y Roles del Sistema (RBAC)
                </h5>
                <small className="text-muted">
                  Crea, edita o elimina cuentas con acceso administrativo al panel.
                </small>
              </div>
              <button
                className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2"
                onClick={handleOpenCreateUser}
              >
                <Plus size={16} /> Nuevo Usuario
              </button>
            </div>

            {loadingUsers ? (
              <div className="p-4 text-center">
                <div className="spinner-border text-danger" role="status" />
                <p className="text-muted mt-2">Cargando usuarios...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-4 text-center text-muted">No hay usuarios registrados.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table align-middle">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo Electrónico</th>
                      <th>Rol</th>
                      <th>Fecha de Registro</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => {
                      const isSelf = u.id === account.id || u.email === account.email;
                      const badgeClass = u.role === 'superadmin'
                        ? 'bg-danger text-white'
                        : u.role === 'editor'
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-white';

                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: 34, height: 34 }}
                              >
                                {(u.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{u.name}</strong>
                                {isSelf && <span className="badge bg-light text-muted ms-2">Tu cuenta</span>}
                              </div>
                            </div>
                          </td>
                          <td className="small">{u.email}</td>
                          <td>
                            <span className={`badge ${badgeClass} small`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="small text-muted">{u.created_at || '—'}</td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleOpenEditUser(u)}
                                title="Editar usuario"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isSelf}
                                title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal para Crear / Editar Usuario */}
        {showUserModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ background: 'rgba(0,0,0,0.55)', zIndex: 3000 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowUserModal(false);
            }}
          >
            <div className="bg-white rounded-3 shadow-lg w-100" style={{ maxWidth: 520 }}>
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <User size={18} className="text-danger" />
                  {editingUser ? 'Editar Cuenta de Usuario' : 'Nuevo Usuario del CMS'}
                </h5>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => setShowUserModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitUserForm} className="p-3">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nombre Completo <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Correo Electrónico <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="usuario@alcaldialeon.gob.ni"
                    disabled={Boolean(editingUser)}
                    required
                  />
                  {editingUser && (
                    <small className="text-muted">El correo electrónico no puede modificarse una vez creado.</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Rol en el CMS <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option value="editor">Editor (Puede gestionar contenidos)</option>
                    <option value="superadmin">Superadmin (Acceso total)</option>
                    <option value="visor">Visor (Solo lectura)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
                  </label>
                  <div className="input-group">
                    <input
                      type={showModalUserPassword ? 'text' : 'password'}
                      className="form-control"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData((p) => ({ ...p, password: e.target.value }))}
                      placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres (letras y números)'}
                      minLength={userFormData.password ? 8 : 0}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowModalUserPassword((v) => !v)}
                    >
                      {showModalUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <small className="text-muted">
                    {editingUser ? 'Si la dejas en blanco se conserva la contraseña actual.' : 'Mínimo 8 caracteres, con al menos una letra y un número.'}
                  </small>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-admin-primary d-flex align-items-center gap-2"
                    disabled={saveUserMutation.isPending}
                  >
                    <Save size={16} />
                    {saveUserMutation.isPending ? 'Guardando...' : 'Guardar Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
