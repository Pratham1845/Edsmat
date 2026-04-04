import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { students } from '../../data/students';

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

const riskMeta = {
  high: {
    label: 'Needs Attention',
    chip: 'bg-red-100 text-red-700 border-red-200',
    card: 'border-red-200 bg-red-50'
  },
  medium: {
    label: 'Need Support Soon',
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200 bg-amber-50'
  },
  low: {
    label: 'Stable',
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    card: 'border-emerald-200 bg-emerald-50'
  }
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
        setError('Unable to load live dashboard right now. Showing latest local analytics view.');
        setDashboard(initialDashboard);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [apiUrl]);

  const studentRiskRows = useMemo(() => {
    return [...students]
      .map((student) => ({
        ...student,
        riskLevel: student.riskScore || 'low'
      }))
      .sort((a, b) => (b.dropoutRiskScore || 0) - (a.dropoutRiskScore || 0));
  }, []);

  const highRiskStudents = useMemo(() => {
    return studentRiskRows.filter((student) => student.riskLevel === 'high').slice(0, 3);
  }, [studentRiskRows]);

  const summary = useMemo(() => {
    const totals = studentRiskRows.reduce(
      (acc, student) => {
        acc[student.riskLevel] += 1;
        acc.riskTotal += student.dropoutRiskScore || 0;
        return acc;
      },
      { high: 0, medium: 0, low: 0, riskTotal: 0 }
    );

    const averageRiskScore = studentRiskRows.length
      ? Math.round(totals.riskTotal / studentRiskRows.length)
      : 0;

    return {
      ...totals,
      averageRiskScore
    };
  }, [studentRiskRows]);

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
            <p className="text-gray-600">Intervention-focused view of student risk signals and support actions.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-5 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span>Logout</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Students</p>
            <p className="text-3xl font-bold text-gray-900">{studentRiskRows.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
            <p className="text-sm text-red-600 mb-1">High Risk</p>
            <p className="text-3xl font-bold text-red-600">{summary.high}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
            <p className="text-sm text-amber-700 mb-1">Medium Risk</p>
            <p className="text-3xl font-bold text-amber-600">{summary.medium}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm">
            <p className="text-sm text-emerald-700 mb-1">Low Risk</p>
            <p className="text-3xl font-bold text-emerald-600">{summary.low}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
            <p className="text-sm text-indigo-700 mb-1">Avg Risk Score</p>
            <p className="text-3xl font-bold text-indigo-700">{summary.averageRiskScore}%</p>
            <p className="mt-1 text-xs text-gray-500">Live Confidence: {dashboard.avgConfidence}%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Priority Alerts</h2>
              {loading && <span className="text-xs text-gray-500">Refreshing...</span>}
            </div>
            <div className="space-y-3">
              {highRiskStudents.length === 0 && (
                <p className="text-sm text-gray-500">No high-risk alerts at the moment.</p>
              )}
              {highRiskStudents.map((student) => (
                <article key={student.id} className={`rounded-lg border p-4 ${riskMeta.high.card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-700 mt-1">Risk score {student.dropoutRiskScore}% crossed intervention threshold.</p>
                      <p className="text-xs text-gray-600 mt-2">Reasons: {student.reasons.join(', ')}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${riskMeta.high.chip}`}>
                      High Risk
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Suggested Intervention Playbook</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">1. Schedule counseling for high-risk students within 48 hours.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">2. Call parent or guardian when attendance and marks both decline.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">3. Assign mentor and set a one-week follow-up milestone.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">4. Review intent and sentiment trends before next class intervention.</div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Student Risk Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="py-2 pr-3 font-semibold">Student</th>
                  <th className="py-2 pr-3 font-semibold">Risk Score</th>
                  <th className="py-2 pr-3 font-semibold">Risk Level</th>
                  <th className="py-2 pr-3 font-semibold">Reason Breakdown</th>
                  <th className="py-2 pr-3 font-semibold">Suggested Interventions</th>
                </tr>
              </thead>
              <tbody>
                {studentRiskRows.map((student) => {
                  const meta = riskMeta[student.riskLevel] || riskMeta.low;
                  return (
                    <tr key={student.id} className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.grade}</p>
                      </td>
                      <td className="py-3 pr-3 font-semibold text-gray-900">{student.dropoutRiskScore}%</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${meta.chip}`}>
                          {student.riskLevel.toUpperCase()} | {meta.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-700">{student.reasons.join(', ')}</td>
                      <td className="py-3 pr-3 text-gray-700">{student.interventions.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent AI Interaction Signals</h2>
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
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">Risk: {item.risk_level || 'LOW'}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">Confidence: {Math.round(item.confidence || 0)}%</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700 border border-gray-200">Intent: {item.intent || 'NORMAL'}</span>
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

