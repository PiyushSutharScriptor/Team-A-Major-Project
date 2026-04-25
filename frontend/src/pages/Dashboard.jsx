import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchIssueStats, fetchMyIssues } from '../store/slices/issueSlice';
import IssueCard from '../components/IssueCard';
import IssueTable from '../components/IssueTable';
import MapView from '../components/MapView';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, issues, isLoading } = useSelector((state) => state.issues);

  useEffect(() => {
    dispatch(fetchIssueStats());
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const getStatCount = (statusName) => {
    const statItem = stats?.stats?.find((s) => s._id === statusName);
    return statItem ? statItem.count : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}. Here's the current overview.</p>
        </div>
        <Link to="/report" className="btn-primary">
          + Report New Issue
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reported', value: stats?.total || 0, color: 'text-white' },
          { label: 'Pending', value: getStatCount('pending'), color: 'text-red-400' },
          { label: 'Assigned / Progress', value: getStatCount('assigned') + getStatCount('in_progress'), color: 'text-blue-400' },
          { label: 'Resolved', value: getStatCount('resolved'), color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="card flex flex-col items-center text-center p-6 bg-gradient-to-b from-dark-800 to-dark-900 border-dark-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2">{stat.label}</h3>
            <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Issues</h2>
            <Link to="/my-issues" className="text-sm text-primary-400 hover:text-primary-300">View All →</Link>
          </div>
          <IssueTable issues={issues} isLoading={isLoading} />
        </div>

        {/* Breakdown Column */}
        <div className="space-y-4 text-white">
          <h2 className="text-xl font-bold">Issue Breakdown</h2>
          <div className="card space-y-4">
            {!stats?.byType?.length ? (
              <p className="text-slate-500 text-center py-4">No data available yet.</p>
            ) : (
              stats.byType.map((type) => (
                <div key={type._id} className="flex items-center justify-between">
                  <span className="capitalize text-slate-300">{type._id.replace('_', ' ')}</span>
                  <span className="bg-dark-900 px-3 py-1 rounded-lg text-primary-400 font-bold">
                    {type.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
