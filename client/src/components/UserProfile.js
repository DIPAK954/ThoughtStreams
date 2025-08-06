import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Post from './Post';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/user/${id}`);
      setUser(response.data.user);
    } catch (error) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(`/api/like/${postId}`);
      if (response.data.success) {
        setUser(prevUser => ({
          ...prevUser,
          posts: prevUser.posts.map(post => 
            post._id === postId ? { ...post, likes: response.data.likes } : post
          )
        }));
      }
    } catch (error) {
      setError('Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'User not found'}</div>
          <Link to="/allposts" className="text-blue-400 hover:underline">
            Back to All Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-5">
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="bg-zinc-800 rounded-lg p-6 shadow-lg text-center mb-6">
          <img 
            src={`http://localhost:5000/api/profile-picture/${user.profilepic || 'default.png'}`} 
            alt="Profile Picture" 
            className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500 mb-4"
            onError={(e) => {
              e.target.src = 'http://localhost:5000/api/profile-picture/default.png';
            }}
          />
          <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
          <p className="text-zinc-400">@{user.username}</p>
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Posts</h3>

          {user.posts.length === 0 ? (
            <p className="text-zinc-400 text-center">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {user.posts.map(post => (
                <Post
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLikePost}
                  isOwnPost={post.user._id === currentUser._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link 
            to="/allposts" 
            className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 