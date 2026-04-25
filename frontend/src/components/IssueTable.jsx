import { format } from 'date-fns';

const StatusBadge = ({ status }) => (
  <span className={`badge-${status} capitalize`}>
    {status.replace('_', ' ')}
  </span>
);

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400 font-bold',
  };
  return <span className={`capitalize ${colors[severity]}`}>{severity}</span>;
};

const IssueTable = ({ issues, isLoading }) => {
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="card text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-lg">No issues found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-700">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-dark-800 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Zone</th>
            <th className="px-6 py-4 font-medium">Severity</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700 bg-dark-900/50">
          {issues.map((issue) => (
            <tr key={issue._id} className="hover:bg-dark-800 transition-colors">
              <td className="px-6 py-4 font-medium text-white capitalize">
                {issue.issueType.replace('_', ' ')}
              </td>
              <td className="px-6 py-4">{issue.zone}</td>
              <td className="px-6 py-4"><SeverityBadge severity={issue.severity} /></td>
              <td className="px-6 py-4"><StatusBadge status={issue.status} /></td>
              <td className="px-6 py-4">{format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable;
