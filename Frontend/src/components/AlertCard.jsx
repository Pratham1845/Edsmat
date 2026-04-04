const AlertCard = ({ alert }) => {
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '🔴',
          badge: 'bg-red-100 text-red-800',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '🟡',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: '🔵',
          badge: 'bg-blue-100 text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: '⚪',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-5 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{styles.icon}</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">{alert.title}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{alert.studentName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.badge}`}>
          {alert.severity.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="ml-11 space-y-2">
        <p className="text-sm text-gray-700">{alert.description}</p>

        {/* Reasons */}
        {alert.reasons && alert.reasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Reasons:</p>
            <ul className="space-y-1">
              {alert.reasons.map((reason, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metrics */}
        {alert.metrics && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {Object.entries(alert.metrics).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 capitalize">{key}</p>
                <p className="text-sm font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="ml-11 mt-4 flex space-x-2">
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Take Action
        </button>
        <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
