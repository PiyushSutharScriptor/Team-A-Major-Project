import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Report Issue', path: '/report', icon: '📝' },
    { name: 'My Issues', path: '/my-issues', icon: '📋' },
    { name: 'Map View', path: '/map', icon: '🗺️' },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const sidebarContent = (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full">
      <div className="h-16 flex items-center px-4 border-b border-dark-700 justify-between">
        <img src="/logo.png" alt="Adaptive Resource Allocation System" className="max-h-14 w-full object-contain" />
        {/* Close button — mobile only */}
        <button onClick={onClose} className="md:hidden ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-xl">{link.icon}</span>
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <span className="text-xl">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          {/* Drawer */}
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
