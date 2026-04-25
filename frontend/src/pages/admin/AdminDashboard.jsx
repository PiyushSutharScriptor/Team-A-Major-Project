import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllIssues } from '../../store/slices/issueSlice';
import { fetchIssueStats } from '../../store/slices/issueSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, issues, isLoading } = useSelector((state) => state.issues);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchIssueStats());
    dispatch(fetchAllIssues('limit=5'));
  }, [dispatch]);

  const getStatCount = (statusName) => {
    const statItem = stats?.stats?.find((s) => s._id === statusName);
    return statItem ? statItem.count : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Overview</h1>
          <p className="text-slate-400 mt-1">Command center dashboard for {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Review', value: getStatCount('under_review'), color: 'text-sky-400', icon: '🔍' },
          { label: 'Pending Response', value: getStatCount('pending') + getStatCount('verified'), color: 'text-amber-400', icon: '🔴' },
          { label: 'Currently Assigned', value: getStatCount('assigned') + getStatCount('in_progress'), color: 'text-purple-400', icon: '🚚' },
          { label: 'Successfully Resolved', value: getStatCount('resolved'), color: 'text-emerald-400', icon: '✅' },
        ].map((stat, i) => (
          <div key={i} className="card p-6 bg-gradient-to-br from-dark-800 to-dark-900 flex justify-between items-center border-l-4 border-l-dark-600 hover:border-l-purple-500 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
      
      {/* Short table for recent issues */}
      <div className="card space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Urgent / Recent Issues</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-dark-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Zone</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700 bg-dark-900/50">
              {issues && issues.map((issue) => (
                <tr key={issue._id} className="hover:bg-dark-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-white capitalize">{issue.issueType.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{issue.zone}</td>
                  <td className="px-6 py-4">{issue.severity}</td>
                  <td className="px-6 py-4">{issue.status}</td>
                </tr>
              ))}
              {(!issues || issues.length === 0) && !isLoading && (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">No recent issues found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
