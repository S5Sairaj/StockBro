import { CandlestickChart } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-10">
      <div className="flex items-center gap-2">
        <CandlestickChart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-card-foreground">MarketGazer</h1>
      </div>
    </header>
  );
}
