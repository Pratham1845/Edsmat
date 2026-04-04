import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AlertCard from '../../components/AlertCard';

const Alerts = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_CHAT_API_BASE_URL || 'http://localhost:5502';

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiUrl}/api/teacher-alerts`);
        if (!response.ok) {
          throw new Error('Failed to fetch teacher alerts');
        }

        const payload = await response.json();
        if (!payload?.success || !Array.isArray(payload.data)) {
          throw new Error('Unexpected teacher alerts response');
        }

        const normalized = payload.data.map((item, index) => {
          const severity = (item.risk_level || 'LOW').toLowerCase();
          const riskPercentage = Number(item.risk_percentage || 0);

          return {
            id: item._id || `${item.createdAt || Date.now()}-${index}`,
            title: `${severity === 'high' ? 'High' : severity === 'medium' ? 'Medium' : 'Low'} Risk Alert`,
            studentName: 'Student Interaction',
            severity,
            description: item.message || 'Alert generated from AI interaction.',
            reasons: [
              item.reason || null,
              `Risk score from Gemini: ${riskPercentage.toFixed(1)}%`,
              item.threshold_triggered
                ? `Teacher alert threshold crossed: ${Number(item.threshold_triggered).toFixed(1)}%`
                : null
            ].filter(Boolean),
            metrics: {
              risk: `${riskPercentage.toFixed(1)}%`,
              emotion: item.emotion || 'neutral',
              webcam: item.webcam_emotion || 'not-used'
            },
            createdAt: item.createdAt
          };
        });

        setAlerts(normalized);
      } catch (_error) {
        setError('Unable to load teacher alerts right now.');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [apiUrl]);

  const filteredAlerts = useMemo(() => {
    if (filterSeverity === 'all') {
      return alerts;
    }
    return alerts.filter((alert) => alert.severity === filterSeverity);
  }, [alerts, filterSeverity]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Alerts</h1>
          <p className="text-gray-600">Monitor and respond to at-risk student alerts</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-900">
                  {alerts.filter((a) => a.severity === 'high').length}
                </p>
              </div>
              <span className="text-4xl">??</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium mb-1">Medium Risk</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {alerts.filter((a) => a.severity === 'medium').length}
                </p>
              </div>
              <span className="text-4xl">??</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Total Alerts</p>
                <p className="text-3xl font-bold text-blue-900">{alerts.length}</p>
              </div>
              <span className="text-4xl">??</span>
            </div>
          </div>
        </div>

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

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading alerts...</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {!loading && filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <span className="text-6xl mb-4 block">?</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">No teacher thresholds were crossed yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
