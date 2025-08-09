
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { cn } from '@/lib/utils';


interface PriceChartProps {
  historicalData: { date: string; open: number; high: number; low: number; close: number }[];
  predictionData?: { date: string; price: number }[];
}

const chartConfig = {
  price: {
    label: "Price",
  },
  prediction: {
    label: "AI Prediction",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Custom shape for the candlestick
const Candlestick = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isBullish = close > open;

    const color = isBullish ? 'hsl(var(--custom-green))' : 'hsl(var(--custom-red))';
    const wickColor = isBullish ? 'hsl(var(--custom-green))' : 'hsl(var(--custom-red))';
    
    return (
        <g stroke={wickColor} fill={color} strokeWidth="1">
            {/* Wick */}
            <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={height} />

            {/* Body */}
            <rect 
              x={x} 
              y={isBullish ? close : open} 
              width={width} 
              height={Math.abs(open - close)}
            />
        </g>
    );
};


export default function PriceChart({ historicalData, predictionData }: PriceChartProps) {

  const mappedHistorical = historicalData.map(d => ({
    date: d.date,
    ohlc: [d.open, d.high, d.low, d.close]
  }));

  const mappedPrediction = predictionData ? predictionData.map(d => ({ date: d.date, prediction: d.price })) : [];
  
  const combinedData = [...mappedHistorical];
  
  mappedPrediction.forEach(pred => {
    const existingEntry = combinedData.find(d => d.date === pred.date);
    if (existingEntry) {
      (existingEntry as any).prediction = pred.prediction;
    } else {
      combinedData.push({
          date: pred.date,
          ohlc: null,
          prediction: pred.prediction,
      });
    }
  });

  combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate Y-axis domain based on min/max of high/low
  const yDomain = [
    (dataMin: number) => Math.floor(dataMin * 0.95),
    (dataMax: number) => Math.ceil(dataMax * 1.05)
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
            <ComposedChart
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
                orientation="left"
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--muted-foreground))' }}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const ohlc = data.ohlc;
                        const prediction = data.prediction;
                        const color = ohlc && ohlc[3] > ohlc[0] ? 'text-green-500' : 'text-red-500';

                        return (
                        <div className="p-2 text-xs bg-background border rounded-lg shadow-lg">
                            <p className="font-bold">{new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                             {ohlc && <>
                                <p className={cn(color)}>Open: ${ohlc[0]?.toFixed(2)}</p>
                                <p className={cn(color)}>High: ${ohlc[1]?.toFixed(2)}</p>
                                <p className={cn(color)}>Low: ${ohlc[2]?.toFixed(2)}</p>
                                <p className={cn(color)}>Close: ${ohlc[3]?.toFixed(2)}</p>
                             </>}
                             {prediction && <p className="text-[hsl(var(--chart-2))]">Prediction: ${prediction?.toFixed(2)}</p>}
                        </div>
                        );
                    }
                    return null;
                }}
              />
              <Legend />

              <Bar dataKey="ohlc" name="Price" fill="hsl(var(--chart-1))" shape={<Candlestick />} />

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
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
