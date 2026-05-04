import { useMemo, useState } from 'react';

export default function MaintenanceLogModal({
  open = false,
  onClose,
  productionLines = [],
  logs = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const allMachines = useMemo(() => {
    if (!productionLines.length) {
      return [
        { id: 1, name: 'Filling Machine #A1', lineId: 1, lineName: 'Filling Machine A' },
        { id: 2, name: 'Capping Machine #A2', lineId: 1, lineName: 'Filling Machine A' },
        { id: 7, name: 'Labeling Machine #B3', lineId: 2, lineName: 'Filling Machine B' },
      ];
    }

    return productionLines.flatMap((l) =>
      (l.machines || []).map((m) => ({
        ...m,
        lineId: l.id,
        lineName: l.name,
      }))
    );
  }, [productionLines]);

  const [filterMachine, setFilterMachine] = useState('all');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    machineId: allMachines[0]?.id || 1,
    title: '',
    technician: '',
    status: 'planned',
    notes: '',
  });

  if (!open) return null;

  const selectedMachine = allMachines.find((m) => m.id === Number(form.machineId));

  const filteredLogs =
    filterMachine === 'all'
      ? logs
      : logs.filter((l) => l.machineId === Number(filterMachine));

  const machineName = (machineId) =>
    allMachines.find((m) => m.id === machineId)?.name || `#${machineId}`;

  const lineName = (lineId) =>
    allMachines.find((m) => m.lineId === lineId)?.lineName || `Line ${lineId}`;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const entry = {
      date: form.date,
      lineId: selectedMachine?.lineId || 1,
      machineId: Number(form.machineId),
      title: form.title.trim(),
      technician: form.technician.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    await onCreate?.(entry);

    setForm((prev) => ({
      ...prev,
      title: '',
      technician: '',
      notes: '',
    }));
  };

  const markCompleted = async (id) => {
    await onUpdate?.(id, { status: 'completed' });
  };

  const removeLog = async (id) => {
    await onDelete?.(id);
  };

  const statusClass = (s) =>
    s === 'completed' ? 'good'
      : s === 'in-progress' ? 'warn'
        : 'ghost';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet pretty maint-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qd-hero">
          <div className="qd-hero-left">
            <div className="qd-circle">
              <i className="fas fa-tools" />
            </div>
            <div>
              <h3 className="qd-title">Maintenance Log</h3>
              <div className="qd-sub">Admin maintenance entries (backend-ready UI shell)</div>
            </div>
          </div>
          <div className="qd-hero-right">
            <button className="btn small" onClick={onClose} type="button">
              <i className="fas fa-times" /> Close
            </button>
          </div>
        </div>

        <div className="maint-grid">
          {/* Left: Add form */}
          <form className="maint-form" onSubmit={onSubmit}>
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />

            <label>Machine</label>
            <select
              value={form.machineId}
              onChange={(e) => setForm((f) => ({ ...f, machineId: Number(e.target.value) }))}
            >
              {allMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.lineName}
                </option>
              ))}
            </select>

            <label>Title</label>
            <input
              type="text"
              placeholder="Bearing lubrication / Sensor calibration..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />

            <label>Technician</label>
            <input
              type="text"
              placeholder="e.g., Alex"
              value={form.technician}
              onChange={(e) => setForm((f) => ({ ...f, technician: e.target.value }))}
            />

            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <label>Notes</label>
            <textarea
              rows={4}
              placeholder="Details, parts replaced, measurements..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />

            <button className="btn" type="submit">
              <i className="fas fa-plus-circle" /> Add Entry
            </button>
          </form>

          {/* Right: Logs */}
          <div className="maint-list-wrap">
            <div className="maint-filter-row">
              <label>Filter</label>
              <select
                value={filterMachine}
                onChange={(e) => setFilterMachine(e.target.value)}
              >
                <option value="all">All machines</option>
                {allMachines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="maint-list">
              {loading && <div className="maint-empty">Loading maintenance logs...</div>}

              {!loading && !filteredLogs.length && (
                <div className="maint-empty">No maintenance entries yet.</div>
              )}

              {filteredLogs.map((log) => (
                <div key={log.id} className="maint-item-card">
                  <div className="maint-item-head">
                    <div>
                      <div className="maint-item-title">{log.title}</div>
                      <div className="maint-item-meta">
                        {log.date} • {machineName(log.machineId)} • {lineName(log.lineId)}
                      </div>
                    </div>

                    <div className="maint-item-actions">
                      <span className={`mini-pill ${statusClass(log.status)}`}>
                        {log.status}
                      </span>

                      <button
                        className="icon-btn-lite"
                        title="Mark completed"
                        onClick={() => markCompleted(log.id)}
                        type="button"
                      >
                        <i className="fas fa-check-circle" />
                      </button>

                      <button
                        className="icon-btn-lite"
                        title="Delete"
                        onClick={() => removeLog(log.id)}
                        type="button"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>

                  {!!log.technician && (
                    <div className="maint-line">
                      <strong>Technician:</strong> {log.technician}
                    </div>
                  )}

                  {!!log.notes && (
                    <div className="maint-line">
                      <strong>Notes:</strong> {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}