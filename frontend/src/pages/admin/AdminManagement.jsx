import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../../services/api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/emails');
      setAdmins(res.data.data); // data contains the array from getAdminEmails
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/emails/${id}/status`, { status: newStatus });
      toast.success(`Admin marked as ${newStatus}`);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Management</h1>
          <p className="text-slate-400 mt-1">Review all personnel authorized with administrative access.</p>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-dark-900 border-b border-dark-700 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">Admin Email</th>
              <th className="px-6 py-4 font-bold">Created Date</th>
              <th className="px-6 py-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-12">
                  <div className="animate-spin w-8 h-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full"></div>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-12 text-slate-500">
                  No administrators found in the database.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-dark-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(admin.createdAt), 'MMM dd, yyyy • hh:mm a')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(admin._id, 'active')}
                        className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider transition-colors
                          ${(!admin.status || admin.status === 'active')
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 cursor-default' 
                            : 'bg-transparent text-slate-500 border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50'
                          }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(admin._id, 'restricted')}
                        className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider transition-colors
                          ${admin.status === 'restricted'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50 cursor-default' 
                            : 'bg-transparent text-slate-500 border-slate-700 hover:text-red-400 hover:border-red-500/50'
                          }`}
                      >
                        Restrict
                      </button>
                    </div>
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

export default AdminManagement;
