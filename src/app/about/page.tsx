
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-6">About StockBro</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              StockBro is a powerful financial analytics dashboard designed to empower investors with AI-driven insights. 
              Our mission is to make sophisticated stock market analysis accessible to everyone, from seasoned traders to curious beginners. 
              We believe that with the right tools, anyone can make informed decisions and navigate the complexities of the financial markets.
            </p>
            <p>
              By leveraging cutting-edge generative AI, we provide trend predictions, technical analysis, and curated news to help you stay ahead of the curve.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">AI-Powered Stock Analysis:</span> Get in-depth analysis and future trend predictions for any stock symbol.
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Trending Stocks:</span> Discover market leaders and top-moving stocks at a glance.
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Curated Financial News:</span> Stay updated with the latest news categorized for your convenience.
                </span>
              </li>
               <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">Technical Indicator Recommendations:</span> Receive AI-driven suggestions for the best technical indicators to aid your analysis.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
