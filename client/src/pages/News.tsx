import { useState } from "react";
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
import { Calendar, Search, Newspaper, MapPin, ArrowRight, Bell, Plus, Users, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { SocialInteractions } from "@/components/SocialInteractions";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const newsSubmitSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  excerpt: z.string().optional().default(""),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
});

type NewsSubmitFormValues = z.infer<typeof newsSubmitSchema>;

function NewsSubmitDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewsSubmitFormValues>({
    resolver: zodResolver(newsSubmitSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      excerpt: "",
      source: "",
      sourceUrl: "",
      image: "",
    },
  });

  const submitNewsMutation = useMutation({
    mutationFn: async (data: NewsSubmitFormValues) => {
      const response = await apiRequest("POST", "/api/news", {
        title: data.title,
        content: data.content,
        category: data.category,
        excerpt: data.excerpt || data.content.substring(0, 200),
        source: data.source || "ArchNet Community",
        sourceUrl: data.sourceUrl || undefined,
        image: data.image || "/placeholder.jpg",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setIsOpen(false);
      form.reset();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" data-testid="button-submit-news">
          <Plus className="mr-2 h-5 w-5" />
          Submit News
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Submit News or Event
          </DialogTitle>
          <DialogDescription>
            Share architecture news, awards, or events with the ArchNet community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-4">
          <div className="space-y-4">
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
              <Label htmlFor="source">Source (Optional)</Label>
              <Input
                id="source"
                placeholder="News source or organization"
                {...form.register("source")}
                data-testid="input-news-source"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Provide detailed content..."
                rows={5}
                {...form.register("content")}
                data-testid="textarea-news-content"
              />
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL (Optional)</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...form.register("image")}
                data-testid="input-news-image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-url">Source URL (Optional)</Label>
              <Input
                id="source-url"
                type="url"
                placeholder="https://example.com"
                {...form.register("sourceUrl")}
                data-testid="input-news-source-url"
              />
            </div>
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
              disabled={submitNewsMutation.isPending}
              className="flex-1"
              data-testid="button-confirm-submit"
            >
              {submitNewsMutation.isPending ? "Submitting..." : "Submit"}
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
  const { toast } = useToast();

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
                      className="group flex flex-col overflow-hidden hover-elevate" 
                      data-testid={`card-news-${item.id}`}
                    >
                      <Link href={`/news/${item.id}`}>
                        <div className="relative aspect-video overflow-hidden bg-secondary/30">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      </Link>
                      <CardHeader className="flex-grow">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline" data-testid={`badge-category-${item.id}`}>
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" data-testid={`badge-date-${item.id}`}>
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(item.date)}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-balance">
                          <Link 
                            href={`/news/${item.id}`} 
                            className="hover:text-accent transition-colors"
                            data-testid={`link-news-${item.id}`}
                          >
                            {item.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{item.excerpt}</CardDescription>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span data-testid={`text-author-${item.id}`}>by {item.author}</span>
                            <span className="font-medium" data-testid={`text-source-${item.id}`}>{item.source}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 mt-auto">
                        <div className="pt-4 border-t flex items-center justify-between">
                          <SocialInteractions
                            contentId={`news-${item.id}`}
                            contentType="news"
                            initialLikes={Math.floor(Math.random() * 100)}
                            initialComments={Math.floor(Math.random() * 20)}
                          />
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/news/${item.id}`} data-testid={`button-read-more-${item.id}`}>
                              Read More
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
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
    </div>
  );
}
