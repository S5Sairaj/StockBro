'use server';

import yahooFinance from 'yahoo-finance2';

function getStartDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
        case 'weekly':
            // 1 year of weekly data
            return new Date(new Date().setFullYear(now.getFullYear() - 1));
        case 'monthly':
             // 5 years of monthly data
            return new Date(new Date().setFullYear(now.getFullYear() - 5));
        case 'daily':
        default:
            // 3 months of daily data
            return new Date(new Date().setMonth(now.getMonth() - 3));
    }
}

export async function getStockData(symbol: string, timeframe: string) {
    try {
        const queryOptions = {
            period1: getStartDate(timeframe),
            interval: (timeframe === 'weekly' ? '1wk' : timeframe === 'monthly' ? '1mo' : '1d') as '1d' | '1wk' | '1mo',
        };
        
        const [quote, history, summary] = await Promise.all([
             yahooFinance.quote(symbol),
             yahooFinance.historical(symbol, queryOptions),
             yahooFinance.quoteSummary(symbol, { modules: ["summaryProfile"] })
        ]);

        if (!quote) {
            throw new Error(`Invalid stock symbol: ${symbol}`);
        }

        const details = {
            name: quote.longName || `${symbol.toUpperCase()} Company`,
            description: summary.summaryProfile?.longBusinessSummary || `Description for ${symbol.toUpperCase()}.`,
            exchange: quote.fullExchangeName || 'N/A',
        };

        const historical = history.map(d => ({
            date: d.date.toISOString().split('T')[0],
            price: parseFloat(d.close.toFixed(2)),
        }));
        
        return { details, historical };
    } catch (error: any) {
        console.error('Failed to fetch stock data for', symbol, error.message);
        if (error.message && (error.message.includes('404') || error.message.includes('No data'))) {
             throw new Error(`Could not find stock data for symbol: ${symbol}. It may be an invalid symbol.`);
        }
        throw new Error('An external service error occurred while fetching stock data.');
    }
}
