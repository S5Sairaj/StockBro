
'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { usePortfolio, PortfolioItem } from '@/hooks/use-portfolio';
import { getStockData } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type PortfolioStock = PortfolioItem & {
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function PortfolioPage() {
    const { user } = useRequireAuth();
    const { portfolio, removeFromPortfolio, isLoaded } = usePortfolio();
    const [stocks, setStocks] = useState<PortfolioStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchPortfolioData = async () => {
            setLoading(true);
            if (portfolio.length === 0) {
                setStocks([]);
                setLoading(false);
                return;
            }

            const stockDataPromises = portfolio.map(async (item) => {
                try {
                    const data = await getStockData(item.symbol, 'daily');
                    // Get the latest two days to calculate change
                    const lastTwo = data.historical.slice(-2);
                    const currentPrice = lastTwo.length > 1 ? lastTwo[1].close : lastTwo[0]?.close || 0;
                    const prevPrice = lastTwo.length > 1 ? lastTwo[0].close : currentPrice;
                    const change = currentPrice - prevPrice;
                    const changePercent = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
                    
                    return {
                        ...item,
                        name: data.details.name,
                        currentPrice,
                        change,
                        changePercent
                    };
                } catch (error) {
                    console.error(`Failed to fetch data for ${item.symbol}`, error);
                    return null;
                }
            });

            const results = await Promise.all(stockDataPromises);
            const validStocks = results.filter((stock): stock is PortfolioStock => stock !== null);
            setStocks(validStocks);
            setLoading(false);
        };

        fetchPortfolioData();
    }, [portfolio, isLoaded, user]);

    if (!user) {
        return null;
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-6">My Portfolio</h2>

                <Card>
                    <CardHeader>
                        <CardTitle>My Holdings</CardTitle>
                        <CardDescription>A detailed view of the stocks in your portfolio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Avg. Cost</TableHead>
                                        <TableHead className="text-right">Current Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
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
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Avg. Cost</TableHead>
                                        <TableHead className="text-right">Current Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stocks.map((stock) => {
                                        return (
                                            <TableRow key={stock.symbol}>
                                                <TableCell className="font-medium">
                                                    <Button variant="link" asChild className="p-0 h-auto text-base">
                                                        <Link href={`/?symbol=${stock.symbol}`}>{stock.symbol}</Link>
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                                                </TableCell>
                                                <TableCell>{stock.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(stock.purchasePrice)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className='flex flex-col items-end'>
                                                        <span>{formatCurrency(stock.currentPrice)}</span>
                                                        <span className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFromPortfolio(stock.symbol)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                         {!loading && stocks.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Your portfolio is empty.</p>
                                <p className="text-sm">Find a stock on the main page to add it to your portfolio.</p>
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
