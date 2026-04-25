import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReportIssue = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    issueType: 'garbage',
    severity: 'medium',
    description: '',
    address: '',
    lat: '',
    lng: ''
  });
  const [images, setImages] = useState([]);

  // Mock location button
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          toast.success("Location retrieved successfully");
        },
        (error) => toast.error("Please enable location permissions")
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFile = files.find(f => !validTypes.includes(f.type));
    if (invalidFile) {
      toast.error('Only JPG, PNG, and WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (files.length > 3) {
      toast.error('Maximum 3 images allowed');
      e.target.value = '';
      return;
    }
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error('Please provide location coordinates');
      return;
    }
    if (formData.description.trim().length < 15) {
      toast.error('Description must be at least 15 characters');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('issueType', formData.issueType);
      data.append('severity', formData.severity);
      data.append('description', formData.description);
      data.append('address', formData.address);
      data.append('coordinates', JSON.stringify([parseFloat(formData.lng), parseFloat(formData.lat)]));

      Array.from(images).forEach((file) => {
        data.append('images', file);
      });

      await api.post('/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Issue reported! It is now under review by our admin team.');
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message;
      if (error.response?.status === 409) {
        toast.warn(msg || 'This issue has already been reported nearby');
      } else {
        toast.error(msg || 'Failed to report issue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Report an Issue</h1>
        <p className="text-slate-400 mt-1">Help us maintain the city by reporting infrastructure problems.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        
        {/* Type & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Issue Type</label>
            <select className="input-field appearance-none" 
              value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})}>
              <option value="garbage">Garbage / Waste</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="road_damage">Road Damage</option>
              <option value="electricity">Electricity</option>
              <option value="sewage">Sewage</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
            <select className="input-field appearance-none"
              value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
              <option value="low">Low (Minor inconvenience)</option>
              <option value="medium">Medium (Needs attention)</option>
              <option value="high">High (Urgent hazard)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <span className={`text-xs font-medium ${formData.description.trim().length < 15 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formData.description.trim().length} / 500 {formData.description.trim().length < 15 && `(min 15)`}
            </span>
          </div>
          <textarea 
            required
            rows="4" 
            className="input-field resize-none"
            placeholder="Please describe the issue in detail (minimum 15 characters)..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          ></textarea>
          {formData.description.trim().length > 0 && formData.description.trim().length < 15 && (
            <p className="mt-1 text-xs text-red-400">Please provide at least 15 characters to describe the issue.</p>
          )}
        </div>

        {/* Location Section */}
        <div className="p-4 bg-dark-900 rounded-xl border border-dark-600 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-300">Location Details</label>
            <button type="button" onClick={handleGetCurrentLocation} className="text-xs bg-primary-600/20 text-primary-400 px-3 py-1.5 rounded hover:bg-primary-600/30 transition-colors">
              📍 Get Current Location
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="any" required placeholder="Latitude" className="input-field" 
              value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
            <input type="number" step="any" required placeholder="Longitude" className="input-field" 
              value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
          </div>
          <input type="text" placeholder="Detailed Address / Landmark (Optional)" className="input-field" 
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Upload Images (Max 3)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 cursor-pointer"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary mt-8 py-3 text-lg">
          {loading ? 'Submitting Issue...' : 'Submit Issue'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
