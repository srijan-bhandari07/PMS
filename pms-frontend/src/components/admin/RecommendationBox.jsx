export default function RecommendationBox({
  alerts = [],
  maintenanceLogs = [],
  qualityStatus = 'Normal',
  defectRate = 0,
  latest = {},  // Add this prop to receive driver data
}) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const openMaintenance = maintenanceLogs.filter(
    (log) => log.status === 'planned' || log.status === 'in-progress'
  );

  const recommendations = [];

  if (criticalAlerts.length > 0) {
    recommendations.push('Immediate engineering inspection is required for critical machine conditions.');
  }

  if (warningAlerts.length > 0) {
    recommendations.push('Review warning alerts and schedule preventive checks before the next production cycle.');
  }

  if (defectRate > 3) {
    recommendations.push('Defect rate is high. QA review should be prioritised before batch release.');
  } else if (defectRate > 1.5) {
    recommendations.push('Monitor defect trend closely and investigate process consistency.');
  }

  if (openMaintenance.length > 0) {
    recommendations.push(`There are ${openMaintenance.length} open maintenance jobs that may affect availability.`);
  }

  // NEW: Predictive maintenance recommendations from latest driver data
  if (latest?.failureIn30Min === 1) {
    recommendations.push('⚠️ High failure risk detected within 30 minutes. Immediate inspection required.');
  }

  if (latest?.rul != null && latest.rul < 300) {
    recommendations.push('🔧 Remaining useful life is low (' + latest.rul + ' sec). Schedule maintenance urgently.');
  }

  if (latest?.oee != null && latest.oee < 0.8) {
    recommendations.push('📉 OEE has dropped below optimal levels (' + (latest.oee * 100).toFixed(1) + '%). Investigate efficiency losses.');
  }

  if (latest?.throughput != null && latest.throughput < 100) {
    recommendations.push('🏭 Throughput is below target. Check production line bottlenecks.');
  }

  if (latest?.reject != null && latest.reject > 15) {
    recommendations.push('🚫 Reject rate is elevated (' + latest.reject + '%). Quality inspection recommended.');
  }

  if (qualityStatus === 'Normal' && recommendations.length === 0) {
    recommendations.push('✅ Production is stable. Continue normal operations and monitor routine KPIs.');
  }

  // Determine owner based on criticality and predictive indicators
  const owner =
    criticalAlerts.length > 0 || latest?.failureIn30Min === 1
      ? 'Engineering + QA'
      : warningAlerts.length > 0 || (latest?.rul != null && latest.rul < 300) || (latest?.oee != null && latest.oee < 0.8)
      ? 'Maintenance Team'
      : 'Operations';

  return (
    <div className="insight-panel">
      <div className="insight-panel-head">
        <div>
          <div className="insight-panel-kicker">Decision Support</div>
          <h3 className="insight-panel-title">Recommended Actions</h3>
        </div>
      </div>

      <div className="recommendation-owner">
        <span>Suggested Owner</span>
        <strong>{owner}</strong>
      </div>

      <ul className="recommendation-list">
        {recommendations.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}