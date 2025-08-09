
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const PORTFOLIO_STORAGE_KEY = 'stockbro-portfolio';

export type PortfolioItem = {
    symbol: string;
    quantity: number;
    purchasePrice: number;
};

export const usePortfolio = () => {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedPortfolio = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
            if (storedPortfolio) {
                setPortfolio(JSON.parse(storedPortfolio));
            }
        } catch (error) {
            console.error("Failed to parse portfolio from localStorage", error);
            setPortfolio([]);
        }
        setIsLoaded(true);
    }, []);

    const savePortfolio = useCallback((newPortfolio: PortfolioItem[]) => {
        try {
            setPortfolio(newPortfolio);
            localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(newPortfolio));
        } catch (error) {
            console.error("Failed to save portfolio to localStorage", error);
        }
    }, []);

    const addToPortfolio = useCallback(
        (newItem: PortfolioItem) => {
            const existingItemIndex = portfolio.findIndex(item => item.symbol === newItem.symbol);
            let newPortfolio = [...portfolio];

            if (existingItemIndex > -1) {
                // If stock already exists, update quantity and average price
                const existingItem = newPortfolio[existingItemIndex];
                const totalQuantity = existingItem.quantity + newItem.quantity;
                const totalCost = (existingItem.quantity * existingItem.purchasePrice) + (newItem.quantity * newItem.purchasePrice);
                existingItem.quantity = totalQuantity;
                existingItem.purchasePrice = totalCost / totalQuantity;
            } else {
                // Otherwise, add new stock
                newPortfolio.push(newItem);
            }
            savePortfolio(newPortfolio);
            toast({
                title: "Portfolio Updated",
                description: `${newItem.quantity} shares of ${newItem.symbol} added to your portfolio.`,
            });
        },
        [portfolio, savePortfolio, toast]
    );

    const removeFromPortfolio = useCallback(
        (symbol: string) => {
            const newPortfolio = portfolio.filter(item => item.symbol !== symbol);
            savePortfolio(newPortfolio);
            toast({
                title: "Stock Removed",
                description: `${symbol} has been removed from your portfolio.`,
            });
        },
        [portfolio, savePortfolio, toast]
    );
    
    const updatePortfolioItem = useCallback(
      (symbol: string, quantity: number, purchasePrice: number) => {
        const newPortfolio = portfolio.map((item) =>
          item.symbol === symbol ? { ...item, quantity, purchasePrice } : item
        );
        savePortfolio(newPortfolio);
        toast({
            title: "Portfolio Updated",
            description: `Your holdings for ${symbol} have been updated.`,
        });
      },
      [portfolio, savePortfolio, toast]
    );


    return { portfolio, addToPortfolio, removeFromPortfolio, updatePortfolioItem, isLoaded };
};
