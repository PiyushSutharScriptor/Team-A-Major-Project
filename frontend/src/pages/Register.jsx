import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', zone: '', phone: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  const zones = ['North', 'South', 'East', 'West', 'Central', 'Downtown'];

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400 mb-2">
            Create Account
          </h1>
          <p className="text-slate-400">Join the smart city initiative</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" required className="input-field" placeholder="John Doe"
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <input type="tel" className="input-field" placeholder="Optional"
                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input type="email" required className="input-field" placeholder="you@example.com"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input type="password" required className="input-field" minLength={6} placeholder="••••••••"
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Residential Zone</label>
              <select required className="input-field ap\eary-none bg-dark-700"
                value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })}>
                <option value="" disabled>Select Zone</option>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary mt-6">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400 relative z-10">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
