import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project, Competition, Book, Research, Tool, News, Job } from "@shared/schema";

const searchCategories = [
  "All",
  "Projects",
  "Books",
  "Research",
  "Competitions",
  "News",
  "Jobs",
  "Tools",
];

interface SearchResult {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  image?: string;
  tags: string[];
}

const trendingSearches = [
  "Sustainable architecture",
  "Islamic design",
  "Competition deadlines",
  "BIM software",
  "Urban planning",
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"], enabled: isOpen });
  const { data: competitions } = useQuery<Competition[]>({ queryKey: ["/api/competitions"], enabled: isOpen });
  const { data: books } = useQuery<Book[]>({ queryKey: ["/api/books"], enabled: isOpen });
  const { data: research } = useQuery<Research[]>({ queryKey: ["/api/research"], enabled: isOpen });
  const { data: tools } = useQuery<Tool[]>({ queryKey: ["/api/tools"], enabled: isOpen });
  const { data: news } = useQuery<News[]>({ queryKey: ["/api/news"], enabled: isOpen });
  const { data: jobs } = useQuery<Job[]>({ queryKey: ["/api/jobs"], enabled: isOpen });

  const allSearchResults: SearchResult[] = [
    ...(projects || []).map((p) => ({
      id: p.id,
      title: p.title,
      category: "Projects",
      type: "projects",
      description: p.description || "",
      image: p.images?.[0] || p.image || undefined,
      tags: p.category ? [p.category] : [],
    })),
    ...(competitions || []).map((c) => ({
      id: c.id,
      title: c.title,
      category: "Competitions",
      type: "competitions",
      description: c.description || "",
      image: c.image || undefined,
      tags: c.category ? [c.category] : [],
    })),
    ...(books || []).map((b) => ({
      id: b.id,
      title: b.title,
      category: "Books",
      type: "books",
      description: `by ${b.author || "Unknown"}`,
      image: b.image || undefined,
      tags: b.category ? [b.category] : [],
    })),
    ...(research || []).map((r) => ({
      id: r.id,
      title: r.title,
      category: "Research",
      type: "research",
      description: `by ${r.authors || "Unknown"}`,
      image: r.image || undefined,
      tags: r.category ? [r.category] : [],
    })),
    ...(tools || []).map((t) => ({
      id: t.id,
      title: t.name,
      category: "Tools",
      type: "tools",
      description: t.description || "",
      image: t.image || undefined,
      tags: t.category ? [t.category] : [],
    })),
    ...(news || []).map((n) => ({
      id: n.id,
      title: n.title,
      category: "News",
      type: "news",
      description: n.excerpt || "",
      image: n.image || undefined,
      tags: n.category ? [n.category] : [],
    })),
    ...(jobs || []).map((j) => ({
      id: j.id,
      title: j.title,
      category: "Jobs",
      type: "jobs",
      description: `${j.company} - ${j.location || "Remote"}`,
      image: undefined,
      tags: j.type ? [j.type] : [],
    })),
  ];

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const filteredResults = allSearchResults.filter((result) => {
    const matchesQuery =
      searchQuery === "" ||
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || result.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery);
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      setIsOpen(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    saveSearch(query);
  };

  const isLoading = !projects && !competitions && !books && !research && !tools && !news && !jobs;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-110 hover:text-accent" data-testid="button-search">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Search ArchNet Jordan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects, books, research, competitions..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
              data-testid="input-search"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {searchCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[450px]">
            {searchQuery ? (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredResults.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {filteredResults.slice(0, 6).map((result, index) => (
                        <Link
                          key={`${result.type}-${result.id}-${index}`}
                          href={`/${result.type}/${result.id}`}
                          onClick={() => {
                            saveSearch(searchQuery);
                            setIsOpen(false);
                          }}
                        >
                          <Card className="p-3 hover:bg-accent/5 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              {result.image ? (
                                <img
                                  src={result.image}
                                  alt={result.title}
                                  className="h-14 w-14 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-14 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                  <Search className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-1">{result.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {result.category}
                                  </Badge>
                                  {result.tags.slice(0, 1).map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    {filteredResults.length > 6 && (
                      <div className="pt-4 border-t">
                        <Button className="w-full" onClick={handleSearch}>
                          View All {filteredResults.length} Results for "{searchQuery}"
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try different keywords or check your spelling</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Recent Searches</h3>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="h-auto py-1 px-2">
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/5 transition-colors text-sm"
                          onClick={() => handleQuickSearch(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Trending Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-accent/20 transition-colors"
                        onClick={() => handleQuickSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Start typing to search across all sections
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
