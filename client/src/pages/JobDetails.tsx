import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Loader2, Briefcase, MapPin, Clock, DollarSign, 
  Building2, Calendar, ExternalLink, Share2, Bookmark, 
  CheckCircle, Target, Award, GraduationCap, Timer, Send,
  User, Mail, Phone, Link as LinkIcon, FileText, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { Job, User as UserType, JobApplication } from "@shared/schema";

interface JobWithPoster extends Job {
  postedBy?: UserType;
}

export default function JobDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [useArchNetProfile, setUseArchNetProfile] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const { data: job, isLoading } = useQuery<JobWithPoster>({
    queryKey: ["/api/jobs", id],
  });

  const { data: poster } = useQuery<UserType>({
    queryKey: ["/api/users", job?.postedById],
    enabled: !!job?.postedById,
  });

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const { data: applicationStatus } = useQuery<{ hasApplied: boolean; application: JobApplication | null }>({
    queryKey: ["/api/jobs", id, "application"],
    enabled: isAuthenticated && !!id,
  });

  const hasApplied = applicationStatus?.hasApplied || false;

  const isSaved = savedItems.some(
    (item) => item.targetType === "job" && item.targetId === id
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/saved", {
        targetType: "job",
        targetId: id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: isSaved ? "Removed from saved" : "Job saved to library",
      });
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
      const res = await apiRequest("POST", `/api/jobs/${id}/apply`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", id, "application"] });
      toast({ 
        title: "Application Submitted!",
        description: "Your application has been sent to the employer." 
      });
      setApplyDialogOpen(false);
      resetApplyForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit application",
        description: error.message || "Please try again.",
        variant: "destructive" 
      });
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
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `${job?.title} at ${job?.company}`,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRelativeTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  const getDaysUntilDeadline = (deadline: Date | string | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    return diffDays;
  };

  const getTypeConfig = (type: string | null) => {
    switch (type) {
      case "full-time":
        return { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", label: "Full-time", icon: Briefcase };
      case "part-time":
        return { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", label: "Part-time", icon: Timer };
      case "internship":
        return { color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: "Internship", icon: GraduationCap };
      case "freelance":
        return { color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", label: "Freelance", icon: Target };
      case "contract":
        return { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", label: "Contract", icon: Award };
      default:
        return { color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20", label: type || "Job", icon: Briefcase };
    }
  };

  const isDeadlinePassed = job?.deadline ? new Date(job.deadline) < new Date() : false;
  const daysUntilDeadline = job?.deadline ? getDaysUntilDeadline(job.deadline) : null;
  const typeConfig = getTypeConfig(job?.type || null);
  const TypeIcon = typeConfig.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Job Not Found</h1>
            <p className="text-muted-foreground">This job listing may have been removed or expired.</p>
            <Button asChild size="lg">
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canApply = !isDeadlinePassed && job.isActive !== false && isAuthenticated && !hasApplied;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>

      <section className="bg-gradient-to-b from-secondary/50 to-background py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                  <Building2 className="h-10 w-10 md:h-12 md:w-12 text-accent" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("border", typeConfig.color)}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                  {isDeadlinePassed && (
                    <Badge variant="destructive">Deadline Passed</Badge>
                  )}
                  {job.isActive === false && (
                    <Badge variant="secondary">Position Closed</Badge>
                  )}
                  {daysUntilDeadline && daysUntilDeadline > 0 && daysUntilDeadline <= 7 && (
                    <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {daysUntilDeadline} days left
                    </Badge>
                  )}
                  {hasApplied && (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>

                <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">{job.title}</h1>

                <div className="flex items-center gap-2 text-lg">
                  <span className="font-semibold text-foreground">{job.company}</span>
                  {job.location && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {job.salary && (
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{job.salary}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      isDeadlinePassed 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-secondary text-muted-foreground"
                    )}>
                      <Calendar className="h-4 w-4" />
                      <span>Apply by {formatDate(job.deadline)}</span>
                    </div>
                  )}
                  {job.createdAt && (
                    <div className="flex items-center gap-2 bg-secondary text-muted-foreground px-4 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      <span>Posted {getRelativeTime(job.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col gap-2 md:items-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="shrink-0"
                  data-testid="button-save-job"
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-current text-accent")} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="shrink-0"
                  data-testid="button-share-job"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {canApply && (
                <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="flex-1 sm:flex-none" data-testid="button-apply-now">
                      <Send className="mr-2 h-5 w-5" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Briefcase className="h-5 w-5 text-accent" />
                        Apply for {job.title}
                      </DialogTitle>
                      <DialogDescription>
                        at {job.company}
                      </DialogDescription>
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
                              <p className="text-sm text-muted-foreground">
                                Share your profile info automatically
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={useArchNetProfile}
                            onCheckedChange={setUseArchNetProfile}
                            data-testid="switch-use-profile"
                          />
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
                              {user.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  {user.location}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!useArchNetProfile && (
                          <div className="space-y-4 border rounded-lg p-4 bg-background">
                            <div className="space-y-2">
                              <Label htmlFor="customEmail">Email Address *</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                  id="customEmail"
                                  type="email"
                                  placeholder="your@email.com"
                                  className="pl-10"
                                  value={customEmail}
                                  onChange={(e) => setCustomEmail(e.target.value)}
                                  required={!useArchNetProfile}
                                  data-testid="input-custom-email"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customPhone">Phone Number</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                  id="customPhone"
                                  type="tel"
                                  placeholder="+962 7XX XXX XXX"
                                  className="pl-10"
                                  value={customPhone}
                                  onChange={(e) => setCustomPhone(e.target.value)}
                                  data-testid="input-custom-phone"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">
                          Cover Letter / Message
                        </Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Tell the employer why you're a great fit for this position, your relevant experience, and what excites you about this opportunity..."
                          className="min-h-[120px]"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          data-testid="textarea-cover-letter"
                        />
                        <p className="text-xs text-muted-foreground">
                          A thoughtful message can make your application stand out
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-medium">Additional Links (Optional)</Label>
                        
                        <div className="space-y-2">
                          <Label htmlFor="portfolioUrl" className="text-sm">Portfolio URL</Label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id="portfolioUrl"
                              type="url"
                              placeholder="https://yourportfolio.com"
                              className="pl-10"
                              value={portfolioUrl}
                              onChange={(e) => setPortfolioUrl(e.target.value)}
                              data-testid="input-portfolio-url"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resumeUrl" className="text-sm">Resume / CV URL</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              id="resumeUrl"
                              type="url"
                              placeholder="https://drive.google.com/your-cv"
                              className="pl-10"
                              value={resumeUrl}
                              onChange={(e) => setResumeUrl(e.target.value)}
                              data-testid="input-resume-url"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Link to your CV on Google Drive, Dropbox, or any other cloud storage
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setApplyDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={applyMutation.isPending} data-testid="button-submit-application">
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
                <Button size="lg" variant="secondary" disabled className="flex-1 sm:flex-none">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Application Submitted
                </Button>
              )}

              {job.applicationUrl && !hasApplied && (
                <Button size="lg" variant="outline" asChild className="flex-1 sm:flex-none">
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Apply on Company Site
                  </a>
                </Button>
              )}

              {!isAuthenticated && !isDeadlinePassed && job.isActive !== false && (
                <Button size="lg" asChild className="flex-1 sm:flex-none">
                  <Link href="/login">
                    <Send className="mr-2 h-5 w-5" />
                    Login to Apply
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {job.description && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-accent" />
                        </div>
                        About This Role
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {job.description.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                          <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {job.requirements && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-accent" />
                        </div>
                        Requirements & Qualifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {job.requirements.split('\n').filter(r => r.trim()).map((req, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="h-3.5 w-3.5 text-accent" />
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {!job.description && !job.requirements && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No additional details provided for this position.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Job Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <div className="py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Company</p>
                        <p className="font-medium">{job.company}</p>
                      </div>
                    </div>
                    <Separator />

                    {job.location && (
                      <>
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                            <p className="font-medium">{job.location}</p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {job.type && (
                      <>
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Employment Type</p>
                            <p className="font-medium capitalize">{job.type.replace("-", " ")}</p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {job.salary && (
                      <>
                        <div className="py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Salary Range</p>
                            <p className="font-medium text-green-600 dark:text-green-400">{job.salary}</p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {job.deadline && (
                      <div className="py-3 flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          isDeadlinePassed ? "bg-destructive/10" : "bg-secondary"
                        )}>
                          <Calendar className={cn(
                            "h-5 w-5",
                            isDeadlinePassed ? "text-destructive" : "text-accent"
                          )} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Application Deadline</p>
                          <p className={cn("font-medium", isDeadlinePassed && "text-destructive")}>
                            {formatDate(job.deadline)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(poster || job.postedById) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">Posted By</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/profile/${poster?.username || ""}`}>
                        <div className="flex items-center gap-4 p-3 -m-3 rounded-xl hover-elevate cursor-pointer">
                          <Avatar className="h-14 w-14 border-2 border-accent/20">
                            <AvatarImage src={poster?.avatar || ""} />
                            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                              {poster?.name?.[0] || job.company[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">{poster?.name || job.company}</span>
                              {poster?.isVerified && <VerificationBadge size="sm" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {poster?.role === "firm" ? "Architecture Firm" : poster?.title || "Company"}
                            </p>
                            {poster?.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {poster.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {canApply && (
                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                          <Briefcase className="h-7 w-7 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Ready to Apply?</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Take the next step in your architecture career
                          </p>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setApplyDialogOpen(true)} data-testid="button-apply-cta">
                          <Send className="mr-2 h-4 w-4" />
                          Apply for This Position
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
