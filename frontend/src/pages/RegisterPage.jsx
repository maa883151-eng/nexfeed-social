import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.username, form.email, form.password);
    if (result.success) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="w-full max-w-md p-8 bg-[#1a1a1a] rounded-2xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-500">NexFeed</h1>
          <p className="text-gray-400 mt-2">Join the AI-Powered Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'username', 'email', 'password'].map((field) => (
            <div key={field}>
              <label className="text-sm text-gray-400 capitalize">{field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full mt-1 px-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
