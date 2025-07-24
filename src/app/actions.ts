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


export async function getTrendingStocks() {
    try {
        const result = await yahooFinance.trendingSymbols('US', { count: 10 });
        const quotes = result.quotes?.filter(q => 
            q.quoteType === 'EQUITY' && 
            typeof q.regularMarketPrice === 'number' && 
            typeof q.regularMarketChange === 'number' &&
            typeof q.regularMarketChangePercent === 'number'
        ) || [];
        
        const trending = quotes.slice(0, 5).map(q => ({
            symbol: q.symbol,
            name: q.longName || q.shortName || q.symbol,
            price: q.regularMarketPrice || 0,
            change: q.regularMarketChange || 0,
            changePercent: q.regularMarketChangePercent || 0,
        }));

        return trending;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to fetch trending stocks:', error.message);
            console.error('Stack trace:', error.stack);
        } else {
            console.error('An unknown error occurred while fetching trending stocks:', error);
        }
        return [];
    }
}

export async function getNews() {
    try {
        const result = await yahooFinance.search('market news', { newsCount: 12 });
        return result.news.map(item => ({
            uuid: item.uuid,
            title: item.title,
            publisher: item.publisher,
            link: item.link,
            providerPublishTime: new Date(item.providerPublishTime * 1000).toLocaleDateString(),
            thumbnail: item.thumbnail?.resolutions?.find(t => t.tag === 'm')?.url
        })).filter(item => item.thumbnail);
    } catch (error) {
        console.error("Failed to fetch news:", error);
        return [];
    }
}
