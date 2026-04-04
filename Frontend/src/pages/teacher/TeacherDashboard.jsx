import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const initialDashboard = {
  totalInteractions: 0,
  riskCounts: { HIGH: 0, MEDIUM: 0, LOW: 0 },
  avgConfidence: 0,
  riskDistribution: [
    { risk_level: 'HIGH', count: 0 },
    { risk_level: 'MEDIUM', count: 0 },
    { risk_level: 'LOW', count: 0 }
  ],
  intentDistribution: []
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_CHAT_API_BASE_URL || 'http://localhost:5502';

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [dashboardRes, historyRes] = await Promise.all([
          fetch(`${apiUrl}/api/dashboard`),
          fetch(`${apiUrl}/api/history`)
        ]);

        if (!dashboardRes.ok || !historyRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardPayload = await dashboardRes.json();
        const historyPayload = await historyRes.json();

        if (!dashboardPayload?.success || !historyPayload?.success) {
          throw new Error('Unexpected API response');
        }

        setDashboard({ ...initialDashboard, ...dashboardPayload.data });
        setHistory(Array.isArray(historyPayload.data) ? historyPayload.data : []);
      } catch (_err) {
        setError('Unable to load live dashboard right now.');
        setDashboard(initialDashboard);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [apiUrl]);

  const pieStyle = useMemo(() => {
    const high = dashboard.riskCounts?.HIGH || 0;
    const medium = dashboard.riskCounts?.MEDIUM || 0;
    const low = dashboard.riskCounts?.LOW || 0;
    const total = high + medium + low;

    if (!total) {
      return { background: 'conic-gradient(#e5e7eb 0deg 360deg)' };
    }

    const highDeg = (high / total) * 360;
    const medDeg = (medium / total) * 360;
    const lowDeg = 360 - highDeg - medDeg;

    return {
      background: `conic-gradient(#ef4444 0deg ${highDeg}deg, #f59e0b ${highDeg}deg ${highDeg + medDeg}deg, #22c55e ${highDeg + medDeg}deg ${highDeg + medDeg + lowDeg}deg)`
    };
  }, [dashboard]);

  const maxIntentCount = useMemo(() => {
    return Math.max(1, ...dashboard.intentDistribution.map((item) => item.count || 0));
  }, [dashboard.intentDistribution]);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600">Live AI interaction analytics and risk monitoring</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Logout</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Interactions</p>
            <p className="text-4xl font-bold text-gray-900">{dashboard.totalInteractions}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
            <p className="text-sm text-red-600 mb-1">HIGH Risk</p>
            <p className="text-4xl font-bold text-red-600">{dashboard.riskCounts?.HIGH || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
            <p className="text-sm text-yellow-700 mb-1">MEDIUM Risk</p>
            <p className="text-4xl font-bold text-yellow-600">{dashboard.riskCounts?.MEDIUM || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 mb-1">LOW Risk</p>
            <p className="text-4xl font-bold text-green-600">{dashboard.riskCounts?.LOW || 0}</p>
            <p className="mt-1 text-xs text-gray-500">Avg Confidence: {dashboard.avgConfidence}%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Level Distribution</h2>
            <div className="flex items-center gap-6">
              <div className="relative h-44 w-44 rounded-full" style={pieStyle}>
                <div className="absolute inset-8 rounded-full bg-white border border-gray-100" />
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-700"><span className="h-3 w-3 rounded-full bg-red-500" /> HIGH: {dashboard.riskCounts?.HIGH || 0}</p>
                <p className="flex items-center gap-2 text-gray-700"><span className="h-3 w-3 rounded-full bg-yellow-500" /> MEDIUM: {dashboard.riskCounts?.MEDIUM || 0}</p>
                <p className="flex items-center gap-2 text-gray-700"><span className="h-3 w-3 rounded-full bg-green-500" /> LOW: {dashboard.riskCounts?.LOW || 0}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Intent Distribution</h2>
            <div className="space-y-3">
              {(dashboard.intentDistribution || []).length === 0 && (
                <p className="text-sm text-gray-500">No intent data available yet.</p>
              )}
              {(dashboard.intentDistribution || []).map((item) => (
                <div key={item.intent}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.intent}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${Math.max(6, (item.count / maxIntentCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Interaction History</h2>
            {loading && <span className="text-sm text-gray-500">Loading...</span>}
          </div>

          {!loading && history.length === 0 && (
            <p className="text-sm text-gray-500">No interaction history found.</p>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((item, index) => (
              <article key={`${item.createdAt}-${index}`} className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-900"><span className="font-semibold">Student:</span> {item.message}</p>
                <p className="mt-2 text-sm text-gray-700"><span className="font-semibold">AI:</span> {item.response_message}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">{item.risk_level || 'LOW'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">{Math.round(item.confidence || 0)}%</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">{item.intent || 'NORMAL'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;
