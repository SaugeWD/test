import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Calendar, Search, Newspaper, MapPin, ArrowRight, Bell, Plus, Users, Clock, Loader2, Upload, FileText, X, Image as ImageIcon, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SocialInteractions } from "@/components/SocialInteractions";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUpload } from "@/hooks/use-upload";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import type { News } from "@shared/schema";

const newsSubmitSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.string().optional(),
  authorName: z.string().min(1, "Author name is required"),
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
}).refine((data) => {
  if (data.isEvent) {
    if (!data.eventDate && !data.eventLocation) {
      return false;
    }
    if (!data.eventDate) {
      return false;
    }
    if (!data.eventLocation) {
      return false;
    }
  }
  return true;
}, {
  message: "Event date and location are required for events",
  path: ["eventDate"],
}).refine((data) => {
  if (data.isEvent && !data.eventLocation) {
    return false;
  }
  return true;
}, {
  message: "Event location is required for events",
  path: ["eventLocation"],
});

type NewsSubmitFormValues = z.infer<typeof newsSubmitSchema>;

interface UploadedImage {
  path: string;
  name: string;
  preview: string;
}

function NewsSubmitDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [pdfAttachment, setPdfAttachment] = useState<{ path: string; name: string } | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { uploadFile } = useUpload();

  const form = useForm<NewsSubmitFormValues>({
    resolver: zodResolver(newsSubmitSchema),
    defaultValues: {
      category: "",
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      authorName: "",
      authorEmail: "",
      authorPhone: "",
      location: "",
      source: "",
      sourceUrl: "",
      publishDate: "",
      isEvent: false,
      eventDate: "",
      eventEndDate: "",
      eventTime: "",
      eventLocation: "",
      eventPrice: "",
      eventRegistrationUrl: "",
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
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removePdf = () => {
    setPdfAttachment(null);
  };

  const resetForm = () => {
    form.reset();
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setPdfAttachment(null);
  };

  const submitNewsMutation = useMutation({
    mutationFn: async (data: NewsSubmitFormValues) => {
      const response = await apiRequest("POST", "/api/news", {
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
      setIsOpen(false);
      resetForm();
      toast({
        title: "Submission received",
        description: "Your news/event will be reviewed and published soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit news",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: NewsSubmitFormValues) => {
    submitNewsMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="lg" data-testid="button-submit-news">
          <Plus className="mr-2 h-5 w-5" />
          Submit News
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Submit News or Event
          </DialogTitle>
          <DialogDescription>
            Share architecture news, awards, or events with the ArchNet community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Newspaper className="h-4 w-4" />
              Basic Information
            </div>
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger id="category" data-testid="select-news-category">
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
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter news title"
                {...form.register("title")}
                data-testid="input-news-title"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt/Summary</Label>
              <Input
                id="excerpt"
                placeholder="Brief summary of the news"
                {...form.register("excerpt")}
                data-testid="input-news-excerpt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date (Optional)</Label>
              <Input
                id="publishDate"
                type="date"
                {...form.register("publishDate")}
                data-testid="input-news-publish-date"
              />
              {form.formState.errors.publishDate && (
                <p className="text-xs text-destructive">{form.formState.errors.publishDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Provide detailed content..."
                rows={8}
                {...form.register("content")}
                data-testid="textarea-news-content"
              />
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="architecture, design, sustainability (comma-separated)"
                {...form.register("tags")}
                data-testid="input-news-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Where is this news from?"
                {...form.register("location")}
                data-testid="input-news-location"
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
                  data-testid="input-news-images"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage || uploadedImages.length >= 5}
                  className="w-full"
                  data-testid="button-upload-images"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingImage ? "Uploading..." : `Upload Images (${uploadedImages.length}/5)`}
                </Button>
                
                {isUploadingImage && (
                  <Progress value={imageUploadProgress} className="h-2" data-testid="progress-image-upload" />
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
                          data-testid={`button-remove-image-${index}`}
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
                  data-testid="input-news-pdf"
                />
                
                {!pdfAttachment ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                      className="w-full"
                      data-testid="button-upload-pdf"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isUploadingPdf ? "Uploading..." : "Upload PDF"}
                    </Button>
                    {isUploadingPdf && (
                      <Progress value={pdfUploadProgress} className="h-2" data-testid="progress-pdf-upload" />
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
                      data-testid="button-remove-pdf"
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
              <Users className="h-4 w-4" />
              Author Information
            </div>
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                placeholder="Your name"
                {...form.register("authorName")}
                data-testid="input-news-author-name"
              />
              {form.formState.errors.authorName && (
                <p className="text-xs text-destructive">{form.formState.errors.authorName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Author Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  placeholder="email@example.com"
                  {...form.register("authorEmail")}
                  data-testid="input-news-author-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorPhone">Author Phone</Label>
                <Input
                  id="authorPhone"
                  type="tel"
                  placeholder="+962 7XX XXX XXX"
                  {...form.register("authorPhone")}
                  data-testid="input-news-author-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source Name</Label>
              <Input
                id="source"
                placeholder="Original source or organization"
                {...form.register("source")}
                data-testid="input-news-source"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://example.com/original-article"
                {...form.register("sourceUrl")}
                data-testid="input-news-source-url"
              />
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
                id="isEvent"
                checked={isEvent}
                onCheckedChange={(checked) => form.setValue("isEvent", checked === true)}
                data-testid="checkbox-is-event"
              />
              <Label htmlFor="isEvent" className="cursor-pointer">
                This is an event
              </Label>
            </div>

            {isEvent && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      {...form.register("eventDate")}
                      data-testid="input-event-date"
                    />
                    {form.formState.errors.eventDate && (
                      <p className="text-xs text-destructive">{form.formState.errors.eventDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventEndDate">Event End Date</Label>
                    <Input
                      id="eventEndDate"
                      type="date"
                      {...form.register("eventEndDate")}
                      data-testid="input-event-end-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Event Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      {...form.register("eventTime")}
                      data-testid="input-event-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventPrice">Event Price</Label>
                    <Input
                      id="eventPrice"
                      placeholder="Free or 50 JOD"
                      {...form.register("eventPrice")}
                      data-testid="input-event-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Event Location *</Label>
                  <Input
                    id="eventLocation"
                    placeholder="Venue name and address"
                    {...form.register("eventLocation")}
                    data-testid="input-event-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventRegistrationUrl">Event Registration URL</Label>
                  <Input
                    id="eventRegistrationUrl"
                    type="url"
                    placeholder="https://example.com/register"
                    {...form.register("eventRegistrationUrl")}
                    data-testid="input-event-registration-url"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              data-testid="button-cancel-submit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitNewsMutation.isPending || isUploadingImage || isUploadingPdf}
              className="flex-1"
              data-testid="button-confirm-submit"
            >
              {submitNewsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface NewsEditDialogProps {
  newsItem: News;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsEditDialog({ newsItem, isOpen, onOpenChange }: NewsEditDialogProps) {
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

  const form = useForm<NewsSubmitFormValues>({
    resolver: zodResolver(newsSubmitSchema),
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
    mutationFn: async (data: NewsSubmitFormValues) => {
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

  const handleSubmit = (data: NewsSubmitFormValues) => {
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
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger id="edit-category" data-testid="select-edit-news-category">
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
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter news title"
                {...form.register("title")}
                data-testid="input-edit-news-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt/Summary</Label>
              <Input
                id="edit-excerpt"
                placeholder="Brief summary of the news"
                {...form.register("excerpt")}
                data-testid="input-edit-news-excerpt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Provide detailed content..."
                rows={6}
                {...form.register("content")}
                data-testid="textarea-edit-news-content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                placeholder="architecture, design, sustainability (comma-separated)"
                {...form.register("tags")}
                data-testid="input-edit-news-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-authorName">Author Name *</Label>
              <Input
                id="edit-authorName"
                placeholder="Your name"
                {...form.register("authorName")}
                data-testid="input-edit-news-author-name"
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
                  data-testid="input-edit-news-images"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage || uploadedImages.length >= 5}
                  className="w-full"
                  data-testid="button-edit-upload-images"
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
                          data-testid={`button-edit-remove-image-${index}`}
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
                  data-testid="input-edit-news-pdf"
                />
                
                {!pdfAttachment ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                      className="w-full"
                      data-testid="button-edit-upload-pdf"
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
                      data-testid="button-edit-remove-pdf"
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
                id="edit-isEvent"
                checked={isEvent}
                onCheckedChange={(checked) => form.setValue("isEvent", checked === true)}
                data-testid="checkbox-edit-is-event"
              />
              <Label htmlFor="edit-isEvent" className="cursor-pointer">
                This is an event
              </Label>
            </div>

            {isEvent && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-eventDate">Event Date *</Label>
                    <Input
                      id="edit-eventDate"
                      type="date"
                      {...form.register("eventDate")}
                      data-testid="input-edit-event-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-eventEndDate">Event End Date</Label>
                    <Input
                      id="edit-eventEndDate"
                      type="date"
                      {...form.register("eventEndDate")}
                      data-testid="input-edit-event-end-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-eventTime">Event Time</Label>
                    <Input
                      id="edit-eventTime"
                      type="time"
                      {...form.register("eventTime")}
                      data-testid="input-edit-event-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-eventPrice">Event Price</Label>
                    <Input
                      id="edit-eventPrice"
                      placeholder="Free or 50 JOD"
                      {...form.register("eventPrice")}
                      data-testid="input-edit-event-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-eventLocation">Event Location *</Label>
                  <Input
                    id="edit-eventLocation"
                    placeholder="Venue name and address"
                    {...form.register("eventLocation")}
                    data-testid="input-edit-event-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-eventRegistrationUrl">Event Registration URL</Label>
                  <Input
                    id="edit-eventRegistrationUrl"
                    type="url"
                    placeholder="https://example.com/register"
                    {...form.register("eventRegistrationUrl")}
                    data-testid="input-edit-event-registration-url"
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
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateNewsMutation.isPending || isUploadingImage || isUploadingPdf}
              className="flex-1"
              data-testid="button-confirm-edit"
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

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [reminders, setReminders] = useState<Record<number, boolean>>({});
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch news from API
  const { data: news = [], isLoading: isLoadingNews } = useQuery<any[]>({
    queryKey: ["/api/news"],
  });

  // Fetch events from API
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  // Normalize news data to handle API formats
  const normalizeNews = (newsItems: any[]) => {
    return newsItems.map((item) => ({
      ...item,
      date: item.date || item.createdAt,
      author: item.author || "ArchNet Editorial",
      excerpt: item.excerpt || (item.content ? item.content.substring(0, 200) : ""),
    }));
  };

  const displayNews = normalizeNews(news);

  const filteredNews = displayNews.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      (event.title || "").toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesType = selectedEventType === "all" || event.type === selectedEventType;
    return matchesSearch && matchesType;
  });

  const categories = ["all", ...Array.from(new Set(displayNews.map((n: any) => n.category).filter(Boolean)))];
  const eventTypes = ["all", ...Array.from(new Set(events.map((e: any) => e.type).filter(Boolean)))];

  const toggleReminder = (id: number) => {
    setReminders((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      toast({
        description: newState[id] ? "Reminder set for this event" : "Reminder removed",
      });
      return newState;
    });
  };

  const handleRegister = (eventTitle: string) => {
    toast({
      title: "Registration",
      description: `You're being redirected to register for ${eventTitle}`,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string | null) => {
    if (end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return formatDate(start);
  };

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/news/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setDeletingNewsId(null);
      toast({
        title: "News deleted",
        description: "The news has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete news",
        variant: "destructive",
      });
    },
  });

  const handleCardClick = (itemId: string) => {
    navigate(`/news/${itemId}`);
  };

  const isOwner = (item: any) => {
    return user?.id && item.submittedById === user.id;
  };

  const isAdminUser = user?.role === "admin";

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12" data-testid="section-hero">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 px-4 py-2">
              <Newspaper className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">News & Events</span>
            </div>
            <h1 className="font-serif text-4xl font-bold md:text-5xl text-balance" data-testid="heading-news-events">
              News & Events
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Stay updated with the latest architecture news, industry updates, and upcoming events in Jordan
            </p>
            <div className="mt-6">
              <NewsSubmitDialog />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-2" data-testid="tabs-news-events">
              <TabsTrigger value="news" data-testid="tab-news">
                News ({displayNews.length})
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">
                Events ({events.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search news..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-news"
                    disabled={isLoadingNews}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      disabled={isLoadingNews}
                      data-testid={`button-filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoadingNews ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground" data-testid="text-loading-news">
                    Loading news articles...
                  </p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground" data-testid="text-no-news">
                    No news found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNews.map((item) => (
                    <Card 
                      key={item.id} 
                      className="group relative flex flex-col overflow-visible hover-elevate cursor-pointer" 
                      data-testid={`card-news-${item.id}`}
                      onClick={() => handleCardClick(item.id)}
                    >
                      {(isOwner(item) || isAdminUser) && (
                        <div 
                          className="absolute top-2 right-2 z-10"
                          style={{ visibility: "hidden" }}
                          data-testid={`menu-container-${item.id}`}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-menu-${item.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNews(item);
                                }}
                                data-testid={`menu-edit-${item.id}`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingNewsId(item.id);
                                }}
                                className="text-destructive focus:text-destructive"
                                data-testid={`menu-delete-${item.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      <div className="relative aspect-video overflow-hidden bg-secondary/30 rounded-t-md">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardHeader className="flex-grow">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline" data-testid={`badge-category-${item.id}`}>
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" data-testid={`badge-date-${item.id}`}>
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(item.date)}
                          </Badge>
                          {item.status === "pending" && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-balance">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{item.excerpt}</CardDescription>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span data-testid={`text-author-${item.id}`}>by {item.author}</span>
                            {item.source && (
                              <span className="font-medium" data-testid={`text-source-${item.id}`}>{item.source}</span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 mt-auto">
                        <div className="pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                          <SocialInteractions
                            contentId={`news-${item.id}`}
                            contentType="news"
                            initialLikes={Math.floor(Math.random() * 100)}
                            initialComments={Math.floor(Math.random() * 20)}
                          />
                        </div>
                      </CardContent>
                      <style>{`
                        [data-testid="card-news-${item.id}"]:hover [data-testid="menu-container-${item.id}"] {
                          visibility: visible !important;
                        }
                      `}</style>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-10"
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    data-testid="input-search-events"
                  />
                </div>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger className="w-[180px]" data-testid="select-event-type">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12" data-testid="loading-events">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading events...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground" data-testid="text-no-events">
                    No events found. Check back later for upcoming events!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="overflow-hidden hover-elevate" 
                      data-testid={`card-event-${event.id}`}
                    >
                      <div className="relative aspect-video overflow-hidden bg-secondary/30">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                        <div className="absolute right-3 top-3 flex gap-2">
                          <Badge variant="secondary" data-testid={`badge-event-type-${event.id}`}>
                            {event.type}
                          </Badge>
                          {event.price && (
                            <Badge 
                              variant={event.price === "Free" ? "default" : "outline"}
                              data-testid={`badge-event-price-${event.id}`}
                            >
                              {event.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-event-status-${event.id}`}>
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-balance" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <CardDescription>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex items-center gap-2" data-testid={`text-event-date-${event.id}`}>
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDateRange(event.dateStart, event.dateEnd)}</span>
                            </div>
                            <div className="flex items-center gap-2" data-testid={`text-event-time-${event.id}`}>
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2" data-testid={`text-event-location-${event.id}`}>
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p 
                          className="mb-4 text-sm text-muted-foreground leading-relaxed" 
                          data-testid={`text-event-description-${event.id}`}
                        >
                          {event.description}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleReminder(event.id)}
                            className={reminders[event.id] ? "text-accent border-accent" : ""}
                            data-testid={`button-reminder-${event.id}`}
                          >
                            <Bell className={`h-4 w-4 ${reminders[event.id] ? "fill-current" : ""}`} />
                          </Button>
                          <Button 
                            className="flex-1" 
                            onClick={() => handleRegister(event.title)}
                            data-testid={`button-register-${event.id}`}
                          >
                            Register
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {editingNews && (
        <NewsEditDialog
          newsItem={editingNews}
          isOpen={!!editingNews}
          onOpenChange={(open) => {
            if (!open) setEditingNews(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingNewsId} onOpenChange={(open) => !open && setDeletingNewsId(null)}>
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
              onClick={() => deletingNewsId && deleteNewsMutation.mutate(deletingNewsId)}
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
