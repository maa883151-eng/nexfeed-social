import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

export default function RightPanel() {
  const [trending, setTrending] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending();
    fetchSuggestions();
  }, []);

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/feed/hashtags/trending');
      setTrending(data);
    } catch {
      // silently ignore
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/users/search?q=');
      setUsers(data.slice(0, 4));
    } catch {
      // silently ignore
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 1) {
      try {
        const { data } = await api.get(`/users/search?q=${val}`);
        setUsers(data);
      } catch {
        // silently ignore
      }
    }
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-[#0f0f0f] border-l border-white/10 p-6 overflow-y-auto">
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Trending</h3>
        </div>
        <div className="space-y-2">
          {trending.length > 0 ? trending.map((tag, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
              <span className="text-indigo-400 text-sm font-medium">{tag.tag}</span>
              <span className="text-xs text-gray-500">{tag.count} posts</span>
            </div>
          )) : (
            <p className="text-xs text-gray-600 px-3">No trending tags yet</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Who to Follow</h3>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => navigate(`/profile/${u.username}`)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
              <span className="text-xs text-indigo-400 font-medium">Follow</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
