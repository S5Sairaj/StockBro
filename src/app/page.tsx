'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { predictStockTrends, type PredictStockTrendsOutput } from '@/ai/flows/predict-stock-trends';
import { useToast } from '@/hooks/use-toast';
import StockForm from '@/components/stock-form';
import StockDetails from '@/components/stock-details';
import PriceChart from '@/components/price-chart';
import IndicatorRecommendations from '@/components/indicator-recommendations';
import TrendingStocks from '@/components/trending-stocks';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getStockData, getTrendingStocks } from './actions';

const stockSymbolSchema = z.string().min(1, 'Stock symbol is required.').max(5, 'Stock symbol must be 5 characters or less.');

type StockData = {
  details: any;
  historical: any[];
  prediction?: {
      predicted_series: {
          dates: string[];
          prices: number[];
      };
      indicator_recommendations: {
          name: string;
          description: string;
      }[];
  };
  symbol?: string;
  timeframe?: string;
  analysis?: string;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [trendingStocks, setTrendingStocks] = useState<any[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchTrending() {
      try {
        setIsTrendingLoading(true);
        const trending = await getTrendingStocks();
        setTrendingStocks(trending);
      } catch (e) {
        console.error("Failed to load trending stocks", e);
      } finally {
        setIsTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  const handleSearch = async (symbol: string, timeframe: string) => {
    try {
      stockSymbolSchema.parse(symbol);
      setLoading(true);
      setError(null);
      setStockData(null);

      const { details, historical } = await getStockData(symbol.toUpperCase(), timeframe);
      
      if (!historical || historical.length === 0) {
        throw new Error("No historical data found. The stock symbol may be delisted or invalid for the selected timeframe.");
      }
      
      const historicalDataCsv = `date,price\n${historical.map(d => `${d.date},${d.price}`).join('\n')}`;
      
      const predictionResult = await predictStockTrends({
        stockSymbol: symbol.toUpperCase(),
        historicalData: historicalDataCsv,
        timeframe: timeframe,
      });

      setStockData({
        details,
        historical,
        prediction: {
          predicted_series: predictionResult.predicted_series,
          indicator_recommendations: predictionResult.indicator_recommendations,
        },
        symbol: symbol.toUpperCase(),
        timeframe,
        analysis: predictionResult.analysis,
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

  const handleTrendingClick = (symbol: string) => {
    handleSearch(symbol, 'daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-6">
              <StockForm onSearch={handleSearch} loading={loading} />
            </CardContent>
          </Card>
          
          {!loading && stockData && stockData.prediction?.indicator_recommendations && (
            <IndicatorRecommendations indicators={stockData.prediction.indicator_recommendations} />
          )}

          <TrendingStocks 
              stocks={trendingStocks} 
              isLoading={isTrendingLoading} 
              onStockClick={handleTrendingClick}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
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
                analysis={stockData.analysis}
              />
              <PriceChart 
                historicalData={stockData.historical} 
                predictionData={stockData.prediction?.predicted_series.prices.map((price, index) => ({
                    date: stockData.prediction!.predicted_series.dates[index],
                    price: price
                }))}
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
  );
}
