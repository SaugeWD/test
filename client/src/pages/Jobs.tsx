import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Briefcase, MapPin, Clock, DollarSign, Building, Filter, Loader2, Plus, Calendar, ExternalLink, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

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
              <Card key={job.id} className="hover-elevate" data-testid={`card-job-${job.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.type && (
                          <Link href={`/jobs?type=${job.type}`} onClick={(e) => e.stopPropagation()}>
                            <Badge className={`border-0 cursor-pointer hover:opacity-80 transition-opacity ${getTypeColor(job.type)}`}>
                              {job.type}
                            </Badge>
                          </Link>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </CardDescription>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatPostedDate(job.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Apply by {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                    {job.applicationUrl && (
                      <Button asChild>
                        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                          Apply Now
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
