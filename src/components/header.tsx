
'use client';

import Link from 'next/link';
import { CandlestickChart } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();

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
        "sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10 transition-all duration-300",
        scrolled ? "bg-opacity-90 backdrop-blur-sm" : ""
    )}>
      <Link href="/" className="flex items-center gap-2">
        <CandlestickChart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">MarketGazer</h1>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/news" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              News
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </Button>
          <ThemeToggle />
          {!loading && (
            user ? (
              <UserNav user={user} />
            ) : (
              <div className="flex items-center gap-2">
                 <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                 </Button>
                 <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                 </Button>
              </div>
            )
          )}
      </nav>
    </header>
  );
}
