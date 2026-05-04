import { useEffect, useState } from 'react';
import ManagerSummaryRow from '../components/admin/ManagerSummaryRow';
import ProductionImpactPanel from '../components/admin/ProductionImpactPanel';
import AdminQualityCharts from '../components/admin/AdminQualityCharts';
import Alerts from '../components/Alerts';
import RecommendationBox from '../components/admin/RecommendationBox';
import { getAdminDashboardApi } from '../api/dashboardApi';
import { getMaintenanceLogsApi } from '../api/adminApi';
import { getOperatorLogsApi } from '../api/operatorLogApi';
import { useAuth } from '../context/AuthContext';

export default function ManagerInsights({ 
  selectedMachine,      // ✅ New prop
  activeProductionLine, // ✅ New prop  
  activeMachine         // ✅ New prop
}) {
  const { currentUser } = useAuth();
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [loading, setLoading] = useState(false);
  const [adminQuality, setAdminQuality] = useState({
    qualityStatus: 'Normal',
    defectRate: 0,
    trend: 0,
    co2History: [],
    drivers: {},
  });
  const [alerts, setAlerts] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [operatorLogs, setOperatorLogs] = useState([]);

  // Load operator logs for the selected machine
  useEffect(() => {
    const loadOperatorLogs = async () => {
      if (!selectedMachine?.id) return;

      const res = await getOperatorLogsApi(selectedMachine.id);
      if (res.ok) {
        setOperatorLogs(res.data || []);
      }
    };

    loadOperatorLogs();
  }, [selectedMachine]);

  // ✅ Updated useEffect with auto-refresh every 5 seconds
  useEffect(() => {
    if (!selectedMachine) {
      console.log("Waiting for selected machine...");
      return;
    }

    let ignore = false;

    async function loadData(showLoader = true) {
      if (showLoader) setLoading(true);
      
      // 🔍 Debug logging
      console.log("Selected Machine:", selectedMachine);
      console.log("Asset ID sent:", selectedMachine?.assetId);
      console.log("Sensor Line ID sent:", selectedMachine?.sensorLineId);  // ✅ ADD THIS
      console.log("Line ID:", activeProductionLine + 1);
      console.log("Machine ID:", activeMachine + 1);
      
      try {
        const [dashboardRes, maintenanceRes] = await Promise.all([
          // ✅ FIXED: Add sensorLineId to API call
          getAdminDashboardApi({
            lineId: activeProductionLine + 1,
            machineId: activeMachine + 1,
            assetId: selectedMachine?.assetId,
            sensorLineId: selectedMachine?.sensorLineId   // 🔥 CRITICAL FIX - ADD THIS
          }),
          getMaintenanceLogsApi(),
        ]);

        // 🔍 Debug API response
        console.log("Dashboard Response:", dashboardRes);
        console.log("Quality Data:", dashboardRes.data?.quality);
        console.log("Drivers:", dashboardRes.data?.quality?.drivers);

        if (!ignore && dashboardRes.ok) {
          setAdminQuality({
            qualityStatus: dashboardRes.data?.quality?.qualityStatus || 'Normal',
            defectRate: dashboardRes.data?.quality?.defectRate || 0,
            trend: dashboardRes.data?.quality?.trend || 0,
            co2History: dashboardRes.data?.quality?.co2History || [],
            drivers: dashboardRes.data?.quality?.drivers || {},
          });
          setAlerts(dashboardRes.data?.alerts || []);
        }

        if (!ignore && maintenanceRes.ok) {
          setMaintenanceLogs(maintenanceRes.data || []);
        }
      } catch (err) {
        console.error('Manager insights load failed', err);
      } finally {
        if (!ignore && showLoader) setLoading(false);
      }
    }

    // Initial load with loader
    loadData(true);

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadData(false); // Don't show loader on auto-refresh
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [selectedMachine, activeProductionLine, activeMachine]);

  // ✅ Cleaned access denied - removed Header and App wrapper
  if (!isAdmin) {
    return (
      <div className="insight-shell">
        <div className="insight-hero-card">
          <div className="insight-hero-copy">
            <p className="insight-eyebrow">Managerial Insights</p>
            <h1 className="insight-title">Access denied</h1>
            <p className="insight-subtitle">
              This page is available to admin users only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Cleaned no machine selected - removed Header and App wrapper
  if (!selectedMachine) {
    return (
      <div className="insight-shell">
        <div className="insight-hero-card">
          <div className="insight-hero-copy">
            <p className="insight-eyebrow">Managerial Insights</p>
            <h1 className="insight-title">No Machine Selected</h1>
            <p className="insight-subtitle">
              Please select a machine from the dashboard to view insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const activeMaintenance = maintenanceLogs.filter(
    (log) => log.status === 'planned' || log.status === 'in-progress'
  ).length;

  const productionMode =
    adminQuality.qualityStatus === 'Poor'
      ? 'Escalation'
      : adminQuality.qualityStatus === 'Warning'
      ? 'Preventive Monitoring'
      : 'Normal Operation';

  // Extract latest from drivers
  const latest = adminQuality.drivers || {};

  // 🔍 Debug KPI data
  console.log("Latest KPI Data:", {
    oee: latest.oee,
    rul: latest.rul,
    throughput: latest.throughput,
    reject: latest.reject,
    failureIn30Min: latest.failureIn30Min,
    timestamp: latest.timestamp
  });

  return (
    <div className="insight-shell">
      {/* 1. Executive hero */}
      <section className="insight-hero-card">
        <div className="insight-hero-copy">
          <p className="insight-eyebrow">Executive Operations View</p>
          <h1 className="insight-title">Managerial Insights</h1>
          <p className="insight-subtitle">
            Production health, downtime exposure, maintenance workload, and quality risk in one place.
          </p>
          {selectedMachine && (
            <p className="insight-machine-info" style={{ marginTop: '10px', color: '#666' }}>
              Currently viewing: <strong>{selectedMachine.name || selectedMachine.assetId}</strong>
            </p>
          )}
        </div>

        <div className="insight-hero-metrics">
          <div className="insight-hero-pill">
            <span className="insight-hero-pill-label">Mode</span>
            <strong>{productionMode}</strong>
          </div>
          <div className="insight-hero-pill">
            <span className="insight-hero-pill-label">Critical Alerts</span>
            <strong>{criticalCount}</strong>
          </div>
          <div className="insight-hero-pill">
            <span className="insight-hero-pill-label">Open Maintenance</span>
            <strong>{activeMaintenance}</strong>
          </div>
        </div>
      </section>

      {loading && (
        <div className="insight-loading-card">
          Loading managerial insights for {selectedMachine?.name || selectedMachine?.assetId}...
        </div>
      )}

      {/* 2. Summary KPI row */}
      <ManagerSummaryRow
        qualityStatus={adminQuality.qualityStatus}
        alerts={alerts}
        maintenanceLogs={maintenanceLogs}
        defectRate={adminQuality.defectRate}
        trend={adminQuality.trend}
      />

      {/* 3. Operational KPI row */}
      <div className="insight-kpi-row">
        <div className="kpi-card">
          <span>OEE</span>
          <strong>
            {latest.oee != null ? `${(latest.oee * 100).toFixed(1)}%` : '--'}
          </strong>
        </div>

        <div className="kpi-card">
          <span>RUL</span>
          <strong>{latest.rul != null ? `${latest.rul} sec` : '--'}</strong>
        </div>

        <div className="kpi-card">
          <span>Failure Risk</span>
          <strong>
            {latest.failureIn30Min === 1 ? '⚠️ High (30 min)' : latest.failureIn30Min === 0 ? '✅ Low' : '--'}
          </strong>
        </div>

        <div className="kpi-card">
          <span>Throughput</span>
          <strong>{latest.throughput?.toFixed(2) ?? '--'}</strong>
        </div>

        <div className="kpi-card">
          <span>Reject Rate</span>
          <strong>{latest.reject != null ? `${latest.reject}%` : '--'}</strong>
        </div>

        <div className="kpi-card">
          <span>Last Update</span>
          <strong>
            {latest.timestamp
              ? new Date(latest.timestamp).toLocaleTimeString()
              : '--'}
          </strong>
        </div>
      </div>

      {/* 4. Production impact + recommendations */}
      <div className="insight-grid-top">
        <ProductionImpactPanel
          qualityStatus={adminQuality.qualityStatus}
          defectRate={adminQuality.defectRate}
          alerts={alerts}
          maintenanceLogs={maintenanceLogs}
          latest={latest}
          selectedMachine={selectedMachine}
        />

        <RecommendationBox
          qualityStatus={adminQuality.qualityStatus}
          defectRate={adminQuality.defectRate}
          alerts={alerts}
          maintenanceLogs={maintenanceLogs}
          latest={latest}
        />
      </div>

      {/* 5. Trends + operator activity */}
      <div className="insight-grid-bottom">
        <div className="insight-panel">
          <div className="insight-panel-head">
            <div>
              <div className="insight-panel-kicker">Quality Trend</div>
              <h3 className="insight-panel-title">CO₂ Stability</h3>
            </div>
          </div>
          <div className="insight-chart-wrap">
            <AdminQualityCharts co2History={adminQuality.co2History} />
          </div>
        </div>

        <div className="insight-panel">
          <div className="insight-panel-head">
            <div>
              <div className="insight-panel-kicker">Floor Updates</div>
              <h3 className="insight-panel-title">Recent Operator Activity</h3>
            </div>
          </div>

          {/* Compact operator logs */}
          <div className="operator-logs-card compact">
            <div className="logs-list">
              {operatorLogs.length === 0 ? (
                <p className="logs-empty">No activity</p>
              ) : (
                operatorLogs.slice(0, 10).map((log) => (
                  <div key={log._id} className={`log-item ${log.type}`}>
                    <span className="log-icon">
                      {log.type === "issue"
                        ? "🔧"
                        : log.type === "note"
                        ? "📝"
                        : "✅"}
                    </span>

                    <div className="log-content">
                      <div className="log-text">{log.message}</div>
                      <div className="log-meta">
                        {log.createdBy} • {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Incident feed last */}
      <div className="insight-panel">
        <div className="insight-panel-head">
          <div>
            <div className="insight-panel-kicker">Incident Feed</div>
            <h3 className="insight-panel-title">Active Alerts</h3>
          </div>
        </div>

        <div className="insight-alert-wrap">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}