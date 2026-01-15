import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  User,
  GraduationCap,
  Folder,
  FileText,
  Briefcase,
  Bookmark,
  Activity,
  Plus,
  Settings,
  MapPin,
  Calendar,
  Loader2,
  Clock,
  Heart,
  MessageSquare,
  Send,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { VerificationBadge } from "@/components/VerificationBadge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Research, Job, SavedItem, Post, Comment, Like } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: research, isLoading: researchLoading } = useQuery<Research[]>({
    queryKey: ["/api/research"],
    enabled: isAuthenticated && (user?.role === "engineer" || user?.role === "firm"),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: isAuthenticated && user?.role === "firm",
  });

  const { data: savedItems, isLoading: savedLoading } = useQuery<SavedItem[]>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  const requestResearchPermissionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications", {
        userId: user?.id,
        type: "research_permission_request",
        title: "Research Publication Request",
        message: `${user?.name} is requesting permission to publish research.`,
      });
    },
    onSuccess: () => {
      toast({ title: "Request submitted", description: "Your request has been sent to the administrators." });
    },
    onError: () => {
      toast({ title: "Request failed", variant: "destructive" });
    },
  });

  // Job creation form state
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobApplicationUrl, setJobApplicationUrl] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");

  const createJobMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      company: string;
      location?: string;
      type?: string;
      description?: string;
      requirements?: string;
      salary?: string;
      applicationUrl?: string;
      deadline?: string;
    }) => {
      return await apiRequest("POST", "/api/jobs", {
        ...data,
        postedById: user?.id,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job posted successfully!", description: "Your job listing is now live." });
      setJobDialogOpen(false);
      resetJobForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to post job", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const resetJobForm = () => {
    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobType("full-time");
    setJobDescription("");
    setJobRequirements("");
    setJobSalary("");
    setJobApplicationUrl("");
    setJobDeadline("");
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobCompany.trim()) {
      toast({ title: "Missing required fields", description: "Title and Company are required.", variant: "destructive" });
      return;
    }
    createJobMutation.mutate({
      title: jobTitle.trim(),
      company: jobCompany.trim(),
      location: jobLocation.trim() || undefined,
      type: jobType,
      description: jobDescription.trim() || undefined,
      requirements: jobRequirements.trim() || undefined,
      salary: jobSalary.trim() || undefined,
      applicationUrl: jobApplicationUrl.trim() || undefined,
      deadline: jobDeadline || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userProjects = (projects || []).filter((p) => p.authorId === user.id);
  const userResearch = (research || []).filter((r) => r.submittedById === user.id);
  const userJobs = (jobs || []).filter((j) => j.postedById === user.id);
  const userPosts = (posts || []).filter((p) => p.authorId === user.id);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "firm":
        return <Building2 className="h-5 w-5" />;
      case "student":
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case "firm":
        return "Architecture Firm";
      case "student":
        return "Architecture Student";
      case "admin":
        return "Administrator";
      default:
        return "Professional Engineer";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow">
                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                <AvatarFallback className="text-xl">{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold">{user.name}</h1>
                  {user.isVerified && <VerificationBadge type="architect" size="md" />}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getRoleIcon()}
                  <span>{getRoleLabel()}</span>
                </div>
                {user.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild data-testid="button-edit-profile">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild data-testid="button-view-profile">
                <Link href={`/profile/${user.username}`}>
                  <User className="mr-2 h-4 w-4" />
                  View Public Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Folder className="h-4 w-4" />
                      Projects
                    </span>
                    <span className="font-semibold" data-testid="text-projects-count">{userProjects.length}</span>
                  </div>
                  {(user.role === "engineer" || user.role === "firm") && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Research
                      </span>
                      <span className="font-semibold" data-testid="text-research-count">{userResearch.length}</span>
                    </div>
                  )}
                  {user.role === "firm" && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        Job Listings
                      </span>
                      <span className="font-semibold" data-testid="text-jobs-count">{userJobs.length}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bookmark className="h-4 w-4" />
                      Saved Items
                    </span>
                    <span className="font-semibold" data-testid="text-saved-count">{savedItems?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      Posts
                    </span>
                    <span className="font-semibold" data-testid="text-posts-count">{userPosts.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild data-testid="button-add-project">
                    <Link href="/projects">
                      <Folder className="mr-2 h-4 w-4" />
                      Add New Project
                    </Link>
                  </Button>

                  {user.role === "firm" && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => setJobDialogOpen(true)} data-testid="button-post-job">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                  )}

                  {(user.role === "engineer" || user.role === "firm") && (
                    <Button variant="outline" className="w-full justify-start" asChild data-testid="button-submit-research">
                      <Link href="/research">
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Research
                      </Link>
                    </Button>
                  )}

                  {user.role === "student" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => requestResearchPermissionMutation.mutate()}
                      disabled={requestResearchPermissionMutation.isPending}
                      data-testid="button-request-research-permission"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Request Research Permission
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Tabs defaultValue="content">
                <TabsList className="mb-6">
                  <TabsTrigger value="content" data-testid="tab-content">
                    <Folder className="mr-2 h-4 w-4" />
                    My Content
                  </TabsTrigger>
                  <TabsTrigger value="saved" data-testid="tab-saved">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Items
                  </TabsTrigger>
                  <TabsTrigger value="activity" data-testid="tab-activity">
                    <Activity className="mr-2 h-4 w-4" />
                    Recent Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <div className="space-y-6">
                    {user.role === "firm" && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              Office Profile
                            </CardTitle>
                            <CardDescription>Manage your firm's public profile</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" asChild data-testid="button-manage-office">
                            <Link href="/settings">
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || "Add a description of your firm to attract talent and showcase your work."}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {user.role === "student" && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5" />
                              Student Profile
                            </CardTitle>
                            <CardDescription>Your academic profile and portfolio</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" asChild data-testid="button-manage-student-profile">
                            <Link href="/settings">
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || "Share your academic journey and showcase your student projects."}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {user.role === "engineer" && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Professional Profile
                            </CardTitle>
                            <CardDescription>Your professional credentials and experience</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" asChild data-testid="button-manage-professional-profile">
                            <Link href="/settings">
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || "Showcase your professional experience and architectural expertise."}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            {user.role === "student" ? "Student Projects" : "Published Projects"}
                          </CardTitle>
                          <CardDescription>
                            {user.role === "student" 
                              ? "Your academic and personal projects" 
                              : "Projects published to your portfolio"}
                          </CardDescription>
                        </div>
                        <Button size="sm" asChild data-testid="button-new-project">
                          <Link href="/projects">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Project
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {projectsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : userProjects.length === 0 ? (
                          <div className="py-8 text-center">
                            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No projects yet. Start by adding your first project.</p>
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {userProjects.slice(0, 6).map((project) => (
                              <Card key={project.id} className="overflow-hidden hover-elevate" data-testid={`card-project-${project.id}`}>
                                <div className="aspect-video bg-muted">
                                  {project.image ? (
                                    <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <Folder className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-3">
                                  <h4 className="font-medium line-clamp-1">{project.title}</h4>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    {project.category && <Badge variant="secondary" className="text-xs">{project.category}</Badge>}
                                    {project.status === "pending" && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {(user.role === "engineer" || user.role === "firm") && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Published Research
                            </CardTitle>
                            <CardDescription>Your research papers and publications</CardDescription>
                          </div>
                          <Button size="sm" asChild data-testid="button-new-research">
                            <Link href="/research">
                              <Plus className="mr-2 h-4 w-4" />
                              Submit Research
                            </Link>
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {researchLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : userResearch.length === 0 ? (
                            <div className="py-8 text-center">
                              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-4 text-muted-foreground">No research papers yet. Submit your first paper.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userResearch.slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-md border p-3" data-testid={`item-research-${item.id}`}>
                                  <div>
                                    <h4 className="font-medium line-clamp-1">{item.title}</h4>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                      {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                                      {item.status === "pending" && (
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="mr-1 h-3 w-3" />
                                          Pending Approval
                                        </Badge>
                                      )}
                                      {item.status === "approved" && (
                                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {user.role === "firm" && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5" />
                              Job Listings
                            </CardTitle>
                            <CardDescription>Job postings from your firm</CardDescription>
                          </div>
                          <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" data-testid="button-new-job">
                                <Plus className="mr-2 h-4 w-4" />
                                Post Job
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Briefcase className="h-5 w-5" />
                                  Post a New Job
                                </DialogTitle>
                                <DialogDescription>
                                  Create a job listing to find qualified architects and designers
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Job Title *</Label>
                                    <Input
                                      id="jobTitle"
                                      placeholder="e.g. Senior Architect"
                                      value={jobTitle}
                                      onChange={(e) => setJobTitle(e.target.value)}
                                      required
                                      data-testid="input-job-title"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="jobCompany">Company Name *</Label>
                                    <div className="relative">
                                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                      <Input
                                        id="jobCompany"
                                        placeholder="Your company name"
                                        className="pl-10"
                                        value={jobCompany}
                                        onChange={(e) => setJobCompany(e.target.value)}
                                        required
                                        data-testid="input-job-company"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="jobLocation">Location</Label>
                                    <div className="relative">
                                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                      <Input
                                        id="jobLocation"
                                        placeholder="e.g. Amman, Jordan"
                                        className="pl-10"
                                        value={jobLocation}
                                        onChange={(e) => setJobLocation(e.target.value)}
                                        data-testid="input-job-location"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="jobType">Job Type</Label>
                                    <Select value={jobType} onValueChange={setJobType}>
                                      <SelectTrigger data-testid="select-job-type">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                        <SelectItem value="freelance">Freelance</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="jobSalary">Salary Range</Label>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                      <Input
                                        id="jobSalary"
                                        placeholder="e.g. 800-1200 JOD/month"
                                        className="pl-10"
                                        value={jobSalary}
                                        onChange={(e) => setJobSalary(e.target.value)}
                                        data-testid="input-job-salary"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="jobDeadline">Application Deadline</Label>
                                    <div className="relative">
                                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                      <Input
                                        id="jobDeadline"
                                        type="date"
                                        className="pl-10"
                                        value={jobDeadline}
                                        onChange={(e) => setJobDeadline(e.target.value)}
                                        data-testid="input-job-deadline"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="jobDescription">Job Description</Label>
                                  <Textarea
                                    id="jobDescription"
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                    className="min-h-[100px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    data-testid="textarea-job-description"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="jobRequirements">Requirements</Label>
                                  <Textarea
                                    id="jobRequirements"
                                    placeholder="List required qualifications, skills, and experience..."
                                    className="min-h-[100px]"
                                    value={jobRequirements}
                                    onChange={(e) => setJobRequirements(e.target.value)}
                                    data-testid="textarea-job-requirements"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="jobApplicationUrl">Application URL (optional)</Label>
                                  <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <Input
                                      id="jobApplicationUrl"
                                      type="url"
                                      placeholder="https://yourcompany.com/careers/apply"
                                      className="pl-10"
                                      value={jobApplicationUrl}
                                      onChange={(e) => setJobApplicationUrl(e.target.value)}
                                      data-testid="input-job-application-url"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">External link where candidates can apply</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <Button type="button" variant="outline" onClick={() => setJobDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={createJobMutation.isPending} data-testid="button-submit-job">
                                    {createJobMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Posting...
                                      </>
                                    ) : (
                                      <>
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Post Job
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </CardHeader>
                        <CardContent>
                          {jobsLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : userJobs.length === 0 ? (
                            <div className="py-8 text-center">
                              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-4 text-muted-foreground">No job listings yet. Post your first job opening.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userJobs.slice(0, 5).map((job) => (
                                <div key={job.id} className="flex items-center justify-between rounded-md border p-3" data-testid={`item-job-${job.id}`}>
                                  <div>
                                    <h4 className="font-medium line-clamp-1">{job.title}</h4>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                                      {job.location && <span>{job.location}</span>}
                                      {!job.isActive && (
                                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="saved">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5" />
                        Saved Items
                      </CardTitle>
                      <CardDescription>Items you've bookmarked for later</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {savedLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : !savedItems || savedItems.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">No saved items yet. Bookmark projects, research, or jobs to save them here.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {savedItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-md border p-3" data-testid={`item-saved-${item.id}`}>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">{item.targetType}</Badge>
                                <span className="text-sm text-muted-foreground">Item #{item.targetId.slice(0, 8)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Your posts, comments, and engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {postsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : userPosts.length === 0 ? (
                        <div className="py-12 text-center">
                          <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-muted-foreground">No recent activity. Start engaging with the community!</p>
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/feed">Go to Feed</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userPosts.slice(0, 10).map((post) => (
                            <div key={post.id} className="flex gap-4 rounded-md border p-4" data-testid={`item-post-${post.id}`}>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                                </div>
                                {post.title && <h4 className="mt-1 font-medium">{post.title}</h4>}
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    Likes
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Comments
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
