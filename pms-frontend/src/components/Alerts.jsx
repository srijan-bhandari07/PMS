import { useState } from 'react';

function iconForSeverity(severity) {
  switch (severity) {
    case 'critical':
      return 'fa-radiation';
    case 'warning':
      return 'fa-exclamation-triangle';
    default:
      return 'fa-info-circle';
  }
}

function labelForSeverity(severity) {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    default:
      return 'Info';
  }
}

export default function Alerts({ alerts = [] }) {
  const [openAlert, setOpenAlert] = useState(null);

  return (
    <>
      <div className="card alerts-card">
        <div className="card-header">
          <div className="card-title">Recent Alerts</div>
        </div>

        {!alerts.length ? (
          <div className="alerts-empty">No alerts</div>
        ) : (
          <ul className="alerts-list">
            {alerts.map((a) => {
              const severity = a.severity || 'info';
              return (
                <li
                  key={a.id}
                  className={`alerts-item ${severity}`}
                  onClick={() => setOpenAlert(a)}
                >
                  <i className={`fas ${iconForSeverity(severity)} alerts-lead-icon`} />
                  <div className="alerts-meta">
                    <div className="alerts-message">{a.message}</div>
                    <div className="alerts-time">
                      {a.timestamp}
                      {a.feature ? ` • ${a.feature}` : ''}
                    </div>
                  </div>
                  <div className={`alerts-badge ${severity}`}>
                    {labelForSeverity(severity)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {openAlert && (
        <div className="alerts-modal-backdrop" onClick={() => setOpenAlert(null)}>
          <div className="alerts-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="alerts-modal-header">
              <div className="alerts-modal-title">
                <i className={`fas ${iconForSeverity(openAlert.severity)}`} />
                <span>{labelForSeverity(openAlert.severity)} Alert</span>
              </div>
              <button className="alerts-close-btn" onClick={() => setOpenAlert(null)} aria-label="Close">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="alerts-detail-box">
              <div className="alerts-detail-row">
                <div className={`alerts-badge ${openAlert.severity || 'info'}`}>
                  {labelForSeverity(openAlert.severity)}
                </div>
                <div className="alerts-detail-machine">
                  {openAlert.machineName || 'Machine'}{openAlert.lineName ? ` • ${openAlert.lineName}` : ''}
                </div>
              </div>

              <section className="alerts-section">
                <h4>Problem</h4>
                <p>{openAlert.message}</p>
              </section>

              <section className="alerts-section">
                <h4>Measured Value</h4>
                <p>
                  {openAlert.value != null
                    ? `${openAlert.value}${openAlert.unit ? ` ${openAlert.unit}` : ''}`
                    : '—'}
                </p>
              </section>

              <section className="alerts-section">
                <h4>Suggested Action</h4>
                <p>
                  {openAlert.action ||
                    (openAlert.severity === 'critical'
                      ? 'Stop the machine, notify maintenance, and inspect immediately.'
                      : openAlert.severity === 'warning'
                      ? 'Review logs and inspect if the condition persists.'
                      : 'Monitor the signal during the next production cycle.')}
                </p>
              </section>

              <div className="alerts-footer-grid">
                <div>
                  <h4>Feature</h4>
                  <p>{openAlert.feature || '—'}</p>
                </div>
                <div className="right-align">
                  <h4>Time</h4>
                  <p>{openAlert.timestamp || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}