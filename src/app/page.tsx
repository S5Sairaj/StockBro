'use client';

import { useState } from 'react';
import { z } from 'zod';
import { predictStockTrends, type PredictStockTrendsOutput } from '@/ai/flows/predict-stock-trends';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import StockForm from '@/components/stock-form';
import StockDetails from '@/components/stock-details';
import PriceChart from '@/components/price-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const stockSymbolSchema = z.string().min(1, 'Stock symbol is required.').max(5, 'Stock symbol must be 5 characters or less.');

// Mock data generation
const generateMockData = (symbol: string, timeframe: string) => {
  const stockDetails: { [key: string]: { name: string; description: string; exchange: string } } = {
    'GOOGL': { name: 'Alphabet Inc.', description: 'A multinational technology company focusing on AI, search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.', exchange: 'NASDAQ' },
    'AAPL': { name: 'Apple Inc.', description: 'A multinational technology company that specializes in consumer electronics, software, and online services.', exchange: 'NASDAQ' },
    'MSFT': { name: 'Microsoft Corporation', description: 'A multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.', exchange: 'NASDAQ' },
    'AMZN': { name: 'Amazon.com, Inc.', description: 'A multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.', exchange: 'NASDAQ' },
  };
  
  const basePrice = { 'GOOGL': 170, 'AAPL': 190, 'MSFT': 420, 'AMZN': 180 }[symbol] || 100;
  const days = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 26 : 12;
  const data = [];
  let currentDate = new Date();
  for (let i = 0; i < days; i++) {
    const price = basePrice + (Math.random() - 0.5) * 20 * (i / days) + Math.sin(i / 5) * 5;
    data.push({ date: new Date(currentDate).toISOString().split('T')[0], price: parseFloat(price.toFixed(2)) });
    if(timeframe === 'daily') currentDate.setDate(currentDate.getDate() - 1);
    if(timeframe === 'weekly') currentDate.setDate(currentDate.getDate() - 7);
    if(timeframe === 'monthly') currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return {
    details: stockDetails[symbol] || { name: `${symbol.toUpperCase()} Company`, description: `Description for ${symbol.toUpperCase()}.`, exchange: 'NYSE' },
    historical: data.reverse(),
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<{ details: any; historical: any[]; prediction?: PredictStockTrendsOutput; analysis?: string; symbol?: string; timeframe?: string; } | null>(null);
  const { toast } = useToast();
  
  const handleSearch = async (symbol: string, timeframe: string) => {
    try {
      stockSymbolSchema.parse(symbol);
      setLoading(true);
      setError(null);
      setStockData(null);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { details, historical } = generateMockData(symbol.toUpperCase(), timeframe);
      
      const historicalDataCsv = `date,price\n${historical.map(d => `${d.date},${d.price}`).join('\n')}`;
      
      const predictionResult = await predictStockTrends({
        stockSymbol: symbol.toUpperCase(),
        historicalData: historicalDataCsv,
        timeframe: timeframe,
      });

      setStockData({
        details,
        historical,
        prediction: predictionResult,
        symbol: symbol.toUpperCase(),
        timeframe,
      });

    } catch (e: any) {
      const errorMessage = e instanceof z.ZodError ? e.errors[0].message : e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <StockForm onSearch={handleSearch} loading={loading} />
            </CardContent>
          </Card>
          <div className="lg:col-span-5">
            {loading && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                </CardContent>
              </Card>
            )}
            {!loading && stockData && (
              <div className="space-y-4">
                <StockDetails
                  symbol={stockData.symbol!}
                  name={stockData.details.name}
                  exchange={stockData.details.exchange}
                  description={stockData.details.description}
                  analysis={stockData.prediction?.analysis}
                />
                <PriceChart 
                  historicalData={stockData.historical} 
                  predictionData={stockData.prediction?.trendPrediction}
                />
              </div>
            )}
            {!loading && !stockData && (
              <Card className="flex h-[550px] items-center justify-center">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>Enter a stock symbol to begin analysis.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
