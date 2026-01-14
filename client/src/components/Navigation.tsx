import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn, ChevronDown, MapPin, Leaf, Building2, Columns, Compass, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSidebar } from "@/components/UserSidebar";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { MessagingPanel } from "@/components/MessagingPanel";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Competitions", href: "/competitions" },
  { name: "Books", href: "/books" },
  { name: "Projects", href: "/projects" },
  { name: "Research Hub", href: "/research" },
  { name: "Jobs", href: "/jobs" },
  { name: "Tools & Software", href: "/tools" },
  { name: "News", href: "/news" },
  { name: "Community", href: "/community" },
  { name: "About", href: "/about" },
];

const contextItems = [
  {
    name: "History Map",
    href: "/context/history-map",
    icon: MapPin,
    description: "Historical sites & evolution",
  },
  {
    name: "Natural Environment",
    href: "/context/plants",
    icon: Leaf,
    description: "Ecology & sustainable design",
  },
  {
    name: "Architectural Style",
    href: "/context/styles",
    icon: Building2,
    description: "Traditional & contemporary",
  },
  {
    name: "Structural Systems",
    href: "/context/structural-systems",
    icon: Columns,
    description: "Building systems & materials",
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(true);
  const contextRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
        setIsContextOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center space-x-2 transition-all duration-200 hover:text-accent hover:scale-105"
                data-testid="button-open-sidebar"
              >
                <span className="font-serif text-2xl font-bold tracking-tight">ArchNet</span>
              </button>

              <div className="relative hidden lg:block" ref={contextRef}>
                <button
                  onClick={() => setIsContextOpen(!isContextOpen)}
                  className="flex items-center gap-1 text-sm font-medium transition-all duration-200 hover:text-accent"
                  data-testid="button-context-dropdown"
                >
                  Context
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isContextOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isContextOpen && (
                  <div className="absolute left-0 top-12 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-3 rounded-xl bg-secondary/50 p-5 shadow-lg backdrop-blur-sm border">
                      {contextItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsContextOpen(false)}
                            className="group flex w-40 flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4 transition-all duration-200 hover:scale-105 hover:border-accent hover:shadow-md"
                          >
                            <Icon className="h-8 w-8 text-accent transition-transform duration-200 group-hover:scale-110" />
                            <div className="text-center">
                              <p className="text-sm font-semibold leading-tight">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden items-center gap-6 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-medium transition-all duration-200 hover:text-accent ${
                    isActive(item.href) ? "text-accent" : ""
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent animate-in fade-in slide-in-from-bottom-1 duration-200" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex">
                <GlobalSearch />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="transition-all duration-200 hover:scale-110"
                data-testid="button-theme-toggle"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {isAuthenticated && (
                <>
                  <NotificationsPanel />
                  <MessagingPanel />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setHasNewPosts(false);
                        setLocation("/feed");
                      }}
                      className={`transition-all duration-200 hover:scale-110 ${
                        location === "/feed" ? "text-accent" : "hover:text-accent"
                      }`}
                      data-testid="button-feed"
                    >
                      <Compass className="h-5 w-5" />
                    </Button>
                    {hasNewPosts && location !== "/feed" && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/login")}
                  className="hidden md:flex gap-2 transition-all duration-200 hover:scale-105 hover:text-accent"
                  data-testid="button-login"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden transition-all duration-200 hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
                data-testid="button-mobile-menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="border-t py-4 lg:hidden animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col space-y-3">
                <div className="border-b pb-3 mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">CONTEXT</p>
                  {contextItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-accent ${
                      isActive(item.href) ? "text-accent font-semibold" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="text-sm font-medium transition-colors hover:text-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
