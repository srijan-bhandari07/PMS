export default function StatusCards({ data = {} }) {
  const cards = [
    { key: 'temperature', fallbackLabel: 'Temperature' },
    { key: 'vibration', fallbackLabel: 'Vibration' },
    { key: 'pressure', fallbackLabel: 'Pressure' },
  ];

  const getValue = (item) => {
    let value = item?.value;

    while (value && typeof value === 'object') {
      value = value.value;
    }

    if (value == null) return '--';

    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : String(value);
  };

  const getUnit = (item) => {
    if (item?.unit) return item.unit;

    let value = item?.value;
    while (value && typeof value === 'object') {
      if (value.unit) return value.unit;
      value = value.value;
    }

    return '';
  };

  const prettySeverity = (severity) => {
    if (severity === 'critical') return 'Critical';
    if (severity === 'warning') return 'Warning';
    return 'Normal';
  };

  const safeSeverityClass = (severity) => {
    return severity === 'critical' || severity === 'warning' ? severity : 'normal';
  };

  return (
    <div className="status-cards">
      {cards.map(({ key, fallbackLabel }) => {
        const item = data[key] || {};
        const severity = safeSeverityClass(item.severity);
        const label = item.label || fallbackLabel;

        return (
          <div key={key} className={`status-card ${severity}`}>
            <div className="status-card-header">
              <div className="status-card-title">{label}</div>
            </div>

            <div className="status-card-value">
              {getValue(item)} {getUnit(item)}
            </div>

            <div className="status-card-subtext">
              {item.hint || 'Live sensor reading'}
            </div>

            <div className={`status-badge ${severity}`}>
              {prettySeverity(severity)}
            </div>
          </div>
        );
      })}
    </div>
  );
}