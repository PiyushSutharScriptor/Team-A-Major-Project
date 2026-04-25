import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    teamName: '',
    specialization: 'general',
    zone: 'North',
    maxCapacity: 5
  });

  const fetchResources = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/resources');
      setResources(res.data.resources);
    } catch (error) {
      if (!silent) toast.error('Failed to load resources');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const interval = setInterval(() => {
      fetchResources(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', formData);
      toast.success('Resource Team added successfully');
      setFormData({ teamName: '', specialization: 'general', zone: 'North', maxCapacity: 5 });
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add resource team');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource team?")) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource Team deleted successfully');
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resource team');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Resource Management</h1>
        <p className="text-slate-400 mt-1">Add and track specialized resource teams across city zones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD RESOURCE FORM */}
        <div className="card lg:col-span-1 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-white mb-4">Add Team</h2>
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Team Name</label>
              <input required type="text" className="input-field" placeholder="E.g. Alpha Plumbers"
                value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Specialization</label>
              <select required className="input-field bg-dark-700 appearance-none"
                value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})}>
                <option value="garbage">Garbage / Waste</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="road_damage">Road Damage</option>
                <option value="electricity">Electricity</option>
                <option value="sewage">Sewage</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Zone Assignment</label>
              <select required className="input-field bg-dark-700 appearance-none"
                value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}>
                {['North', 'South', 'East', 'West', 'Central', 'Downtown'].map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Workload Capacity</label>
              <input required type="number" min="1" max="20" className="input-field"
                value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: Number(e.target.value)})} />
            </div>

            <button type="submit" className="w-full btn-primary bg-purple-600 hover:bg-purple-700">Add Team</button>
          </form>
        </div>

        {/* RESOURCE LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white">Active Resource Teams</h2>
          
          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>
          ) : resources.length === 0 ? (
            <div className="card text-center py-12 text-slate-400">No resources found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(res => (
                <div key={res._id} className="card p-5 border-l-4 border-l-purple-500 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">{res.teamName}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase
                        ${res.availabilityStatus === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {res.availabilityStatus}
                      </span>
                      <button 
                        onClick={() => handleDeleteResource(res._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded"
                        title="Delete Team"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p><strong className="text-slate-300">Spec:</strong> <span className="capitalize">{res.specialization.replace('_', ' ')}</span></p>
                    <p><strong className="text-slate-300">Zone:</strong> {res.zone}</p>
                    <p><strong className="text-slate-300">Workload:</strong> {res.currentLoad} / {res.maxCapacity} active issues</p>
                  </div>
                  
                  {/* Progress bar for load */}
                  <div className="w-full bg-dark-600 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full ${res.currentLoad >= res.maxCapacity ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (res.currentLoad / res.maxCapacity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;
