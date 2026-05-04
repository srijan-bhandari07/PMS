export default function QualityDetailModal({
  open = false,
  mode = 'quality', // 'quality' | 'defects'
  title,
  qualityStatus = 'Normal',
  defectRate = 0,
  drivers = {},
  co2History = [],
  onClose,
}) {
  if (!open) return null;

  const isDefects = mode === 'defects';

  const fmt = (v, d = 2) => (Number.isFinite(+v) ? (+v).toFixed(d) : '—');

  const rows = [
    { label: 'Tank Pressure', value: drivers.tankPressure, unit: ' bar' },
    { label: 'Tank Level', value: drivers.tankLevel, unit: '' },
    { label: 'Product Temp', value: drivers.productTemp, unit: ' °C' },
    { label: 'Fill Level', value: drivers.fillLevel, unit: ' ml' },

    { label: 'Snift-1 Throttle', value: drivers.snift1Throttle, unit: '' },
    { label: 'Snift-1 Time', value: drivers.snift1Time, unit: ' s' },
    { label: 'Snift-2 Throttle', value: drivers.snift2Throttle, unit: '' },
    { label: 'Snift-2 Time', value: drivers.snift2Time, unit: ' s' },

    { label: 'Cycle Rate', value: drivers.cycleRate, unit: '' },
    { label: 'Vibration', value: drivers.vibration, unit: ' mm/s' },
    { label: 'Sealing Force', value: drivers.sealingForce, unit: ' N' },
    { label: 'Seam Integrity', value: drivers.seamIntegrity, unit: '%' },

    { label: 'O₂ Content', value: drivers.oxygenContent, unit: '%' },
    { label: 'CO₂ Content', value: drivers.co2Content, unit: '%' },
    { label: 'Seam Thickness', value: drivers.seamThickness, unit: ' mm' },
  ];

  const latestCo2 = co2History.length ? co2History[co2History.length - 1] : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet pretty" onClick={(e) => e.stopPropagation()}>
        <div className="qd-hero">
          <div className="qd-hero-left">
            <div className="qd-circle">
              <i className={`fas ${isDefects ? 'fa-triangle-exclamation' : 'fa-gauge-high'}`} />
            </div>
            <div>
              <h3 className="qd-title">{title || (isDefects ? 'Defect Details' : 'Quality Details')}</h3>
              <div className="qd-sub">
                {isDefects ? 'Live defect trend overview' : 'Live quality overview'}
              </div>
            </div>
          </div>

          <div className="qd-hero-right">
            <span className="kpi-pill ghost">{qualityStatus}</span>
            <button className="btn small" onClick={onClose}>
              <i className="fas fa-times" /> Close
            </button>
          </div>
        </div>

        <div className="qd-grid">
          <div className="qd-card">
            <div className="qd-card-head">Signals</div>

            <div className="qd-signals">
              {rows.map((r) => (
                <div key={r.label} className="qd-signal">
                  <div className="qd-signal-label">{r.label}</div>
                  <div className="qd-signal-right">
                    <div className="qd-gauge">
                      <div
                        className="qd-gauge-fill"
                        style={{
                          width: `${Math.min(100, Math.max(8, Number.isFinite(+r.value) ? (+r.value * 12) : 8))}%`,
                        }}
                      />
                    </div>
                    <div className="qd-signal-val">
                      {fmt(r.value)}
                      <span className="qd-unit">{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="qd-card">
            <div className="qd-card-head">{isDefects ? 'Defect Summary' : 'Quality Summary'}</div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div className="card" style={{ padding: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>Quality Status</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{qualityStatus}</div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>Defect Rate</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{fmt(defectRate)}%</div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>Latest CO₂</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>
                  {latestCo2 != null ? `${fmt(latestCo2)}%` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Notes Section */}
        <div className="qd-card" style={{ marginTop: 16 }}>
          <div className="qd-card-head">Sensor Notes</div>
          <div style={{ display: 'grid', gap: 10, padding: '8px 0' }}>
            <div><strong>Status:</strong> {drivers.status || '—'}</div>
            <div><strong>Fail Sensor:</strong> {drivers.failSensor || '—'}</div>
            <div><strong>Specific Problem:</strong> {drivers.specificProblem || '—'}</div>
            <div><strong>Cause:</strong> {drivers.cause || '—'}</div>
            <div><strong>Corrective Action:</strong> {drivers.correctiveAction || '—'}</div>
          </div>
        </div>

        {/* Management Insight Section */}
        <div className="qd-card" style={{ marginTop: 16 }}>
          <div className="qd-card-head">Management Insight</div>

          <div style={{ display: 'grid', gap: 10 }}>
            <div className="card" style={{ padding: 12 }}>
              <div className="muted" style={{ fontSize: 12 }}>Production Risk</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {qualityStatus === 'Poor'
                  ? 'High Risk'
                  : qualityStatus === 'Warning'
                  ? 'Moderate Risk'
                  : 'Low Risk'}
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div className="muted" style={{ fontSize: 12 }}>Business Impact</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {defectRate > 3
                  ? 'Potential production loss and customer delays'
                  : defectRate > 1.5
                  ? 'Minor production impact possible'
                  : 'No immediate impact'}
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div className="muted" style={{ fontSize: 12 }}>Priority</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {qualityStatus === 'Poor'
                  ? 'Immediate Action Required'
                  : qualityStatus === 'Warning'
                  ? 'Monitor Closely'
                  : 'Normal'}
              </div>
            </div>
          </div>
        </div>

        <div className="qd-footer">
          <div className="qd-card">
            <div className="qd-card-head">Suggested Action</div>
            <p className="muted" style={{ lineHeight: 1.5 }}>
              {isDefects
                ? defectRate > 3
                  ? 'Immediate QA inspection required. Halt production if defect trend continues.'
                  : 'Review recent process changes and monitor next production cycle.'
                : qualityStatus === 'Poor'
                ? 'Escalate to engineering team. Investigate root cause immediately.'
                : qualityStatus === 'Warning'
                ? 'Monitor signals closely and prepare preventive maintenance.'
                : 'System operating within normal conditions.'}
            </p>
          </div>

          <div className="qd-card">
            <div className="qd-card-head">Notes</div>
            <p className="muted" style={{ lineHeight: 1.5 }}>
              Backend will later provide thresholds, severity, and detailed recommendations for each signal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}