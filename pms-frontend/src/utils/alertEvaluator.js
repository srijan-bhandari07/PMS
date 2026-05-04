export const THRESHOLDS = {
  // Filling
  tankPressure:   { normal:[2.0,3.0],  warning:[1.0,2.0,3.0,4.5],  critical:[0,1.0,4.5,6.0] },
  productTemp:    { normal:[0.5,4.0],  warning:[0.5,4.0,4.0,8.0],  critical:[0,0.5,8.0,Infinity] },

  // Seaming
  vibration:      { normal:[0.5,2.5],  warning:[0.5,2.5,2.5,6.0],  critical:[0,0.5,6.0,10.0] },

  // QA
  oxygenContent:  { normal:[0.1,0.8],  warning:[0.1,0.8,0.8,3.0],  critical:[0,0.1,3.0,Infinity] },
  co2Content:     { normal:[4.0,6.0],  warning:[2.0,4.0,6.0,8.0],  critical:[0,2.0,8.0,Infinity] },
};

const META = {
  tankPressure:   { label: 'Tank Pressure', unit: 'bar', group: 'Filling' },
  productTemp:    { label: 'Product Temp', unit: '°C', group: 'Filling' },
  vibration:      { label: 'Vibration', unit: 'mm/s', group: 'Seaming' },
  oxygenContent:  { label: 'O₂ Content', unit: '%', group: 'QA' },
  co2Content:     { label: 'CO₂ Content', unit: '%', group: 'QA' },
};

export function getFeatureMeta(feature) {
  return META[feature] || { label: feature, unit: '', group: 'Process' };
}

export function getSeverity(feature, value) {
  const t = THRESHOLDS[feature];
  if (!t || value == null || Number.isNaN(+value)) return 'info';

  const v = +value;
  const [nLow, nHigh] = t.normal;
  const [, cLow, cHigh] = t.critical;

  if (v < cLow || v > cHigh) return 'critical';
  if (v >= nLow && v <= nHigh) return 'normal';
  if ((v > cLow && v < nLow) || (v > nHigh && v < cHigh)) return 'warning';

  return 'info';
}

export function getColorClass(feature, value) {
  const sev = getSeverity(feature, value);
  return sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'normal';
}

export function describeThreshold(feature) {
  const t = THRESHOLDS[feature];
  if (!t) return '';
  const normal = `${t.normal[0]}–${t.normal[1]}`;
  const warn = `${t.warning[0]}–${t.warning[1]} or ${t.warning[2]}–${t.warning[3]}`;
  const crit = `<${t.critical[1]} or >${t.critical[2]}`;
  return `Normal: ${normal} | Warning: ${warn} | Critical: ${crit}`;
}