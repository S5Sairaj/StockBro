'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  historicalData: { date: string; price: number }[];
  predictionData?: [string, number][];
}

const chartConfig = {
  price: {
    label: "Historical Price",
    color: "hsl(var(--primary))",
  },
  prediction: {
    label: "AI Prediction",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

// Helper function to format the prediction data
const formatPredictionData = (predictionTuples: [string, number][] | undefined) => {
  if (!predictionTuples || !Array.isArray(predictionTuples)) return [];
  return predictionTuples.map(([date, price]) => ({
    date,
    prediction: price,
  }));
};


export default function PriceChart({ historicalData, predictionData }: PriceChartProps) {
  const parsedPrediction = formatPredictionData(predictionData);

  const combinedData = historicalData.map(hist => {
    const pred = parsedPrediction.find(p => p.date === hist.date);
    return {
      date: hist.date,
      price: hist.price,
      prediction: pred ? pred.prediction : null,
    };
  });
  
  parsedPrediction.forEach(pred => {
      if (!combinedData.some(d => d.date === pred.date)) {
          combinedData.push({
              date: pred.date,
              price: null,
              prediction: pred.prediction,
          });
      }
  });

  combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const yDomain = [
    (dataMin: number) => Math.floor(dataMin * 0.9),
    (dataMax: number) => Math.ceil(dataMax * 1.1)
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>Historical price and AI-powered trend prediction.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={combinedData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                domain={yDomain} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--muted-foreground))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartConfig.price.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Historical"
              />
              <Line
                type="monotone"
                dataKey="prediction"
                stroke={chartConfig.prediction.color}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                connectNulls={false}
                name="Prediction"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
