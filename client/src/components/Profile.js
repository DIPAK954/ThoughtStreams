import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Post from './Post';

const Profile = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setPosts(user.posts || []);
    }
  }, [user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/post', { content: newPost });
      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/post/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      setError('Failed to delete post');
    }
  };

  const handleUpdatePost = async (postId, newContent) => {
    try {
      await axios.put(`/api/post/${postId}`, { content: newContent });
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, content: newContent } : post
      ));
    } catch (error) {
      setError('Failed to update post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(`/api/like/${postId}`);
      if (response.data.success) {
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, likes: response.data.likes } : post
        ));
      }
    } catch (error) {
      setError('Failed to like post');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-5">
      <div className="max-w-3xl mx-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-5">
          <Link 
            to="/allposts" 
            className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-md text-sm"
          >
            Home
          </Link>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-zinc-800 rounded-lg shadow-lg text-center sm:text-left mb-6">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
            <img 
              className="w-full h-full object-cover" 
              src={`http://localhost:5000/api/profile-picture/${user.profilepic || 'default.png'}`} 
              alt="Profile Pic"
              onError={(e) => {
                e.target.src = 'http://localhost:5000/api/profile-picture/default.png';
              }}
            />
            <Link 
              to="/profile/upload" 
              className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition"
            >
              ✏️
            </Link>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-semibold text-white">Hello, {user.name} 👋</h3>
            <p className="text-sm text-zinc-400"><strong>Username:</strong> {user.username}</p>
            <p className="text-sm text-zinc-400"><strong>Email:</strong> {user.email}</p>
          </div>
        </div>

        {/* Create Post */}
        <div className="mb-6">
          <h5 className="mb-3 text-lg text-zinc-400">You can create a post.</h5>
          <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
            <textarea 
              placeholder="What's on your mind?" 
              className="w-full p-3 outline-none resize-none bg-transparent border-2 border-zinc-800 rounded-md min-h-[100px] focus:border-blue-500 transition-colors"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              required
            />
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create New Post'}
            </button>
          </form>
        </div>

        {/* Posts Section */}
        <div className="posts">
          <h3 className="text-lg text-zinc-400 mb-3">Your Posts</h3>
          <div className="postcontainer grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.length === 0 ? (
              <p className="text-zinc-400 col-span-2 text-center">No posts yet. Create your first post!</p>
            ) : (
              posts.map(post => (
                <Post
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                  onLike={handleLikePost}
                  isOwnPost={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 