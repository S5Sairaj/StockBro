'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  historicalData: { date: string; price: number }[];
  predictionData?: { date: string; price: number }[];
}

const chartConfig = {
  price: {
    label: "Historical Price",
    color: "hsl(var(--chart-1))",
  },
  prediction: {
    label: "AI Prediction",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function PriceChart({ historicalData, predictionData }: PriceChartProps) {

  // Map historical data for the chart
  const mappedHistorical = historicalData.map(d => ({ date: d.date, price: d.price }));
  
  // Map prediction data for the chart
  const mappedPrediction = predictionData ? predictionData.map(d => ({ date: d.date, prediction: d.price })) : [];

  // Combine the data for rendering
  const combinedData = [...mappedHistorical];

  mappedPrediction.forEach(pred => {
    const existingEntry = combinedData.find(d => d.date === pred.date);
    if (existingEntry) {
      // If date exists, add prediction to it
      (existingEntry as any).prediction = pred.prediction;
    } else {
      // If date does not exist, add a new entry
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
