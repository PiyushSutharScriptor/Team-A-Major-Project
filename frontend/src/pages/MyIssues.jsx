import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyIssues } from '../store/slices/issueSlice';
import IssueCard from '../components/IssueCard';
import IssueTable from '../components/IssueTable';

const MyIssues = () => {
  const dispatch = useDispatch();
  const { issues, isLoading } = useSelector((state) => state.issues);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Reported Issues</h1>
          <p className="text-slate-400 mt-1">Track the progress of your submitted reports</p>
        </div>
        
        <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-dark-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-dark-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-2 bg-dark-800 border border-dark-700 rounded-xl overflow-x-auto w-max">
        {['all', 'under_review', 'verified', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-all duration-200
              ${filter === status 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-dark-700 hover:text-white'
              }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-6xl mb-4">📭</p>
          <h3 className="text-xl font-bold text-white mb-2">No issues found</h3>
          <p className="text-slate-400">You haven't reported any issues matching this filter.</p>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <IssueTable issues={filteredIssues} isLoading={isLoading} />
        )
      )}
    </div>
  );
};

export default MyIssues;
