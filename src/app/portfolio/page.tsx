
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRequireAuth } from '@/hooks/use-auth';
import { usePortfolio, PortfolioItem } from '@/hooks/use-portfolio';
import { getStockData } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type PortfolioStock = PortfolioItem & {
    name: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const StatCard = ({ label, value, valueClass, icon, description, descriptionClass }: { label: string, value: string, valueClass?: string, icon?: React.ReactNode, description?: string, descriptionClass?: string }) => (
    <div className="flex flex-col space-y-1 rounded-lg border p-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</p>
        <p className={cn("text-lg font-bold", valueClass)}>{value}</p>
        {description && <p className={cn("text-xs", descriptionClass)}>{description}</p>}
    </div>
);


export default function PortfolioPage() {
    const { user } = useRequireAuth();
    const { portfolio, removeFromPortfolio, isLoaded } = usePortfolio();
    const [stocks, setStocks] = useState<PortfolioStock[]>([]);
    const [loading, setLoading] = useState(true);

     const portfolioSummary = useMemo(() => {
        if (!stocks || stocks.length === 0) {
            return {
                totalValue: 0,
                totalCost: 0,
                totalGainLoss: 0,
                totalGainLossPercent: 0,
            };
        }

        const totalValue = stocks.reduce((acc, stock) => acc + stock.totalValue, 0);
        const totalCost = stocks.reduce((acc, stock) => acc + stock.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

        return { totalValue, totalCost, totalGainLoss, totalGainLossPercent };
    }, [stocks]);


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
                    const lastTwo = data.historical.slice(-2);
                    const currentPrice = lastTwo.length > 1 ? lastTwo[1].close : lastTwo[0]?.close || 0;
                    const prevPrice = lastTwo.length > 1 ? lastTwo[0].close : currentPrice;
                    const change = currentPrice - prevPrice;
                    const changePercent = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
                    
                    const totalCost = item.quantity * item.purchasePrice;
                    const totalValue = item.quantity * currentPrice;
                    const totalGainLoss = totalValue - totalCost;
                    const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

                    return {
                        ...item,
                        name: data.details.name,
                        currentPrice,
                        change,
                        changePercent,
                        totalValue,
                        totalCost,
                        totalGainLoss,
                        totalGainLossPercent,
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
    
    const { totalValue, totalCost, totalGainLoss, totalGainLossPercent } = portfolioSummary;
    const gainLossColor = totalGainLoss >= 0 ? "text-green-500" : "text-red-500";
    const gainLossIcon = totalGainLoss === 0 ? <Minus className="h-4 w-4" /> : totalGainLoss > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Portfolio</h2>
                    <p className="text-muted-foreground">An overview of your investment performance.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Portfolio Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Skeleton className="h-[90px] w-full" />
                                <Skeleton className="h-[90px] w-full" />
                                <Skeleton className="h-[90px] w-full" />
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <StatCard 
                                    label="Total Market Value"
                                    value={formatCurrency(totalValue)}
                               />
                               <StatCard 
                                    label="Total Gain/Loss"
                                    value={formatCurrency(totalGainLoss)}
                                    valueClass={gainLossColor}
                                    icon={gainLossIcon}
                                    description={`${totalGainLossPercent.toFixed(2)}%`}
                                    descriptionClass={gainLossColor}

                               />
                               <StatCard 
                                    label="Total Cost Basis"
                                    value={formatCurrency(totalCost)}
                               />
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                                        <TableHead>Avg. Cost</TableHead>
                                        <TableHead>Current Price</TableHead>
                                        <TableHead>Market Value</TableHead>
                                        <TableHead>Total Gain/Loss</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                                        <TableHead className="w-[180px]">Symbol</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Avg. Cost</TableHead>
                                        <TableHead>Current Price</TableHead>
                                        <TableHead>Market Value</TableHead>
                                        <TableHead>Total Gain/Loss</TableHead>
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
                                                    <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                                                </TableCell>
                                                <TableCell>{stock.quantity.toLocaleString()}</TableCell>
                                                <TableCell>{formatCurrency(stock.purchasePrice)}</TableCell>
                                                <TableCell>
                                                    <div className='flex flex-col items-start'>
                                                        <span>{formatCurrency(stock.currentPrice)}</span>
                                                        <span className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                                                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatCurrency(stock.totalValue)}</TableCell>
                                                <TableCell>
                                                     <div className='flex flex-col items-start'>
                                                        <span className={cn(stock.totalGainLoss >= 0 ? "text-green-500" : "text-red-500")}>
                                                          {formatCurrency(stock.totalGainLoss)}
                                                        </span>
                                                        <span className={cn("text-xs", stock.totalGainLoss >= 0 ? "text-green-500" : "text-red-500")}>
                                                          ({stock.totalGainLossPercent.toFixed(2)}%)
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
