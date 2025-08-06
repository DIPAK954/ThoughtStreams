import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Post = ({ post, currentUser, onDelete, onUpdate, onLike, isOwnPost }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser._id) || false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sync isLiked state when post.likes changes
  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser._id) || false);
  }, [post.likes, currentUser._id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
  };

  const handleSave = () => {
    onUpdate(post._id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleLike = () => {
    onLike(post._id);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(post._id);
    setShowDeleteModal(false);
  };

  return (
    <div className="p-4 rounded-md border-2 border-zinc-800 bg-zinc-700 relative">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-blue-500">
          {isOwnPost ? (
            `@${currentUser.username}`
          ) : (
            <Link to={`/user/${post.user._id}`} className="hover:underline">
              @{post.user.username}
            </Link>
          )}
        </h4>
        <small className="text-zinc-400">
          {new Date(post.date).toLocaleDateString()}
        </small>
      </div>
      {isEditing ? (
        <div className="mb-3">
          <textarea
            className="w-full p-2 outline-none bg-transparent border-2 border-zinc-600 rounded-md resize-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm tracking-tight mb-3">{post.content}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <small className="text-zinc-400">{post.likes?.length || 0} Likes</small>
          <button
            onClick={handleLike}
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            {isLiked ? "❤️" : "🤍"}
          </button>
        </div>
        {isOwnPost && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="text-yellow-500 hover:text-yellow-400 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-400 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Delete Post?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post; 