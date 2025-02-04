import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Code, Users, Building2, Newspaper } from "lucide-react"

export function Navigation() {
  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-xl">
            BlogLibrary
          </Link>
          <div className="hidden md:flex gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                Product
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] p-3">
                <DropdownMenuItem asChild className="flex gap-3 p-3 cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-pink-500" />
                      <span className="font-semibold">For Creators</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      YouTubers, bloggers, podcasters, musicians & artists
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex gap-3 p-3 cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">For Publishers</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Writers, journalists, local news and new media outlets
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex gap-3 p-3 cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">For Business</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Modern brands & companies with ambitious content marketing
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex gap-3 p-3 cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">For Developers</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Source code, documentation, guides and tutorials
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/explore" className="text-muted-foreground hover:text-foreground">
              Explore
            </Link>
            <Link href="/resources" className="text-muted-foreground hover:text-foreground">
              Resources
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost">Sign in</Button>
          <Button>Get started</Button>
        </div>
      </nav>
    </header>
  )
}

