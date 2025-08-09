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
  analysis: z.string().describe('A summary of the stock analysis, including recommended strategy, entry/exit points, and risk management.'),
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
You are an advanced AI-powered financial analyst and strategist specializing in stock market time series analysis. You are an expert at explaining complex topics to beginners. Your task is to:
- Ingest historical stock market data, including OHLC (Open, High, Low, Close) prices and trading volume.
- Perform advanced time series forecasting using models like ARIMA, LSTM, and Prophet to predict price movements.
- Identify stocks with a predicted success rate of at least 40-60% profit probability over the forecasted period.
- Develop clear, actionable trading strategies (e.g., momentum-based, mean-reversion, breakout, swing trading) with specific entry and exit points.
- Provide risk management recommendations (stop-loss, take-profit, position sizing) to minimize losses.

Analyze the provided historical stock data for {{stockSymbol}} over a {{timeframe}} timeframe and generate a trend prediction.

Historical Data:
{{{historicalData}}}

Based on this data, provide:
1.  A concise analysis summary written for an absolute beginner. Explain any trading strategies or financial terms you use in simple, easy-to-understand language. This summary MUST include a recommended trading strategy, specific entry/exit points, and risk management advice (stop-loss, take-profit).
2.  A predicted price series for the next 30 periods.
3.  A list of 5-7 technical indicators that would be most beneficial for a user to analyze for this specific stock. For each indicator, provide its name and a concise description of what it measures and why it's useful, assuming the reader is a novice.
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
