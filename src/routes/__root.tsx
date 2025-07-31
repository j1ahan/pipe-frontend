import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: () => (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Home
            </Link>
            {/* <Link
              to="/playground"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Playground
            </Link> */}
            <Link
              to="/benchmark"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Benchmark
            </Link>
            <Link
              to="/syntax-guide"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Syntax Guide
            </Link>
            <Link
              to="/references"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              References
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold tracking-tight">
              <span className="text-blue-600">PIPE</span>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  ),
})
