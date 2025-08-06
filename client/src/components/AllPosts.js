import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Post from './Post';

const AllPosts = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
    setSearchMessage('');
  }, [searchTerm, posts]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data.posts);
    } catch (error) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const filtered = posts.filter(post => 
      post.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
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

  const visitProfile = () => {
    if (!searchTerm.trim()) {
      setSearchMessage('Please enter a username to search.');
      return;
    }
    const foundPost = posts.find(post => 
      post.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (foundPost) {
      window.location.href = `/user/${foundPost.user._id}`;
    } else {
      setSearchMessage('User not found!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div>Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-5">
      <div className="max-w-3xl mx-auto">
        {/* Search Bar and Profile Button */}
        <div className="mb-5 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search for a user..."
            className="w-full p-3 outline-none bg-zinc-800 border border-zinc-600 rounded-md text-white focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') visitProfile(); }}
          />
          <button
            onClick={visitProfile}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            🔍
          </button>
          <Link
            to="/profile"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Profile
          </Link>
        </div>
        {searchMessage && (
          <div className="mb-4 p-2 bg-yellow-500 text-white rounded text-center text-sm">{searchMessage}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">
            {error}
          </div>
        )}
        {/* Posts Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredPosts.length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400">
              {searchTerm ? 'No users found matching your search.' : 'No posts available.'}
            </div>
          ) : (
            filteredPosts.map(post => (
              <Post
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLikePost}
                isOwnPost={post.user._id === user._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPosts; 