import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications } from '../store/slices/notificationSlice';

const Navbar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdminActive = location.pathname.startsWith('/admin');

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  return (
    <nav className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors mr-1"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Panel label — role-specific */}
        {user?.role === 'admin' ? (
          <Link
            to="/admin/dashboard"
            className={`text-sm font-bold transition-colors px-2.5 py-1.5 rounded-lg ${isAdminActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-dark-700'}`}
          >
            Admin Panel
          </Link>
        ) : (
          <Link
            to="/"
            className={`text-sm font-bold transition-colors px-2.5 py-1.5 rounded-lg ${!isAdminActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-dark-700'}`}
          >
            User Panel
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Link to="/notifications" className="relative p-2 text-slate-300 hover:text-white transition-colors">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-slow border-2 border-dark-800">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role} • {user?.zone}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-dark-700 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
