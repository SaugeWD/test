import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SocialInteractions } from "@/components/SocialInteractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  Trophy,
  Award,
  Bookmark,
  Bell,
  Send,
  Upload,
  Users,
  Globe,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
        <Button className="w-full" data-testid={`button-apply-${competition.id}`}>
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


function ReminderButton({ competitionId }: { competitionId: string }) {
  const [hasReminder, setHasReminder] = useState(false);
  const { toast } = useToast();

  const handleToggleReminder = () => {
    setHasReminder(!hasReminder);
    toast({
      description: hasReminder
        ? "Reminder removed"
        : "You'll be notified when this competition opens",
    });
  };

  return (
    <Button
      className="w-full"
      variant={hasReminder ? "secondary" : "default"}
      onClick={handleToggleReminder}
      data-testid={`button-reminder-${competitionId}`}
    >
      <Bell className={`mr-2 h-4 w-4 ${hasReminder ? "fill-current" : ""}`} />
      {hasReminder ? "Reminder Set" : "Set Reminder"}
    </Button>
  );
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: savedItems = [] } = useQuery<Array<{ targetType: string; targetId: string }>>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isSaved = savedItems.some(
    (item) => item.targetType === "competition" && item.targetId === competition.id
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved", { 
        targetType: "competition", 
        targetId: competition.id 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        description: isSaved ? "Removed from saved" : "Saved to your library",
      });
    },
  });

  const toggleSaved = () => {
    if (!isAuthenticated) {
      toast({ description: "Please sign in to save competitions" });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card className="group flex flex-col overflow-hidden hover-elevate" data-testid={`card-competition-${competition.id}`}>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {competition.image ? (
          <img
            src={competition.image}
            alt={competition.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Badge
            variant={
              competition.status === "ongoing"
                ? "default"
                : competition.status === "upcoming"
                  ? "secondary"
                  : "outline"
            }
          >
            {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
          </Badge>
        </div>
      </div>

      <CardHeader className="flex-grow">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          {competition.category && <Badge variant="outline">{competition.category}</Badge>}
        </div>
        <CardTitle className="text-xl text-balance line-clamp-2">{competition.title}</CardTitle>
        <CardDescription className="line-clamp-2">{competition.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>
              {competition.status === "closed" ? "Ended" : "Deadline"}:{" "}
              {new Date(competition.deadline).toLocaleDateString()}
            </span>
          </div>
          {competition.prize && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="font-semibold text-accent">{competition.prize}</span>
            </div>
          )}
          {competition.organizer && (
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{competition.organizer}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {competition.status === "ongoing" && (
            <>
              <ApplyDialog competition={competition} />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={toggleSaved}
                  className={isSaved ? "bg-accent/10 text-accent" : ""}
                  data-testid={`button-save-comp-${competition.id}`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/competitions/${competition.id}`} data-testid={`link-details-${competition.id}`}>
                    Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}

          {competition.status === "upcoming" && (
            <>
              <ReminderButton competitionId={competition.id} />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={toggleSaved}
                  className={isSaved ? "bg-accent/10 text-accent" : ""}
                  data-testid={`button-save-comp-${competition.id}`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/competitions/${competition.id}`} data-testid={`link-details-${competition.id}`}>
                    Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}

          {competition.status === "closed" && (
            <Button
              variant="outline"
              onClick={toggleSaved}
              className={`w-full ${isSaved ? "bg-accent/10 text-accent" : ""}`}
              data-testid={`button-save-comp-${competition.id}`}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}

          <div className="pt-2 border-t">
            <SocialInteractions
              contentId={competition.id}
              contentType="competition"
              className="justify-end"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitionSkeletonCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="flex-grow">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompetitionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("ongoing");

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["/api/competitions"],
  });

  const categories = ["all", ...Array.from(new Set(competitions.map((c) => c.category).filter((cat): cat is string => !!cat)))];

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch =
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = selectedCategory === "all" || comp.category === selectedCategory;
    const matchesStatus = comp.status === activeTab;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCounts = () => {
    return {
      ongoing: competitions.filter((c) => c.status === "ongoing").length,
      upcoming: competitions.filter((c) => c.status === "upcoming").length,
      closed: competitions.filter((c) => c.status === "closed").length,
    };
  };

  const counts = getCounts();

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 px-4 py-2">
              <Trophy className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Architectural Competitions</span>
            </div>
            <h1 className="font-serif text-4xl font-bold md:text-5xl text-balance" data-testid="heading-competitions">
              Architectural Competitions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Discover local and international architecture competitions with deadlines, requirements, and rewards.
              Showcase your talent and win recognition.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-background py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search competitions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-competitions"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3" data-testid="tabs-competition-status">
              <TabsTrigger value="ongoing" data-testid="tab-ongoing">
                Ongoing ({counts.ongoing})
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                Upcoming ({counts.upcoming})
              </TabsTrigger>
              <TabsTrigger value="closed" data-testid="tab-closed">
                Closed ({counts.closed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <CompetitionSkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredCompetitions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No competitions found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCompetitions.map((competition) => (
                    <CompetitionCard key={competition.id} competition={competition} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
