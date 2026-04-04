const StudentCard = ({ student }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressBarColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-base font-bold text-gray-900">{student.name}</h3>
            <p className="text-xs text-gray-500">{student.grade}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskColor(
            student.riskScore
          )}`}
        >
          {student.riskScore.toUpperCase()} RISK
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Marks */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Marks</span>
            <span className="font-semibold text-gray-900">{student.marks}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressBarColor(student.marks)}`}
              style={{ width: `${student.marks}%` }}
            ></div>
          </div>
        </div>

        {/* Attendance */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Attendance</span>
            <span className="font-semibold text-gray-900">{student.attendance}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressBarColor(student.attendance)}`}
              style={{ width: `${student.attendance}%` }}
            ></div>
          </div>
        </div>

        {/* Engagement */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Engagement</span>
            <span className="font-semibold text-gray-900">{student.engagement}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressBarColor(student.engagement)}`}
              style={{ width: `${student.engagement}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500">Last active: {student.lastActive}</span>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
