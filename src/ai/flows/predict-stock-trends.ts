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
  userLevel: z.number().describe("The user's current level in the app."),
  isExpert: z.boolean().describe("Whether to perform an expert-level analysis.")
});

export type PredictStockTrendsInput = z.infer<typeof PredictStockTrendsInputSchema>;

const PredictStockTrendsOutputSchema = z.object({
  trendPrediction: z.string().describe('Predicted stock trend line data, in a format plottable on a chart.'),
  analysis: z.string().describe('A summary of the factors influencing the predicted trend.'),
  indicatorRecommendations: z.array(z.object({
    name: z.string().describe('The name of the recommended financial indicator (e.g., "Moving Average Convergence Divergence (MACD)")'),
    description: z.string().describe('A brief explanation of what the indicator measures and how it can be used.'),
  })).describe('A list of recommended technical indicators for further analysis.')
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
{{#if isExpert}}
You are advising an expert investor. Provide a highly technical and in-depth analysis, assuming a high level of financial literacy. Focus on nuanced market signals, advanced metrics, and potential black swan events.
{{else}}
You are advising a beginner investor. Explain your reasoning clearly and avoid jargon. Your goal is to be educational and provide a straightforward analysis.
{{/if}}

You will analyze the historical stock data for the given stock symbol and timeframe, and predict the future trend.
Your analysis should consider recency bias, volatility, and market sentiment (derived from news APIs, which are not available to you, so make a reasonable assumption).

Also, provide a list of {{#if isExpert}}5-7{{else}}3-5{{/if}} technical indicators that would be most beneficial for a user to analyze for this specific stock to "increase the chance of getting money". For each indicator, provide its name and a concise description of what it measures and why it's useful for this stock.

Stock Symbol: {{{stockSymbol}}}
Historical Data: {{{historicalData}}}
Timeframe: {{{timeframe}}}
User Level: {{{userLevel}}}

Based on this information, predict the stock trend and provide the predicted trend line data, a summary of your analysis, and your indicator recommendations.
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
