import { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post.id}/like`);
      onLike(post.id, data.liked);
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete(post.id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data);
      setShowComments(true);
    } catch {
      // silently ignore
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, {
        content: commentText
      });
      setComments(prev => [data, ...prev]);
      setCommentText('');
    } catch {
      toast.error('Failed to comment');
    } finally {
      setLoadingComment(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const renderContent = (text) => {
    return text.split(/(#\w+)/g).map((part, i) =>
      part.startsWith('#')
        ? <span key={i} className="text-indigo-400 hover:underline cursor-pointer">{part}</span>
        : part
    );
  };

  return (
    <div className="border-b border-white/10 py-4 hover:bg-white/[0.02] transition px-4">
      <div className="flex gap-3">
        <div
          onClick={() => navigate(`/profile/${post.username}`)}
          className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition"
        >
          {post.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                onClick={() => navigate(`/profile/${post.username}`)}
                className="font-semibold text-white text-sm hover:underline cursor-pointer"
              >
                {post.name}
              </span>
              {post.is_verified && (
                <span className="text-indigo-400 text-xs">✓</span>
              )}
              <span className="text-gray-500 text-sm">@{post.username}</span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span>
            </div>

            {user?.id === post.user_id && (
              <button
                onClick={handleDelete}
                className="text-gray-600 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {post.ai_score > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Zap size={11} className="text-indigo-400" />
              <span className="text-xs text-indigo-400">
                AI Score: {(post.ai_score * 100).toFixed(0)}%
              </span>
              {post.ai_reason && (
                <span className="text-xs text-gray-600 truncate">• {post.ai_reason}</span>
              )}
            </div>
          )}

          <p className="text-white text-sm leading-relaxed mb-3">
            {renderContent(post.content)}
          </p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="post"
              className="rounded-xl w-full object-cover max-h-80 mb-3 border border-white/10"
            />
          )}

          <div className="flex items-center gap-6">
            <button
              onClick={loadComments}
              className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 transition text-xs"
            >
              <MessageCircle size={16} />
              <span>{post.comments_count}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition text-xs ${
                post.is_liked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-400'
              }`}
            >
              <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
              <span>{post.likes_count}</span>
            </button>

            <button className="flex items-center gap-1.5 text-gray-500 hover:text-green-400 transition text-xs">
              <Share2 size={16} />
            </button>
          </div>

          {showComments && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex gap-2 mb-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleComment}
                  disabled={loadingComment}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-full text-xs font-semibold transition"
                >
                  Post
                </button>
              </div>

              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold text-white mr-2">{c.name}</span>
                      <span className="text-xs text-gray-300">{c.content}</span>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-2">No comments yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
