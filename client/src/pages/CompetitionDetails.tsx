import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SocialInteractions } from "@/components/SocialInteractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  DollarSign,
  ExternalLink,
  Trophy,
  Bookmark,
  Send,
  Upload,
  Users,
  Globe,
  Loader2,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Competition {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | string;
  prize: string | null;
  status: "ongoing" | "upcoming" | "closed";
  category: string | null;
  organizer: string | null;
  image: string | null;
  requirements: string | null;
  website: string | null;
}

function ApplyDialog({ competition }: { competition: Competition }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsOpen(false);

    toast({
      title: "Application submitted",
      description:
        "Your application has been submitted successfully. You'll receive updates via email and notifications.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto" size="lg" data-testid={`button-apply-${competition.id}`}>
          <Send className="mr-2 h-4 w-4" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Apply to Competition</DialogTitle>
          <DialogDescription>{competition.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                required
                data-testid="input-apply-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                data-testid="input-apply-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization / University</Label>
              <Input
                id="organization"
                placeholder="Enter your organization"
                required
                data-testid="input-apply-organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team Members (Optional)</Label>
              <Textarea
                id="team"
                placeholder="List team member names and roles"
                rows={3}
                data-testid="input-apply-team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statement">Design Statement</Label>
              <Textarea
                id="statement"
                placeholder="Briefly describe your design approach and concept"
                rows={5}
                required
                data-testid="input-apply-statement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Upload Portfolio / Previous Work</Label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  data-testid="button-upload-files"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              data-testid="button-apply-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-apply-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompetitionDetailsSkeleton() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function CompetitionNotFound() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Competition Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The competition you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/competitions" data-testid="link-back-to-competitions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Competitions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default function CompetitionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: competition, isLoading, error } = useQuery<Competition>({
    queryKey: ["/api/competitions", id],
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/saved", {
        targetType: "competition",
        targetId: id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: data.saved ? "Saved to your library" : "Removed from saved",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save. Please log in and try again.",
      });
    },
  });

  if (isLoading) {
    return <CompetitionDetailsSkeleton />;
  }

  if (error || !competition) {
    return <CompetitionNotFound />;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ongoing":
        return "default";
      case "upcoming":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/competitions"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Competitions
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {competition.image ? (
                <img
                  src={competition.image}
                  alt={competition.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Trophy className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <div className="absolute right-4 top-4">
                <Badge variant={getStatusBadgeVariant(competition.status)} className="text-sm">
                  {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {competition.category && (
                  <Badge variant="outline">{competition.category}</Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold" data-testid="heading-competition-title">
                {competition.title}
              </h1>

              {competition.organizer && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-5 w-5" />
                  <span className="text-lg">Organized by {competition.organizer}</span>
                </div>
              )}

              {competition.description && (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {competition.description}
                  </p>
                </div>
              )}

              {competition.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {competition.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="pt-4 border-t">
                <SocialInteractions
                  contentId={competition.id}
                  contentType="competition"
                  className="justify-start"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Competition Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">
                        {competition.status === "closed" ? "Ended" : "Deadline"}
                      </span>
                      <p className="font-medium">
                        {new Date(competition.deadline).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {competition.prize && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Prize</span>
                        <p className="font-semibold text-accent">{competition.prize}</p>
                      </div>
                    </div>
                  )}

                  {competition.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Website</span>
                        <p>
                          <a
                            href={competition.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1 truncate"
                            data-testid="link-website"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  {competition.status === "ongoing" && (
                    <ApplyDialog competition={competition} />
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-competition"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className="mr-2 h-4 w-4" />
                    )}
                    Save Competition
                  </Button>

                  {competition.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={competition.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-external-website"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Official Website
                      </a>
                    </Button>
                  )}
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
