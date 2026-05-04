import { useMemo, useState } from 'react';

export default function ManageUsersModal({
  open = false,
  onClose,
  users = [],
  lines = [],
  onCreate,
  onUpdate,
  onDelete,
  onToggleMachineAccess,
}) {
  const [tab, setTab] = useState('create'); // create | manage
  const [showPass] = useState(false);

  const allMachines = useMemo(
    () => lines.flatMap((l) => l.machines || []),
    [lines]
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'operator',
    active: true,
    password: '',
    confirm: '',
  });

  if (!open) return null;

  const passTooShort = (form.password || '').length < 6;
  const passMismatch = form.password !== form.confirm;

  const canSubmit =
    Boolean(form.name.trim() && form.email.trim() && form.role) &&
    !passTooShort &&
    !passMismatch &&
    form.password.length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onCreate?.({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      active: form.active,
      password: form.password,
    });

    setForm({
      name: '',
      email: '',
      role: 'operator',
      active: true,
      password: '',
      confirm: '',
    });
    setTab('manage');
  };

  const sliderY = tab === 'create' ? 0 : 48;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet pretty users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="users-shell">
          {/* Left rail */}
          <div className="users-rail">
            <span className="users-rail-slider" style={{ transform: `translateY(${sliderY}px)` }} />
            <button
              type="button"
              className={`users-rail-btn ${tab === 'create' ? 'active' : ''}`}
              onClick={() => setTab('create')}
            >
              <i className="fas fa-user-plus" />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              className={`users-rail-btn ${tab === 'manage' ? 'active' : ''}`}
              onClick={() => setTab('manage')}
            >
              <i className="fas fa-users" />
              <span>Manage Users</span>
            </button>
          </div>

          {/* Right content */}
          <div className="users-content">
            <div className="users-header">
              <div className="users-title">
                <i className="fas fa-users-cog" />
                <span>Users &amp; Access</span>
              </div>
              <button className="icon-btn-lite" onClick={onClose} aria-label="Close" type="button">
                <i className="fas fa-times" />
              </button>
            </div>

            {tab === 'create' ? (
              <div className="users-create-wrap">
                <form className="users-form" onSubmit={submit}>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Staff"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="staff@abc.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />

                  <label>Type of account</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>

                  <label>Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Set a password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    autoComplete="new-password"
                  />

                  <label>Confirm password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                    autoComplete="new-password"
                  />

                  {(form.password || form.confirm) && (
                    <div className={`users-validation ${passMismatch || passTooShort ? 'bad' : 'good'}`}>
                      {passMismatch
                        ? 'Passwords do not match.'
                        : passTooShort
                        ? 'Password must be at least 6 characters.'
                        : 'Password looks good.'}
                    </div>
                  )}

                  <div className="users-switch-row">
                    <span>Active</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      />
                      <span />
                    </label>
                  </div>

                  <button className="btn" type="submit" disabled={!canSubmit}>
                    <i className="fas fa-user-plus" /> Create New Account
                  </button>
                </form>
              </div>
            ) : (
              <div className="users-list">
                {!users.length && (
                  <div className="users-empty">
                    <i className="fas fa-user-friends" />
                    <p>No users found yet.</p>
                  </div>
                )}

                {users.map((u) => (
                  <div key={u.id} className="users-card">
                    <div className="users-card-head">
                      <div className="users-avatar">
                        {(u.name || '?')
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>

                      <div className="users-meta">
                        <div className="users-name">{u.name}</div>
                        <div className="users-email">{u.email}</div>
                      </div>

                      <div className="users-actions">
                        <div className="users-inline-switch">
                          <span>Active</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={u.active !== false}
                              onChange={(e) => onUpdate?.(u.id, { active: e.target.checked })}
                            />
                            <span />
                          </label>
                        </div>

                        <button
                          className="icon-btn-lite"
                          onClick={() => onDelete?.(u.id)}
                          title="Delete user"
                          type="button"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>

                    <div className="users-field-row">
                      <div className="users-field-label">Role</div>
                      <select
                        value={u.role}
                        onChange={(e) => onUpdate?.(u.id, { role: e.target.value })}
                      >
                        <option value="operator">Operator</option>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="users-field-row">
                      <div className="users-field-label">Machine Access</div>
                      <div className="users-chips">
                        {allMachines.map((m) => {
                          const has = (u.accessibleMachines || []).includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              className={`users-chip ${has ? 'on' : 'off'}`}
                              onClick={() => onToggleMachineAccess?.(u.id, m.id)}
                              title={m.name}
                            >
                              {m.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}