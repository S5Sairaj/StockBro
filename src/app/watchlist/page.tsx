
'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { useWatchlist } from '@/hooks/use-watchlist';
import { getStockData } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type WatchlistStock = {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
};

export default function WatchlistPage() {
    const { user } = useRequireAuth();
    const { watchlist, removeFromWatchlist, isLoaded } = useWatchlist();
    const [stocks, setStocks] = useState<WatchlistStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchWatchlistData = async () => {
            setLoading(true);
            if (watchlist.length === 0) {
                setStocks([]);
                setLoading(false);
                return;
            }

            const stockDataPromises = watchlist.map(async (symbol) => {
                try {
                    const data = await getStockData(symbol, 'daily');
                    const lastTwo = data.historical.slice(-2);
                    const price = lastTwo[1]?.price || 0;
                    const prevPrice = lastTwo[0]?.price || price;
                    const change = price - prevPrice;
                    const changePercent = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
                    
                    return {
                        symbol,
                        name: data.details.name,
                        price,
                        change,
                        changePercent
                    };
                } catch (error) {
                    console.error(`Failed to fetch data for ${symbol}`, error);
                    // Return null or a specific error object if a stock fails
                    return null;
                }
            });

            const results = await Promise.all(stockDataPromises);
            setStocks(results.filter((stock): stock is WatchlistStock => stock !== null));
            setLoading(false);
        };

        fetchWatchlistData();
    }, [watchlist, isLoaded, user]);

    if (!user) {
        return null; // or a loading spinner, as useRequireAuth will redirect
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-6">My Watchlist</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Saved Stocks</CardTitle>
                        <CardDescription>Stocks you are currently tracking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Change</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {!loading && stocks.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Change</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stocks.map((stock) => (
                                        <TableRow key={stock.symbol}>
                                            <TableCell className="font-medium">
                                                <Button variant="link" asChild className="p-0 h-auto">
                                                    <Link href={`/?symbol=${stock.symbol}`}>{stock.symbol}</Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell>{stock.name}</TableCell>
                                            <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                                            <TableCell className={cn(
                                                "text-right",
                                                stock.change >= 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                    <span>{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFromWatchlist(stock.symbol)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                         {!loading && stocks.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Your watchlist is empty.</p>
                                <p className="text-sm">Add stocks from the main page to start tracking them.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/">Find Stocks</Link>
                                </Button>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
