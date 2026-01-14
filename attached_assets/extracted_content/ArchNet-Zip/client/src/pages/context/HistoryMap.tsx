import { useState } from "react";
import { MapPin, Calendar, Landmark, User, BookOpen, Search, Filter, Bookmark } from "lucide-react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SocialInteractions } from "@/components/SocialInteractions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContextHistoryMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [savedEras, setSavedEras] = useState<Record<string, boolean>>({});
  const [savedIdeologies, setSavedIdeologies] = useState<Record<string, boolean>>({});
  const [savedArchitects, setSavedArchitects] = useState<Record<string, boolean>>({});

  const historicalEras = [
    {
      id: "ancient",
      period: "Ancient Period",
      years: "3200 BCE - 332 BCE",
      sites: ["Petra", "Jerash", "Umm Qais"],
      description: "Nabataean, Roman, and Greek influences shaped early architectural development.",
      image: "/placeholder.jpg",
      keyProjects: ["Petra Treasury", "Jerash Oval Plaza", "Umm Qais Basilica"],
      notableArchitects: ["Nabataean Master Builders"],
    },
    {
      id: "islamic",
      period: "Islamic Era",
      years: "632 CE - 1516 CE",
      sites: ["Umayyad Desert Castles", "Ajloun Castle", "Kerak Castle"],
      description: "Islamic architecture introduced new forms, decorative patterns, and urban planning principles.",
      image: "/placeholder.jpg",
      keyProjects: ["Qasr Amra", "Ajloun Fortress", "Kerak Citadel"],
      notableArchitects: ["Umayyad Court Architects", "Ayyubid Engineers"],
    },
    {
      id: "ottoman",
      period: "Ottoman Period",
      years: "1516 - 1918",
      sites: ["Salt Historic Center", "Amman Old Town", "Irbid Heritage Sites"],
      description: "Ottoman influence brought distinctive architectural elements and urban development patterns.",
      image: "/placeholder.jpg",
      keyProjects: ["Salt Historic Houses", "Ottoman Railway Stations", "Traditional Souqs"],
      notableArchitects: ["Ottoman Imperial Architects"],
    },
    {
      id: "modern",
      period: "Modern Era",
      years: "1920 - Present",
      sites: ["Amman Downtown", "Aqaba Modern District", "Contemporary Projects"],
      description: "Blend of traditional Jordanian elements with contemporary international architecture.",
      image: "/placeholder.jpg",
      keyProjects: ["King Abdullah Mosque", "Jordan Museum", "Abdali Boulevard"],
      notableArchitects: ["Jafar Tukan", "Rasem Badran", "Contemporary Jordanian Architects"],
    },
  ];

  const architecturalIdeologies = [
    {
      id: "islamic-arch",
      name: "Islamic Architecture",
      period: "7th Century - Present",
      description:
        "Characterized by geometric patterns, calligraphy, courtyards, and emphasis on interior spaces. Islamic architecture in Jordan reflects regional adaptations of broader Islamic design principles.",
      keyWorks: ["Umayyad Palaces", "Mamluk Mosques", "Contemporary Islamic Centers"],
      visualExamples: ["/placeholder.jpg"],
      architects: ["Umayyad Caliphate Architects", "Mamluk Master Builders"],
    },
    {
      id: "vernacular",
      name: "Vernacular Architecture",
      period: "Ancient - Present",
      description:
        "Traditional building methods using local materials like limestone, mud brick, and wood. Responds to climate with thick walls, small windows, and courtyards for natural cooling.",
      keyWorks: ["Salt Historic Houses", "Traditional Villages", "Desert Dwellings"],
      visualExamples: ["/placeholder.jpg"],
      architects: ["Local Master Builders", "Traditional Craftsmen"],
    },
    {
      id: "modernism",
      name: "Modernism",
      period: "1950s - 1980s",
      description:
        "Introduction of international modernist principles adapted to Jordanian context. Emphasis on function, clean lines, and integration of modern materials with local traditions.",
      keyWorks: ["Early Amman Modern Buildings", "Institutional Architecture", "Housing Projects"],
      visualExamples: ["/placeholder.jpg"],
      architects: ["Jafar Tukan", "First Generation Jordanian Architects"],
    },
    {
      id: "contemporary",
      name: "Contemporary Architecture",
      period: "1990s - Present",
      description:
        "Synthesis of global architectural trends with local identity. Focus on sustainability, cultural expression, and innovative use of traditional elements in modern contexts.",
      keyWorks: ["Jordan Museum", "King Hussein Business Park", "Contemporary Villas"],
      visualExamples: ["/placeholder.jpg"],
      architects: ["Rasem Badran", "Sahel Al Hiyari", "Contemporary Practices"],
    },
  ];

  const notableArchitects = [
    {
      id: "jafar-tukan",
      name: "Jafar Tukan",
      period: "1938 - 2014",
      bio: "Pioneer of modern Jordanian architecture. Studied at the American University of Beirut and established one of Jordan's first architectural practices. Known for integrating modernist principles with regional identity.",
      keyWorks: ["Central Bank of Jordan", "Housing Bank", "Numerous residential projects"],
      image: "/placeholder-user.jpg",
      style: "Modernism with Regional Identity",
    },
    {
      id: "rasem-badran",
      name: "Rasem Badran",
      period: "1945 - Present",
      bio: "Internationally acclaimed architect known for contemporary interpretations of Islamic architecture. His work emphasizes cultural continuity and contextual design.",
      keyWorks: ["Grand Mosque of Riyadh", "Justice Palace Amman", "Tunis Financial Harbor"],
      image: "/placeholder-user.jpg",
      style: "Contemporary Islamic Architecture",
    },
    {
      id: "sahel-al-hiyari",
      name: "Sahel Al Hiyari",
      period: "1960 - Present",
      bio: "Leading contemporary Jordanian architect focusing on sustainable design and cultural heritage preservation. Known for innovative approaches to traditional architecture.",
      keyWorks: ["Feynan Ecolodge", "Heritage Conservation Projects", "Sustainable Tourism Facilities"],
      image: "/placeholder-user.jpg",
      style: "Sustainable Contemporary",
    },
  ];

  const filteredEras = historicalEras.filter((era) => {
    const matchesSearch =
      era.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      era.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEra = selectedEra === "all" || era.id === selectedEra;
    return matchesSearch && matchesEra;
  });

  const filteredIdeologies = architecturalIdeologies.filter((ideology) => {
    const matchesSearch =
      ideology.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ideology.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = selectedStyle === "all" || ideology.id === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  const filteredArchitects = notableArchitects.filter((architect) => {
    const matchesSearch =
      architect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      architect.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleSaveEra = (id: string) => {
    setSavedEras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSaveIdeology = (id: string) => {
    setSavedIdeologies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSaveArchitect = (id: string) => {
    setSavedArchitects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-accent">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Context Resource</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl mb-4" data-testid="heading-history-map">
              Architectural Timeline of Jordan
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore the rich architectural heritage of Jordan through historical eras, architectural ideologies, and
              notable architects. Discover how architecture evolved through time and shaped the built environment.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-background sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search timeline, architects, ideologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-history"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedEra} onValueChange={setSelectedEra}>
                <SelectTrigger className="w-[180px]" data-testid="select-era-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Era" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Eras</SelectItem>
                  <SelectItem value="ancient">Ancient</SelectItem>
                  <SelectItem value="islamic">Islamic</SelectItem>
                  <SelectItem value="ottoman">Ottoman</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-[180px]" data-testid="select-style-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="islamic-arch">Islamic</SelectItem>
                  <SelectItem value="vernacular">Vernacular</SelectItem>
                  <SelectItem value="modernism">Modernism</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue="eras" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="eras" data-testid="tab-historical-eras">Historical Eras</TabsTrigger>
            <TabsTrigger value="ideologies" data-testid="tab-ideologies">Ideologies & Architects</TabsTrigger>
          </TabsList>

          <TabsContent value="eras" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold mb-2">Historical Eras</h2>
              <p className="text-muted-foreground">
                Explore architectural development through major historical periods
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredEras.map((era) => (
                <Card
                  key={era.id}
                  className="group overflow-hidden transition-all duration-200 hover:border-accent hover:shadow-lg"
                  data-testid={`card-era-${era.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={era.image}
                      alt={era.period}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                      <h3 className="font-serif text-xl font-bold">{era.period}</h3>
                    </div>
                    <p className="text-sm text-accent font-medium mb-3">{era.years}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{era.description}</p>

                    <div className="mb-3">
                      <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide">Key Projects:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {era.keyProjects.slice(0, 3).map((project, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Landmark className="h-3 w-3 mr-1" />
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold mb-2 uppercase tracking-wide">Notable Sites:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {era.sites.map((site, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                            <MapPin className="h-3 w-3 mr-1" />
                            {site}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveEra(era.id)}
                        className={savedEras[era.id] ? "bg-accent/10 text-accent" : ""}
                        data-testid={`button-save-era-${era.id}`}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${savedEras[era.id] ? "fill-current" : ""}`} />
                        {savedEras[era.id] ? "Saved" : "Save"}
                      </Button>
                      <SocialInteractions
                        contentId={`era-${era.id}`}
                        contentType="post"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEras.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No historical eras match your search criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ideologies" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold mb-2">Architectural Ideologies & Notable Architects</h2>
              <p className="text-muted-foreground">
                Discover architectural philosophies and the architects who shaped Jordan's built environment
              </p>
            </div>

            <div className="mb-12">
              <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-accent" />
                Architectural Ideologies
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {filteredIdeologies.map((ideology) => (
                  <Card
                    key={ideology.id}
                    className="group overflow-hidden transition-all duration-200 hover:border-accent hover:shadow-lg"
                    data-testid={`card-ideology-${ideology.id}`}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={ideology.visualExamples[0]}
                        alt={ideology.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h4 className="font-serif text-xl font-bold mb-1">{ideology.name}</h4>
                      <p className="text-sm text-accent font-medium mb-3">{ideology.period}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ideology.description}</p>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold mb-2 uppercase tracking-wide">Key Works:</h5>
                        <div className="flex flex-wrap gap-2">
                          {ideology.keyWorks.map((work, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {work}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSaveIdeology(ideology.id)}
                          className={savedIdeologies[ideology.id] ? "bg-accent/10 text-accent" : ""}
                          data-testid={`button-save-ideology-${ideology.id}`}
                        >
                          <Bookmark className={`h-4 w-4 mr-2 ${savedIdeologies[ideology.id] ? "fill-current" : ""}`} />
                          {savedIdeologies[ideology.id] ? "Saved" : "Save"}
                        </Button>
                        <SocialInteractions
                          contentId={`ideology-${ideology.id}`}
                          contentType="post"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredIdeologies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No ideologies match your search criteria.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-accent" />
                Notable Architects
              </h3>
              <div className="space-y-6">
                {filteredArchitects.map((architect) => (
                  <Card
                    key={architect.id}
                    className="group overflow-hidden transition-all duration-200 hover:border-accent hover:shadow-lg"
                    data-testid={`card-architect-${architect.id}`}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/4 aspect-square overflow-hidden">
                        <img
                          src={architect.image}
                          alt={architect.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-6 md:w-3/4">
                        <h4 className="font-serif text-2xl font-bold mb-1">{architect.name}</h4>
                        <p className="text-sm text-accent font-medium mb-1">{architect.period}</p>
                        <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">
                          {architect.style}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">{architect.bio}</p>

                        <div className="mb-4">
                          <h5 className="text-sm font-semibold mb-2">Key Works:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {architect.keyWorks.map((work, i) => (
                              <li key={i}>{work}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaveArchitect(architect.id)}
                            className={savedArchitects[architect.id] ? "bg-accent/10 text-accent" : ""}
                            data-testid={`button-save-architect-${architect.id}`}
                          >
                            <Bookmark
                              className={`h-4 w-4 mr-2 ${savedArchitects[architect.id] ? "fill-current" : ""}`}
                            />
                            {savedArchitects[architect.id] ? "Saved" : "Save"}
                          </Button>
                          <SocialInteractions
                            contentId={`architect-${architect.id}`}
                            contentType="post"
                          />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredArchitects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No architects match your search criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Explore More Context Resources</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Deepen your understanding of Jordanian architecture with our curated context resources.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/context/plants">
                <Button variant="outline" data-testid="link-natural-environment">
                  Natural Environment
                </Button>
              </Link>
              <Link href="/context/styles">
                <Button variant="outline" data-testid="link-architectural-styles">
                  Architectural Styles
                </Button>
              </Link>
              <Link href="/context/structural-systems">
                <Button variant="outline" data-testid="link-structural-systems">
                  Structural Systems
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
