import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AddAdmin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/add-admin', { email });
      toast.success('Admin email authorized successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to authorize admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Authorize Admin</h1>
        <p className="text-slate-400 mt-1">Add emails that are allowed to register/login as administrators.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email Address</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="colleague@system.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-600/20">
          {loading ? 'Authorizing...' : 'Authorize Admin Access'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-dark-800 border-l-4 border-emerald-500 rounded-r-xl">
        <h4 className="font-bold text-white mb-1">How it works</h4>
        <p className="text-sm text-slate-400">
          Once an email is authorized here, that person can go to the standard Register page, select "Admin" as their role, and create their account. Unauthorized emails will be rejected.
        </p>
      </div>
    </div>
  );
};

export default AddAdmin;
