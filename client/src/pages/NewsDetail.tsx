import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Edit,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { SocialInteractions } from "@/components/SocialInteractions";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { useUpload } from "@/hooks/use-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { News, User as UserType } from "@shared/schema";
import { format } from "date-fns";

const newsEditSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  tags: z.string().optional(),
  authorName: z.string().min(2, "Author name is required"),
  authorEmail: z.string().email().optional().or(z.literal("")),
  authorPhone: z.string().optional(),
  location: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  publishDate: z.string().optional(),
  isEvent: z.boolean().default(false),
  eventDate: z.string().optional(),
  eventEndDate: z.string().optional(),
  eventTime: z.string().optional(),
  eventLocation: z.string().optional(),
  eventPrice: z.string().optional(),
  eventRegistrationUrl: z.string().url().optional().or(z.literal("")),
});

type NewsEditFormValues = z.infer<typeof newsEditSchema>;

interface UploadedImage {
  path: string;
  name: string;
  preview: string;
}

interface NewsWithSubmitter extends News {
  submittedBy?: UserType;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: news, isLoading, error } = useQuery<NewsWithSubmitter>({
    queryKey: ["/api/news", id],
  });

  const { data: submitter } = useQuery<UserType>({
    queryKey: ["/api/users", news?.submittedById],
    enabled: !!news?.submittedById,
  });

  const isOwner = user?.id && news?.submittedById === user.id;
  const isAdminUser = user?.role === "admin";
  const canEditDelete = isOwner || isAdminUser;

  const deleteNewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/news/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "News deleted",
        description: "The news has been deleted successfully.",
      });
      navigate("/news");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete news",
        variant: "destructive",
      });
    },
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
          {canEditDelete && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                data-testid="button-edit-news"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
                data-testid="button-delete-news"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {news.category && (
                  <Link href={`/news?category=${encodeURIComponent(news.category)}`}>
                    <Badge variant="default" className="cursor-pointer hover:opacity-80 transition-opacity" data-testid="badge-category">
                      {news.category}
                    </Badge>
                  </Link>
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

      {news && (
        <NewsEditDialogDetail
          newsItem={news}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this news? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNewsMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteNewsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface NewsEditDialogDetailProps {
  newsItem: News;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function NewsEditDialogDetail({ newsItem, isOpen, onOpenChange }: NewsEditDialogDetailProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    newsItem.images?.map((path, i) => ({ path, name: `Image ${i + 1}`, preview: path })) || 
    (newsItem.image ? [{ path: newsItem.image, name: "Image 1", preview: newsItem.image }] : [])
  );
  const [pdfAttachment, setPdfAttachment] = useState<{ path: string; name: string } | null>(
    newsItem.pdfAttachment ? { path: newsItem.pdfAttachment, name: "Attached PDF" } : null
  );
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { uploadFile } = useUpload();

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const form = useForm<NewsEditFormValues>({
    resolver: zodResolver(newsEditSchema),
    defaultValues: {
      category: newsItem.category || "",
      title: newsItem.title || "",
      excerpt: newsItem.excerpt || "",
      content: newsItem.content || "",
      tags: newsItem.tags?.join(", ") || "",
      authorName: newsItem.authorName || "",
      authorEmail: newsItem.authorEmail || "",
      authorPhone: newsItem.authorPhone || "",
      location: newsItem.location || "",
      source: newsItem.source || "",
      sourceUrl: newsItem.sourceUrl || "",
      publishDate: formatDateForInput(newsItem.publishDate),
      isEvent: newsItem.isEvent || false,
      eventDate: formatDateForInput(newsItem.eventDate),
      eventEndDate: formatDateForInput(newsItem.eventEndDate),
      eventTime: newsItem.eventTime || "",
      eventLocation: newsItem.eventLocation || "",
      eventPrice: newsItem.eventPrice || "",
      eventRegistrationUrl: newsItem.eventRegistrationUrl || "",
    },
  });

  const isEvent = form.watch("isEvent");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can upload up to 5 images",
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploadingImage(true);
    setImageUploadProgress(0);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const result = await uploadFile(file);
        if (result) {
          const preview = URL.createObjectURL(file);
          setUploadedImages((prev) => [
            ...prev,
            { path: result.objectPath, name: file.name, preview },
          ]);
        }
        setImageUploadProgress(((i + 1) / filesToUpload.length) * 100);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploadingImage(false);
    setImageUploadProgress(0);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadProgress(0);

    try {
      setPdfUploadProgress(30);
      const result = await uploadFile(file);
      if (result) {
        setPdfAttachment({ path: result.objectPath, name: file.name });
        setPdfUploadProgress(100);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF",
        variant: "destructive",
      });
    }

    setIsUploadingPdf(false);
    setPdfUploadProgress(0);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].preview.startsWith("blob:")) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removePdf = () => {
    setPdfAttachment(null);
  };

  const updateNewsMutation = useMutation({
    mutationFn: async (data: NewsEditFormValues) => {
      const response = await apiRequest("PUT", `/api/news/${newsItem.id}`, {
        title: data.title,
        content: data.content,
        category: data.category,
        excerpt: data.excerpt || data.content.substring(0, 200),
        source: data.source || undefined,
        sourceUrl: data.sourceUrl || undefined,
        image: uploadedImages.length > 0 ? uploadedImages[0].path : undefined,
        images: uploadedImages.map((img) => img.path),
        pdfAttachment: pdfAttachment?.path || undefined,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        authorName: data.authorName,
        authorEmail: data.authorEmail || undefined,
        authorPhone: data.authorPhone || undefined,
        location: data.location || undefined,
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : undefined,
        isEvent: data.isEvent,
        eventDate: data.isEvent && data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
        eventEndDate: data.isEvent && data.eventEndDate ? new Date(data.eventEndDate).toISOString() : undefined,
        eventTime: data.isEvent ? data.eventTime : undefined,
        eventLocation: data.isEvent ? data.eventLocation : undefined,
        eventPrice: data.isEvent ? data.eventPrice : undefined,
        eventRegistrationUrl: data.isEvent && data.eventRegistrationUrl ? data.eventRegistrationUrl : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news", newsItem.id] });
      onOpenChange(false);
      toast({
        title: "News updated",
        description: "Your news has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update news",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: NewsEditFormValues) => {
    updateNewsMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit News
          </DialogTitle>
          <DialogDescription>
            Update your news or event details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detail-edit-category">Category *</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger id="detail-edit-category" data-testid="select-detail-edit-news-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Industry News">Industry News</SelectItem>
                  <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                  <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                  <SelectItem value="Awards">Awards</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Sustainability">Sustainability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-edit-title">Title *</Label>
              <Input
                id="detail-edit-title"
                placeholder="Enter news title"
                {...form.register("title")}
                data-testid="input-detail-edit-news-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-edit-excerpt">Excerpt/Summary</Label>
              <Input
                id="detail-edit-excerpt"
                placeholder="Brief summary of the news"
                {...form.register("excerpt")}
                data-testid="input-detail-edit-news-excerpt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-edit-content">Content *</Label>
              <Textarea
                id="detail-edit-content"
                placeholder="Provide detailed content..."
                rows={6}
                {...form.register("content")}
                data-testid="textarea-detail-edit-news-content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-edit-tags">Tags</Label>
              <Input
                id="detail-edit-tags"
                placeholder="architecture, design, sustainability (comma-separated)"
                {...form.register("tags")}
                data-testid="input-detail-edit-news-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-edit-authorName">Author Name *</Label>
              <Input
                id="detail-edit-authorName"
                placeholder="Your name"
                {...form.register("authorName")}
                data-testid="input-detail-edit-news-author-name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Media
            </div>
            <Separator />

            <div className="space-y-2">
              <Label>Images (up to 5)</Label>
              <div className="space-y-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="input-detail-edit-news-images"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage || uploadedImages.length >= 5}
                  className="w-full"
                  data-testid="button-detail-edit-upload-images"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingImage ? "Uploading..." : `Upload Images (${uploadedImages.length}/5)`}
                </Button>
                
                {isUploadingImage && (
                  <Progress value={imageUploadProgress} className="h-2" />
                )}

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="w-full h-full object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          data-testid={`button-detail-edit-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>PDF Attachment</Label>
              <div className="space-y-3">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  data-testid="input-detail-edit-news-pdf"
                />
                
                {!pdfAttachment ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                      className="w-full"
                      data-testid="button-detail-edit-upload-pdf"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isUploadingPdf ? "Uploading..." : "Upload PDF"}
                    </Button>
                    {isUploadingPdf && (
                      <Progress value={pdfUploadProgress} className="h-2" />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">{pdfAttachment.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removePdf}
                      data-testid="button-detail-edit-remove-pdf"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Event Details
            </div>
            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="detail-edit-isEvent"
                checked={isEvent}
                onCheckedChange={(checked) => form.setValue("isEvent", checked === true)}
                data-testid="checkbox-detail-edit-is-event"
              />
              <Label htmlFor="detail-edit-isEvent" className="cursor-pointer">
                This is an event
              </Label>
            </div>

            {isEvent && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-eventDate">Event Date *</Label>
                    <Input
                      id="detail-edit-eventDate"
                      type="date"
                      {...form.register("eventDate")}
                      data-testid="input-detail-edit-event-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-eventEndDate">Event End Date</Label>
                    <Input
                      id="detail-edit-eventEndDate"
                      type="date"
                      {...form.register("eventEndDate")}
                      data-testid="input-detail-edit-event-end-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-eventTime">Event Time</Label>
                    <Input
                      id="detail-edit-eventTime"
                      type="time"
                      {...form.register("eventTime")}
                      data-testid="input-detail-edit-event-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-eventPrice">Event Price</Label>
                    <Input
                      id="detail-edit-eventPrice"
                      placeholder="Free or 50 JOD"
                      {...form.register("eventPrice")}
                      data-testid="input-detail-edit-event-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-edit-eventLocation">Event Location *</Label>
                  <Input
                    id="detail-edit-eventLocation"
                    placeholder="Venue name and address"
                    {...form.register("eventLocation")}
                    data-testid="input-detail-edit-event-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-edit-eventRegistrationUrl">Event Registration URL</Label>
                  <Input
                    id="detail-edit-eventRegistrationUrl"
                    type="url"
                    placeholder="https://example.com/register"
                    {...form.register("eventRegistrationUrl")}
                    data-testid="input-detail-edit-event-registration-url"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-detail-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateNewsMutation.isPending || isUploadingImage || isUploadingPdf}
              className="flex-1"
              data-testid="button-detail-confirm-edit"
            >
              {updateNewsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
