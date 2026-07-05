import { Link, useNavigate } from 'react-router-dom';
import { Home, Bell, User, LogOut, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: null },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/10 flex flex-col p-6">
      <div className="flex items-center gap-2 mb-10">
        <Zap className="text-indigo-500" size={28} />
        <span className="text-2xl font-bold text-white">NexFeed</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={label}
            to={path || `/profile/${user?.username}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
