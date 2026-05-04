export default function ManagerSummaryRow({
  alerts = [],
  maintenanceLogs = [],
  qualityStatus = "Normal",
}) {
  // 🔹 Calculate counts safely
  const warningCount = alerts.filter(a => a.severity === "warning").length;
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const riskCount = warningCount + criticalCount;

  const maintenanceCount = maintenanceLogs.filter(
    log => log.status === "planned" || log.status === "in-progress"
  ).length;

  // 🔹 Derived labels
  const downtimeLevel =
    criticalCount > 0 ? "High" :
    warningCount > 2 ? "Medium" :
    "Low";

  const productionStatus =
    qualityStatus === "Poor" ? "At Risk" :
    qualityStatus === "Warning" ? "Monitor Closely" :
    "Stable";

  return (
    <div className="manager-row">
      <div className="manager-card">
        <span className="manager-label">Machines at Risk</span>
        <h2>{riskCount}</h2>
        <p>{criticalCount} critical • {warningCount} warning</p>
      </div>

      <div className="manager-card">
        <span className="manager-label">Maintenance Due</span>
        <h2>{maintenanceCount}</h2>
        <p>planned or in-progress</p>
      </div>

      <div className="manager-card">
        <span className="manager-label">Downtime Risk</span>
        <h2>{downtimeLevel}</h2>
        <p>based on alerts</p>
      </div>

      <div className="manager-card">
        <span className="manager-label">Production Status</span>
        <h2>{productionStatus}</h2>
        <p>current outlook</p>
      </div>
    </div>
  );
}