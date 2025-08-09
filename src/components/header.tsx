'use client';

import Link from 'next/link';
import { CandlestickChart } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-primary px-4 text-primary-foreground md:px-6 z-10">
      <Link href="/" className="flex items-center gap-2 text-inherit">
        <CandlestickChart className="h-6 w-6" />
        <h1 className="text-xl font-bold tracking-tight">StockBro</h1>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
          <Button variant="link" asChild>
            <Link href="/about" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
              About
            </Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/contact" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
              Contact
            </Link>
          </Button>
      </nav>
    </header>
  );
}
