import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Heart, MessageSquare, Share2, Bookmark, MapPin, Calendar, User, 
  ArrowLeft, Loader2, ChevronLeft, ChevronRight, Upload, X,
  Image as ImageIcon, Edit, Reply, MoreHorizontal, Trash2,
  Layers, Grid3X3, LayoutGrid, FileImage, Lightbulb, FileText, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useUpload } from "@/hooks/use-upload";
import type { Project, User as UserType, Comment } from "@shared/schema";

interface ProjectWithAuthor extends Project {
  author?: UserType;
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "cultural", label: "Cultural" },
  { value: "educational", label: "Educational" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality" },
  { value: "industrial", label: "Industrial" },
  { value: "landscape", label: "Landscape" },
  { value: "mixed-use", label: "Mixed Use" },
  { value: "religious", label: "Religious" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "urban", label: "Urban Design" },
];

const PROJECT_TYPES = [
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    projectType: "",
    year: "",
    conceptExplanation: "",
    image: "",
    images: [] as string[],
    plans: [] as string[],
    elevations: [] as string[],
    sections: [] as string[],
    conceptDiagrams: [] as string[],
  });
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { uploadFile, isUploading } = useUpload();

  const { data: project, isLoading: projectLoading } = useQuery<ProjectWithAuthor>({
    queryKey: ["/api/projects", id],
  });

  const { data: author } = useQuery<UserType>({
    queryKey: ["/api/users", project?.authorId],
    enabled: !!project?.authorId,
  });

  const { data: allComments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments", "project", id],
  });

  const comments = allComments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => allComments.filter(c => c.parentId === parentId);

  const { data: likesData } = useQuery<{ count: number }>({
    queryKey: ["/api/likes", "project", id],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", user?.id, "likes"],
    enabled: isAuthenticated && !!user?.id,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "project" && like.targetId === id
  );

  const isSaved = savedItems.some(
    (item) => item.targetType === "project" && item.targetId === id
  );

  const isOwner = user?.id === project?.authorId;

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: "project",
        targetId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", "project", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "likes"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", {
        targetType: "project",
        targetId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: isSaved ? "Removed from saved" : "Saved to library",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const res = await apiRequest("POST", "/api/comments", {
        targetType: "project",
        targetId: id,
        content,
        parentId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "project", id] });
      setCommentText("");
      setReplyText("");
      setReplyingTo(null);
      toast({ description: "Comment posted successfully" });
    },
    onError: () => {
      toast({ description: "Failed to post comment", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      setIsEditDialogOpen(false);
      toast({ description: "Project updated successfully" });
    },
    onError: () => {
      toast({ description: "Failed to update project", variant: "destructive" });
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: project?.title || "Project on ArchNet", url });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    }
  };

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "project", id] });
      setDeleteConfirmId(null);
      toast({ description: "Comment deleted successfully" });
    },
    onError: () => {
      toast({ description: "Failed to delete comment", variant: "destructive" });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await apiRequest("PATCH", `/api/comments/${commentId}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "project", id] });
      setEditingCommentId(null);
      setEditingCommentContent("");
      toast({ description: "Comment updated successfully" });
    },
    onError: () => {
      toast({ description: "Failed to update comment", variant: "destructive" });
    },
  });

  const openEditDialog = () => {
    if (project) {
      setEditForm({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        projectType: project.projectType || "",
        year: project.year || "",
        conceptExplanation: project.conceptExplanation || "",
        image: project.image || "",
        images: project.images || [],
        plans: project.plans || [],
        elevations: project.elevations || [],
        sections: project.sections || [],
        conceptDiagrams: project.conceptDiagrams || [],
      });
      setIsEditDialogOpen(true);
    }
  };

  // Helper to check if field should use named images
  const isNamedField = (field: string) => ['plans', 'elevations', 'sections'].includes(field);
  
  // Helper to parse named image from JSON or legacy string
  const parseNamedImageLocal = (item: string): { name: string; path: string } => {
    try {
      const parsed = JSON.parse(item);
      if (parsed.path) {
        return { name: parsed.name || '', path: parsed.path };
      }
    } catch {
      // Legacy format - just a path string
    }
    return { name: '', path: item };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof editForm) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result) {
        if (field === "image") {
          setEditForm(f => ({ ...f, image: result.objectPath }));
        } else if (isNamedField(field)) {
          // For plans, elevations, sections - store as JSON with name
          const namedItem = JSON.stringify({ name: '', path: result.objectPath });
          setEditForm(f => ({ ...f, [field]: [...(f[field] as string[]), namedItem] }));
        } else {
          setEditForm(f => ({ ...f, [field]: [...(f[field] as string[]), result.objectPath] }));
        }
      }
    }
  };

  const removeImage = (field: keyof typeof editForm, index?: number) => {
    if (field === "image") {
      setEditForm(f => ({ ...f, image: "" }));
    } else if (index !== undefined) {
      setEditForm(f => ({
        ...f,
        [field]: (f[field] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const updateItemName = (field: keyof typeof editForm, index: number, newName: string) => {
    setEditForm(f => {
      const items = [...(f[field] as string[])];
      const parsed = parseNamedImageLocal(items[index]);
      items[index] = JSON.stringify({ name: newName, path: parsed.path });
      return { ...f, [field]: items };
    });
  };

  const handleEditSubmit = () => {
    updateProjectMutation.mutate(editForm);
  };

  const mainImage = project?.image;
  const additionalImages = project?.images || [];
  const rawPlans = project?.plans || [];
  const rawElevations = project?.elevations || [];
  const rawSections = project?.sections || [];
  const conceptDiagrams = project?.conceptDiagrams || [];
  
  // Parse named images for plans, elevations, sections
  const plans = rawPlans.map(item => parseNamedImageLocal(item));
  const elevations = rawElevations.map(item => parseNamedImageLocal(item));
  const sections = rawSections.map(item => parseNamedImageLocal(item));
  
  // Extract paths for the hero carousel and lightbox
  const planPaths = plans.map(p => p.path);
  const elevationPaths = elevations.map(e => e.path);
  const sectionPaths = sections.map(s => s.path);
  
  const allImages = [
    mainImage,
    ...additionalImages,
    ...planPaths,
    ...elevationPaths,
    ...sectionPaths,
    ...conceptDiagrams,
  ].filter(Boolean) as string[];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Auto-play for hero carousel (every 5 seconds)
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [allImages.length]);

  // Lightbox functions
  const openLightbox = (images: string[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevLightboxImage();
          break;
        case 'ArrowRight':
          nextLightboxImage();
          break;
        case 'Escape':
          setLightboxOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxImages.length]);

  if (projectLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Image Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden border-b bg-muted">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]}
              alt={project.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={prevImage}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={nextImage}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.slice(0, 10).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      )}
                    />
                  ))}
                  {allImages.length > 10 && (
                    <span className="text-white/70 text-xs ml-1">+{allImages.length - 10}</span>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
      </section>

      {/* Project Header */}
      <section className="border-b py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Link>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {project.projectType && (
                    <Badge variant={project.projectType === "academic" ? "secondary" : "default"}>
                      {project.projectType === "academic" ? "Academic" : "Professional"}
                    </Badge>
                  )}
                  {project.category && (
                    <Badge variant="outline" className="capitalize">{project.category}</Badge>
                  )}
                  {project.status === "pending" && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Approval</Badge>
                  )}
                </div>

                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-balance leading-tight">
                  {project.title}
                </h1>
              </div>

              {isOwner && (
                <Button variant="outline" onClick={openEditDialog} data-testid="button-edit-project">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              )}
            </div>

            {author && (
              <Link href={`/profile/${author.username}`} className="mt-6 inline-flex items-center gap-3 group">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage src={author.avatar || undefined} />
                  <AvatarFallback>{author.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium group-hover:text-primary transition-colors">{author.name}</span>
                    {author.isVerified && <VerificationBadge type={author.verificationType || undefined} />}
                  </div>
                  <span className="text-sm text-muted-foreground">@{author.username}</span>
                </div>
              </Link>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
              {project.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{project.year}</span>
                </div>
              )}
              {author?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{author.location}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({ description: "Please log in to like" });
                    return;
                  }
                  likeMutation.mutate();
                }}
                disabled={likeMutation.isPending}
                data-testid="button-like-project"
              >
                {likeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
                )}
                {likesData?.count ?? 0} Likes
              </Button>
              
              <Button
                variant={isSaved ? "default" : "outline"}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast({ description: "Please log in to save" });
                    return;
                  }
                  saveMutation.mutate();
                }}
                disabled={saveMutation.isPending}
                data-testid="button-save-project"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
                )}
                Save
              </Button>

              <Button variant="outline" onClick={handleShare} data-testid="button-share-project">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {project.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      About the Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Concept Explanation */}
              {project.conceptExplanation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Concept Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {project.conceptExplanation}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Project Gallery - Organized Sections */}
              {(plans.length > 0 || elevations.length > 0 || sections.length > 0 || conceptDiagrams.length > 0 || additionalImages.length > 0) && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6" />
                    Project Gallery
                  </h2>

                  {/* Plans Section */}
                  {plans.length > 0 && (
                    <NamedGallerySection
                      title="Plans"
                      icon={<Layers className="h-5 w-5" />}
                      items={plans}
                      onImageClick={(index) => openLightbox(planPaths, index)}
                    />
                  )}

                  {/* Elevations Section */}
                  {elevations.length > 0 && (
                    <NamedGallerySection
                      title="Elevations"
                      icon={<Grid3X3 className="h-5 w-5" />}
                      items={elevations}
                      onImageClick={(index) => openLightbox(elevationPaths, index)}
                    />
                  )}

                  {/* Sections Section */}
                  {sections.length > 0 && (
                    <NamedGallerySection
                      title="Sections"
                      icon={<FileImage className="h-5 w-5" />}
                      items={sections}
                      onImageClick={(index) => openLightbox(sectionPaths, index)}
                    />
                  )}

                  {/* Concept Diagrams Section */}
                  {conceptDiagrams.length > 0 && (
                    <GallerySection
                      title="Concept Diagrams"
                      icon={<Lightbulb className="h-5 w-5" />}
                      images={conceptDiagrams}
                      onImageClick={(index) => openLightbox(conceptDiagrams, index)}
                    />
                  )}

                  {/* Additional Images Section */}
                  {additionalImages.length > 0 && (
                    <GallerySection
                      title="Additional Images"
                      icon={<ImageIcon className="h-5 w-5" />}
                      images={additionalImages}
                      onImageClick={(index) => openLightbox(additionalImages, index)}
                    />
                  )}
                </div>
              )}

              <Separator />

              {/* Comments Section */}
              <div>
                <h2 className="mb-6 font-serif text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Comments ({allComments.length})
                </h2>

                {isAuthenticated ? (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar || undefined} />
                          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Share your thoughts about this project..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="resize-none"
                            rows={3}
                            data-testid="textarea-comment"
                          />
                          <Button
                            onClick={() => commentMutation.mutate({ content: commentText })}
                            disabled={!commentText.trim() || commentMutation.isPending}
                            data-testid="button-post-comment"
                          >
                            {commentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="mb-6">
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">Log in to leave a comment</p>
                      <Button asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentCard 
                        key={comment.id} 
                        comment={comment}
                        replies={getReplies(comment.id)}
                        isAuthenticated={isAuthenticated}
                        currentUserId={user?.id}
                        onReply={(id) => {
                          setReplyingTo(id);
                          setReplyText("");
                        }}
                        replyingTo={replyingTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSubmitReply={(parentId) => {
                          if (replyText.trim()) {
                            commentMutation.mutate({ content: replyText, parentId });
                          }
                        }}
                        onCancelReply={() => setReplyingTo(null)}
                        isSubmitting={commentMutation.isPending}
                        editingCommentId={editingCommentId}
                        editingCommentContent={editingCommentContent}
                        setEditingCommentId={setEditingCommentId}
                        setEditingCommentContent={setEditingCommentContent}
                        onDeleteComment={(commentId) => setDeleteConfirmId(commentId)}
                        onUpdateComment={(commentId, content) => updateCommentMutation.mutate({ commentId, content })}
                        isDeleting={deleteCommentMutation.isPending}
                        isUpdating={updateCommentMutation.isPending}
                        projectId={id!}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {author && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src={author.avatar || undefined} />
                        <AvatarFallback className="text-2xl">{author.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h3 className="font-semibold text-lg">{author.name}</h3>
                        {author.isVerified && <VerificationBadge type={author.verificationType || undefined} />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">@{author.username}</p>
                      {author.title && (
                        <p className="text-sm text-muted-foreground mb-4">{author.title}</p>
                      )}
                      {author.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{author.bio}</p>
                      )}
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/profile/${author.username}`}>
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Project Details</h3>
                  <div className="space-y-3 text-sm">
                    {project.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="capitalize">{project.category}</span>
                      </div>
                    )}
                    {project.projectType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="capitalize">{project.projectType}</span>
                      </div>
                    )}
                    {project.year && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year</span>
                        <span>{project.year}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Images</span>
                      <span>{allImages.length}</span>
                    </div>
                    {plans.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plans</span>
                        <span>{plans.length}</span>
                      </div>
                    )}
                    {elevations.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Elevations</span>
                        <span>{elevations.length}</span>
                      </div>
                    )}
                    {sections.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sections</span>
                        <span>{sections.length}</span>
                      </div>
                    )}
                    {conceptDiagrams.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Concept Diagrams</span>
                        <span>{conceptDiagrams.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project information below.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Project title"
                  data-testid="input-edit-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Project description"
                  rows={4}
                  data-testid="textarea-edit-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={editForm.category} onValueChange={(v) => setEditForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger data-testid="select-edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Project Type</label>
                  <Select value={editForm.projectType} onValueChange={(v) => setEditForm(f => ({ ...f, projectType: v }))}>
                    <SelectTrigger data-testid="select-edit-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  value={editForm.year}
                  onChange={(e) => setEditForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="e.g., 2024"
                  data-testid="input-edit-year"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Concept Explanation</label>
                <Textarea
                  value={editForm.conceptExplanation}
                  onChange={(e) => setEditForm(f => ({ ...f, conceptExplanation: e.target.value }))}
                  placeholder="Explain your design concept..."
                  rows={5}
                  data-testid="textarea-edit-concept"
                />
              </div>

              <Separator className="my-4" />
              <h4 className="text-sm font-semibold mb-3">Project Images</h4>

              <ImageUploadField
                label="Main Image"
                images={editForm.image ? [editForm.image] : []}
                onUpload={(e) => handleImageUpload(e, "image")}
                onRemove={(_index) => removeImage("image")}
                isUploading={isUploading}
                testIdPrefix="main-image"
                multiple={false}
              />

              <ImageUploadField
                label="Additional Images"
                images={editForm.images}
                onUpload={(e) => handleImageUpload(e, "images")}
                onRemove={(index) => removeImage("images", index)}
                isUploading={isUploading}
                testIdPrefix="additional"
              />

              <NamedImageUploadField
                label="Plans"
                items={editForm.plans}
                onUpload={(e) => handleImageUpload(e, "plans")}
                onRemove={(index) => removeImage("plans", index)}
                onUpdateName={(index, name) => updateItemName("plans", index, name)}
                isUploading={isUploading}
                testIdPrefix="plans"
                placeholder="e.g., Ground Floor, First Floor"
              />

              <NamedImageUploadField
                label="Elevations"
                items={editForm.elevations}
                onUpload={(e) => handleImageUpload(e, "elevations")}
                onRemove={(index) => removeImage("elevations", index)}
                onUpdateName={(index, name) => updateItemName("elevations", index, name)}
                isUploading={isUploading}
                testIdPrefix="elevations"
                placeholder="e.g., North Elevation, South Elevation"
              />

              <NamedImageUploadField
                label="Sections"
                items={editForm.sections}
                onUpload={(e) => handleImageUpload(e, "sections")}
                onRemove={(index) => removeImage("sections", index)}
                onUpdateName={(index, name) => updateItemName("sections", index, name)}
                isUploading={isUploading}
                testIdPrefix="sections"
                placeholder="e.g., Section A-A, Cross Section"
              />

              <ImageUploadField
                label="Concept Diagrams"
                images={editForm.conceptDiagrams}
                onUpload={(e) => handleImageUpload(e, "conceptDiagrams")}
                onRemove={(index) => removeImage("conceptDiagrams", index)}
                isUploading={isUploading}
                testIdPrefix="concepts"
              />
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  deleteCommentMutation.mutate(deleteConfirmId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-sm border-0">
          <div className="relative flex items-center justify-center min-h-[80vh]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm hover-elevate"
              onClick={() => setLightboxOpen(false)}
              data-testid="button-lightbox-close"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-md text-sm font-medium">
              {lightboxIndex + 1} of {lightboxImages.length}
            </div>

            {/* Navigation - Previous */}
            {lightboxImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm hover-elevate"
                onClick={prevLightboxImage}
                data-testid="button-lightbox-prev"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Main Image */}
            <div className="flex items-center justify-center p-8 w-full h-full">
              {lightboxImages[lightboxIndex] && (
                <img
                  src={lightboxImages[lightboxIndex]}
                  alt={`Image ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  data-testid="img-lightbox-current"
                />
              )}
            </div>

            {/* Navigation - Next */}
            {lightboxImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 backdrop-blur-sm hover-elevate"
                onClick={nextLightboxImage}
                data-testid="button-lightbox-next"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Thumbnail Strip */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg max-w-[80vw] overflow-x-auto">
                {lightboxImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                      idx === lightboxIndex 
                        ? "border-primary ring-2 ring-primary/30" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    data-testid={`button-lightbox-thumb-${idx}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function ImageGallery({ images, onSelect, selectedIndex }: { images: string[]; onSelect: (i: number) => void; selectedIndex?: number }) {
  if (images.length === 0) return null;
  
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <button
          key={index}
          className={cn(
            "aspect-video overflow-hidden rounded-lg border-2 transition-all hover:opacity-90",
            selectedIndex !== undefined && images[selectedIndex] === image ? "border-primary ring-2 ring-primary/20" : "border-transparent"
          )}
          onClick={() => onSelect(index)}
        >
          <img
            src={image}
            alt={`Image ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

interface GallerySectionProps {
  title: string;
  icon: React.ReactNode;
  images: string[];
  onImageClick: (index: number) => void;
}

function GallerySection({ title, icon, images, onImageClick }: GallerySectionProps) {
  if (images.length === 0) return null;

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageClick(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30 transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid={`button-gallery-image-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {title.slice(0, -1)} {index + 1}
                </span>
                <span className="text-xs text-white/80 drop-shadow-sm">
                  {index + 1}/{images.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Gallery section that supports named images (with labels like "Ground Floor")
interface NamedGallerySectionProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{ name: string; path: string }>;
  onImageClick: (index: number) => void;
}

function NamedGallerySection({ title, icon, items, onImageClick }: NamedGallerySectionProps) {
  if (items.length === 0) return null;

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {items.length} {items.length === 1 ? 'drawing' : 'drawings'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {items.map((item, index) => {
            const imgSrc = item.path.startsWith('/objects') || item.path.startsWith('http') 
              ? item.path 
              : `/objects/${item.path}`;
            return (
              <div
                key={index}
                className="group relative w-full overflow-hidden rounded-xl border-2 border-border bg-background transition-all hover:border-primary/50 hover:shadow-xl"
                data-testid={`gallery-item-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`}
              >
                <div className="aspect-[3/2] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                  <iframe
                    src={imgSrc}
                    title={item.name || `${title} ${index + 1}`}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t bg-muted/50">
                  <span className="text-sm font-semibold truncate">
                    {item.name || `${title.slice(0, -1)} ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={imgSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {index + 1} of {items.length}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface ImageUploadFieldProps {
  label: string;
  images: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  isUploading: boolean;
  testIdPrefix: string;
  multiple?: boolean;
}

function ImageUploadField({ label, images, onUpload, onRemove, isUploading, testIdPrefix, multiple = true }: ImageUploadFieldProps) {
  const isPdf = (path: string) => path.toLowerCase().endsWith('.pdf');
  const getFileName = (path: string) => path.split('/').pop() || path;
  const isUrl = (path: string) => path.startsWith('/objects') || path.startsWith('http');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-dashed border-input rounded-md p-4">
        <div className="flex items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <label className={`cursor-pointer text-sm text-muted-foreground hover:text-foreground ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
            <span>{isUploading ? 'Uploading...' : `Click to upload${multiple ? " (multiple)" : ""}`}</span>
            <input
              type="file"
              className="hidden"
              multiple={multiple}
              accept="image/*,.pdf,application/pdf"
              onChange={onUpload}
              disabled={isUploading}
              data-testid={`input-upload-${testIdPrefix}`}
            />
          </label>
        </div>
        {images.length > 0 && (
          <div className="mt-3 space-y-2">
            {images.map((path, index) => (
              <div key={index} className="flex items-center justify-between gap-2 text-sm bg-muted/50 px-3 py-2 rounded-md">
                <div className="flex items-center gap-2 truncate min-w-0">
                  {isPdf(path) ? (
                    <>
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{getFileName(path)}</span>
                    </>
                  ) : (
                    <>
                      <img 
                        src={isUrl(path) ? path : `/objects/${path}`} 
                        alt={`${label} ${index + 1}`}
                        className="h-8 w-12 object-cover rounded flex-shrink-0"
                      />
                      <span className="truncate text-muted-foreground">{getFileName(path)}</span>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onRemove(index)}
                  data-testid={`button-remove-${testIdPrefix}-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to parse named images (JSON format or legacy string)
interface NamedImage {
  name: string;
  path: string;
}

function parseNamedImage(item: string): NamedImage {
  try {
    const parsed = JSON.parse(item);
    if (parsed.path) {
      return { name: parsed.name || '', path: parsed.path };
    }
  } catch {
    // Legacy format - just a path string
  }
  return { name: '', path: item };
}

function serializeNamedImage(name: string, path: string): string {
  return JSON.stringify({ name, path });
}

interface NamedImageUploadFieldProps {
  label: string;
  items: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onUpdateName: (index: number, name: string) => void;
  isUploading: boolean;
  testIdPrefix: string;
  placeholder?: string;
}

function NamedImageUploadField({ 
  label, 
  items, 
  onUpload, 
  onRemove, 
  onUpdateName,
  isUploading, 
  testIdPrefix,
  placeholder = "e.g., Ground Floor"
}: NamedImageUploadFieldProps) {
  const isPdf = (path: string) => path.toLowerCase().endsWith('.pdf');
  const isUrl = (path: string) => path.startsWith('/objects') || path.startsWith('http');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-dashed border-input rounded-md p-4">
        <div className="flex items-center justify-center gap-2">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <label className={`cursor-pointer text-sm text-muted-foreground hover:text-foreground ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
            <span>{isUploading ? 'Uploading...' : 'Click to upload (multiple)'}</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf,application/pdf"
              onChange={onUpload}
              disabled={isUploading}
              data-testid={`input-upload-${testIdPrefix}`}
            />
          </label>
        </div>
        {items.length > 0 && (
          <div className="mt-3 space-y-3">
            {items.map((item, index) => {
              const parsed = parseNamedImage(item);
              return (
                <div key={index} className="flex items-start gap-3 bg-muted/50 p-3 rounded-md">
                  {isPdf(parsed.path) ? (
                    <div className="h-16 w-20 flex items-center justify-center bg-muted rounded flex-shrink-0">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img 
                      src={isUrl(parsed.path) ? parsed.path : `/objects/${parsed.path}`} 
                      alt={parsed.name || `${label} ${index + 1}`}
                      className="h-16 w-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Input
                      value={parsed.name}
                      onChange={(e) => onUpdateName(index, e.target.value)}
                      placeholder={placeholder}
                      className="h-8 text-sm"
                      data-testid={`input-name-${testIdPrefix}-${index}`}
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {parsed.path.split('/').pop()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => onRemove(index)}
                    data-testid={`button-remove-${testIdPrefix}-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  replies: Comment[];
  isAuthenticated: boolean;
  currentUserId?: string;
  onReply: (id: string) => void;
  replyingTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
  onCancelReply: () => void;
  isSubmitting: boolean;
  projectId: string;
  editingCommentId: string | null;
  editingCommentContent: string;
  setEditingCommentId: (id: string | null) => void;
  setEditingCommentContent: (content: string) => void;
  onDeleteComment: (id: string) => void;
  onUpdateComment: (id: string, content: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

function CommentCard({ 
  comment, 
  replies, 
  isAuthenticated, 
  currentUserId,
  onReply, 
  replyingTo, 
  replyText, 
  setReplyText, 
  onSubmitReply,
  onCancelReply,
  isSubmitting,
  projectId,
  editingCommentId,
  editingCommentContent,
  setEditingCommentId,
  setEditingCommentContent,
  onDeleteComment,
  onUpdateComment,
  isDeleting,
  isUpdating
}: CommentCardProps) {
  const { toast } = useToast();
  const isOwner = currentUserId === comment.userId;
  const isEditing = editingCommentId === comment.id;
  
  const { data: author } = useQuery<UserType>({
    queryKey: ["/api/users", comment.userId],
  });

  const { data: likesData } = useQuery<{ count: number }>({
    queryKey: ["/api/likes", "comment", comment.id],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", currentUserId, "likes"],
    enabled: !!currentUserId,
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "comment" && like.targetId === comment.id
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: "comment",
        targetId: comment.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", "comment", comment.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "likes"] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ description: "Please log in to like comments" });
      return;
    }
    likeMutation.mutate();
  };

  const handleStartEdit = () => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleSaveEdit = () => {
    if (editingCommentContent.trim()) {
      onUpdateComment(comment.id, editingCommentContent);
    }
  };

  return (
    <Card data-testid={`comment-${comment.id}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Link href={author ? `/profile/${author.username}` : "#"}>
            <Avatar>
              <AvatarImage src={author?.avatar || undefined} />
              <AvatarFallback>{author?.name?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {author ? (
                  <Link href={`/profile/${author.username}`} className="font-semibold hover:text-primary">
                    {author.name}
                  </Link>
                ) : (
                  <span className="font-semibold">Loading...</span>
                )}
                {author?.isVerified && <VerificationBadge type={author.verificationType || undefined} />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-comment-menu-${comment.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleStartEdit} data-testid={`button-edit-comment-${comment.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteComment(comment.id)} 
                        className="text-destructive"
                        data-testid={`button-delete-comment-${comment.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="mb-3">
                <Textarea
                  value={editingCommentContent}
                  onChange={(e) => setEditingCommentContent(e.target.value)}
                  className="resize-none mb-2"
                  rows={3}
                  data-testid={`textarea-edit-comment-${comment.id}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editingCommentContent.trim()}>
                    {isUpdating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("text-muted-foreground", isLiked && "text-red-500")}
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                {likeMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Heart className={cn("mr-1.5 h-3.5 w-3.5", isLiked && "fill-current")} />
                )}
                {likesData?.count ?? 0}
              </Button>
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => onReply(comment.id)}
                >
                  <Reply className="mr-1.5 h-3.5 w-3.5" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 pl-4 border-l-2 border-muted">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="resize-none mb-2"
                  rows={2}
                  data-testid={`textarea-reply-${comment.id}`}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyText.trim() || isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Reply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancelReply}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {replies.map((reply) => (
                  <ReplyCard 
                    key={reply.id} 
                    reply={reply} 
                    isAuthenticated={isAuthenticated} 
                    currentUserId={currentUserId}
                    editingCommentId={editingCommentId}
                    editingCommentContent={editingCommentContent}
                    setEditingCommentId={setEditingCommentId}
                    setEditingCommentContent={setEditingCommentContent}
                    onDeleteComment={onDeleteComment}
                    onUpdateComment={onUpdateComment}
                    isDeleting={isDeleting}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReplyCardProps {
  reply: Comment;
  isAuthenticated: boolean;
  currentUserId?: string;
  editingCommentId: string | null;
  editingCommentContent: string;
  setEditingCommentId: (id: string | null) => void;
  setEditingCommentContent: (content: string) => void;
  onDeleteComment: (id: string) => void;
  onUpdateComment: (id: string, content: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

function ReplyCard({ 
  reply, 
  isAuthenticated, 
  currentUserId,
  editingCommentId,
  editingCommentContent,
  setEditingCommentId,
  setEditingCommentContent,
  onDeleteComment,
  onUpdateComment,
  isDeleting,
  isUpdating
}: ReplyCardProps) {
  const { toast } = useToast();
  const isOwner = currentUserId === reply.userId;
  const isEditing = editingCommentId === reply.id;
  
  const { data: author } = useQuery<UserType>({
    queryKey: ["/api/users", reply.userId],
  });

  const { data: likesData } = useQuery<{ count: number }>({
    queryKey: ["/api/likes", "comment", reply.id],
  });

  const { data: userLikes = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/users", currentUserId, "likes"],
    enabled: !!currentUserId,
  });

  const isLiked = userLikes.some(
    (like) => like.targetType === "comment" && like.targetId === reply.id
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/likes", {
        targetType: "comment",
        targetId: reply.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/likes", "comment", reply.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUserId, "likes"] });
    },
  });

  const handleStartEdit = () => {
    setEditingCommentId(reply.id);
    setEditingCommentContent(reply.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleSaveEdit = () => {
    if (editingCommentContent.trim()) {
      onUpdateComment(reply.id, editingCommentContent);
    }
  };

  return (
    <div className="pl-4 border-l-2 border-muted" data-testid={`reply-${reply.id}`}>
      <div className="flex gap-3">
        <Link href={author ? `/profile/${author.username}` : "#"}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={author?.avatar || undefined} />
            <AvatarFallback className="text-xs">{author?.name?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              {author ? (
                <Link href={`/profile/${author.username}`} className="text-sm font-semibold hover:text-primary">
                  {author.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold">Loading...</span>
              )}
              <span className="text-xs text-muted-foreground">
                {reply.createdAt && new Date(reply.createdAt).toLocaleDateString()}
              </span>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`button-reply-menu-${reply.id}`}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleStartEdit} data-testid={`button-edit-reply-${reply.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteComment(reply.id)} 
                    className="text-destructive"
                    data-testid={`button-delete-reply-${reply.id}`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {isEditing ? (
            <div className="mb-2">
              <Textarea
                value={editingCommentContent}
                onChange={(e) => setEditingCommentContent(e.target.value)}
                className="resize-none mb-2 text-sm"
                rows={2}
                data-testid={`textarea-edit-reply-${reply.id}`}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editingCommentContent.trim()}>
                  {isUpdating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("text-muted-foreground mt-1 h-7", isLiked && "text-red-500")}
            onClick={() => {
              if (!isAuthenticated) {
                toast({ description: "Please log in to like" });
                return;
              }
              likeMutation.mutate();
            }}
            disabled={likeMutation.isPending}
          >
            {likeMutation.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Heart className={cn("mr-1 h-3 w-3", isLiked && "fill-current")} />
            )}
            {likesData?.count ?? 0}
          </Button>
        </div>
      </div>
    </div>
  );
}
