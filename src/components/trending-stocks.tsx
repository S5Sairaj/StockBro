'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TrendingStocksProps {
  stocks: Stock[];
  isLoading: boolean;
  onStockClick: (symbol: string) => void;
}

export default function TrendingStocks({ stocks, isLoading, onStockClick }: TrendingStocksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Stocks</CardTitle>
        <CardDescription>A selection of S&P 500 companies.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className='flex-1 pr-4'>
                        <Skeleton className="h-5 w-20 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className='w-24 text-right'>
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            ))}
          </div>
        ) : stocks && stocks.length > 0 ? (
          <ul className="divide-y divide-border -mx-6">
            {stocks.map((stock) => (
              <li 
                key={stock.symbol} 
                className="flex items-center justify-between p-4 px-6 hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => onStockClick(stock.symbol)}
              >
                <div className="flex-1 pr-4 overflow-hidden">
                  <p className="font-bold">{stock.symbol}</p>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  <div
                    className={cn(
                      'text-sm flex items-center justify-end gap-1',
                      stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
            <div className="text-center text-muted-foreground p-4">
              <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-sm font-semibold">Could not load featured stocks</p>
              <p className="text-xs">This can happen sometimes. Please try again later.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}