import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

export function useLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/lists');
      setLists(data.lists);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createList = async (payload) => {
    const { data } = await api.post('/lists', payload);
    setLists((prev) => [data.list, ...prev]);
    return data.list;
  };

  const deleteList = async (listId) => {
    await api.delete(`/lists/${listId}`);
    setLists((prev) => prev.filter((l) => l._id !== listId));
  };

  return { lists, loading, error, createList, deleteList, refetch };
}

export function useList(listId) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(false);
  const [lastPick, setLastPick] = useState(null);

  const refetch = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/lists/${listId}`);
      setList(data.list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = async (payload) => {
    const { data } = await api.post(`/lists/${listId}/items`, payload);
    setList((prev) => ({
      ...prev,
      items: [...prev.items, data.item],
    }));
    return data.item;
  };

  const updateItem = async (itemId, payload) => {
    const { data } = await api.patch(`/lists/${listId}/items/${itemId}`, payload);
    setList((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === itemId ? data.item : item
      ),
    }));
    return data.item;
  };

  const deleteItem = async (itemId) => {
    await api.delete(`/lists/${listId}/items/${itemId}`);
    setList((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== itemId),
    }));
  };

  const updateList = async (payload) => {
    const { data } = await api.patch(`/lists/${listId}`, payload);
    setList(data.list);
    return data.list;
  };

  const pick = async () => {
    setPicking(true);
    setError(null);
    try {
      const { data } = await api.post(`/lists/${listId}/pick`);
      setLastPick(data.picked);
      setList((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item._id === data.picked._id
            ? { ...item, lastPickedAt: new Date().toISOString() }
            : item
        ),
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Pick failed';
      setError(msg);
      throw err;
    } finally {
      setPicking(false);
    }
  };

  const clearLastPick = () => setLastPick(null);

  return {
    list,
    loading,
    error,
    picking,
    lastPick,
    addItem,
    updateItem,
    deleteItem,
    updateList,
    pick,
    clearLastPick,
    refetch,
  };
}
