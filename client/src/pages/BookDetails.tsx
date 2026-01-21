import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SocialInteractions } from "@/components/SocialInteractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Download,
  ArrowLeft,
  User,
  Building2,
  Globe,
  FileText,
  Calendar,
  Bookmark,
  Loader2,
  Hash,
  BookOpenCheck,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";

function BookDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BookNotFound() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Book Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The book you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/books" data-testid="link-back-to-books">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Books
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: book, isLoading, error } = useQuery<Book>({
    queryKey: ["/api/books", id],
    enabled: !!id,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isSaved = savedItems.some(
    (item) => item.targetType === "book" && item.targetId === id
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/saved", {
        targetType: "book",
        targetId: id,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries for cross-page sync
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        description: isSaved ? "Removed from saved" : "Saved to your library",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save. Please log in and try again.",
      });
    },
  });

  if (isLoading) {
    return <BookDetailsSkeleton />;
  }

  if (error || !book) {
    return <BookNotFound />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>

        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-lg">
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {book.downloadUrl && (
                <Button className="w-full" size="lg" asChild>
                  <a
                    href={book.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-download"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Book
                  </a>
                </Button>
              )}

              <Button
                variant="outline"
                className={`w-full ${isSaved ? "bg-accent/10 text-accent" : ""}`}
                size="lg"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                data-testid="button-save-book"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                )}
                {isSaved ? "Saved" : "Save Book"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {book.category && (
                  <Badge className="capitalize">{book.category}</Badge>
                )}
                {book.subcategory && (
                  <Badge variant="outline">{book.subcategory}</Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" data-testid="heading-book-title">
                {book.title}
              </h1>

              {book.author && (
                <div className="flex items-center text-lg text-muted-foreground mb-4">
                  <User className="mr-2 h-5 w-5" />
                  <span>by <span className="font-medium text-foreground">{book.author}</span></span>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {book.publishedYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{book.publishedYear}</span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex items-center gap-1">
                    <BookOpenCheck className="h-4 w-4" />
                    <span>{book.pageCount} pages</span>
                  </div>
                )}
                {book.language && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{book.language}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {book.description && (
              <div>
                <h2 className="text-lg font-semibold mb-3">About This Book</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-4">Book Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {book.publisher && (
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Publisher</p>
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {book.publishedYear && (
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Published</p>
                        <p className="font-medium">{book.publishedYear}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {book.pageCount && (
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pages</p>
                        <p className="font-medium">{book.pageCount} pages</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {book.language && (
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Globe className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="font-medium">{book.language}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {book.isbn && (
                  <Card>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Hash className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ISBN</p>
                        <p className="font-medium">{book.isbn}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-4">Community</h2>
              <SocialInteractions
                contentId={book.id}
                contentType="book"
                className="justify-start"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
