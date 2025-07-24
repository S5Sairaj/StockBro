import Link from 'next/link';
import { CandlestickChart } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-10">
      <Link href="/" className="flex items-center gap-2">
        <CandlestickChart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-card-foreground">MarketGazer</h1>
      </Link>
      <nav className="flex-1">
        <ul className="flex items-center gap-4">
          <li>
            <Button variant="link" asChild>
              <Link href="/news" className="text-muted-foreground transition-colors hover:text-foreground">
                News
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
