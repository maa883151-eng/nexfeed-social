import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import PostCard from '../components/feed/PostCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${username}`);
      setProfile(data);
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/users/${username}/posts`);
      setPosts(data.posts);
    } catch {
      // silently ignore
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/users/${profile.id}/follow`);
      setProfile(prev => ({
        ...prev,
        is_following: data.following,
        followers_count: data.following
          ? prev.followers_count + 1
          : prev.followers_count - 1
      }));
    } catch {
      toast.error('Failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleLike = (postId, liked) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: liked, likes_count: liked ? p.likes_count + 1 : p.likes_count - 1 }
        : p
    ));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  if (!profile) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-500">User not found</p>
    </div>
  );

  const isOwn = currentUser?.username === username;

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold">
            {profile.name?.[0]?.toUpperCase()}
          </div>

          {!isOwn && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition ${
                profile.is_following
                  ? 'border border-white/20 text-gray-300 hover:border-red-400 hover:text-red-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {profile.is_following
                ? <><UserCheck size={15} /> Following</>
                : <><UserPlus size={15} /> Follow</>
              }
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <p className="text-gray-500 text-sm mb-2">@{profile.username}</p>
        {profile.bio && <p className="text-gray-300 text-sm mb-4">{profile.bio}</p>}

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-white font-bold">{profile.posts_count}</p>
            <p className="text-gray-500 text-xs">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.followers_count}</p>
            <p className="text-gray-500 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold">{profile.following_count}</p>
            <p className="text-gray-500 text-xs">Following</p>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-600 py-12">No posts yet</p>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
