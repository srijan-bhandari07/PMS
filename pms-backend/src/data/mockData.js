const users = [
  {
    id: 1,
    name: "Admin",
    email: "admin@gmail.com",
    password: "admin",
    role: "admin",
    active: true,
    accessibleMachines: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 2,
    name: "Operator One",
    email: "operator1@gmail.com",
    password: "123456",
    role: "operator",
    active: true,
    accessibleMachines: [1, 2],
  },
  {
    id: 3,
    name: "Viewer One",
    email: "viewer1@gmail.com",
    password: "123456",
    role: "viewer",
    active: true,
    accessibleMachines: [7, 8],
  },
];

let maintenanceLogs = [
  {
    id: 1001,
    date: "2026-02-26",
    lineId: 1,
    machineId: 1,
    title: "Routine inspection",
    technician: "Alex",
    status: "completed",
    notes: "Checked belts and vibration mountings.",
  },
  {
    id: 1002,
    date: "2026-02-25",
    lineId: 2,
    machineId: 7,
    title: "Sensor calibration",
    technician: "Sam",
    status: "planned",
    notes: "Schedule QA sensor calibration for next shift.",
  },
];

module.exports = {
  users,
  getMaintenanceLogs: () => maintenanceLogs,
  setMaintenanceLogs: (logs) => {
    maintenanceLogs = logs;
  },
};