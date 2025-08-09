'use client';

import Link from 'next/link';
import { CandlestickChart } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-accent px-4 md:px-6 z-10">
      <Link href="/" className="flex items-center gap-2 text-accent-foreground">
        <CandlestickChart className="h-6 w-6 text-accent-foreground" />
        <h1 className="text-xl font-bold tracking-tight">StockBro</h1>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
          <Button variant="link" asChild>
            <Link href="/about" className="text-accent-foreground transition-colors hover:text-accent-foreground/80">
              About
            </Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/contact" className="text-accent-foreground transition-colors hover:text-accent-foreground/80">
              Contact
            </Link>
          </Button>
          <ThemeToggle />
      </nav>
    </header>
  );
}
