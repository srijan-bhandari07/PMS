export default function ProductionImpactPanel({
  qualityStatus = 'Normal',
  defectRate = 0,
  alerts = [],
  maintenanceLogs = [],
  latest = {},
  selectedMachine = null, // ✅ Step 2: Add selectedMachine prop
}) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const openMaintenance = maintenanceLogs.filter(
    (log) => log.status === 'planned' || log.status === 'in-progress'
  );

  const status = latest.status || 'Normal';
  const downtime = Number(latest.downtime ?? 0);
  const throughput = Number(latest.throughput ?? 0);
  const reject = Number(latest.reject ?? 0);
  const oee = Number(latest.oee ?? 0);
  const rul = Number(latest.rul ?? 0);
  const failureIn30Min = Number(latest.failureIn30Min ?? 0);

  // ✅ Step 3: Get line name from selectedMachine
  const lineName = selectedMachine?.lineName || selectedMachine?.name || 'Unknown Line';

  // ✅ Step 4: Real risk logic
  let atRiskLine = 'No line at risk';
  let estimatedDowntime = `${downtime.toFixed(0)} hrs`;
  let orderImpact = 'No immediate impact';
  let recommendedOwner = 'Operations';

  // Check if line is at risk
  const isAtRisk = (
    status !== 'Normal' ||
    failureIn30Min === 1 ||
    criticalAlerts.length > 0 ||
    downtime > 0 ||
    reject > 5 || // If reject rate > 5%
    oee < 0.75   // If OEE < 75%
  );

  if (isAtRisk) {
    // ✅ Step 4: Use actual line name
    atRiskLine = lineName;
    recommendedOwner = criticalAlerts.length > 0 ? 'Engineering + QA' : 'Maintenance Team';

    // Calculate estimated downtime
    if (downtime > 0) {
      estimatedDowntime = `${downtime.toFixed(1)} hrs`;
    } else if (failureIn30Min === 1) {
      estimatedDowntime = '0.5 hrs (30 min)';
    } else if (criticalAlerts.length > 0) {
      estimatedDowntime = '2-4 hrs';
    } else if (openMaintenance.length > 0) {
      estimatedDowntime = '1-2 hrs';
    } else {
      estimatedDowntime = 'Under assessment';
    }

    // Calculate order impact
    if (reject > 5 || defectRate > 2) {
      orderImpact = 'Quality hold - Production review needed';
    } else if (oee < 0.85) {
      orderImpact = 'Efficiency loss - Schedule adjustment';
    } else if (failureIn30Min === 1) {
      orderImpact = 'Potential outage - Prepare contingency';
    } else if (downtime > 0) {
      orderImpact = 'Delivery delay - Customer notification';
    } else if (criticalAlerts.length > 0) {
      orderImpact = 'Immediate intervention required';
    } else {
      orderImpact = 'Monitor closely';
    }
  }

  return (
    <div className="impact-container">
      <div className="impact-grid">
        <div className="impact-card">
          <span>AT-RISK LINE : </span>
          <strong>{atRiskLine}</strong>
        </div>

        <div className="impact-card">
          <span>ESTIMATED DOWNTIME : </span>
          <strong>{estimatedDowntime}</strong>
        </div>

        <div className="impact-card">
          <span>ORDER IMPACT : </span>
          <strong>{orderImpact}</strong>
        </div>

        <div className="impact-card">
          <span>RECOMMENDED OWNER : </span>
          <strong>{recommendedOwner}</strong>
        </div>
      </div>

      {/* Optional: Show additional metrics */}
      {(criticalAlerts.length > 0 || openMaintenance.length > 0) && (
        <div className="impact-details" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {criticalAlerts.length > 0 && (
            <div style={{ color: '#ff6b6b', marginBottom: '8px' }}>
              ⚠️ {criticalAlerts.length} critical alert(s) require immediate attention
            </div>
          )}
          {openMaintenance.length > 0 && (
            <div style={{ color: '#ffd93d' }}>
              🔧 {openMaintenance.length} open maintenance task(s) in progress
            </div>
          )}
        </div>
      )}
    </div>
  );
}