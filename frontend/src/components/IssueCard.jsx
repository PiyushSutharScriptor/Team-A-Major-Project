import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  return (
    <span className={`badge-${status} capitalize`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border capitalize ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const IssueCard = ({ issue }) => {
  return (
    <div className="card hover:border-primary-500/30 transition-colors group cursor-pointer h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <StatusBadge status={issue.status} />
          <h3 className="text-lg font-bold text-white capitalize">{issue.issueType.replace('_', ' ')}</h3>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
      
      <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
        {issue.description}
      </p>

      {issue.images && issue.images.length > 0 && (
        <div className="h-32 rounded-xl overflow-hidden mb-4 relative group-hover:shadow-lg transition-shadow">
          <img 
            src={issue.images[0].url} 
            alt="Issue" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="pt-4 border-t border-dark-700 mt-auto flex justify-between items-center text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span>{issue.zone}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🕒</span>
          <span>{format(new Date(issue.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
