import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      const user = resultAction.payload;
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        toast.error('You are not authorized to access the admin panel');
        navigate('/'); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="card w-full max-w-md relative overflow-hidden border-dark-700 bg-dark-800 shadow-2xl">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-400">Company access only. Unauthorized access is forbidden.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="admin@system.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 flex justify-center items-center mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Access Command Center'
            )}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-400 relative z-10">
          Not an admin?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Return to User Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
