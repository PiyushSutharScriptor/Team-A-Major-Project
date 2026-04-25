import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationSlice';
import { format } from 'date-fns';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Updates on your reported issues</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-primary-400 hover:text-primary-300 bg-primary-500/10 px-4 py-2 rounded-lg transition-colors border border-primary-500/20"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && items.length === 0 ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-20 text-slate-400">
            <p className="text-5xl mb-3">🔔</p>
            <p className="text-lg">You have no notifications yet.</p>
          </div>
        ) : (
          items.map((notification) => (
            <div 
              key={notification._id} 
              className={`p-5 rounded-xl border transition-all flex gap-4 
                ${!notification.isRead 
                  ? 'bg-dark-800 border-primary-500/30 shadow-lg shadow-primary-500/5' 
                  : 'bg-dark-900 border-dark-700 opacity-70'
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl
                ${!notification.isRead ? 'bg-primary-600/20 text-primary-400' : 'bg-dark-800 text-slate-500'}`}
              >
                {notification.type === 'issue_resolved' ? '✅' :
                 notification.type === 'issue_assigned' ? '🚚' :
                 notification.type === 'escalation' ? '⚠️' : '📢'}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <p className={`text-sm md:text-base ${!notification.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-slate-500 mt-2 font-medium">
                  {format(new Date(notification.createdAt), 'MMM dd, yyyy • hh:mm a')}
                </span>
              </div>

              {!notification.isRead && (
                <div className="flex items-center">
                  <button 
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="w-10 h-10 rounded-full bg-dark-700 hover:bg-dark-600 text-primary-400 flex items-center justify-center transition-colors"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
