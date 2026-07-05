import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async (pageNum = 1) => {
    try {
      const { data } = await api.get(`/feed?page=${pageNum}`);
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(data.hasMore);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleLike = (postId, liked) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: liked, likes_count: liked ? p.likes_count + 1 : p.likes_count - 1 }
        : p
    ));
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchFeed(next);
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="mb-6 pb-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">Home</h1>
        <p className="text-xs text-indigo-400 mt-0.5">AI-ranked feed</p>
      </div>

      <PostComposer onPost={handleNewPost} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
