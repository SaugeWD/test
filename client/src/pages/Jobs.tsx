import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Briefcase, MapPin, Clock, DollarSign, Building, Filter, Loader2, Plus, Calendar, ExternalLink, Building2, Share2, Bookmark, MoreHorizontal, Pencil, Trash2, Send, User, Mail, Phone, Link as LinkIcon, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Job, JobApplication } from "@shared/schema";

export default function JobsPage() {
  const searchQuery = useSearch();
  const params = new URLSearchParams(searchQuery);
  const urlType = params.get("type");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(urlType || "all");
  
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
  
  useEffect(() => {
    if (urlType) setTypeFilter(urlType);
  }, [urlType]);

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

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

  const filteredJobs = (jobs || []).filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatPostedDate = (date: Date | string | null) => {
    if (!date) return "Recently";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "full-time":
        return "bg-green-500 text-white";
      case "part-time":
        return "bg-blue-500 text-white";
      case "internship":
        return "bg-purple-500 text-white";
      case "freelance":
        return "bg-orange-500 text-white";
      case "contract":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-8 w-8 text-accent" />
                <h1 className="font-serif text-4xl font-bold">Jobs & Opportunities</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Find architecture jobs, internships, and career opportunities in Jordan and beyond.
              </p>
            </div>
            {user?.role === "firm" && (
              <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-post-job-page">
                    <Plus className="mr-2 h-5 w-5" />
                    Post a Job
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
                        <Label htmlFor="jobTypeSelect">Job Type</Label>
                        <Select value={jobType} onValueChange={setJobType}>
                          <SelectTrigger data-testid="select-new-job-type">
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
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search jobs by title, company..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-jobs"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-job-type-filter">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
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
                <p className="text-muted-foreground">Failed to load jobs. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && filteredJobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                user={user}
                toast={toast}
                getTypeColor={getTypeColor}
                formatPostedDate={formatPostedDate}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface JobCardProps {
  job: Job;
  user: any;
  toast: any;
  getTypeColor: (type: string | null) => string;
  formatPostedDate: (date: Date | string | null) => string;
}

function JobCard({ job, user, toast, getTypeColor, formatPostedDate }: JobCardProps) {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [useArchNetProfile, setUseArchNetProfile] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAuthenticated = !!user;
  const isOwner = user?.id === job.postedById;
  const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false;

  const { data: applicationStatus } = useQuery<{ hasApplied: boolean; application: JobApplication | null }>({
    queryKey: ["/api/jobs", job.id, "application"],
    enabled: isAuthenticated,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const hasApplied = applicationStatus?.hasApplied || false;
  const isSaved = savedItems.some((item) => item.targetType === "job" && item.targetId === job.id);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", {
        targetType: "job",
        targetId: job.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({ description: isSaved ? "Removed from saved" : "Job saved" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: {
      coverLetter: string;
      useArchNetProfile: boolean;
      email?: string;
      phone?: string;
      portfolioUrl?: string;
      resumeUrl?: string;
    }) => {
      const res = await apiRequest("POST", `/api/jobs/${job.id}/apply`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", job.id, "application"] });
      toast({ title: "Application Submitted!", description: "Your application has been sent." });
      setApplyDialogOpen(false);
      resetApplyForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to submit", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/jobs/${job.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ description: "Job deleted successfully" });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const resetApplyForm = () => {
    setCoverLetter("");
    setCustomEmail("");
    setCustomPhone("");
    setPortfolioUrl("");
    setResumeUrl("");
    setUseArchNetProfile(true);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      coverLetter: coverLetter.trim(),
      useArchNetProfile,
      email: useArchNetProfile ? undefined : customEmail.trim() || undefined,
      phone: useArchNetProfile ? undefined : customPhone.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    }
  };

  const canApply = !isDeadlinePassed && job.isActive !== false && isAuthenticated && !hasApplied && !isOwner;

  return (
    <Card className="hover-elevate" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {job.type && (
              <Link href={`/jobs?type=${job.type}`} onClick={(e) => e.stopPropagation()}>
                <Badge variant="outline" className="cursor-pointer hover:opacity-80 transition-opacity">
                  {job.type}
                </Badge>
              </Link>
            )}
            {hasApplied && (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                Applied
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {job.salary && (
              <div className="text-right">
                <p className="text-accent font-medium">{job.salary}</p>
              </div>
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-job-menu-${job.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Building className="h-4 w-4" />
              {job.company}
            </div>
            {job.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatPostedDate(job.createdAt)}
            </div>
          </div>
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        )}

        {job.requirements && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {job.requirements.split('\n').slice(0, 3).filter(r => r.trim()).map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-1.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.deadline && isDeadlinePassed && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <Clock className="h-4 w-4" />
            Deadline passed
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {canApply && (
            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid={`button-apply-${job.id}`}>
                  <Send className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="h-5 w-5 text-accent" />
                    Apply for {job.title}
                  </DialogTitle>
                  <DialogDescription>at {job.company}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleApply} className="space-y-6 mt-4">
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">Use ArchNet Profile</p>
                          <p className="text-sm text-muted-foreground">Share your profile info automatically</p>
                        </div>
                      </div>
                      <Switch checked={useArchNetProfile} onCheckedChange={setUseArchNetProfile} />
                    </div>

                    {useArchNetProfile && user && (
                      <div className="border rounded-lg p-4 bg-background space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar || ""} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.title || user.role}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!useArchNetProfile && (
                      <div className="space-y-4 border rounded-lg p-4 bg-background">
                        <div className="space-y-2">
                          <Label htmlFor={`email-${job.id}`}>Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id={`email-${job.id}`}
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={customEmail}
                              onChange={(e) => setCustomEmail(e.target.value)}
                              required={!useArchNetProfile}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${job.id}`}>Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id={`phone-${job.id}`}
                              type="tel"
                              placeholder="+962 7XX XXX XXX"
                              className="pl-10"
                              value={customPhone}
                              onChange={(e) => setCustomPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cover-${job.id}`}>Cover Letter / Message</Label>
                    <Textarea
                      id={`cover-${job.id}`}
                      placeholder="Tell the employer why you're a great fit..."
                      className="min-h-[100px]"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Additional Links (Optional)</Label>
                    <div className="space-y-2">
                      <Label htmlFor={`portfolio-${job.id}`} className="text-sm">Portfolio URL</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          id={`portfolio-${job.id}`}
                          type="url"
                          placeholder="https://yourportfolio.com"
                          className="pl-10"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`resume-${job.id}`} className="text-sm">Resume / CV URL</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          id={`resume-${job.id}`}
                          type="url"
                          placeholder="https://drive.google.com/your-cv"
                          className="pl-10"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setApplyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={applyMutation.isPending}>
                      {applyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {hasApplied && (
            <Button variant="secondary" disabled>
              Applied
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href={`/jobs/${job.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{job.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
