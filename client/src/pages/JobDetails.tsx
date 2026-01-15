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
import { 
  ArrowLeft, Loader2, Briefcase, MapPin, Clock, DollarSign, 
  Building2, Calendar, ExternalLink, Share2, Bookmark, 
  CheckCircle, Globe, Mail, Phone, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { Job, User as UserType } from "@shared/schema";

interface JobWithPoster extends Job {
  postedBy?: UserType;
}

export default function JobDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const isDeadlinePassed = job?.deadline ? new Date(job.deadline) < new Date() : false;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">This job listing may have been removed or expired.</p>
          <Button asChild>
            <Link href="/jobs">Browse All Jobs</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>

          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                {job.type && (
                  <Badge className={`border-0 ${getTypeColor(job.type)}`}>
                    {job.type}
                  </Badge>
                )}
                {isDeadlinePassed && (
                  <Badge variant="destructive">Deadline Passed</Badge>
                )}
                {job.isActive === false && (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>

              <div className="flex items-center gap-4 text-lg text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  <span className="font-medium">{job.company}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>{job.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {job.salary && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <span>{job.salary}</span>
                  </div>
                )}
                {job.deadline && (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md",
                    isDeadlinePassed ? "bg-destructive/10 text-destructive" : "bg-secondary/50"
                  )}>
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>Apply by {formatDate(job.deadline)}</span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-job"
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  data-testid="button-share-job"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {job.applicationUrl && !isDeadlinePassed && job.isActive !== false && (
                <Button size="lg" asChild className="w-full lg:w-auto" data-testid="button-apply-now">
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apply Now
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {job.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-accent" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {job.description.split('\n').map((paragraph, i) => (
                        <p key={i} className="text-muted-foreground leading-relaxed mb-3">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {job.requirements.split('\n').map((req, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <p className="text-muted-foreground">{req}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {(poster || job.postedById) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Posted By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/profile/${poster?.username || ""}`}>
                      <div className="flex items-center gap-3 hover-elevate p-2 -m-2 rounded-lg cursor-pointer">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={poster?.avatar || ""} />
                          <AvatarFallback>
                            {poster?.name?.[0] || job.company[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{poster?.name || job.company}</span>
                            {poster?.isVerified && <VerificationBadge size="sm" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {poster?.role === "firm" ? "Architecture Firm" : poster?.title || "Company"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-accent" />
                    Job Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <Separator />
                  {job.location && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {job.type && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Job Type</span>
                        <Badge className={`border-0 ${getTypeColor(job.type)}`} variant="secondary">
                          {job.type}
                        </Badge>
                      </div>
                      <Separator />
                    </>
                  )}
                  {job.salary && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Salary</span>
                        <span className="font-medium text-accent">{job.salary}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {job.deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className={cn(
                        "font-medium",
                        isDeadlinePassed && "text-destructive"
                      )}>
                        {formatDate(job.deadline)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {job.applicationUrl && !isDeadlinePassed && job.isActive !== false && (
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="font-semibold">Ready to Apply?</h3>
                      <p className="text-sm text-muted-foreground">
                        Don't miss this opportunity. Apply now before the deadline!
                      </p>
                      <Button className="w-full" asChild data-testid="button-apply-cta">
                        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apply for This Position
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
