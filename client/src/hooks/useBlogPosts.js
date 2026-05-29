import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

export function useBlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get('/blog-posts');
      setPosts(data.posts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createPost = async (payload) => {
    const { data } = await api.post('/blog-posts', payload);
    setPosts((prev) => [data.post, ...prev]);
    return data.post;
  };

  const updatePost = async (postId, payload) => {
    const { data } = await api.patch(`/blog-posts/${postId}`, payload);
    setPosts((prev) => prev.map((post) => (post._id === postId ? data.post : post)));
    return data.post;
  };

  const deletePost = async (postId) => {
    await api.delete(`/blog-posts/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refetch,
  };
}
