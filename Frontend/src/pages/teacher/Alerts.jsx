import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AlertCard from '../../components/AlertCard';
import { students } from '../../data/students';

const Alerts = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Generate alerts from student data
  const alerts = students
    .filter(student => student.riskScore !== 'low')
    .map(student => ({
      id: student.id,
      title: `${student.riskScore === 'high' ? 'High' : 'Medium'} Risk Alert`,
      studentName: student.name,
      severity: student.riskScore,
      description: `Student is showing signs of disengagement and may be at risk of dropping out.`,
      reasons: [
        student.marks < 60 ? `Low academic performance (${student.marks}%)` : null,
        student.attendance < 70 ? `Poor attendance rate (${student.attendance}%)` : null,
        student.engagement < 60 ? `Low engagement level (${student.engagement}%)` : null,
      ].filter(Boolean),
      metrics: {
        marks: `${student.marks}%`,
        attendance: `${student.attendance}%`,
        engagement: `${student.engagement}%`,
      },
    }));

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filterSeverity);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Alerts</h1>
          <p className="text-gray-600">Monitor and respond to at-risk student alerts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-900">
                  {alerts.filter(a => a.severity === 'high').length}
                </p>
              </div>
              <span className="text-4xl">🔴</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium mb-1">Medium Risk</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {alerts.filter(a => a.severity === 'medium').length}
                </p>
              </div>
              <span className="text-4xl">🟡</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Total Alerts</p>
                <p className="text-3xl font-bold text-blue-900">{alerts.length}</p>
              </div>
              <span className="text-4xl">⚠️</span>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Alerts</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Export Alerts
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <span className="text-6xl mb-4 block">✅</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">All students are performing well!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
