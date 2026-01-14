import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Folder, ArrowUpDown, Plus, MapPin, User, Loader2, Upload, Image as ImageIcon, FileText, X, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUpload } from "@/hooks/use-upload";
import { useState } from "react";
import { Link } from "wouter";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, User as UserType } from "@shared/schema";
import { SocialInteractions } from "@/components/SocialInteractions";

interface ProjectWithAuthor extends Project {
  author?: UserType;
}

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  category: z.string().optional(),
  projectType: z.string().optional(),
  year: z.string().optional(),
  conceptExplanation: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "cultural", label: "Cultural" },
  { value: "educational", label: "Educational" },
  { value: "mixed-use", label: "Mixed-Use" },
  { value: "urban", label: "Urban" },
  { value: "interior", label: "Interior" },
];

const PROJECT_TYPES = [
  { value: "academic", label: "Academic" },
  { value: "professional", label: "Professional" },
];

function FileUploadField({ 
  label, 
  multiple = false, 
  uploadedPaths,
  setUploadedPaths,
  testId,
}: { 
  label: string; 
  multiple?: boolean; 
  uploadedPaths: string[];
  setUploadedPaths: (paths: string[]) => void;
  testId: string;
}) {
  const { uploadFile, isUploading } = useUpload();
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const filesToUpload = multiple ? selectedFiles : selectedFiles.slice(0, 1);
    setUploadingCount(filesToUpload.length);

    const newPaths: string[] = [];
    for (const file of filesToUpload) {
      const result = await uploadFile(file);
      if (result) {
        newPaths.push(result.objectPath);
      }
    }
    
    if (newPaths.length > 0) {
      if (multiple) {
        setUploadedPaths([...uploadedPaths, ...newPaths]);
      } else {
        setUploadedPaths(newPaths.slice(0, 1));
      }
    }
    setUploadingCount(0);
    e.target.value = '';
  };

  const removePath = (index: number) => {
    setUploadedPaths(uploadedPaths.filter((_, i) => i !== index));
  };

  const isPdf = (path: string) => path.toLowerCase().endsWith('.pdf');
  const getFileName = (path: string) => path.split('/').pop() || path;
  const isUploading_ = uploadingCount > 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-dashed border-input rounded-md p-4">
        <div className="flex items-center justify-center gap-2">
          {isUploading_ ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <label className={`cursor-pointer text-sm text-muted-foreground hover:text-foreground ${isUploading_ ? 'pointer-events-none opacity-50' : ''}`}>
            <span>{isUploading_ ? `Uploading ${uploadingCount} file(s)...` : `Click to upload${multiple ? " (multiple)" : ""}`}</span>
            <input
              type="file"
              className="hidden"
              multiple={multiple}
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading_}
              data-testid={testId}
            />
          </label>
        </div>
        {uploadedPaths.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedPaths.map((path, index) => (
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
                        src={path.startsWith('/objects') || path.startsWith('http') ? path : `/objects/${path}`} 
                        alt={`Upload ${index + 1}`}
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
                  onClick={() => removePath(index)}
                  data-testid={`button-remove-file-${index}`}
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
function parseNamedImage(item: string): { name: string; path: string } {
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

function NamedFileUploadField({ 
  label, 
  uploadedPaths,
  setUploadedPaths,
  testId,
  placeholder = "e.g., Ground Floor",
}: { 
  label: string; 
  uploadedPaths: string[];
  setUploadedPaths: (paths: string[]) => void;
  testId: string;
  placeholder?: string;
}) {
  const { uploadFile } = useUpload();
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadingCount(selectedFiles.length);

    const newPaths: string[] = [];
    for (const file of selectedFiles) {
      const result = await uploadFile(file);
      if (result) {
        // Store as JSON with empty name
        newPaths.push(JSON.stringify({ name: '', path: result.objectPath }));
      }
    }
    
    if (newPaths.length > 0) {
      setUploadedPaths([...uploadedPaths, ...newPaths]);
    }
    setUploadingCount(0);
    e.target.value = '';
  };

  const removePath = (index: number) => {
    setUploadedPaths(uploadedPaths.filter((_, i) => i !== index));
  };

  const updateName = (index: number, newName: string) => {
    const items = [...uploadedPaths];
    const parsed = parseNamedImage(items[index]);
    items[index] = JSON.stringify({ name: newName, path: parsed.path });
    setUploadedPaths(items);
  };

  const isPdf = (path: string) => path.toLowerCase().endsWith('.pdf');
  const isUploading_ = uploadingCount > 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="border border-dashed border-input rounded-md p-4">
        <div className="flex items-center justify-center gap-2">
          {isUploading_ ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <label className={`cursor-pointer text-sm text-muted-foreground hover:text-foreground ${isUploading_ ? 'pointer-events-none opacity-50' : ''}`}>
            <span>{isUploading_ ? `Uploading ${uploadingCount} file(s)...` : 'Click to upload (multiple)'}</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading_}
              data-testid={testId}
            />
          </label>
        </div>
        {uploadedPaths.length > 0 && (
          <div className="mt-3 space-y-3">
            {uploadedPaths.map((item, index) => {
              const parsed = parseNamedImage(item);
              return (
                <div key={index} className="flex items-start gap-3 bg-muted/50 p-3 rounded-md">
                  {isPdf(parsed.path) ? (
                    <div className="h-16 w-20 flex items-center justify-center bg-muted rounded flex-shrink-0">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img 
                      src={parsed.path.startsWith('/objects') || parsed.path.startsWith('http') ? parsed.path : `/objects/${parsed.path}`} 
                      alt={parsed.name || `${label} ${index + 1}`}
                      className="h-16 w-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Input
                      value={parsed.name}
                      onChange={(e) => updateName(index, e.target.value)}
                      placeholder={placeholder}
                      className="h-8 text-sm"
                      data-testid={`input-name-${testId}-${index}`}
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
                    onClick={() => removePath(index)}
                    data-testid={`button-remove-named-${index}`}
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

function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isStudent = user?.role === "student";

  const [mainImage, setMainImage] = useState<string[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [plans, setPlans] = useState<string[]>([]);
  const [elevations, setElevations] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [conceptDiagrams, setConceptDiagrams] = useState<string[]>([]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      projectType: "",
      year: "",
      conceptExplanation: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const projectData = {
        ...values,
        image: mainImage[0] || "",
        images: additionalImages,
        plans,
        elevations,
        sections,
        conceptDiagrams,
      };
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project submitted",
        description: "Your project has been submitted successfully.",
      });
      setOpen(false);
      form.reset();
      setMainImage([]);
      setAdditionalImages([]);
      setPlans([]);
      setElevations([]);
      setSections([]);
      setConceptDiagrams([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    createProjectMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-project">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            {isStudent 
              ? "Share your academic work with the community. Student projects are a great way to get feedback and build your portfolio."
              : "Share your architectural project with the community. Fill in the details below to submit your work."
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter project title" 
                          {...field} 
                          data-testid="input-project-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of your project"
                          className="resize-none"
                          rows={3}
                          {...field} 
                          data-testid="textarea-project-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-project-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-project-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 2024" 
                            {...field} 
                            data-testid="input-project-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Project Images & Documents
                </h3>
                <FormDescription>
                  Upload images and PDFs of your project. Files will be uploaded to cloud storage.
                </FormDescription>

                <FileUploadField
                  label="Main Image"
                  uploadedPaths={mainImage}
                  setUploadedPaths={setMainImage}
                  testId="input-main-image"
                />

                <FileUploadField
                  label="Additional Images"
                  multiple
                  uploadedPaths={additionalImages}
                  setUploadedPaths={setAdditionalImages}
                  testId="input-additional-images"
                />

                <NamedFileUploadField
                  label="Plans"
                  uploadedPaths={plans}
                  setUploadedPaths={setPlans}
                  testId="input-plans"
                  placeholder="e.g., Ground Floor, First Floor"
                />

                <NamedFileUploadField
                  label="Elevations"
                  uploadedPaths={elevations}
                  setUploadedPaths={setElevations}
                  testId="input-elevations"
                  placeholder="e.g., North Elevation, South Elevation"
                />

                <NamedFileUploadField
                  label="Sections"
                  uploadedPaths={sections}
                  setUploadedPaths={setSections}
                  testId="input-sections"
                  placeholder="e.g., Section A-A, Cross Section"
                />

                <FileUploadField
                  label="Concept Diagrams"
                  multiple
                  uploadedPaths={conceptDiagrams}
                  setUploadedPaths={setConceptDiagrams}
                  testId="input-concept-diagrams"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Concept Explanation
                </h3>

                <FormField
                  control={form.control}
                  name="conceptExplanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Concept</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the concept behind your project, design decisions, and key features..."
                          className="resize-none"
                          rows={6}
                          {...field} 
                          data-testid="textarea-concept-explanation"
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the design philosophy, inspirations, and key decisions that shaped your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            data-testid="button-cancel-project"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createProjectMutation.isPending}
            data-testid="button-submit-project"
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      setDeleteProjectId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      });
    },
  });

  const { data: projects, isLoading, error } = useQuery<ProjectWithAuthor[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = (projects || []).filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.author?.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set((projects || []).map((p) => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Folder className="h-8 w-8 text-accent" />
                <h1 className="font-serif text-4xl font-bold">Projects</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Discover architectural projects from the community. Share your own work and get feedback.
              </p>
            </div>
            {isAuthenticated && <AddProjectDialog />}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-projects"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
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
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Failed to load projects. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredProjects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No projects found. Be the first to share a project!</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const isOwner = user?.id === project.authorId;
              return (
                <Card key={project.id} className="overflow-hidden hover-elevate group relative" data-testid={`card-project-${project.id}`}>
                  {isOwner && (
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={(e) => e.preventDefault()}
                            data-testid={`button-project-menu-${project.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              setDeleteProjectId(project.id);
                            }}
                            className="text-destructive"
                            data-testid={`button-delete-project-${project.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <Link href={`/projects/${project.id}`}>
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Folder className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {project.projectType && (
                          <Badge variant={project.projectType === "academic" ? "secondary" : "default"} className="text-xs">
                            {project.projectType === "academic" ? "Academic" : "Professional"}
                          </Badge>
                        )}
                      </div>
                      {project.category && (
                        <Badge className="absolute top-3 right-3 capitalize">{project.category}</Badge>
                      )}
                    </div>
                  </Link>
                  <CardHeader className="pb-2">
                    <Link href={`/projects/${project.id}`}>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.conceptExplanation ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.conceptExplanation}</p>
                    ) : project.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    ) : null}
                    <Link href={project.author?.username ? `/profile/${project.author.username}` : "#"} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <User className="h-4 w-4" />
                      <span>{project.author?.name || "Unknown"}</span>
                      {project.author?.isVerified && <VerificationBadge type="architect" size="sm" />}
                    </Link>
                    {project.year && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{project.year}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <SocialInteractions
                        contentId={project.id}
                        contentType="project"
                        shareUrl={`${window.location.origin}/projects/${project.id}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteProjectId && deleteProjectMutation.mutate(deleteProjectId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteProjectMutation.isPending}
                >
                  {deleteProjectMutation.isPending ? (
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
      </section>

      <Footer />
    </div>
  );
}
