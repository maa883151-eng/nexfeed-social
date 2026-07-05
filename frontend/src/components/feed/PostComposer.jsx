import { useState } from 'react';
import { Image, Hash, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PostComposer({ onPost }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/posts', { content });
      onPost(data);
      setContent('');
      toast.success('Posted!');
    } catch {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-white/10 pb-4 mb-2">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base"
          />

          {content.length > 0 && (
            <p className="text-xs text-gray-600 mb-2">
              <Hash size={10} className="inline mr-1" />
              Use #hashtags to help AI rank your post
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex gap-3">
              <button type="button" className="text-indigo-400 hover:text-indigo-300 transition">
                <Image size={18} />
              </button>
              <button type="button" className="text-indigo-400 hover:text-indigo-300 transition">
                <Hash size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={`text-xs ${content.length > 280 ? 'text-red-400' : 'text-gray-500'}`}>
                  {content.length}/280
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || content.length > 280}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full text-sm font-semibold transition flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
