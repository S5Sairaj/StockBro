'use server';

/**
 * @fileOverview Stock trend prediction flow using generative AI.
 *
 * - predictStockTrends - A function that predicts stock trends based on historical data.
 * - PredictStockTrendsInput - The input type for the predictStockTrends function.
 * - PredictStockTrendsOutput - The return type for the predictStockTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictStockTrendsInputSchema = z.object({
  stockSymbol: z.string().describe('The stock symbol for which to predict trends.'),
  historicalData: z.string().describe('Historical stock data, preferably in CSV format.'),
  timeframe: z.string().describe('The timeframe for the analysis (e.g., daily, weekly, monthly).'),
});

export type PredictStockTrendsInput = z.infer<typeof PredictStockTrendsInputSchema>;

const PredictStockTrendsOutputSchema = z.object({
  trendPrediction: z.string().describe('Predicted stock trend line data, in a format plottable on a chart.'),
  analysis: z.string().describe('A summary of the factors influencing the predicted trend.'),
});

export type PredictStockTrendsOutput = z.infer<typeof PredictStockTrendsOutputSchema>;

export async function predictStockTrends(input: PredictStockTrendsInput): Promise<PredictStockTrendsOutput> {
  return predictStockTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictStockTrendsPrompt',
  input: {schema: PredictStockTrendsInputSchema},
  output: {schema: PredictStockTrendsOutputSchema},
  prompt: `You are a financial analyst specializing in stock market trend prediction.

You will analyze the historical stock data for the given stock symbol and timeframe, and predict the future trend.
Your analysis should consider recency bias, volatility, and market sentiment (derived from news APIs, which are not available to you, so make a reasonable assumption).

Stock Symbol: {{{stockSymbol}}}
Historical Data: {{{historicalData}}}
Timeframe: {{{timeframe}}}

Based on this information, predict the stock trend and provide the predicted trend line data and a summary of your analysis.
The trendPrediction should be formatted as a series of date and price point pairs: "[[date1, price1], [date2, price2], ...]"
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
