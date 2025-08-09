
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const STRATEGIES_STORAGE_KEY = 'stockbro-strategies';

export type Strategy = {
    id: string;
    title: string;
    description: string;
};

export const useStrategies = () => {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedStrategies = localStorage.getItem(STRATEGIES_STORAGE_KEY);
            if (storedStrategies) {
                setStrategies(JSON.parse(storedStrategies));
            }
        } catch (error) {
            console.error("Failed to parse strategies from localStorage", error);
            setStrategies([]);
        }
        setIsLoaded(true);
    }, []);

    const saveStrategies = useCallback((newStrategies: Strategy[]) => {
        try {
            setStrategies(newStrategies);
            localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(newStrategies));
        } catch (error) {
            console.error("Failed to save strategies to localStorage", error);
        }
    }, []);

    const addStrategy = useCallback(
        (newStrategy: Omit<Strategy, 'id'>) => {
            const strategyWithId = { ...newStrategy, id: new Date().toISOString() };
            const newStrategies = [...strategies, strategyWithId];
            saveStrategies(newStrategies);
            toast({
                title: "Strategy Added",
                description: `"${strategyWithId.title}" has been saved.`,
            });
        },
        [strategies, saveStrategies, toast]
    );

    const updateStrategy = useCallback(
      (updatedStrategy: Strategy) => {
        const newStrategies = strategies.map((s) =>
          s.id === updatedStrategy.id ? updatedStrategy : s
        );
        saveStrategies(newStrategies);
        toast({
            title: "Strategy Updated",
            description: `"${updatedStrategy.title}" has been updated.`,
        });
      },
      [strategies, saveStrategies, toast]
    );

    const removeStrategy = useCallback(
        (id: string) => {
            const newStrategies = strategies.filter(s => s.id !== id);
            saveStrategies(newStrategies);
            toast({
                title: "Strategy Removed",
                description: `The strategy has been deleted.`,
                variant: 'destructive',
            });
        },
        [strategies, saveStrategies, toast]
    );

    return { strategies, addStrategy, updateStrategy, removeStrategy, isLoaded };
};
