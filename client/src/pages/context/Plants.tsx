import { useState } from "react";
import { Link } from "wouter";
import { Leaf, Droplets, Sun, Wind, ArrowRight, Trees, Sprout, Search, Mountain, Bookmark, Share2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const treesDatabase = [
  {
    id: 1,
    commonName: "Aleppo Pine",
    scientificName: "Pinus halepensis",
    category: "Trees",
    type: "Evergreen Tree",
    nativeStatus: "Native",
    height: "15-25m",
    spread: "8-12m",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    soilType: ["Well-drained", "Rocky", "Sandy"],
    compatibleSoils: ["Terra Rossa", "Rendzina", "Sandy Loam"],
    region: "Northern Jordan",
    seasonalChanges: "Evergreen, produces cones in autumn",
    uses: "Shade, windbreak, erosion control, ornamental",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    commonName: "Olive Tree",
    scientificName: "Olea europaea",
    category: "Trees",
    type: "Evergreen Tree",
    nativeStatus: "Native",
    height: "8-15m",
    spread: "8-12m",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    soilType: ["Well-drained", "Alkaline"],
    compatibleSoils: ["Terra Rossa", "Rendzina", "Calcareous"],
    region: "All regions",
    seasonalChanges: "Evergreen, flowers in spring, fruits in autumn",
    uses: "Ornamental, cultural significance, edible fruit, shade",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    commonName: "Carob Tree",
    scientificName: "Ceratonia siliqua",
    category: "Trees",
    type: "Evergreen Tree",
    nativeStatus: "Native",
    height: "10-15m",
    spread: "8-10m",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    soilType: ["Well-drained", "Rocky"],
    compatibleSoils: ["Terra Rossa", "Rendzina", "Rocky Limestone"],
    region: "Northern and Central Jordan",
    seasonalChanges: "Evergreen, produces pods in summer",
    uses: "Shade, edible pods, nitrogen fixation, ornamental",
    image: "/placeholder.svg",
  },
];

const plantsDatabase = [
  {
    id: 4,
    commonName: "White Broom",
    scientificName: "Retama raetam",
    category: "Plants",
    type: "Desert Shrub",
    nativeStatus: "Native",
    height: "2-3m",
    spread: "2-3m",
    sunRequirement: "Full Sun",
    waterNeeds: "Very Low",
    soilType: ["Sandy", "Poor soil"],
    compatibleSoils: ["Sandy Desert", "Wadi Sediments"],
    region: "Southern Jordan, Wadi Rum",
    seasonalChanges: "White flowers in spring, drought-deciduous",
    uses: "Erosion control, desert landscaping, nitrogen fixation",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    commonName: "Rosemary",
    scientificName: "Rosmarinus officinalis",
    category: "Plants",
    type: "Mediterranean Shrub",
    nativeStatus: "Adapted",
    height: "0.5-1.5m",
    spread: "0.5-1m",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    soilType: ["Well-drained"],
    compatibleSoils: ["Sandy Loam", "Terra Rossa", "Calcareous"],
    region: "All regions",
    seasonalChanges: "Evergreen, blue flowers in spring",
    uses: "Aromatic, culinary, ornamental, pollinator-friendly",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    commonName: "Desert Lavender",
    scientificName: "Lavandula coronopifolia",
    category: "Plants",
    type: "Desert Shrub",
    nativeStatus: "Native",
    height: "0.3-0.6m",
    spread: "0.4-0.6m",
    sunRequirement: "Full Sun",
    waterNeeds: "Very Low",
    soilType: ["Sandy", "Well-drained"],
    compatibleSoils: ["Sandy Desert", "Sandy Loam"],
    region: "Southern Jordan",
    seasonalChanges: "Purple flowers in spring, aromatic year-round",
    uses: "Aromatic, pollinator-friendly, low maintenance, ornamental",
    image: "/placeholder.svg",
  },
];

const soilTypesDatabase = [
  {
    id: 7,
    name: "Terra Rossa",
    category: "Soil",
    type: "Clay-rich Red Soil",
    composition: "Clay 40-60%, Silt 20-30%, Sand 10-30%",
    pH: "7.0-8.5 (Neutral to Alkaline)",
    drainage: "Moderate",
    waterRetention: "High",
    fertility: "High",
    location: "Northern highlands, limestone areas",
    layers: "A-horizon (20-40cm topsoil), B-horizon (40-80cm clay accumulation), C-horizon (weathered limestone)",
    bestFor: ["Olive trees", "Carob trees", "Mediterranean shrubs", "Fruit trees"],
    challenges: ["Heavy texture", "Can be sticky when wet", "May crack when dry"],
    image: "/placeholder.svg",
  },
  {
    id: 8,
    name: "Rendzina",
    category: "Soil",
    type: "Shallow Limestone Soil",
    composition: "Clay 30-40%, Silt 30-40%, Sand 20-30%, Limestone fragments",
    pH: "7.5-8.5 (Alkaline)",
    drainage: "Good",
    waterRetention: "Moderate",
    fertility: "Moderate to High",
    location: "Limestone plateaus, northern and central Jordan",
    layers: "A-horizon (10-30cm dark topsoil), C-horizon (limestone bedrock)",
    bestFor: ["Aleppo pine", "Olive trees", "Native shrubs", "Drought-tolerant plants"],
    challenges: ["Shallow depth", "Rocky", "Limited root space"],
    image: "/placeholder.svg",
  },
  {
    id: 9,
    name: "Sandy Desert Soil",
    category: "Soil",
    type: "Arid Sandy Soil",
    composition: "Sand 70-90%, Silt 5-15%, Clay 5-15%",
    pH: "7.5-8.5 (Alkaline)",
    drainage: "Excellent",
    waterRetention: "Very Low",
    fertility: "Low",
    location: "Wadi Rum, southern deserts, eastern plains",
    layers: "A-horizon (5-15cm minimal topsoil), C-horizon (deep sand deposits)",
    bestFor: ["White broom", "Desert lavender", "Acacia trees", "Xerophytic plants"],
    challenges: ["Low water retention", "Low nutrients", "Wind erosion", "Extreme temperatures"],
    image: "/placeholder.svg",
  },
  {
    id: 10,
    name: "Sandy Loam",
    category: "Soil",
    type: "Balanced Agricultural Soil",
    composition: "Sand 50-70%, Silt 15-25%, Clay 10-20%",
    pH: "7.0-8.0 (Neutral to Slightly Alkaline)",
    drainage: "Good",
    waterRetention: "Moderate",
    fertility: "Moderate to High",
    location: "Jordan Valley, agricultural areas, wadi terraces",
    layers: "A-horizon (30-50cm topsoil), B-horizon (50-100cm subsoil), C-horizon (parent material)",
    bestFor: ["Most trees and shrubs", "Agricultural crops", "Ornamental plants", "Rosemary"],
    challenges: ["Requires irrigation in dry season", "Can be depleted without organic matter"],
    image: "/placeholder.svg",
  },
];

type TreeItem = typeof treesDatabase[number];
type PlantItem = typeof plantsDatabase[number];
type SoilItem = typeof soilTypesDatabase[number];
type AllItem = TreeItem | PlantItem | SoilItem;

const allItems: AllItem[] = [...treesDatabase, ...plantsDatabase, ...soilTypesDatabase];

export default function ContextPlantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedWaterNeeds, setSelectedWaterNeeds] = useState("all");
  const [selectedSunExposure, setSelectedSunExposure] = useState("all");
  const [savedItems, setSavedItems] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("trees");
  const { toast } = useToast();

  const filterItems = <T extends AllItem>(items: T[]): T[] => {
    return items.filter((item) => {
      const name = 'commonName' in item ? item.commonName : item.name;
      const scientificName = 'scientificName' in item ? item.scientificName : '';
      const uses = 'uses' in item ? item.uses : '';
      const bestFor = 'bestFor' in item ? item.bestFor : [];
      const region = 'region' in item ? item.region : '';
      const location = 'location' in item ? item.location : '';
      const waterNeeds = 'waterNeeds' in item ? item.waterNeeds : '';
      const sunRequirement = 'sunRequirement' in item ? item.sunRequirement : '';
      const soilType = 'soilType' in item ? item.soilType : [];

      const matchesSearch =
        name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scientificName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uses?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bestFor?.some((use: string) => use.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesRegion =
        selectedRegion === "all" || region?.includes(selectedRegion) || location?.includes(selectedRegion);
      const matchesWater = selectedWaterNeeds === "all" || waterNeeds === selectedWaterNeeds;
      const matchesSun = selectedSunExposure === "all" || sunRequirement === selectedSunExposure;
      return matchesSearch && matchesType && matchesRegion && matchesWater && matchesSun;
    });
  };

  const filteredTrees = filterItems(treesDatabase);
  const filteredPlants = filterItems(plantsDatabase);
  const filteredSoils = filterItems(soilTypesDatabase);

  const toggleSaveItem = (id: number) => {
    setSavedItems((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      toast({
        description: newState[id] ? "Saved to your library" : "Removed from saved items",
      });
      return newState;
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check this out on ArchNet",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        description: "Link copied to clipboard",
      });
    }
  };

  const landscapingPrinciples = [
    {
      icon: Droplets,
      title: "Water Conservation",
      description:
        "Use native, drought-resistant plants to minimize irrigation needs in Jordan's arid climate. Implement xeriscaping principles and efficient irrigation systems.",
    },
    {
      icon: Sun,
      title: "Sun Exposure & Microclimate",
      description:
        "Select plants based on site orientation and sun exposure patterns. Create microclimates through strategic planting to reduce cooling loads in buildings.",
    },
    {
      icon: Wind,
      title: "Wind Protection",
      description:
        "Strategic planting of trees and shrubs to create windbreaks, reduce wind impact on structures, and improve outdoor comfort.",
    },
    {
      icon: Trees,
      title: "Ecological Integration",
      description:
        "Support local biodiversity by choosing native species that provide habitat for pollinators and wildlife while maintaining ecological balance.",
    },
    {
      icon: Sprout,
      title: "Soil Health & Adaptation",
      description:
        "Select plants adapted to local soil conditions. Use native species that improve soil quality through nitrogen fixation and organic matter.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-accent">
              <Leaf className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Context Resource</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Natural Environment & Landscape
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A comprehensive guide to native trees, plants, soil types, and plant-soil compatibility in Jordan —
              essential knowledge for sustainable architectural and landscape design.
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
                placeholder="Search trees, plants, soil types, or uses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-plants"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]" data-testid="select-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Evergreen Tree">Evergreen Tree</SelectItem>
                  <SelectItem value="Desert Shrub">Desert Shrub</SelectItem>
                  <SelectItem value="Mediterranean Shrub">Mediterranean Shrub</SelectItem>
                  <SelectItem value="Clay-rich Red Soil">Clay-rich Red Soil</SelectItem>
                  <SelectItem value="Shallow Limestone Soil">Shallow Limestone Soil</SelectItem>
                  <SelectItem value="Arid Sandy Soil">Arid Sandy Soil</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]" data-testid="select-region">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Northern">Northern Jordan</SelectItem>
                  <SelectItem value="Central">Central Jordan</SelectItem>
                  <SelectItem value="Southern">Southern Jordan</SelectItem>
                  <SelectItem value="Jordan Valley">Jordan Valley</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedWaterNeeds} onValueChange={setSelectedWaterNeeds}>
                <SelectTrigger className="w-[160px]" data-testid="select-water-needs">
                  <SelectValue placeholder="Water Needs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Water Needs</SelectItem>
                  <SelectItem value="Very Low">Very Low</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSunExposure} onValueChange={setSelectedSunExposure}>
                <SelectTrigger className="w-[180px]" data-testid="select-sun-exposure">
                  <SelectValue placeholder="Sun Exposure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sun Exposure</SelectItem>
                  <SelectItem value="Full Sun">Full Sun</SelectItem>
                  <SelectItem value="Partial Shade">Partial Shade</SelectItem>
                  <SelectItem value="Full Shade">Full Shade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="trees" data-testid="tab-trees">
              <Trees className="mr-2 h-4 w-4" />
              Trees
            </TabsTrigger>
            <TabsTrigger value="plants" data-testid="tab-plants">
              <Sprout className="mr-2 h-4 w-4" />
              Plants
            </TabsTrigger>
            <TabsTrigger value="soil" data-testid="tab-soil">
              <Mountain className="mr-2 h-4 w-4" />
              Soil Types
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trees">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-3xl font-bold">Native Trees in Jordan</h2>
              <p className="text-muted-foreground">{filteredTrees.length} trees found</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrees.map((tree) => (
                <Card
                  key={tree.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent"
                  data-testid={`card-tree-${tree.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={tree.image}
                      alt={tree.commonName}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={tree.nativeStatus === "Native" ? "default" : "secondary"}>
                          {tree.nativeStatus}
                        </Badge>
                        <Badge variant="outline">{tree.type}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{tree.commonName}</CardTitle>
                    <CardDescription className="italic">{tree.scientificName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-medium">{tree.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spread</p>
                        <p className="font-medium">{tree.spread}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sun</p>
                        <p className="font-medium">{tree.sunRequirement}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Water</p>
                        <p className="font-medium">{tree.waterNeeds}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Region</p>
                      <p className="text-sm font-medium">{tree.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Compatible Soils</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tree.compatibleSoils.map((soil, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {soil}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Uses</p>
                      <p className="text-sm leading-relaxed">{tree.uses}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveItem(tree.id)}
                        className={savedItems[tree.id] ? "bg-accent/10 text-accent" : ""}
                        data-testid={`button-save-tree-${tree.id}`}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${savedItems[tree.id] ? "fill-current" : ""}`} />
                        {savedItems[tree.id] ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        data-testid={`button-share-tree-${tree.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plants">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-3xl font-bold">Native Plants & Shrubs</h2>
              <p className="text-muted-foreground">{filteredPlants.length} plants found</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlants.map((plant) => (
                <Card
                  key={plant.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent"
                  data-testid={`card-plant-${plant.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={plant.image}
                      alt={plant.commonName}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={plant.nativeStatus === "Native" ? "default" : "secondary"}>
                          {plant.nativeStatus}
                        </Badge>
                        <Badge variant="outline">{plant.type}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plant.commonName}</CardTitle>
                    <CardDescription className="italic">{plant.scientificName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-medium">{plant.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spread</p>
                        <p className="font-medium">{plant.spread}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sun</p>
                        <p className="font-medium">{plant.sunRequirement}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Water</p>
                        <p className="font-medium">{plant.waterNeeds}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Region</p>
                      <p className="text-sm font-medium">{plant.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Compatible Soils</p>
                      <div className="flex flex-wrap gap-1.5">
                        {plant.compatibleSoils.map((soil, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {soil}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Uses</p>
                      <p className="text-sm leading-relaxed">{plant.uses}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveItem(plant.id)}
                        className={savedItems[plant.id] ? "bg-accent/10 text-accent" : ""}
                        data-testid={`button-save-plant-${plant.id}`}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${savedItems[plant.id] ? "fill-current" : ""}`} />
                        {savedItems[plant.id] ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        data-testid={`button-share-plant-${plant.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="soil">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-3xl font-bold">Soil Types in Jordan</h2>
              <p className="text-muted-foreground">{filteredSoils.length} soil types found</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredSoils.map((soil) => (
                <Card
                  key={soil.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent"
                  data-testid={`card-soil-${soil.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={soil.image}
                      alt={soil.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="default">{soil.type}</Badge>
                    </div>
                    <CardTitle className="text-xl">{soil.name}</CardTitle>
                    <CardDescription>{soil.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Composition</p>
                      <p className="text-sm text-muted-foreground">{soil.composition}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">pH Level</p>
                        <p className="font-medium">{soil.pH}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Drainage</p>
                        <p className="font-medium">{soil.drainage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Water Retention</p>
                        <p className="font-medium">{soil.waterRetention}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fertility</p>
                        <p className="font-medium">{soil.fertility}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold mb-1">Soil Layers</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{soil.layers}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Best For</p>
                      <div className="flex flex-wrap gap-1.5">
                        {soil.bestFor.map((plant, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {plant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Challenges</p>
                      <ul className="space-y-1">
                        {soil.challenges.map((challenge, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <div className="mt-1 h-1 w-1 rounded-full bg-orange-500 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveItem(soil.id)}
                        className={savedItems[soil.id] ? "bg-accent/10 text-accent" : ""}
                        data-testid={`button-save-soil-${soil.id}`}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${savedItems[soil.id] ? "fill-current" : ""}`} />
                        {savedItems[soil.id] ? "Saved" : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        data-testid={`button-share-soil-${soil.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl font-bold mb-8">Plant-Soil Compatibility Guide</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Understanding which plants thrive in specific soil types is essential for successful landscape design in
            Jordan. This guide shows optimal plant-soil combinations for sustainable, low-maintenance landscapes.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-serif text-lg font-bold">Soil Type</th>
                  <th className="p-4 text-left font-serif text-lg font-bold">Best Trees</th>
                  <th className="p-4 text-left font-serif text-lg font-bold">Best Plants</th>
                  <th className="p-4 text-left font-serif text-lg font-bold">Key Characteristics</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-4 font-semibold">Terra Rossa</td>
                  <td className="p-4 text-muted-foreground">Olive, Carob, Aleppo Pine</td>
                  <td className="p-4 text-muted-foreground">Rosemary, Mediterranean shrubs</td>
                  <td className="p-4 text-muted-foreground">High fertility, good water retention</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-4 font-semibold">Rendzina</td>
                  <td className="p-4 text-muted-foreground">Aleppo Pine, Olive</td>
                  <td className="p-4 text-muted-foreground">Native shrubs, drought-tolerant plants</td>
                  <td className="p-4 text-muted-foreground">Shallow, rocky, alkaline</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-4 font-semibold">Sandy Desert</td>
                  <td className="p-4 text-muted-foreground">Acacia species</td>
                  <td className="p-4 text-muted-foreground">White Broom, Desert Lavender</td>
                  <td className="p-4 text-muted-foreground">Excellent drainage, very low water retention</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-4 font-semibold">Sandy Loam</td>
                  <td className="p-4 text-muted-foreground">Most tree species</td>
                  <td className="p-4 text-muted-foreground">Rosemary, ornamental plants</td>
                  <td className="p-4 text-muted-foreground">Balanced, versatile, good for most plants</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t bg-background">
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl font-bold mb-8">Sustainable Landscaping Principles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {landscapingPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div
                  key={index}
                  className="group rounded-lg border bg-background p-6 transition-all duration-200 hover:border-accent hover:shadow-md"
                >
                  <Icon className="h-10 w-10 text-accent mb-4 transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="font-serif text-xl font-bold mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{principle.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Explore More Context Resources</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Deepen your understanding of Jordanian architecture with our curated context resources.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/context/history-map">
                <Button variant="outline" className="gap-2" data-testid="button-goto-history-map">
                  History Map
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/context/styles">
                <Button variant="outline" className="gap-2" data-testid="button-goto-styles">
                  Architectural Styles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/context/structural-systems">
                <Button variant="outline" className="gap-2" data-testid="button-goto-structural">
                  Structural Systems
                  <ArrowRight className="h-4 w-4" />
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
