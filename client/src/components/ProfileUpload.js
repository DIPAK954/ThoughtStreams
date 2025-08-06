import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigate('/profile');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-zinc-800 p-8 rounded-lg shadow-md">
        <h3 className="text-2xl mb-5 text-center font-semibold">Upload Profile Picture</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-zinc-400 mb-2 block">Choose an image:</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition
                cursor-pointer"
            />
          </label>

          {selectedFile && (
            <div className="text-sm text-zinc-400">
              Selected: {selectedFile.name}
            </div>
          )}

          <button
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-md cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/profile')}
            className="text-blue-400 hover:underline"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpload; 