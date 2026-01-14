import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Bookmark, BookmarkCheck, Clock, MapPin, Users, Landmark, Sun, Palette, Ruler } from "lucide-react";

const traditionalStyles = [
  {
    id: 1,
    name: "Nabataean Architecture",
    period: "1st century BCE - 1st century CE",
    category: "Traditional",
    region: "Petra, Southern Jordan",
    characteristics: [
      "Rock-cut facades carved into sandstone cliffs",
      "Hellenistic and Eastern architectural fusion",
      "Sophisticated water engineering and cisterns",
      "Decorative capitals with floral motifs",
      "Monumental tomb facades",
    ],
    examples: ["The Treasury (Al-Khazneh)", "The Monastery (Ad-Deir)", "Royal Tombs", "Little Petra (Siq al-Barid)"],
    architects: ["Unknown Nabataean master builders"],
    description: "The Nabataeans created one of the ancient world's most remarkable architectural achievements at Petra. Their rock-cut architecture combined influences from Egypt, Greece, and Mesopotamia into a unique style that demonstrated mastery over the harsh desert environment through innovative water management systems.",
    image: "/placeholder.jpg",
  },
  {
    id: 2,
    name: "Islamic-Umayyad Architecture",
    period: "7th-8th century CE",
    category: "Traditional",
    region: "Desert Castles, Eastern Jordan",
    characteristics: [
      "Desert palace complexes (qasr)",
      "Geometric and arabesque patterns",
      "Elaborate frescoes and mosaics",
      "Roman-Byzantine influenced layouts",
      "Hammams (bathhouses) with hypocaust heating",
    ],
    examples: ["Qasr Amra (UNESCO World Heritage)", "Qasr Kharana", "Qasr al-Hallabat", "Qasr Mushatta"],
    architects: ["Umayyad royal patrons and Syrian craftsmen"],
    description: "The Umayyad desert castles represent a unique fusion of Roman, Byzantine, and early Islamic architectural traditions. These complexes served as hunting lodges, agricultural centers, and diplomatic venues, featuring some of the finest examples of early Islamic art including the famous frescoes of Qasr Amra.",
    image: "/placeholder.jpg",
  },
  {
    id: 3,
    name: "Ottoman Vernacular",
    period: "16th-20th century",
    category: "Traditional",
    region: "Salt, Amman Old Town, Madaba",
    characteristics: [
      "Local limestone construction",
      "Central courtyards (hosh)",
      "Pointed and horseshoe arches",
      "Wooden mashrabiya screens",
      "Flat roofs with parapets",
    ],
    examples: ["Salt Historic Center (UNESCO)", "Abu Jaber House", "Old Amman Downtown", "Madaba Historic Quarter"],
    architects: ["Local master builders (mu'allim)"],
    description: "Ottoman vernacular architecture in Jordan developed a distinctive regional character combining Ottoman imperial influences with local building traditions. The golden limestone construction and courtyard houses of Salt exemplify this style, recognized by UNESCO for its outstanding universal value.",
    image: "/placeholder.jpg",
  },
  {
    id: 4,
    name: "Bedouin/Desert Architecture",
    period: "Timeless tradition",
    category: "Traditional",
    region: "Wadi Rum, Badia Desert Regions",
    characteristics: [
      "Black goat-hair tents (beit al-sha'ar)",
      "Low-profile stone structures",
      "Natural and locally-sourced materials",
      "Climate-responsive passive design",
      "Portable and adaptable forms",
    ],
    examples: ["Traditional Bedouin camps", "Desert stone shelters", "Wadi Rum encampments"],
    architects: ["Bedouin tribal builders"],
    description: "Bedouin architecture represents centuries of adaptation to the harsh desert environment. The iconic black tent, woven from goat hair, provides insulation in winter and allows airflow in summer. Stone structures built into hillsides demonstrate an intuitive understanding of thermal mass and passive cooling.",
    image: "/placeholder.jpg",
  },
];

const contemporaryStyles = [
  {
    id: 5,
    name: "Modern Jordanian",
    period: "1950s-1980s",
    category: "Contemporary",
    region: "Amman, Irbid, Aqaba",
    characteristics: [
      "Integration of local limestone cladding",
      "Modernist principles with regional adaptation",
      "Reinforced concrete construction",
      "Large windows with shading devices",
      "Flat roofs and clean geometric forms",
    ],
    examples: ["Jordan University Campus", "Royal Cultural Center", "Early Amman urban development"],
    architects: ["Jafar Tukan", "Rasem Badran (early works)", "Ministry of Public Works architects"],
    description: "Post-independence Jordan saw the emergence of a modern architectural identity that sought to balance international modernist principles with local materials and climate considerations. Limestone cladding became a signature element, creating visual continuity with traditional construction.",
    image: "/placeholder.jpg",
  },
  {
    id: 6,
    name: "Contemporary Islamic",
    period: "1990s-present",
    category: "Contemporary",
    region: "Amman, National institutions",
    characteristics: [
      "Reinterpretation of Islamic geometric patterns",
      "Cultural continuity with innovation",
      "Courtyard typologies in modern form",
      "Mashrabiya-inspired shading systems",
      "Integration of calligraphy and ornament",
    ],
    examples: ["King Hussein Mosque", "Jordan National Museum", "Amman Citadel Museum", "Aga Khan Award projects"],
    architects: ["Rasem Badran", "Sahel Al Hiyari", "Khammash Architects"],
    description: "Contemporary Islamic architecture in Jordan, pioneered by Rasem Badran, represents a sophisticated dialogue between heritage and modernity. This approach reinterprets traditional spatial concepts, materials, and ornamental systems through contemporary construction methods and design thinking.",
    image: "/placeholder.jpg",
  },
  {
    id: 7,
    name: "Sustainable Contemporary",
    period: "2000s-present",
    category: "Contemporary",
    region: "Nationwide, Eco-resorts",
    characteristics: [
      "Passive cooling strategies",
      "Local and recycled materials",
      "Solar orientation and shading",
      "Green building certifications",
      "Water conservation systems",
    ],
    examples: ["Feynan Ecolodge", "RSCN Nature Reserves", "Green-rated commercial buildings", "Sustainable housing projects"],
    architects: ["Ammar Khammash", "Eco-design consultancies", "International sustainable design firms"],
    description: "Sustainable contemporary architecture in Jordan draws on traditional passive design wisdom while incorporating modern environmental technologies. Projects like Feynan Ecolodge demonstrate how contemporary buildings can achieve minimal environmental impact while celebrating regional building traditions.",
    image: "/placeholder.jpg",
  },
];

const allStyles = [...traditionalStyles, ...contemporaryStyles];

const contemporaryApproaches = [
  {
    title: "Climate-Responsive Design",
    description: "Modern interpretations of traditional passive cooling strategies, including thick walls, small windows, and courtyard layouts.",
    icon: Sun,
  },
  {
    title: "Material Authenticity",
    description: "Use of local limestone, sandstone, and earth materials that connect contemporary buildings to regional heritage.",
    icon: Palette,
  },
  {
    title: "Contextual Modernism",
    description: "Blending international modern architecture with local proportions, materials, and spatial concepts.",
    icon: Ruler,
  },
];

const designElements = [
  {
    element: "Materials",
    traditional: "Local limestone, sandstone, mud brick",
    contemporary: "Concrete, glass, steel with stone cladding",
  },
  {
    element: "Forms",
    traditional: "Domes, arches, courtyards, thick walls",
    contemporary: "Clean lines, open plans, large glazing",
  },
  {
    element: "Climate Strategy",
    traditional: "Passive cooling, small openings, thermal mass",
    contemporary: "Active systems with passive principles, shading devices",
  },
  {
    element: "Ornamentation",
    traditional: "Geometric patterns, calligraphy, carved stone",
    contemporary: "Minimal detailing, material expression, subtle references",
  },
  {
    element: "Spatial Organization",
    traditional: "Inward-facing, hierarchical, private courtyards",
    contemporary: "Flexible, open, indoor-outdoor connection",
  },
];

export default function ContextStylesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [savedStyles, setSavedStyles] = useState<Record<number, boolean>>({});

  const filteredStyles = allStyles.filter((style) => {
    const matchesSearch =
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.characteristics.some((char) => char.toLowerCase().includes(searchQuery.toLowerCase())) ||
      style.examples.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPeriod = selectedPeriod === "all" || style.category === selectedPeriod;
    const matchesRegion = selectedRegion === "all" || style.region.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchesSearch && matchesPeriod && matchesRegion;
  });

  const toggleSaveStyle = (id: number) => {
    setSavedStyles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-accent">
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Context Resource</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl mb-4" data-testid="text-page-title">
              Architectural Styles of Jordan
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore the evolution of architectural styles in Jordan — from ancient Nabataean rock-cut facades to
              contemporary contextual modernism. Understand how tradition informs innovation.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search architectural styles, characteristics, or examples..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-styles"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[160px]" data-testid="select-period">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="Traditional">Traditional</SelectItem>
                  <SelectItem value="Contemporary">Contemporary</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]" data-testid="select-region">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Petra">Petra</SelectItem>
                  <SelectItem value="Amman">Amman</SelectItem>
                  <SelectItem value="Salt">Salt</SelectItem>
                  <SelectItem value="Desert">Desert Regions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all" data-testid="tab-all-styles">All Styles</TabsTrigger>
            <TabsTrigger value="traditional" data-testid="tab-traditional">Traditional</TabsTrigger>
            <TabsTrigger value="contemporary" data-testid="tab-contemporary">Contemporary</TabsTrigger>
            <TabsTrigger value="comparison" data-testid="tab-comparison">Style Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">All Architectural Styles</h2>
              <p className="text-muted-foreground">{filteredStyles.length} styles found</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStyles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  isSaved={savedStyles[style.id]}
                  onToggleSave={() => toggleSaveStyle(style.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="traditional">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Traditional Styles</h2>
              <p className="text-muted-foreground">Ancient and historic architectural traditions of Jordan</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {traditionalStyles
                .filter((style) =>
                  style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  style.characteristics.some((char) => char.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((style) => (
                  <StyleCard
                    key={style.id}
                    style={style}
                    isSaved={savedStyles[style.id]}
                    onToggleSave={() => toggleSaveStyle(style.id)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="contemporary">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Contemporary Styles</h2>
              <p className="text-muted-foreground">Modern architectural approaches in Jordan</p>
            </div>

            <div className="mb-12">
              <h3 className="font-semibold text-lg mb-4">Contemporary Design Approaches</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {contemporaryApproaches.map((approach) => {
                  const Icon = approach.icon;
                  return (
                    <Card key={approach.title} className="hover-elevate">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-accent" />
                          <CardTitle className="text-base">{approach.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{approach.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contemporaryStyles
                .filter((style) =>
                  style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  style.characteristics.some((char) => char.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((style) => (
                  <StyleCard
                    key={style.id}
                    style={style}
                    isSaved={savedStyles[style.id]}
                    onToggleSave={() => toggleSaveStyle(style.id)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Traditional vs Contemporary</h2>
              <p className="text-muted-foreground">Compare design elements across architectural periods</p>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-secondary/30">
                        <th className="p-4 text-left font-semibold">Design Element</th>
                        <th className="p-4 text-left font-semibold">Traditional</th>
                        <th className="p-4 text-left font-semibold">Contemporary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {designElements.map((item, index) => (
                        <tr key={item.element} className={index % 2 === 0 ? "bg-background" : "bg-secondary/10"}>
                          <td className="p-4 font-medium">{item.element}</td>
                          <td className="p-4 text-muted-foreground">{item.traditional}</td>
                          <td className="p-4 text-muted-foreground">{item.contemporary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}

interface StyleCardProps {
  style: {
    id: number;
    name: string;
    period: string;
    category: string;
    region: string;
    characteristics: string[];
    examples: string[];
    architects: string[];
    description: string;
    image: string;
  };
  isSaved: boolean;
  onToggleSave: () => void;
}

function StyleCard({ style, isSaved, onToggleSave }: StyleCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent" data-testid={`card-style-${style.id}`}>
      <div className="aspect-video overflow-hidden bg-secondary/30">
        <img
          src={style.image}
          alt={style.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={style.category === "Traditional" ? "secondary" : "default"} className="text-xs">
            {style.category}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSave}
            className={isSaved ? "text-accent" : ""}
            data-testid={`button-save-style-${style.id}`}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>
        <CardTitle className="font-serif text-lg">{style.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{style.period}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{style.region.split(",")[0]}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{style.description}</p>

        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Characteristics</h4>
          <div className="flex flex-wrap gap-1">
            {style.characteristics.slice(0, 3).map((char, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {char.length > 25 ? char.substring(0, 25) + "..." : char}
              </Badge>
            ))}
            {style.characteristics.length > 3 && (
              <Badge variant="outline" className="text-xs">+{style.characteristics.length - 3} more</Badge>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Notable Examples</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {style.examples.slice(0, 2).map((example, index) => (
              <li key={index} className="flex items-center gap-1">
                <Landmark className="h-3 w-3 text-accent" />
                {example}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Architects</h4>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{style.architects[0]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
