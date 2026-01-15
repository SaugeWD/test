import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  ArrowLeft,
  Loader2,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Tag,
  Ticket,
  Newspaper,
} from "lucide-react";
import { SocialInteractions } from "@/components/SocialInteractions";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { News, User as UserType } from "@shared/schema";
import { format } from "date-fns";

interface NewsWithSubmitter extends News {
  submittedBy?: UserType;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: news, isLoading, error } = useQuery<NewsWithSubmitter>({
    queryKey: ["/api/news", id],
  });

  const { data: submitter } = useQuery<UserType>({
    queryKey: ["/api/users", news?.submittedById],
    enabled: !!news?.submittedById,
  });

  const allImages = news?.images?.length
    ? news.images
    : news?.image
    ? [news.image]
    : [];

  const formatEventDateRange = () => {
    if (!news?.eventDate) return null;
    const startDate = new Date(news.eventDate);
    const endDate = news.eventEndDate ? new Date(news.eventEndDate) : null;

    if (endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    return format(startDate, "MMMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <Newspaper className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">News not found</h1>
          <p className="text-muted-foreground mb-6">
            The news article you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/news">Back to News</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {news.category && (
                  <Badge variant="default" data-testid="badge-category">
                    {news.category}
                  </Badge>
                )}
                {news.isEvent && (
                  <Badge variant="secondary" data-testid="badge-event">
                    Event
                  </Badge>
                )}
                {news.publishDate && (
                  <Badge variant="outline" data-testid="badge-date">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(news.publishDate), "MMM d, yyyy")}
                  </Badge>
                )}
                {!news.publishDate && news.createdAt && (
                  <Badge variant="outline" data-testid="badge-date">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(news.createdAt), "MMM d, yyyy")}
                  </Badge>
                )}
                {news.status === "pending" && (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    Pending Review
                  </Badge>
                )}
              </div>

              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                data-testid="text-news-title"
              >
                {news.title}
              </h1>

              {news.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {news.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <SocialInteractions
                  contentId={id!}
                  contentType="news"
                  shareUrl={typeof window !== "undefined" ? window.location.href : ""}
                />
              </div>
            </div>

            {news.isEvent && (
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {news.eventDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p
                            className="text-sm text-muted-foreground"
                            data-testid="text-event-date"
                          >
                            {formatEventDateRange()}
                          </p>
                        </div>
                      </div>
                    )}
                    {news.eventTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Time</p>
                          <p
                            className="text-sm text-muted-foreground"
                            data-testid="text-event-time"
                          >
                            {news.eventTime}
                          </p>
                        </div>
                      </div>
                    )}
                    {news.eventLocation && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p
                            className="text-sm text-muted-foreground"
                            data-testid="text-event-location"
                          >
                            {news.eventLocation}
                          </p>
                        </div>
                      </div>
                    )}
                    {news.eventPrice && (
                      <div className="flex items-start gap-3">
                        <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Price</p>
                          <p
                            className="text-sm text-muted-foreground"
                            data-testid="text-event-price"
                          >
                            {news.eventPrice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {news.eventRegistrationUrl && (
                    <div className="pt-2">
                      <Button asChild data-testid="button-register">
                        <a
                          href={news.eventRegistrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Register for Event
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {allImages.length > 0 && (
              <div className="space-y-4">
                {allImages.length === 1 ? (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={allImages[0]}
                      alt={news.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                      data-testid="img-news-featured"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src={allImages[selectedImageIndex]}
                        alt={`${news.title} - Image ${selectedImageIndex + 1}`}
                        className="w-full h-auto max-h-[500px] object-cover"
                        data-testid="img-news-featured"
                      />
                    </div>
                    <Carousel className="w-full max-w-xl mx-auto">
                      <CarouselContent>
                        {allImages.map((image, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-1/4 md:basis-1/5"
                          >
                            <button
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                                selectedImageIndex === index
                                  ? "border-accent ring-2 ring-accent/20"
                                  : "border-transparent hover:border-muted-foreground/30"
                              }`}
                              data-testid={`button-thumbnail-${index}`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {allImages.length > 5 && (
                        <>
                          <CarouselPrevious className="left-0" />
                          <CarouselNext className="right-0" />
                        </>
                      )}
                    </Carousel>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Full Article
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  data-testid="text-news-content"
                >
                  {news.content || "No content available."}
                </div>
              </div>
            </div>

            {news.tags && news.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      data-testid={`badge-tag-${index}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {news.pdfAttachment && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">PDF Attachment</p>
                        <p className="text-xs text-muted-foreground">
                          Download the attached document
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild data-testid="button-download-pdf">
                      <a href={news.pdfAttachment} download>
                        <Download className="mr-1.5 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {(news.authorName || news.authorEmail || news.authorPhone) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Author Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {news.authorName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span
                        className="text-sm font-medium"
                        data-testid="text-author-name"
                      >
                        {news.authorName}
                      </span>
                    </div>
                  )}
                  {news.authorEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${news.authorEmail}`}
                        className="text-sm text-accent hover:underline"
                        data-testid="link-author-email"
                      >
                        {news.authorEmail}
                      </a>
                    </div>
                  )}
                  {news.authorPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${news.authorPhone}`}
                        className="text-sm text-accent hover:underline"
                        data-testid="link-author-phone"
                      >
                        {news.authorPhone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {news.location && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm" data-testid="text-location">
                      {news.location}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {(news.source || news.sourceUrl) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {news.sourceUrl ? (
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-accent hover:underline"
                      data-testid="link-source"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {news.source || "View Source"}
                    </a>
                  ) : (
                    <span className="text-sm" data-testid="text-source">
                      {news.source}
                    </span>
                  )}
                </CardContent>
              </Card>
            )}

            {submitter && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Submitted By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/profile/${submitter.username}`}>
                    <div
                      className="flex items-center gap-3 hover-elevate p-2 rounded-lg -m-2"
                      data-testid="link-submitter-profile"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={submitter.avatar || ""} />
                        <AvatarFallback>
                          {submitter.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">
                            {submitter.name}
                          </span>
                          {submitter.isVerified && (
                            <VerificationBadge type="architect" size="sm" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{submitter.username}
                        </p>
                        {submitter.title && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {submitter.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Article Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">
                    {news.category || "General"}
                  </span>
                </div>
                {news.publishDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-medium">
                      {format(new Date(news.publishDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {news.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">
                      {format(new Date(news.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">
                    {news.isEvent ? "Event" : "News"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
