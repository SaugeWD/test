import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Download, ArrowUpDown, User, Loader2, Bookmark, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SocialInteractions } from "@/components/SocialInteractions";
import type { Book } from "@shared/schema";

function BookCard({ book }: { book: Book }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isSaved = savedItems.some(
    (item) => item.targetType === "book" && item.targetId === book.id
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved", { 
        targetType: "book", 
        targetId: book.id 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: isSaved ? "Removed from saved" : "Saved to your library",
      });
    },
  });

  const toggleSaved = () => {
    if (!isAuthenticated) {
      toast({ description: "Please sign in to save books" });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card className="group flex flex-col overflow-hidden hover-elevate" data-testid={`card-book-${book.id}`}>
      <Link href={`/books/${book.id}`} className="block">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {book.category && (
            <Badge className="absolute top-3 left-3">{book.category}</Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
          {book.author && (
            <CardDescription className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {book.author}
            </CardDescription>
          )}
        </CardHeader>
      </Link>
      <CardContent className="flex-1 pb-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {book.publishedYear && <span>{book.publishedYear}</span>}
          {book.pageCount && <span>{book.pageCount} pages</span>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={toggleSaved}
            className={`flex-1 ${isSaved ? "bg-accent/10 text-accent" : ""}`}
            data-testid={`button-save-book-${book.id}`}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          {book.downloadUrl ? (
            <Button variant="outline" className="flex-1" asChild>
              <a href={book.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/books/${book.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Details
              </Link>
            </Button>
          )}
        </div>
        <div className="w-full border-t pt-2">
          <SocialInteractions
            contentId={book.id}
            contentType="book"
            className="justify-end"
          />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const filteredBooks = (books || []).filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set((books || []).map((b) => b.category).filter(Boolean)));

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl font-bold">Books & References</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Access a comprehensive library of architecture books, journals, and academic resources.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books by title or author..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-books"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Failed to load books. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredBooks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No books found.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
