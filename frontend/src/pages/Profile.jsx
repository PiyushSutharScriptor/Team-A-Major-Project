import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import api from '../services/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    zone: user?.zone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      dispatch(updateUser(response.data.user));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      const response = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateUser(response.data.user));
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Your Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Avatar Section */}
        <div className="card lg:col-span-1 flex flex-col items-center justify-center p-8">
          <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current.click()}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dark-600 group-hover:border-primary-500 transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-medium text-sm">Change</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarUpload}
            />
          </div>
          <h2 className="text-xl font-bold text-white capitalize">{user?.name}</h2>
          <p className="text-primary-400 capitalize bg-primary-500/10 px-3 py-1 rounded-full text-sm font-medium mt-2">
            {user?.role}
          </p>
          <p className="text-slate-500 mt-3">{user?.email}</p>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          
          <form onSubmit={handleProfileUpdate} className="card space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-dark-700 pb-4">Personal Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input type="text" className="input-field" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input type="tel" className="input-field" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Zone</label>
              <select className="input-field appearance-none bg-dark-700"
                value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}>
                {['North', 'South', 'East', 'West', 'Central', 'Downtown'].map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Password Change */}
          <form onSubmit={handlePasswordChange} className="card space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-dark-700 pb-4">Security</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <input type="password" required className="input-field max-w-md" 
                value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input type="password" required minLength={6} className="input-field" 
                  value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input type="password" required minLength={6} className="input-field" 
                  value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn-secondary">Update Password</button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;
