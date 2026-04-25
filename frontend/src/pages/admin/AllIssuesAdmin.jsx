import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../../services/api';

const STATUS_BADGE = {
  pending: 'bg-amber-500/20 text-amber-400',
  under_review: 'bg-sky-500/20 text-sky-400',
  verified: 'bg-teal-500/20 text-teal-400',
  assigned: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const AllIssuesAdmin = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', zone: '', severity: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, issueId: null, reason: '' });
  const [viewIssue, setViewIssue] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/issues?${query}&limit=100`);
      setIssues(res.data.issues);
    } catch (error) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleAction = async (id, actionType, extra = {}) => {
    try {
      if (actionType === 'verify') {
        await api.patch(`/issues/${id}/verify`);
        toast.success('Issue verified and resource assigned!');
      } else if (actionType === 'reject') {
        await api.patch(`/issues/${id}/reject`, { reason: extra.reason });
        toast.success('Issue rejected.');
        setRejectModal({ open: false, issueId: null, reason: '' });
      } else if (actionType === 'assign') {
        await api.post(`/issues/${id}/assign`);
        toast.success('Resource auto-assigned successfully');
      } else if (actionType === 'resolve') {
        await api.patch(`/issues/${id}/status`, { status: 'resolved' });
        toast.success('Issue marked as resolved');
      }
      setViewIssue(null);
      fetchIssues();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const openView = (issue) => {
    setViewIssue(issue);
    setImgIndex(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">All System Issues</h1>
        <p className="text-slate-400 mt-1">Review, verify, and manage all reported issues across zones.</p>
      </div>

      {/* ── Issue Detail View Modal ── */}
      {viewIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewIssue(null)}>
          <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-dark-700">
              <h2 className="text-xl font-bold text-white capitalize">{viewIssue.issueType.replace(/_/g, ' ')} Issue</h2>
              <button onClick={() => setViewIssue(null)} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Images */}
              {viewIssue.images && viewIssue.images.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded Photos ({viewIssue.images.length})</p>
                  <div className="relative rounded-xl overflow-hidden bg-dark-900 h-56">
                    <img
                      src={viewIssue.images[imgIndex].url}
                      alt={`Issue photo ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {viewIssue.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        {viewIssue.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIndex(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {viewIssue.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {viewIssue.images.map((img, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? 'border-primary-500' : 'border-dark-600'}`}>
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 rounded-xl bg-dark-900 border border-dark-600 flex items-center justify-center text-slate-500 text-sm">
                  📷 No photos uploaded
                </div>
              )}

              {/* Status & Severity badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_BADGE[viewIssue.status] || 'bg-slate-500/20 text-slate-400'}`}>
                  {viewIssue.status.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${
                  viewIssue.severity === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  viewIssue.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {viewIssue.severity} severity
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Type</p>
                  <p className="text-white font-medium capitalize">{viewIssue.issueType.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zone</p>
                  <p className="text-white font-medium">{viewIssue.zone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reported By</p>
                  <p className="text-white font-medium">{viewIssue.userId?.name || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-primary-400 font-medium text-xs break-all">{viewIssue.userId?.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📞 Mobile Number</p>
                  <p className="text-white font-medium">{viewIssue.userId?.phone || <span className="text-slate-500 italic">Not provided</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reported On</p>
                  <p className="text-white font-medium">{format(new Date(viewIssue.createdAt), 'MMM dd, yyyy — hh:mm a')}</p>
                </div>
                {viewIssue.location?.address && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">📍 Address</p>
                    <p className="text-white font-medium">{viewIssue.location.address}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</p>
                <p className="text-slate-300 leading-relaxed bg-dark-900 rounded-xl p-4 text-sm border border-dark-600">{viewIssue.description}</p>
              </div>

              {/* Rejection reason if present */}
              {viewIssue.status === 'rejected' && viewIssue.rejectionReason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Rejection Reason</p>
                  <p className="text-red-300 text-sm">{viewIssue.rejectionReason}</p>
                </div>
              )}

              {/* Action buttons inside modal */}
              {viewIssue.status === 'under_review' && (
                <div className="flex gap-3 pt-2 border-t border-dark-700">
                  <button
                    onClick={() => handleAction(viewIssue._id, 'verify')}
                    className="flex-1 bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    ✓ Verify Issue
                  </button>
                  <button
                    onClick={() => { setViewIssue(null); setRejectModal({ open: true, issueId: viewIssue._id, reason: '' }); }}
                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    ✕ Reject Issue
                  </button>
                </div>
              )}
              {viewIssue.status === 'verified' && (
                <div className="pt-2 border-t border-dark-700">
                  <button
                    onClick={() => handleAction(viewIssue._id, 'assign')}
                    className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Auto Assign Resource
                  </button>
                </div>
              )}
              {(viewIssue.status === 'assigned' || viewIssue.status === 'in_progress') && (
                <div className="pt-2 border-t border-dark-700">
                  <button
                    onClick={() => handleAction(viewIssue._id, 'resolve')}
                    className="w-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    ✓ Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ── */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Reject Issue</h2>
            <p className="text-slate-400 text-sm">Provide a reason for rejection (optional). The user will be notified.</p>
            <textarea
              className="input-field resize-none"
              rows="3"
              placeholder="e.g. Duplicate report, insufficient detail, incorrect location..."
              value={rejectModal.reason}
              onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal({ open: false, issueId: null, reason: '' })} className="btn-secondary py-2 px-4 text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectModal.issueId, 'reject', { reason: rejectModal.reason || 'Rejected by admin.' })}
                className="btn-danger py-2 px-4 text-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card flex flex-wrap gap-4 items-center bg-dark-800">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
        <select className="input-field w-auto min-w-[150px] py-2 text-sm"
          value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select className="input-field w-auto min-w-[150px] py-2 text-sm"
          value={filters.severity} onChange={e => setFilters({...filters, severity: e.target.value})}>
          <option value="">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select className="input-field w-auto min-w-[150px] py-2 text-sm"
          value={filters.zone} onChange={e => setFilters({...filters, zone: e.target.value})}>
          <option value="">All Zones</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="Central">Central</option>
          <option value="Downtown">Downtown</option>
        </select>

        <button onClick={() => setFilters({ status: '', zone: '', severity: '' })} className="btn-secondary py-2 text-sm ml-auto">
          Clear Filters
        </button>
      </div>

      {/* ── Issues Table ── */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-dark-900 border-b border-dark-700 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Zone</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {loading ? (
              <tr><td colSpan="8" className="text-center py-12"><div className="animate-spin w-8 h-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full"></div></td></tr>
            ) : issues.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-12 text-slate-500">No issues found for this filter.</td></tr>
            ) : (
              issues.map(issue => (
                <tr key={issue._id} className="hover:bg-dark-800 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{issue._id.slice(-6)}</td>
                  <td className="px-6 py-4 font-medium text-white capitalize">{issue.issueType.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4">{issue.userId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{issue.zone}</td>
                  <td className={`px-6 py-4 capitalize font-semibold ${issue.severity === 'high' ? 'text-red-400' : issue.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {issue.severity}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[issue.status] || 'bg-slate-500/20 text-slate-400'}`}>
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                    {issue.status === 'rejected' && issue.rejectionReason && (
                      <p className="text-xs text-red-400/70 mt-1 max-w-[160px] truncate" title={issue.rejectionReason}>↳ {issue.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(issue.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {/* View button — always visible */}
                    <button
                      onClick={() => openView(issue)}
                      className="bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 px-3 py-1.5 rounded font-medium text-xs transition-colors"
                    >
                      👁 View
                    </button>

                    {/* Verify & Reject — only for under_review */}
                    {issue.status === 'under_review' && (
                      <>
                        <button
                          onClick={() => handleAction(issue._id, 'verify')}
                          className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 px-3 py-1.5 rounded font-medium text-xs transition-colors"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, issueId: issue._id, reason: '' })}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded font-medium text-xs transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {/* Auto assign — for verified issues */}
                    {issue.status === 'verified' && (
                      <button
                        onClick={() => handleAction(issue._id, 'assign')}
                        className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded font-medium text-xs transition-colors"
                      >
                        Auto Assign
                      </button>
                    )}

                    {/* Mark resolved — for assigned/in_progress */}
                    {(issue.status === 'assigned' || issue.status === 'in_progress') && (
                      <button
                        onClick={() => handleAction(issue._id, 'resolve')}
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded font-medium text-xs transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllIssuesAdmin;
