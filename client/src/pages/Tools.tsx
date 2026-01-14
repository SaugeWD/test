import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Wrench, 
  ExternalLink, 
  Monitor,
  GraduationCap,
  Clock,
  Star,
  User,
  Wind,
  Sun,
  Mountain,
  BarChart3,
  Puzzle,
  Code2,
  Bookmark,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface APITool {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  history: string | null;
  usageInArchitecture: string | null;
  category: string | null;
  type: string | null;
  image: string | null;
  website: string | null;
  isPaid: boolean;
  pricing: string | null;
  createdAt: string | null;
}

interface APICourse {
  id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  platform: string | null;
  duration: string | null;
  level: string | null;
  category: string | null;
  image: string | null;
  website: string | null;
  isPaid: boolean;
  price: string | null;
  rating: string | null;
  createdAt: string | null;
}

interface APIPlugin {
  id: string;
  name: string;
  description: string | null;
  software: string;
  category: string | null;
  developer: string | null;
  website: string | null;
  isPaid: boolean;
  price: string | null;
  createdAt: string | null;
}

interface SavedItem {
  targetType: string;
  targetId: string;
}

function useSaveItem(targetType: string, targetId: string) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: savedItems = [] } = useQuery<SavedItem[]>({
    queryKey: ["/api/saved"],
    enabled: isAuthenticated,
  });

  const isSaved = savedItems.some(
    (item) => item.targetType === targetType && item.targetId === targetId
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved", { targetType, targetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({ description: isSaved ? "Removed from saved" : "Saved successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Please log in to save items" });
    },
  });

  return { isSaved, saveMutation, isAuthenticated };
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-16 mt-2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function SoftwareCard({ tool }: { tool: APITool }) {
  const { isSaved, saveMutation } = useSaveItem("tool", tool.id);

  return (
    <Card className="hover-elevate flex flex-col h-full" data-testid={`card-software-${tool.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-lg bg-accent/10 p-2">
              <Monitor className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              {tool.category && (
                <Badge variant="outline" className="text-xs mt-1 capitalize">
                  {tool.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
          {tool.description || "No description available"}
        </p>
        {tool.purpose && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            <span className="font-medium text-foreground">Purpose:</span> {tool.purpose}
          </p>
        )}
        <div className="mt-auto pt-3">
          <span className={`text-lg font-bold ${!tool.isPaid ? "text-green-600 dark:text-green-400" : ""}`}>
            {tool.pricing || (tool.isPaid ? "Paid" : "Free")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {tool.website ? (
          <Button className="flex-1" asChild data-testid={`button-visit-${tool.id}`}>
            <a href={tool.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            No Link
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={isSaved ? "text-accent" : ""}
          data-testid={`button-save-software-${tool.id}`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AnalysisToolCard({ tool }: { tool: APITool }) {
  const { isSaved, saveMutation } = useSaveItem("tool", tool.id);

  const getIcon = () => {
    switch (tool.category) {
      case "wind": return <Wind className="h-5 w-5 text-cyan-500" />;
      case "solar": return <Sun className="h-5 w-5 text-yellow-500" />;
      case "topography": return <Mountain className="h-5 w-5 text-green-600" />;
      case "environmental": return <BarChart3 className="h-5 w-5 text-emerald-500" />;
      case "climate": return <Wind className="h-5 w-5 text-blue-500" />;
      case "energy": return <BarChart3 className="h-5 w-5 text-orange-500" />;
      case "site-analysis": return <Mountain className="h-5 w-5 text-violet-500" />;
      default: return <BarChart3 className="h-5 w-5 text-accent" />;
    }
  };

  const getIconBg = () => {
    switch (tool.category) {
      case "wind": return "bg-cyan-500/10";
      case "solar": return "bg-yellow-500/10";
      case "topography": return "bg-green-600/10";
      case "environmental": return "bg-emerald-500/10";
      case "climate": return "bg-blue-500/10";
      case "energy": return "bg-orange-500/10";
      case "site-analysis": return "bg-violet-500/10";
      default: return "bg-accent/10";
    }
  };

  return (
    <Card className="hover-elevate flex flex-col h-full" data-testid={`card-tool-${tool.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className={`rounded-lg p-2 ${getIconBg()}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              {tool.category && (
                <Badge variant="outline" className="text-xs mt-1 capitalize">
                  {tool.category.replace("-", " ")}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
          {tool.description || "No description available"}
        </p>
        {tool.purpose && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            <span className="font-medium text-foreground">Use for:</span> {tool.purpose}
          </p>
        )}
        <div className="mt-auto pt-3">
          <span className={`text-lg font-bold ${!tool.isPaid ? "text-green-600 dark:text-green-400" : ""}`}>
            {tool.pricing || (tool.isPaid ? "Paid" : "Free")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {tool.website ? (
          <Button className="flex-1" asChild data-testid={`button-visit-tool-${tool.id}`}>
            <a href={tool.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Learn More
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            No Link
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={isSaved ? "text-accent" : ""}
          data-testid={`button-save-tool-${tool.id}`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PluginCard({ plugin }: { plugin: APIPlugin }) {
  const { isSaved, saveMutation } = useSaveItem("plugin", plugin.id);

  const getSoftwareColor = () => {
    switch (plugin.software) {
      case "Revit": return "bg-blue-500/10 text-blue-500";
      case "AutoCAD": return "bg-red-500/10 text-red-500";
      case "Rhino": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "SketchUp": return "bg-orange-500/10 text-orange-500";
      case "ArchiCAD": return "bg-cyan-500/10 text-cyan-500";
      default: return "bg-accent/10 text-accent";
    }
  };

  return (
    <Card className="hover-elevate flex flex-col h-full" data-testid={`card-plugin-${plugin.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className={`rounded-lg p-2 ${getSoftwareColor().split(" ")[0]}`}>
              <Puzzle className={`h-5 w-5 ${getSoftwareColor().split(" ").slice(1).join(" ")}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{plugin.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="text-xs">{plugin.software}</Badge>
                {plugin.category && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {plugin.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
          {plugin.description || "No description available"}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Code2 className="h-4 w-4" />
          <span>{plugin.developer || "Unknown"}</span>
        </div>
        <div className="mt-auto pt-3">
          <span className={`text-lg font-bold ${!plugin.isPaid ? "text-green-600 dark:text-green-400" : ""}`}>
            {plugin.isPaid ? plugin.price : "Free"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {plugin.website ? (
          <Button className="flex-1" asChild data-testid={`button-get-plugin-${plugin.id}`}>
            <a href={plugin.website} target="_blank" rel="noopener noreferrer">
              <Puzzle className="h-4 w-4 mr-2" />
              Get Plugin
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            No Link
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={isSaved ? "text-accent" : ""}
          data-testid={`button-save-plugin-${plugin.id}`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CourseCard({ course }: { course: APICourse }) {
  const { isSaved, saveMutation } = useSaveItem("course", course.id);

  return (
    <Card className="hover-elevate flex flex-col h-full" data-testid={`card-course-${course.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {course.platform && (
                  <Badge variant="secondary" className="text-xs">
                    {course.platform}
                  </Badge>
                )}
                {course.level && (
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
          {course.description || "No description available"}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3 flex-wrap">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{course.instructor || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{course.rating || "-"}</span>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <span className={`text-lg font-bold ${!course.isPaid ? "text-green-600 dark:text-green-400" : ""}`}>
            {course.isPaid ? course.price : "Free"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        {course.website ? (
          <Button className="flex-1" asChild data-testid={`button-enroll-${course.id}`}>
            <a href={course.website} target="_blank" rel="noopener noreferrer">
              <GraduationCap className="h-4 w-4 mr-2" />
              Start
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            Coming Soon
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={isSaved ? "text-accent" : ""}
          data-testid={`button-save-course-${course.id}`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Tools() {
  const [activeTab, setActiveTab] = useState("software");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [softwareFilter, setSoftwareFilter] = useState("all");

  const { data: allTools = [], isLoading: isToolsLoading } = useQuery<APITool[]>({
    queryKey: ["/api/tools"],
  });

  const { data: courses = [], isLoading: isCoursesLoading } = useQuery<APICourse[]>({
    queryKey: ["/api/courses"],
  });

  const { data: plugins = [], isLoading: isPluginsLoading } = useQuery<APIPlugin[]>({
    queryKey: ["/api/plugins"],
  });

  const software = allTools.filter(t => t.type === "software" || !t.type);
  const analysisTools = allTools.filter(t => t.type === "tool");

  const softwareCategories = Array.from(new Set(software.map(t => t.category).filter((c): c is string => c !== null)));
  const analysisCategories = Array.from(new Set(analysisTools.map(t => t.category).filter((c): c is string => c !== null)));
  const courseCategories = Array.from(new Set(courses.map(c => c.category).filter((c): c is string => c !== null)));
  const pluginSoftwares = Array.from(new Set(plugins.map(p => p.software).filter((s): s is string => s !== null)));
  const pluginCategories = Array.from(new Set(plugins.map(p => p.category).filter((c): c is string => c !== null)));

  const getCategories = () => {
    switch (activeTab) {
      case "software": return softwareCategories;
      case "analysis": return analysisCategories;
      case "courses": return courseCategories;
      case "plugins": return pluginCategories;
      default: return [];
    }
  };

  const filteredSoftware = software.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
      (tool.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAnalysisTools = analysisTools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
      (tool.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch = plugin.name.toLowerCase().includes(search.toLowerCase()) ||
      (plugin.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesSoftware = softwareFilter === "all" || plugin.software === softwareFilter;
    const matchesCategory = categoryFilter === "all" || plugin.category === categoryFilter;
    return matchesSearch && matchesSoftware && matchesCategory;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCategoryFilter("all");
    setSoftwareFilter("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="py-12 bg-gradient-to-br from-accent/5 to-background border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <Wrench className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-4xl font-bold" data-testid="text-tools-title">
                Architectural Resources
              </h1>
            </div>
            <p className="text-lg text-muted-foreground" data-testid="text-tools-description">
              Explore professional software, plugins, analysis tools, and educational courses for architects.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <TabsList className="grid w-full md:w-auto grid-cols-4">
                <TabsTrigger value="software" className="gap-2" data-testid="tab-software">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Software</span>
                </TabsTrigger>
                <TabsTrigger value="plugins" className="gap-2" data-testid="tab-plugins">
                  <Puzzle className="h-4 w-4" />
                  <span className="hidden sm:inline">Plugins</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2" data-testid="tab-analysis">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="gap-2" data-testid="tab-courses">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Courses</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search"
                  />
                </div>

                {activeTab === "plugins" && (
                  <Select value={softwareFilter} onValueChange={setSoftwareFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="select-software">
                      <SelectValue placeholder="Software" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Software</SelectItem>
                      {pluginSoftwares.map((sw) => (
                        <SelectItem key={sw} value={sw}>
                          {sw}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="software" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {isToolsLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : filteredSoftware.length > 0 ? (
                  filteredSoftware.map((tool) => (
                    <SoftwareCard key={tool.id} tool={tool} />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No software found matching your search.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="plugins" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {isPluginsLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : filteredPlugins.length > 0 ? (
                  filteredPlugins.map((plugin) => (
                    <PluginCard key={plugin.id} plugin={plugin} />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <Puzzle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No plugins found matching your search.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {isToolsLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : filteredAnalysisTools.length > 0 ? (
                  filteredAnalysisTools.map((tool) => (
                    <AnalysisToolCard key={tool.id} tool={tool} />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No analysis tools found matching your search.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {isCoursesLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No courses found matching your search.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
