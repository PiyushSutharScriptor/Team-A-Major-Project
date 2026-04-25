import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Standard Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import NotificationsPage from './pages/NotificationsPage';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';

// Admin Layout
import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManagement from './pages/admin/AdminManagement';
import AddAdmin from './pages/admin/AddAdmin';
import AllIssuesAdmin from './pages/admin/AllIssuesAdmin';
import ResourceManagement from './pages/admin/ResourceManagement';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : (user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />)} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : (user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />)} />
      <Route path="/admin/login" element={isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />

      {/* Protected Routes directly rendering into Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/my-issues" element={<MyIssues />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/management" element={<AdminManagement />} />
        <Route path="/admin/add-admin" element={<AddAdmin />} />
        <Route path="/admin/issues" element={<AllIssuesAdmin />} />
        <Route path="/admin/resources" element={<ResourceManagement />} />
        <Route path="/admin/map" element={<MapPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
