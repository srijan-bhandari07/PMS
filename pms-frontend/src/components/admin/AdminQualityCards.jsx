export default function AdminQualityCards({
  qualityStatus = 'Normal',
  defectRate = 0,
  trend = 0,
  drivers = {},
  alerts = [],
  maintenanceLogs = [],
  onOpenQuality,
  onOpenDefects,
}) {
  const fmt = {
    pct: (v, d = 2) => (Number.isFinite(+v) ? (+v).toFixed(d) : '—'),
    num: (v, d = 2) => (Number.isFinite(+v) ? (+v).toFixed(d) : '—'),
  };

  const badgeTone =
    qualityStatus.toLowerCase() === 'warning'
      ? 'warning'
      : qualityStatus.toLowerCase() === 'poor'
      ? 'danger'
      : 'ok';

  const trendColor =
    trend > 0 ? '#ff9b8f' : trend < 0 ? '#7ce6b3' : 'rgba(255,255,255,.85)';
  const trendSign = trend > 0 ? '▲' : trend < 0 ? '▼' : '•';

  const driverItems = [
    drivers.tankPressure != null && `Tank Pressure: ${fmt.num(drivers.tankPressure, 2)} bar`,
    drivers.tankLevel != null && `Tank Level: ${fmt.num(drivers.tankLevel, 2)}`,
    drivers.productTemp != null && `Product Temp: ${fmt.num(drivers.productTemp, 2)} °C`,
    drivers.fillLevel != null && `Fill Level: ${fmt.num(drivers.fillLevel, 2)} ml`,
    drivers.snift1Throttle != null && `Snift-1 Throttle: ${fmt.num(drivers.snift1Throttle, 2)}`,
    drivers.snift1Time != null && `Snift-1 Time: ${fmt.num(drivers.snift1Time, 2)} s`,
    drivers.snift2Throttle != null && `Snift-2 Throttle: ${fmt.num(drivers.snift2Throttle, 2)}`,
    drivers.snift2Time != null && `Snift-2 Time: ${fmt.num(drivers.snift2Time, 2)} s`,
    drivers.cycleRate != null && `Cycle Rate: ${fmt.num(drivers.cycleRate, 2)}`,
    drivers.vibration != null && `Vibration: ${fmt.num(drivers.vibration, 2)} mm/s`,
    drivers.sealingForce != null && `Sealing Force: ${fmt.num(drivers.sealingForce, 2)} N`,
    drivers.seamIntegrity != null && `Seam Integrity: ${fmt.num(drivers.seamIntegrity, 2)}%`,
    drivers.oxygenContent != null && `O₂: ${fmt.pct(drivers.oxygenContent, 2)}%`,
    drivers.co2Content != null && `CO₂: ${fmt.pct(drivers.co2Content, 2)}%`,
    drivers.seamThickness != null && `Seam Thickness: ${fmt.num(drivers.seamThickness, 2)} mm`,
  ]
    .filter(Boolean)
    .slice(0, 6)
    .join(' • ');

  return (
    <div className="admin-manager-block">
      {/* REMOVED the duplicate mgr-summary-row section */}

      <div className="kpi-row">
        <article
          role="button"
          tabIndex={0}
          className="kpi-card"
          onClick={onOpenQuality}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenQuality?.()}
        >
          <header className="kpi-head">
            <h3 className="kpi-title">Quality Status</h3>
          </header>

          <div className="kpi-body">
            <div className={`pill ${badgeTone}`}>{qualityStatus}</div>

            <div className="kpi-line">
              <strong>Key Drivers:</strong>&nbsp;
              {driverItems || 'Waiting for backend signals…'}
            </div>

            <div className="kpi-line">
              <strong>Manager Insight:</strong>&nbsp;
              {qualityStatus === 'Poor'
                ? 'Immediate QA and engineering review recommended.'
                : qualityStatus === 'Warning'
                ? 'Monitor closely and prepare preventive action.'
                : 'Production is within expected quality conditions.'}
            </div>
          </div>
        </article>

        <article
          role="button"
          tabIndex={0}
          className="kpi-card"
          onClick={onOpenDefects}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenDefects?.()}
        >
          <header className="kpi-head">
            <h3 className="kpi-title">Defect Rate</h3>
          </header>

          <div className="kpi-body">
            <div className="big-num">
              {fmt.num(defectRate, 2)}%
              <span className="big-num-gap"> </span>
              <span className="kpi-trend" style={{ color: trendColor }}>
                {trendSign} {Math.abs(+trend).toFixed(2)}% vs last
              </span>
            </div>

            <div className="kpi-line">
              <strong>Summary:</strong>&nbsp;
              {defectRate > 3
                ? 'High defect rate needs immediate review.'
                : defectRate > 1.5
                ? 'Monitor quality and inspect seaming.'
                : 'Quality within expected range.'}
            </div>

            <div className="kpi-line">
              <strong>Business Impact:</strong>&nbsp;
              {defectRate > 3
                ? 'Potential output loss and customer order risk.'
                : defectRate > 1.5
                ? 'Minor production risk if trend continues.'
                : 'No immediate production impact expected.'}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}