import { useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StatusCards from './components/StatusCards';
import Alerts from './components/Alerts';
import Charts from './components/Charts';
import { useAuth } from './context/AuthContext';
import AdminQualityCards from './components/admin/AdminQualityCards';
import AdminQualityCharts from './components/admin/AdminQualityCharts';
import QualityDetailModal from './components/admin/QualityDetailModal';
import MaintenanceLogModal from './components/admin/MaintenanceLogModal';
import ManageUsersModal from './components/admin/ManageUsersModal';
import ManagerInsights from './pages/ManagerInsights';
import { getMachinesApi, createMachineApi, updateMachineApi, deleteMachineApi, getAssetsApi, getLineIdsApi } from './api/machineApi';
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  toggleMachineAccessApi,
  getMaintenanceLogsApi,
  createMaintenanceLogApi,
  updateMaintenanceLogApi,
  deleteMaintenanceLogApi,
} from './api/adminApi';
import {
  getOperatorLogsApi,
  createOperatorLogApi,
} from './api/operatorLogApi';
import { getUserDashboardApi, getAdminDashboardApi } from './api/dashboardApi';

// Machine Modal Component
function MachineModal({ open, onClose, editingMachine, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    lineName: '',
    assetId: '',
    sensorLineId: '',
    status: 'normal',
  });
  const [assets, setAssets] = useState([]);
  const [lineIds, setLineIds] = useState([]);
  const [loadingLineIds, setLoadingLineIds] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadAssets() {
      const res = await getAssetsApi();
      if (res.ok) setAssets(res.data || []);
    }

    loadAssets();

    if (editingMachine) {
      setForm({
        name: editingMachine.name || '',
        lineName: editingMachine.lineName || '',
        assetId: editingMachine.assetId || '',
        sensorLineId: editingMachine.sensorLineId || '',
        status: editingMachine.status || 'normal',
      });
    } else {
      setForm({
        name: '',
        lineName: '',
        assetId: '',
        sensorLineId: '',
        status: 'normal',
      });
    }
  }, [open, editingMachine]);

  // Load line IDs when asset ID changes
  useEffect(() => {
    async function loadLineIds() {
      if (!form.assetId) {
        setLineIds([]);
        return;
      }
      
      setLoadingLineIds(true);
      try {
        const res = await getLineIdsApi(form.assetId);
        if (res.ok) {
          setLineIds(res.data || []);
          // Clear sensorLineId if it's not in the new list
          if (form.sensorLineId && !res.data.includes(form.sensorLineId)) {
            setForm(prev => ({ ...prev, sensorLineId: '' }));
          }
        } else {
          setLineIds([]);
        }
      } catch (error) {
        console.error('Failed to load line IDs:', error);
        setLineIds([]);
      } finally {
        setLoadingLineIds(false);
      }
    }

    loadLineIds();
  }, [form.assetId]);

  const handleSubmit = async () => {
    if (!form.name || !form.lineName || !form.assetId || !form.sensorLineId) {
      onSuccess?.(null, 'Please fill in all required fields (Asset Group Name, Line Display Name, Asset ID, and Sensor Line ID)', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = editingMachine
        ? await updateMachineApi(editingMachine.id, form)
        : await createMachineApi(form);
      
      if (res.ok) {
        const successMessage = editingMachine ? 'Machine updated successfully!' : 'Machine created successfully!';
        onSuccess?.(successMessage, 'success');
        onClose();
      } else {
        onSuccess?.(null, 'Failed to ' + (editingMachine ? 'update' : 'create') + ' machine: ' + (res.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error saving machine:', error);
      onSuccess?.(null, 'Failed to ' + (editingMachine ? 'update' : 'create') + ' machine', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const safeAssets = Array.isArray(assets) ? assets : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="qd-hero">
          <div className="qd-hero-left">
            <div className="qd-circle">
              <i className="fas fa-microchip" />
            </div>
            <div>
              <h3 className="qd-title">{editingMachine ? 'Edit Machine' : 'Create Machine'}</h3>
              <div className="qd-sub">
                {editingMachine
                  ? `Update machine details for ${editingMachine.name}`
                  : 'Add a new machine to the production line'}
              </div>
            </div>
          </div>
          <div className="qd-hero-right">
            <button className="btn small" onClick={onClose}>
              <i className="fas fa-times" /> Cancel
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* ✅ Asset Group Name - moved to top */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#dbe8ff', fontWeight: '600' }}>
                Asset Group Name *
              </label>
              <input
                type="text"
                value={form.lineName}
                onChange={(e) => setForm({ ...form, lineName: e.target.value })}
                placeholder="e.g., Filling Machine A"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1b2735',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#ecf0f1'
                }}
              />
              <small style={{ color: '#9fb3c8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Groups machines in the sidebar
              </small>
            </div>

            {/* ✅ Line Display Name - moved to second position */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#dbe8ff', fontWeight: '600' }}>
                Line Display Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Filling Machine #A1"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1b2735',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#ecf0f1'
                }}
              />
              <small style={{ color: '#9fb3c8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                The name that appears on the dashboard
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#dbe8ff', fontWeight: '600' }}>
                Asset ID *
              </label>
              <select
                value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1b2735',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#ecf0f1'
                }}
              >
                <option value="">Select an asset...</option>
                {safeAssets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              <small style={{ color: '#9fb3c8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Matches the Asset ID in sensor data
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#dbe8ff', fontWeight: '600' }}>
                Sensor Line ID *
              </label>
              <select
                value={form.sensorLineId}
                onChange={(e) => setForm({ ...form, sensorLineId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1b2735',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#ecf0f1'
                }}
                disabled={!form.assetId || loadingLineIds}
              >
                <option value="">
                  {!form.assetId 
                    ? "Select an asset first..." 
                    : loadingLineIds 
                    ? "Loading lines..." 
                    : "Select line..."}
                </option>
                {lineIds.map((line) => (
                  <option key={line} value={line}>
                    {line}
                  </option>
                ))}
              </select>
              <small style={{ color: '#9fb3c8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {!form.assetId 
                  ? "Please select an Asset ID first" 
                  : lineIds.length === 0 && !loadingLineIds
                  ? "No line IDs found for this asset"
                  : "Matches the Line ID in sensor data"}
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#dbe8ff', fontWeight: '600' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1b2735',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#ecf0f1'
                }}
              >
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="non-operational">Non-operational</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn" 
              onClick={handleSubmit}
              disabled={saving || !form.name || !form.lineName || !form.assetId || !form.sensorLineId}
              style={{ 
                background: '#3498db',
                opacity: (saving || !form.name || !form.lineName || !form.assetId || !form.sensorLineId) ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : (editingMachine ? 'Update Machine' : 'Create Machine')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMachine, setActiveMachine] = useState(0);
  const [activeProductionLine, setActiveProductionLine] = useState(0);

  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [showMaintLog, setShowMaintLog] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);
  
  const [showMachines, setShowMachines] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [maintLoading, setMaintLoading] = useState(false);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [userDashboard, setUserDashboard] = useState({
    signals: null,
    charts: null,
    alerts: [],
  });
  const [adminDashboard, setAdminDashboard] = useState({
    quality: null,
    alerts: [],
  });

  const [productionLines, setProductionLines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(true);

  // Operator Logs state
  const [operatorLogs, setOperatorLogs] = useState([]);
  const [operatorAction, setOperatorAction] = useState(null);
  const [operatorMessage, setOperatorMessage] = useState("");

  // ✅ Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // ✅ Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ Show toast function
  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2500);
  }

  // Load machines from backend
  useEffect(() => {
    let ignore = false;

    async function loadMachines() {
      setMachinesLoading(true);
      try {
        const res = await getMachinesApi();
        if (!ignore && res.ok && Array.isArray(res.data)) {
          setProductionLines(res.data);
          console.log('[App] Loaded production lines:', res.data);
        } else if (!ignore) {
          console.warn('[App] Failed to load machines, using fallback data');
          setProductionLines([
            {
              id: 1,
              name: 'Filling Machine A',
              machines: [
                { id: 1, name: 'Filling Machine #A1', status: 'warning', assetId: 'Filling Machine A1', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
                { id: 2, name: 'Capping Machine #A2', status: 'normal', assetId: 'Capping Machine A2', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
                { id: 3, name: 'Labeling Machine #A3', status: 'normal', assetId: 'Labeling Machine A3', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
                { id: 4, name: 'Packaging Machine #A4', status: 'normal', assetId: 'Packaging Machine A4', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
              ],
            },
            {
              id: 2,
              name: 'Filling Machine B',
              machines: [
                { id: 5, name: 'Filling Machine #B1', status: 'normal', assetId: 'Filling Machine B1', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
                { id: 6, name: 'Capping Machine #B2', status: 'normal', assetId: 'Capping Machine B2', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
                { id: 7, name: 'Labeling Machine #B3', status: 'warning', assetId: 'Labeling Machine B3', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
                { id: 8, name: 'Packaging Machine #B4', status: 'normal', assetId: 'Packaging Machine B4', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
              ],
            },
          ]);
        }
      } catch (e) {
        console.error('[App] Failed to load machines:', e);
        setProductionLines([
          {
            id: 1,
            name: 'Filling Machine A',
            machines: [
              { id: 1, name: 'Filling Machine #A1', status: 'warning', assetId: 'Filling Machine A1', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
              { id: 2, name: 'Capping Machine #A2', status: 'normal', assetId: 'Capping Machine A2', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
              { id: 3, name: 'Labeling Machine #A3', status: 'normal', assetId: 'Labeling Machine A3', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
              { id: 4, name: 'Packaging Machine #A4', status: 'normal', assetId: 'Packaging Machine A4', sensorLineId: 'Line A', lineName: 'Filling Machine A' },
            ],
          },
          {
            id: 2,
            name: 'Filling Machine B',
            machines: [
              { id: 5, name: 'Filling Machine #B1', status: 'normal', assetId: 'Filling Machine B1', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
              { id: 6, name: 'Capping Machine #B2', status: 'normal', assetId: 'Capping Machine B2', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
              { id: 7, name: 'Labeling Machine #B3', status: 'warning', assetId: 'Labeling Machine B3', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
              { id: 8, name: 'Packaging Machine #B4', status: 'normal', assetId: 'Packaging Machine B4', sensorLineId: 'Line B', lineName: 'Filling Machine B' },
            ],
          },
        ]);
      } finally {
        if (!ignore) setMachinesLoading(false);
      }
    }

    loadMachines();

    return () => {
      ignore = true;
    };
  }, []);

  // Get current machine from loaded data
  const currentMachine = useMemo(() => {
    if (productionLines.length === 0 || machinesLoading) {
      return { name: 'Loading...', status: 'normal', sensorLineId: '' };
    }
    
    const line = productionLines[activeProductionLine];
    if (!line || !line.machines) {
      return { name: 'Select a machine', status: 'normal', sensorLineId: '' };
    }
    
    const machine = line.machines[activeMachine];
    if (!machine) {
      return { name: 'Select a machine', status: 'normal', sensorLineId: '' };
    }
    
    return {
      id: machine.id,
      name: machine.name,
      status: machine.status || 'normal',
      assetId: machine.assetId || '',
      sensorLineId: machine.sensorLineId || '',
    };
  }, [productionLines, activeProductionLine, activeMachine, machinesLoading]);

  const statusLabel =
    currentMachine.status === 'non-operational'
      ? 'Non-operational'
      : currentMachine.status === 'warning'
      ? 'Warning'
      : 'Operational';

  // ✅ Calculate selected machine for ManagerInsights
  const selectedMachine = productionLines[activeProductionLine]?.machines?.[activeMachine] || null;

  const adminLines = useMemo(() => {
    if (productionLines.length > 0) {
      return productionLines;
    }
    return [
      {
        id: 1,
        name: 'Filling Machine A',
        machines: [
          { id: 1, name: 'Filling Machine #A1' },
          { id: 2, name: 'Capping Machine #A2' },
          { id: 3, name: 'Labeling Machine #A3' },
          { id: 4, name: 'Packaging Machine #A4' },
        ],
      },
      {
        id: 2,
        name: 'Filling Machine B',
        machines: [
          { id: 5, name: 'Filling Machine #B1' },
          { id: 6, name: 'Capping Machine #B2' },
          { id: 7, name: 'Labeling Machine #B3' },
          { id: 8, name: 'Packaging Machine #B4' },
        ],
      },
    ];
  }, [productionLines]);

  // Operator Logs functions
  const loadOperatorLogs = async () => {
    if (!selectedMachine?.id) return;

    const res = await getOperatorLogsApi(selectedMachine.id);
    if (res.ok) {
      setOperatorLogs(res.data || []);
    }
  };

  const submitOperatorLog = async () => {
    if (!selectedMachine) return;

    const message =
      operatorMessage.trim() ||
      (operatorAction === "issue"
        ? "Issue reported by operator."
        : operatorAction === "note"
        ? "Operator note added."
        : "Machine marked as fixed.");

    const res = await createOperatorLogApi({
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      assetId: selectedMachine.assetId || "",
      type: operatorAction,
      message,
    });

    if (res.ok) {
      setOperatorAction(null);
      setOperatorMessage("");
      loadOperatorLogs();
      showToast(`${operatorAction === "issue" ? "Issue" : operatorAction === "note" ? "Note" : "Fix"} logged successfully`, 'success');
    } else {
      showToast('Failed to submit log', 'error');
    }
  };

  // Load operator logs when selected machine changes (only for non-admin/operators)
  useEffect(() => {
    if (!isAdmin) {
      loadOperatorLogs();
    }
  }, [selectedMachine, isAdmin]); // ✅ Added isAdmin to dependencies

  const handleOpenCreateMachine = () => {
    setEditingMachine(null);
    setShowMachines(true);
  };

  const handleOpenEditMachine = (machine) => {
    setEditingMachine(machine);
    setShowMachines(true);
  };

  // ✅ Updated delete handler - shows modal instead of confirm
  const handleDeleteMachine = (machine) => {
    setDeleteTarget(machine);
  };

  // ✅ Confirm delete function
  const confirmDeleteMachine = async () => {
    if (!deleteTarget) return;

    try {
      const res = await deleteMachineApi(deleteTarget.id);

      if (!res.ok) {
        showToast('Delete failed: ' + res.error, 'error');
        setDeleteTarget(null);
        return;
      }

      const updated = await getMachinesApi();
      if (updated.ok && Array.isArray(updated.data)) {
        setProductionLines(updated.data);
      }

      showToast('Machine deleted successfully', 'success');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete machine', 'error');
      setDeleteTarget(null);
    }
  };

  // ✅ Updated machine success handler with toast
  const handleMachineSuccess = (message, type = 'success') => {
    setEditingMachine(null);
    
    const loadMachines = async () => {
      const res = await getMachinesApi();
      if (res.ok && Array.isArray(res.data)) {
        setProductionLines(res.data);
      }
    };
    
    loadMachines();
    
    if (message) {
      showToast(message, type);
    }
  };

  // Load admin users - ✅ Already protected with isAdmin check
  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      if (!isAdmin) return; // ✅ Role check
      setUsersLoading(true);
      try {
        const res = await getUsersApi();
        if (!ignore && res.ok) {
          setAdminUsers(res.data || []);
        }
      } catch (e) {
        console.error('Failed to load users', e);
      } finally {
        if (!ignore) setUsersLoading(false);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [isAdmin]); // ✅ Depends on isAdmin

  // Load maintenance logs - ✅ Already protected with isAdmin check
  useEffect(() => {
    let ignore = false;

    async function loadMaintenanceLogs() {
      if (!isAdmin) return; // ✅ Role check
      setMaintLoading(true);
      try {
        const res = await getMaintenanceLogsApi();
        if (!ignore && res.ok) {
          setMaintenanceLogs(res.data || []);
        }
      } catch (e) {
        console.error('Failed to load maintenance logs', e);
      } finally {
        if (!ignore) setMaintLoading(false);
      }
    }

    loadMaintenanceLogs();

    return () => {
      ignore = true;
    };
  }, [isAdmin]); // ✅ Depends on isAdmin

  // Load dashboard (user/admin) + auto refresh
  useEffect(() => {
    let ignore = false;

    async function loadDashboard(showLoader = false) {
      if (showLoader) setDashboardLoading(true);

      const selectedLine = productionLines[activeProductionLine];
      const selectedMachine = selectedLine?.machines?.[activeMachine] || null;
      const assetId = selectedMachine?.assetId;
      const sensorLineId = selectedMachine?.sensorLineId;

      console.log('[App] Loading dashboard for:', { 
        lineId: activeProductionLine + 1, 
        machineId: activeMachine + 1, 
        assetId,
        sensorLineId
      });

      try {
        if (isAdmin) {
          const res = await getAdminDashboardApi({
            lineId: activeProductionLine + 1,
            machineId: activeMachine + 1,
            assetId: assetId,
            sensorLineId: sensorLineId,
          });

          if (!ignore && res.ok) {
            setAdminDashboard({
              quality: res.data?.quality || null,
              alerts: res.data?.alerts || [],
            });
          }
        } else {
          const res = await getUserDashboardApi({
            lineId: activeProductionLine + 1,
            machineId: activeMachine + 1,
            assetId: assetId,
            sensorLineId: sensorLineId,
          });

          if (!ignore && res.ok) {
            setUserDashboard({
              signals: res.data?.signals || null,
              charts: res.data?.charts || null,
              alerts: res.data?.alerts || [],
            });
          }
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        if (!ignore && showLoader) setDashboardLoading(false);
      }
    }

    loadDashboard(true);

    const interval = setInterval(() => {
      loadDashboard(false);
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAdmin, activeProductionLine, activeMachine, productionLines]);

  const handleCreateUser = async (payload) => {
    try {
      const res = await createUserApi(payload);
      if (!res.ok) return;
      setAdminUsers((prev) => [...prev, res.data]);
      showToast('User created successfully', 'success');
    } catch (e) {
      console.error('Create user failed', e);
      showToast('Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (id, patch) => {
    try {
      const res = await updateUserApi(id, patch);
      if (!res.ok) return;
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...res.data } : u))
      );
      showToast('User updated successfully', 'success');
    } catch (e) {
      console.error('Update user failed', e);
      showToast('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await deleteUserApi(id);
      if (!res.ok) return;
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted successfully', 'success');
    } catch (e) {
      console.error('Delete user failed', e);
      showToast('Failed to delete user', 'error');
    }
  };

  const handleToggleMachineAccess = async (userId, machineId) => {
    try {
      const res = await toggleMachineAccessApi(userId, machineId);
      if (!res.ok) return;
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...res.data } : u))
      );
      showToast('Machine access updated', 'success');
    } catch (e) {
      console.error('Toggle machine access failed', e);
      showToast('Failed to update machine access', 'error');
    }
  };

  const handleCreateMaintenanceLog = async (payload) => {
    try {
      const res = await createMaintenanceLogApi(payload);
      if (!res.ok) return;
      setMaintenanceLogs((prev) => [res.data, ...prev]);
      showToast('Maintenance log created', 'success');
    } catch (e) {
      console.error('Create maintenance log failed', e);
      showToast('Failed to create maintenance log', 'error');
    }
  };

  const handleUpdateMaintenanceLog = async (id, patch) => {
    try {
      const res = await updateMaintenanceLogApi(id, patch);
      if (!res.ok) return;
      setMaintenanceLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, ...res.data } : log))
      );
      showToast('Maintenance log updated', 'success');
    } catch (e) {
      console.error('Update maintenance log failed', e);
      showToast('Failed to update maintenance log', 'error');
    }
  };

  const handleDeleteMaintenanceLog = async (id) => {
    try {
      const res = await deleteMaintenanceLogApi(id);
      if (!res.ok) return;
      setMaintenanceLogs((prev) => prev.filter((log) => log.id !== id));
      showToast('Maintenance log deleted', 'success');
    } catch (e) {
      console.error('Delete maintenance log failed', e);
      showToast('Failed to delete maintenance log', 'error');
    }
  };

  const machineSignals = userDashboard.signals || {
    temperature: {
      value: 0,
      unit: '°C',
      severity: 'normal',
      label: 'Temperature',
      hint: 'Loading...',
    },
    vibration: {
      value: 0,
      unit: 'mm/s',
      severity: 'normal',
      label: 'Vibration',
      hint: 'Loading...',
    },
    pressure: {
      value: 0,
      unit: 'bar',
      severity: 'normal',
      label: 'Pressure',
      hint: 'Loading...',
    },
  };

  const chartData = userDashboard.charts || {
    temperatureSeries: [0, 0, 0, 0, 0, 0, 0],
    vibrationAxes: [0, 0, 0],
  };

  const adminQuality = adminDashboard.quality || {
    qualityStatus: 'Normal',
    defectRate: 0,
    trend: 0,
    drivers: {},
    co2History: [0, 0, 0, 0, 0],
    co2Series: [],
  };

  const alerts = isAdmin ? (adminDashboard.alerts || []) : (userDashboard.alerts || []);

  return (
    <div className="App">
      <Header
        onToggleSidebar={() => setIsSidebarOpen((s) => !s)}
        onOpenMaintLog={() => setShowMaintLog(true)}
        onOpenManageUsers={() => setShowManageUsers(true)}
      />

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="dashboard">
        <Sidebar
          productionLines={productionLines}
          activeMachine={activeMachine}
          setActiveMachine={(i) => {
            setActiveMachine(i);
            setIsSidebarOpen(false);
          }}
          activeProductionLine={activeProductionLine}
          setActiveProductionLine={(i) => {
            setActiveProductionLine(i);
            setActiveMachine(0);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCreateMachine={handleOpenCreateMachine}
          onEditMachine={handleOpenEditMachine}
          onDeleteMachine={handleDeleteMachine}
        />

        <div className="main-content">
          <Routes>
            {/* Dashboard Route */}
            <Route
              path="/"
              element={
                <>
                  <div className="card machine-header">
                    <h2>{currentMachine.name}</h2>
                    <div className="machine-status">
                      <span className={`status-indicator ${currentMachine.status}`} />
                      {statusLabel}
                    </div>
                  </div>

                  {dashboardLoading && (
                    <div className="card" style={{ color: '#dbe8ff' }}>
                      Loading dashboard data...
                    </div>
                  )}

                  {isAdmin ? (
                    adminDashboard.quality ? (
                      <>
                        <AdminQualityCards
                          qualityStatus={adminQuality.qualityStatus}
                          defectRate={adminQuality.defectRate}
                          trend={adminQuality.trend}
                          drivers={adminQuality.drivers}
                          alerts={alerts}
                          maintenanceLogs={maintenanceLogs}
                          onOpenQuality={() => setShowQualityModal(true)}
                          onOpenDefects={() => setShowDefectModal(true)}
                        />

                        <div className="chart-container">
                          <AdminQualityCharts
                            co2History={adminQuality.co2History}
                            co2Series={adminQuality.co2Series || []}
                          />
                        </div>

                        <Alerts alerts={alerts} />
                      </>
                    ) : (
                      <div className="card" style={{ color: '#dbe8ff' }}>
                        No asset is assigned to this machine yet.
                      </div>
                    )
                  ) : (
                    userDashboard.signals ? (
                      <div className="operator-dashboard">
                        <Alerts alerts={(alerts || []).slice(0, 10)} />

                        <div className={`operator-status-banner ${currentMachine.status}`}>
                          <div>
                            <span className="operator-status-label">Current Machine</span>
                            <h2>{currentMachine.name}</h2>
                          </div>

                          <strong>
                            {currentMachine.status === 'normal'
                              ? '🟢 Running Normally'
                              : currentMachine.status === 'warning'
                              ? '🟠 Check Machine'
                              : '🔴 Stop / Inspect'}
                          </strong>
                        </div>

                        <StatusCards data={machineSignals} />

                        <div className="operator-actions">
                          <button type="button" onClick={() => setOperatorAction("issue")}>
                            🔧 Log Issue
                          </button>
                          <button type="button" onClick={() => setOperatorAction("note")}>
                            📝 Add Note
                          </button>
                          <button type="button" onClick={() => setOperatorAction("fixed")}>
                            ✅ Mark Fixed
                          </button>
                        </div>

                        <div className="operator-log-list">
                          <h3>Recent Operator Logs</h3>

                          {operatorLogs.length === 0 ? (
                            <p>No logs yet.</p>
                          ) : (
                            operatorLogs.slice(0, 5).map((log) => (
                              <div key={log._id} className={`operator-log-item ${log.type}`}>
                                <strong>
                                  {log.type === "issue"
                                    ? "🔧 Issue"
                                    : log.type === "note"
                                    ? "📝 Note"
                                    : "✅ Fixed"}
                                </strong>
                                <span>{log.message}</span>
                                <small>{new Date(log.createdAt).toLocaleString()}</small>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="chart-container operator-chart">
                          <Charts
                            temperatureSeries={chartData.temperatureSeries}
                            vibrationAxes={chartData.vibrationAxes}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="card" style={{ color: '#dbe8ff' }}>
                        No asset is assigned to this machine yet.
                      </div>
                    )
                  )}
                </>
              }
            />

            {/* ✅ Manager Insights Route - PROTECTED */}
            <Route
              path="/manager-insights"
              element={
                isAdmin ? (
                  <ManagerInsights
                    selectedMachine={selectedMachine}
                    activeProductionLine={activeProductionLine}
                    activeMachine={activeMachine}
                  />
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>Access Denied</h2>
                    <p>This page is only available to admin users.</p>
                  </div>
                )
              }
            />
          </Routes>
        </div>
      </div>

      {/* ===== Admin Detail Modals - ✅ Already wrapped with isAdmin ===== */}
      {isAdmin && (
        <>
          <QualityDetailModal
            open={showQualityModal}
            mode="quality"
            title="Quality Details"
            qualityStatus={adminQuality.qualityStatus}
            defectRate={adminQuality.defectRate}
            drivers={adminQuality.drivers}
            co2History={adminQuality.co2History}
            onClose={() => setShowQualityModal(false)}
          />

          <QualityDetailModal
            open={showDefectModal}
            mode="defects"
            title="Defect Details"
            qualityStatus={adminQuality.qualityStatus}
            defectRate={adminQuality.defectRate}
            drivers={adminQuality.drivers}
            co2History={adminQuality.co2History}
            onClose={() => setShowDefectModal(false)}
          />

          <MaintenanceLogModal
            open={showMaintLog}
            onClose={() => setShowMaintLog(false)}
            productionLines={adminLines}
            logs={maintenanceLogs}
            loading={maintLoading}
            onCreate={handleCreateMaintenanceLog}
            onUpdate={handleUpdateMaintenanceLog}
            onDelete={handleDeleteMaintenanceLog}
          />

          <ManageUsersModal
            open={showManageUsers}
            onClose={() => setShowManageUsers(false)}
            users={adminUsers}
            lines={adminLines}
            loading={usersLoading}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
            onToggleMachineAccess={handleToggleMachineAccess}
          />

          <MachineModal
            open={showMachines}
            onClose={() => setShowMachines(false)}
            editingMachine={editingMachine}
            onSuccess={handleMachineSuccess}
          />
        </>
      )}

      {/* Operator Log Modal */}
      {operatorAction && (
        <div className="modal-backdrop" onClick={() => setOperatorAction(null)}>
          <div className="modal-sheet operator-log-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {operatorAction === "issue"
                ? "Log Issue"
                : operatorAction === "note"
                ? "Add Note"
                : "Mark Fixed"}
            </h3>

            <p>
              Machine: <strong>{selectedMachine?.name}</strong>
            </p>

            <textarea
              value={operatorMessage}
              onChange={(e) => setOperatorMessage(e.target.value)}
              placeholder={
                operatorAction === "issue"
                  ? "Describe the issue..."
                  : operatorAction === "note"
                  ? "Write operator note..."
                  : "What was fixed?"
              }
            />

            <div className="confirm-actions">
              <button className="btn" onClick={() => setOperatorAction(null)}>
                Cancel
              </button>
              <button className="btn" onClick={submitOperatorLog}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-sheet confirm-sheet"
            style={{ maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-header" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#eef5ff' }}>Delete Machine</h3>
              <p style={{ margin: 0, color: '#9fb3c8', lineHeight: 1.5 }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: '#ff6b6b' }}>{deleteTarget.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>

            <div className="confirm-actions" style={{ display: 'flex', gap: '12px', padding: '0 20px 20px 20px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={confirmDeleteMachine}
                style={{ background: '#e74c3c' }}
              >
                Delete Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast Notification */}
      {toast.show && (
        <div className={`app-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}