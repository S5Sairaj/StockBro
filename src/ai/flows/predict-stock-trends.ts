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
  tickers: z.array(z.string()).describe('List of stock tickers to analyze.'),
  stockSymbol: z.string().describe('The primary stock symbol for which to generate the main prediction. Will be added to tickers list if not present.'),
  historicalData: z.string().describe('Historical stock data for the primary stock symbol, preferably in CSV format.'),
  startDate: z.string().describe('Start date for historical data in YYYY-MM-DD format.'),
  endDate: z.string().describe('End date for historical data in YYYY-MM-DD format.'),
  frequency: z.enum(['daily', 'minute']).default('daily').describe('Frequency of historical data.'),
  targetProfitPct: z.number().default(5).describe('Target profit percentage for trade recommendations.'),
  horizonDays: z.number().default(30).describe('Forecast horizon in days.'),
  probabilityBand: z.tuple([z.number(), z.number()]).default([0.4, 0.6]).describe('The desired band for calibrated profit probability.'),
  capital: z.number().default(100000).describe('Total capital for position sizing.'),
  maxPositions: z.number().default(10).describe('Maximum number of concurrent positions.'),
  riskPerTrade: z.number().default(0.01).describe('Percentage of capital to risk per trade.'),
  allowedStrategies: z.array(z.enum(['momentum', 'mean_reversion', 'swing', 'breakout'])).default(['momentum', 'mean_reversion', 'swing', 'breakout']),
  apiKeys: z.object({
    priceData: z.string().optional(),
    news: z.string().optional()
  }).optional()
});

export type PredictStockTrendsInput = z.infer<typeof PredictStockTrendsInputSchema>;

const PredictedSeriesSchema = z.object({
  dates: z.array(z.string()).describe('Array of dates for the prediction.'),
  median: z.array(z.number()).describe('Median predicted price path.'),
  lower90: z.array(z.number()).describe('Lower 90% confidence interval of the price path.'),
  upper90: z.array(z.number()).describe('Upper 90% confidence interval of the price path.'),
});

const TickerPredictionSchema = z.object({
  predictedSeries: PredictedSeriesSchema,
  calibratedProbOfProfit: z.number().describe('The calibrated probability of achieving the target profit within the horizon.'),
  recommendedStrategy: z.string().describe('The recommended trading strategy (e.g., momentum, mean_reversion).'),
  entry: z.object({
    type: z.enum(['market', 'limit']),
    price: z.number().describe('Recommended entry price.')
  }).describe('The entry point for the trade.'),
  stopLoss: z.union([z.number(), z.string()]).describe('Stop-loss as a price or percentage.'),
  takeProfit: z.union([z.number(), z.string()]).describe('Take-profit as a price or percentage.'),
  positionSize: z.union([z.number(), z.string()]).describe('Recommended position size in dollars or as a percentage of capital.'),
  backtest: z.object({
    CAGR: z.number().describe('Compound Annual Growth Rate from backtesting.'),
    maxDrawdown: z.number().describe('Maximum drawdown from backtesting.'),
    winRate: z.number().describe('Win rate of the strategy in the backtest.'),
  }).describe('Key metrics from the strategy backtest.'),
  rationale: z.string().describe('A short, human-readable rationale for the recommendation.'),
  indicatorRecommendations: z.array(z.object({
    name: z.string().describe('The name of the recommended financial indicator (e.g., "Moving Average Convergence Divergence (MACD)")'),
    description: z.string().describe('A brief explanation of what the indicator measures and how it can be used.'),
  })).describe('A list of recommended technical indicators for further analysis.')
});

const PredictStockTrendsOutputSchema = z.object({
  runId: z.string().describe('A unique identifier for this analysis run.'),
  date: z.string().describe('The date of the analysis run in YYYY-MM-DD format.'),
  tickers: z.record(TickerPredictionSchema).describe('A mapping from ticker symbol to its detailed prediction and recommendation.'),
  portfolioRecommendation: z.object({
    allocations: z.array(z.object({
      ticker: z.string(),
      pct: z.number()
    }))
  }).describe('Recommended portfolio allocations.'),
  models: z.object({
    versions: z.record(z.string()).describe('Versions of the models used in the ensemble.'),
    ensembleMethod: z.string().describe('Method used to ensemble the model outputs.')
  }).describe('Details about the models used.'),
  notes: z.string().describe('Disclaimers and information about data sources.'),
});

export type PredictStockTrendsOutput = z.infer<typeof PredictStockTrendsOutputSchema>;

export async function predictStockTrends(input: PredictStockTrendsInput): Promise<PredictStockTrendsOutput> {
  const finalInput = {
    ...input,
    tickers: Array.from(new Set([...input.tickers, input.stockSymbol.toUpperCase()]))
  };
  return predictStockTrendsFlow(finalInput);
}

const prompt = ai.definePrompt({
  name: 'predictStockTrendsPrompt',
  input: {schema: PredictStockTrendsInputSchema},
  output: {schema: PredictStockTrendsOutputSchema},
  prompt: `
SYSTEM / ROLE:
You are a disciplined, safety-minded AI financial engineer and strategist. Your job is to convert price and auxiliary market data into transparent, auditable, and backtested trading strategies and explicit trade recommendations. Prioritize reproducibility, explainability, and risk controls.

TASK:
Given a list of stock tickers and a configuration, do the following pipeline automatically and return JSON with requested outputs:
1. Ingest OHLCV historical data (min daily, configurable intraday) and optionally news/sentiment and macro variables. For this request, you have been provided with historical data for the primary symbol: {{{stockSymbol}}}. The data is: {{{historicalData}}}. You may need to simulate or assume data for other tickers in the list: {{{tickers}}}.
2. Clean and engineer time-series features (returns, log returns, volatility, moving averages, RSI, MACD, volume features, calendar features, macro lags).
3. Fit an ensemble of models:
   - Statistical: ARIMA/SARIMA where appropriate (auto order selection).
   - Probabilistic: Prophet (trend + seasonality).
   - ML: Gradient-boosted tree (LightGBM/XGBoost) on engineered features for direction/return.
   - Deep: LSTM/Transformer for sequence-to-value forecasting (short-term).
4. Calibrate model outputs into a probability of achieving a target profit over a forecast horizon (e.g., probability of >= X% gain within H days). Use a validation set/backtest to map predicted return distributions to empirical probabilities (reliability calibration with isotonic or Platt scaling).
5. Backtest candidate strategies (momentum, mean-reversion, breakout, swing) with transaction cost, slippage, and position sizing (Kelly/SR-based or volatility parity).
6. Produce per-ticker outputs:
   - predicted price path (median + 90% interval),
   - calibrated probability of target profit within horizon,
   - recommended strategy (entry, stop-loss, take-profit, position size),
   - backtested metrics: CAGR, max drawdown, sharpe, win-rate, average win/loss.
   - Also include a list of 5-7 technical indicators that would be most beneficial for a user to analyze for this specific stock. For each indicator, provide its name and a concise description of what it measures and why it's useful.
7. Filter and return only tickers whose calibrated profit probability falls within the user-specified band (default 40%–60%).
8. For each recommendation, include a short, human-readable rationale and confidence score, plus the data and model version used.
9. Always include caveats: past performance != future performance, require API keys for live trading, and include explicit risk-management defaults.

INPUT:
- tickers: {{{tickers}}}
- start_date: {{{startDate}}}, end_date: {{{endDate}}},
- frequency: {{{frequency}}},
- target_profit_pct: {{{targetProfitPct}}},
- horizon_days: {{{horizonDays}}},
- probability_band: [{{probabilityBand.0}}, {{probabilityBand.1}}],
- capital: {{{capital}}}, max_positions: {{{maxPositions}}}, risk_per_trade: {{{riskPerTrade}}},
- allowed_strategies: {{{allowedStrategies}}},
- api_keys: (not provided, assume none)

OUTPUT (JSON):
The output must be a valid JSON object matching the defined schema.

QUALITY RULES:
- Use realistic defaults for transaction cost (e.g. 0.1% per trade) and slippage.
- Use cross-validation with time-series split; never use random shuffle CV.
- Provide human-readable explanations for every trade suggestion (1-3 sentences).
- Log exact training windows and hyperparameters in the JSON.
- If any step fails or data is insufficient, return a helpful error and fallback (e.g., skip ticker).
- Respect API rate limits and cache price data locally.

SAFETY & LEGAL:
- Do not claim guaranteed returns.
- Provide clear disclaimers that recommendations are educational and not financial advice.
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
