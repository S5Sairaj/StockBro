
'use client';

import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_STORAGE_KEY = 'stockbro-watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
        console.error("Failed to parse watchlist from localStorage", error);
        setWatchlist([]);
    }
    setIsLoaded(true);
  }, []);

  const saveWatchlist = useCallback((newWatchlist: string[]) => {
    try {
        setWatchlist(newWatchlist);
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
    } catch(error) {
        console.error("Failed to save watchlist to localStorage", error);
    }
  }, []);

  const addToWatchlist = useCallback(
    (symbol: string) => {
      if (!watchlist.includes(symbol)) {
        const newWatchlist = [...watchlist, symbol];
        saveWatchlist(newWatchlist);
      }
    },
    [watchlist, saveWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (symbol: string) => {
      const newWatchlist = watchlist.filter((item) => item !== symbol);
      saveWatchlist(newWatchlist);
    },
    [watchlist, saveWatchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isLoaded };
};
