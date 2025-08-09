'use server';

/**
 * @fileOverview A disciplined, safety-minded AI financial engineer and strategist.
 * This file contains the logic for a sophisticated trading strategy pipeline.
 *
 * - predictStockTrends - A function that handles the full pipeline from data ingestion to trade recommendation.
 * - PredictStockTrendsInput - The input type for the predictStockTrends function.
 * - PredictStockTrendsOutput - The return type for the predictStockTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictStockTrendsInputSchema = z.object({
  stockSymbol: z.string().describe('The stock symbol to analyze.'),
  historicalData: z.string().describe('Historical stock data in CSV format.'),
  timeframe: z.string().describe('The timeframe for the analysis (e.g., daily, weekly).')
});

export type PredictStockTrendsInput = z.infer<typeof PredictStockTrendsInputSchema>;

const PredictedSeriesSchema = z.object({
  dates: z.array(z.string()).describe('Array of dates for the prediction.'),
  prices: z.array(z.number()).describe('Array of predicted prices.'),
});

const IndicatorRecommendationSchema = z.object({
    name: z.string().describe('The name of the recommended financial indicator (e.g., "Moving Average Convergence Divergence (MACD)")'),
    description: z.string().describe('A brief explanation of what the indicator measures and how it can be used.'),
});

const PredictStockTrendsOutputSchema = z.object({
  analysis: z.string().describe('A summary of the stock analysis.'),
  predicted_series: PredictedSeriesSchema.describe('The predicted price series for the stock.'),
  indicator_recommendations: z.array(IndicatorRecommendationSchema).describe('A list of recommended technical indicators for further analysis.'),
  profit_probability: z.number().describe('The estimated probability of the stock achieving a profit in the forecasted period.')
});

export type PredictStockTrendsOutput = z.infer<typeof PredictStockTrendsOutputSchema>;

export async function predictStockTrends(input: PredictStockTrendsInput): Promise<PredictStockTrendsOutput> {
  return predictStockTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictStockTrendsPrompt',
  input: {schema: PredictStockTrendsInputSchema},
  output: {schema: PredictStockTrendsOutputSchema},
  prompt: `
You are an advanced AI-powered financial analyst and strategist specializing in stock market time series analysis. Your task is to:

- Ingest historical stock market data, including OHLC (Open, High, Low, Close) prices and trading volume.
- Perform advanced time series forecasting using models like ARIMA, LSTM, and Prophet to predict price movements.
- Identify stocks with a predicted success rate of at least 40-60% profit probability over the forecasted period.

Analyze the provided historical stock data for {{stockSymbol}} over a {{timeframe}} timeframe and generate a trend prediction.

Historical Data:
{{{historicalData}}}

Based on this data, provide:
1.  A concise analysis summary.
2.  A predicted price series for the next 30 periods.
3.  A list of 5-7 technical indicators that would be most beneficial for a user to analyze for this specific stock. For each indicator, provide its name and a concise description of what it measures and why it's useful.
4.  An estimated profit probability for the stock over the forecast horizon.
`,
});

const predictStockTrendsFlow = ai.defineFlow(
  {
    name: 'predictStockTrendsFlow',
    inputSchema: PredictStockTrendsInputSchema,
    outputSchema: PredictStockTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
