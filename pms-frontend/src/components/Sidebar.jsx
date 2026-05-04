import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  productionLines = [],
  activeProductionLine,
  activeMachine,
  setActiveProductionLine,
  setActiveMachine,
  isOpen = false,
  onClose = () => {},
  onCreateMachine = () => {},
  onEditMachine = () => {},
  onDeleteMachine = () => {},
}) {
  const { currentUser } = useAuth();
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const safeLines = Array.isArray(productionLines) ? productionLines : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'warning':
        return 'fa-exclamation-circle';
      case 'non-operational':
        return 'fa-power-off';
      case 'normal':
      default:
        return 'fa-check-circle';
    }
  };

  const getStatusClass = (status) => {
    if (status === 'warning') return 'warning';
    if (status === 'non-operational') return 'down';
    return 'normal';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="card-header sidebar-header">
        <div className="card-title">Machines</div>

        <div className="sidebar-actions">
          {isAdmin && (
            <button
              type="button"
              className="sidebar-add-btn"
              aria-label="Create machine"
              title="Create machine"
              onClick={onCreateMachine}
            >
              <i className="fas fa-plus" />
            </button>
          )}

          <button
            type="button"
            className="sidebar-close"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <i className="fas fa-times" />
          </button>
        </div>
      </div>

      {safeLines.length === 0 ? (
        <div className="sidebar-empty">No machines available.</div>
      ) : (
        safeLines.map((line, lineIndex) => (
          <div key={line.id || line.name} className="production-line-section">
            <div
              className={`production-line-header ${
                lineIndex === activeProductionLine ? 'active' : ''
              }`}
              onClick={() => setActiveProductionLine(lineIndex)}
            >
              <i className="fas fa-industry" />
              <span className="line-name">{line.name}</span>
              <i
                className={`fas ${
                  lineIndex === activeProductionLine
                    ? 'fa-chevron-down'
                    : 'fa-chevron-right'
                }`}
              />
            </div>

            {lineIndex === activeProductionLine && (
              <ul className="machine-list">
                {(line.machines || []).length === 0 ? (
                  <li className="machine-empty">No machines in this line.</li>
                ) : (
                  (line.machines || []).map((machine, machineIndex) => {
                    const isActive = machineIndex === activeMachine;
                    const statusClass = getStatusClass(machine.status);

                    return (
                      <li
                        key={machine.id || machine.name}
                        className={`${isActive ? 'active' : ''} ${statusClass}`}
                        onClick={() => {
                          setActiveMachine(machineIndex);
                          onClose();
                        }}
                      >
                        <div className="machine-left">
                          <i className={`fas ${getStatusIcon(machine.status)}`} />
                          <span className="machine-name">{machine.name}</span>
                        </div>

                        <div className="machine-right">
                          {isAdmin && (
                            <div
                              className="machine-admin-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="machine-icon-btn"
                                title="Edit machine"
                                onClick={() => onEditMachine(machine)}
                              >
                                <i className="fas fa-pen" />
                              </button>

                              <button
                                type="button"
                                className="machine-icon-btn delete"
                                title="Delete machine"
                                onClick={() => onDeleteMachine(machine)}
                              >
                                <i className="fas fa-trash" />
                              </button>
                            </div>
                          )}

                          {isActive && <i className="fas fa-chevron-right active-arrow" />}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        ))
      )}
    </aside>
  );
}