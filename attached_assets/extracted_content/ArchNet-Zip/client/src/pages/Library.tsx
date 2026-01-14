import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, BookOpen, Download, User, Bookmark, Loader2, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Book, SavedItem } from "@shared/schema";

export default function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedItems = [], isLoading: isLoadingSaved } = useQuery<SavedItem[]>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const { data: books = [], isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const unsaveMutation = useMutation({
    mutationFn: async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
      return apiRequest("POST", "/api/saved", { targetType, targetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
    },
  });

  const savedBookIds = savedItems
    .filter((item) => item.targetType === "book")
    .map((item) => item.targetId);

  const savedBooks = books.filter((book) => savedBookIds.includes(book.id));

  const isLoading = isLoadingSaved || isLoadingBooks;

  const handleUnsave = (bookId: string) => {
    unsaveMutation.mutate({ targetType: "book", targetId: bookId });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <BookMarked className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your library</h1>
          <p className="text-muted-foreground mb-6">
            Save books and resources to access them here
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookMarked className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl font-bold">My Library</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your saved books and resources, all in one place.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[3/4]" />
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && savedBooks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved books yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse our collection and save books to find them here
                </p>
                <Button asChild>
                  <Link href="/books">Browse Books</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && savedBooks.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover-elevate" data-testid={`card-library-book-${book.id}`}>
                  <div className="aspect-[3/4] bg-muted relative">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {book.category && (
                      <Badge className="absolute top-3 right-3">{book.category}</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                    {book.author && (
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {book.author}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {book.publishedYear && <span>{book.publishedYear}</span>}
                      {book.pageCount && <span>{book.pageCount} pages</span>}
                    </div>

                    <div className="flex gap-2">
                      {book.downloadUrl ? (
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={book.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          Not Available
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnsave(book.id)}
                        disabled={unsaveMutation.isPending}
                        data-testid={`button-unsave-${book.id}`}
                      >
                        {unsaveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
