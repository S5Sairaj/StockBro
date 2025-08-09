'use client';

import Link from 'next/link';
import { CandlestickChart } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={cn(
        "sticky top-0 flex h-16 items-center gap-4 bg-accent px-4 md:px-6 z-10 transition-all duration-300",
        scrolled ? "bg-accent/90 backdrop-blur-sm border-b" : "bg-accent border-b border-transparent"
    )}>
      <Link href="/" className="flex items-center gap-2">
        <CandlestickChart className="h-6 w-6 text-accent-foreground" />
        <h1 className="text-xl font-bold tracking-tight text-accent-foreground">StockBro</h1>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/about" className="text-accent-foreground no-underline hover:text-accent-foreground/80 transition-colors">
              About
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact" className="text-accent-foreground no-underline hover:text-accent-foreground/80 transition-colors">
              Contact
            </Link>
          </Button>
          <ThemeToggle />
      </nav>
    </header>
  );
}
