import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SocialInteractions } from "@/components/SocialInteractions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Columns, Search, Bookmark, ArrowRight, Layers, Box, Building, 
  Home, Factory, Mountain, Shield, AlertTriangle
} from "lucide-react";

interface StructuralSystem {
  id: number;
  name: string;
  category: string;
  systemType: string;
  materials: string[];
  description: string;
  advantages: string[];
  limitations: string[];
  applications: string[];
  materialRequirements: string;
}

const structuralSystemsData: StructuralSystem[] = [
  {
    id: 1,
    name: "Stone Masonry",
    category: "Load-Bearing Systems",
    systemType: "Traditional",
    materials: ["Limestone", "Basalt", "Sandstone"],
    description: "Traditional limestone construction with 500mm+ walls. This ancient technique uses locally sourced stone to create durable, thermally massive structures that have defined Jordanian vernacular architecture for centuries.",
    advantages: ["Excellent thermal mass", "Locally available materials", "Fire resistant", "Durable and long-lasting", "Cultural authenticity"],
    limitations: ["Thick walls reduce usable space", "Labor intensive", "Limited span capability", "Skilled mason requirement"],
    applications: ["Heritage restoration", "Traditional homes", "Rural construction", "Cultural buildings"],
    materialRequirements: "Local limestone or basalt, lime mortar, skilled stone masons"
  },
  {
    id: 2,
    name: "Reinforced Concrete Walls",
    category: "Load-Bearing Systems",
    systemType: "Modern",
    materials: ["Concrete", "Steel reinforcement"],
    description: "Modern bearing wall systems using reinforced concrete. Provides excellent structural capacity and can be combined with insulation for improved thermal performance.",
    advantages: ["High load capacity", "Good seismic resistance", "Fire resistant", "Flexible form options"],
    limitations: ["High embodied energy", "Thermal bridging concerns", "Requires formwork", "Longer construction time"],
    applications: ["Multi-story residential", "Commercial buildings", "Industrial structures"],
    materialRequirements: "Concrete mix, steel reinforcement bars, formwork materials"
  },
  {
    id: 3,
    name: "Adobe/Mud Brick",
    category: "Load-Bearing Systems",
    systemType: "Traditional",
    materials: ["Earth", "Straw", "Water"],
    description: "Traditional desert construction using sun-dried mud bricks. An ancient sustainable building method perfectly suited to Jordan's arid climate, providing excellent thermal comfort.",
    advantages: ["Very low cost", "Excellent thermal properties", "Sustainable", "Uses local materials", "Low embodied energy"],
    limitations: ["Requires maintenance", "Water sensitivity", "Limited height", "Not suitable for humid areas"],
    applications: ["Desert construction", "Eco-tourism facilities", "Traditional restoration", "Rural housing"],
    materialRequirements: "Local clay soil, straw or other fiber, water, sun-drying space"
  },
  {
    id: 4,
    name: "Reinforced Concrete Frame",
    category: "Frame Systems",
    systemType: "Modern",
    materials: ["Concrete", "Steel reinforcement"],
    description: "The most common structural system in modern Jordan. Columns and beams form a frame that carries loads, allowing flexible floor plans and large openings with infill walls for enclosure.",
    advantages: ["Flexible floor plans", "Good seismic performance", "Fire resistant", "Allows large openings", "Well-understood locally"],
    limitations: ["Requires skilled labor", "Formwork needed", "Longer construction time", "High embodied energy"],
    applications: ["Residential towers", "Commercial buildings", "Institutional structures", "Hotels"],
    materialRequirements: "Concrete, steel reinforcement, formwork, skilled construction teams"
  },
  {
    id: 5,
    name: "Steel Frame",
    category: "Frame Systems",
    systemType: "Modern",
    materials: ["Structural steel", "Steel connections", "Metal decking"],
    description: "Efficient system for industrial and commercial buildings. Steel members are connected to form a structural frame, enabling long spans and rapid construction.",
    advantages: ["Fast construction", "Long span capability", "Lightweight", "Prefabricated components", "Recyclable"],
    limitations: ["Requires fire protection", "Corrosion concerns", "Higher initial cost", "Specialized labor needed"],
    applications: ["Industrial facilities", "Large commercial spaces", "Airport terminals", "Exhibition halls"],
    materialRequirements: "Structural steel sections, high-strength bolts, welding equipment, fire protection systems"
  },
  {
    id: 6,
    name: "Timber Frame",
    category: "Frame Systems",
    systemType: "Traditional/Sustainable",
    materials: ["Wood", "Timber connections"],
    description: "Limited use in Jordan due to scarce timber resources. Mainly found in traditional structures and increasingly in sustainable construction projects using imported or certified wood.",
    advantages: ["Renewable material", "Low embodied energy", "Fast construction", "Good insulation", "Carbon sequestration"],
    limitations: ["Limited local availability", "Fire concerns", "Termite susceptibility", "Moisture sensitivity"],
    applications: ["Traditional roof structures", "Sustainable projects", "Temporary structures", "Interior framing"],
    materialRequirements: "Imported or certified timber, metal connectors, preservative treatments"
  },
  {
    id: 7,
    name: "Strip Foundations",
    category: "Foundation Systems",
    systemType: "Modern",
    materials: ["Concrete", "Steel reinforcement"],
    description: "Common foundation type for residential buildings in Jordan. Continuous strip of concrete supports load-bearing walls, distributing loads to stable soil below.",
    advantages: ["Cost-effective", "Simple construction", "Suitable for most soils", "Easy to inspect"],
    limitations: ["Not suitable for poor soils", "Limited for heavy loads", "Requires stable ground"],
    applications: ["Residential buildings", "Low-rise construction", "Garden walls", "Light commercial"],
    materialRequirements: "Concrete, steel reinforcement, excavation equipment"
  },
  {
    id: 8,
    name: "Raft Foundations",
    category: "Foundation Systems",
    systemType: "Modern",
    materials: ["Reinforced concrete"],
    description: "Large concrete slab supporting entire building. Used for expansive or weak soils and large buildings where load distribution is critical.",
    advantages: ["Distributes loads evenly", "Good for weak soils", "Reduces differential settlement", "Acts as ground floor slab"],
    limitations: ["Higher material cost", "More concrete required", "Complex waterproofing"],
    applications: ["Large buildings", "Expansive soil areas", "High-rise construction", "Water table issues"],
    materialRequirements: "Large volume of concrete, extensive steel reinforcement, waterproofing membranes"
  },
  {
    id: 9,
    name: "Pile Foundations",
    category: "Foundation Systems",
    systemType: "Modern",
    materials: ["Concrete", "Steel", "Timber"],
    description: "Deep foundation system for high-rise buildings and poor soil conditions. Transfers building loads through weak upper soil layers to stronger strata below.",
    advantages: ["Suitable for poor soils", "High load capacity", "Minimal settlement", "Works in high water table"],
    limitations: ["High cost", "Specialized equipment", "Longer construction time", "Noise and vibration"],
    applications: ["High-rise buildings", "Bridge foundations", "Poor soil conditions", "Waterfront structures"],
    materialRequirements: "Piling equipment, concrete or steel piles, specialized contractors"
  },
  {
    id: 10,
    name: "Flat Concrete Roof",
    category: "Roof Systems",
    systemType: "Modern",
    materials: ["Reinforced concrete", "Waterproofing", "Insulation"],
    description: "The dominant roof type in Jordan. Reinforced concrete slabs with waterproofing and insulation layers. Often used as accessible roof terraces.",
    advantages: ["Usable roof space", "Good thermal mass", "Fire resistant", "Easy to waterproof"],
    limitations: ["Heavy weight", "Requires good drainage", "Thermal bridging", "Waterproofing maintenance"],
    applications: ["Residential buildings", "Commercial structures", "Most urban construction"],
    materialRequirements: "Concrete, steel reinforcement, waterproofing membrane, thermal insulation"
  },
  {
    id: 11,
    name: "Vaulted/Domed Roofs",
    category: "Roof Systems",
    systemType: "Traditional",
    materials: ["Stone", "Brick", "Mud brick"],
    description: "Traditional Islamic architectural influence. Curved surfaces span spaces without timber, providing excellent thermal performance and distinctive aesthetic.",
    advantages: ["No timber required", "Excellent acoustics", "Thermal performance", "Aesthetic appeal", "Cultural significance"],
    limitations: ["Skilled masons needed", "Lateral thrust forces", "Complex geometry", "Limited to specific uses"],
    applications: ["Mosques", "Historic restorations", "Bathhouses", "Cultural centers"],
    materialRequirements: "Stone or brick, skilled dome masons, centering for construction"
  },
  {
    id: 12,
    name: "Steel Truss Roofs",
    category: "Roof Systems",
    systemType: "Modern",
    materials: ["Structural steel", "Metal roofing", "Purlins"],
    description: "Industrial and commercial spans using prefabricated steel trusses. Enables large column-free spaces essential for warehouses, factories, and sports facilities.",
    advantages: ["Long spans possible", "Lightweight", "Fast erection", "Prefabricated quality"],
    limitations: ["Requires fire protection", "Corrosion protection needed", "Specialized design"],
    applications: ["Industrial buildings", "Warehouses", "Sports facilities", "Exhibition halls"],
    materialRequirements: "Steel truss sections, metal roofing sheets, purlins, crane for erection"
  },
  {
    id: 13,
    name: "Shear Walls",
    category: "Seismic Design",
    systemType: "Modern",
    materials: ["Reinforced concrete"],
    description: "Vertical structural walls designed to resist lateral forces from wind and earthquakes. Essential for tall buildings in Jordan's moderate seismic zone.",
    advantages: ["Excellent lateral resistance", "Controls building drift", "Good for tall buildings", "Stiffness control"],
    limitations: ["Fixed wall locations", "Limits floor plan flexibility", "Complex analysis required"],
    applications: ["High-rise buildings", "Elevator cores", "Stairwells", "Seismic regions"],
    materialRequirements: "High-strength concrete, dense steel reinforcement, specialized detailing"
  },
  {
    id: 14,
    name: "Moment Frames",
    category: "Seismic Design",
    systemType: "Modern",
    materials: ["Steel", "Reinforced concrete"],
    description: "Rigid frame connections between beams and columns resist lateral loads. Provides architectural flexibility but requires careful detailing for seismic zones.",
    advantages: ["Architectural flexibility", "No bracing required", "Open floor plans", "Ductile behavior"],
    limitations: ["More expensive connections", "Larger member sizes", "More complex design"],
    applications: ["Commercial buildings", "Hospitals", "Schools", "Public buildings"],
    materialRequirements: "Special connection details, moment-resisting connections, ductile reinforcement"
  },
  {
    id: 15,
    name: "Base Isolation",
    category: "Seismic Design",
    systemType: "Modern",
    materials: ["Elastomeric bearings", "Lead-rubber bearings", "Sliding bearings"],
    description: "Advanced seismic protection system that isolates the building from ground motion. Used for critical facilities and historic buildings requiring enhanced protection.",
    advantages: ["Reduces seismic forces", "Protects contents", "Minimal structural damage", "Ideal for critical facilities"],
    limitations: ["High initial cost", "Specialized engineering", "Maintenance required", "Limited applicability"],
    applications: ["Hospitals", "Data centers", "Museums", "Historic buildings"],
    materialRequirements: "Isolation bearings, flexible utility connections, moat space around building"
  }
];

const seismicInfo = [
  {
    title: "Jordan Seismic Zones",
    description: "Jordan is located in a moderate seismic zone along the Dead Sea Transform Fault. Building codes require seismic design for all structures, with increased requirements near the Jordan Valley.",
    icon: AlertTriangle
  },
  {
    title: "Building Code Requirements",
    description: "The Jordanian National Building Code mandates seismic design based on zone, soil type, building importance, and structural system. All buildings must be designed for lateral forces.",
    icon: Shield
  },
  {
    title: "Ductility Requirements",
    description: "Structural systems must provide ductile behavior with multiple load paths. Proper detailing of reinforcement and connections ensures buildings can absorb seismic energy safely.",
    icon: Layers
  }
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Load-Bearing Systems", label: "Load-Bearing Systems" },
  { value: "Frame Systems", label: "Frame Systems" },
  { value: "Foundation Systems", label: "Foundation Systems" },
  { value: "Roof Systems", label: "Roof Systems" },
  { value: "Seismic Design", label: "Seismic Design" }
];

const materials = [
  { value: "all", label: "All Materials" },
  { value: "Concrete", label: "Concrete" },
  { value: "Steel", label: "Steel" },
  { value: "Stone", label: "Stone/Masonry" },
  { value: "Earth", label: "Earth/Adobe" },
  { value: "Wood", label: "Wood/Timber" }
];

const systemTypes = [
  { value: "all", label: "All Types" },
  { value: "Traditional", label: "Traditional" },
  { value: "Modern", label: "Modern" },
  { value: "Traditional/Sustainable", label: "Sustainable" }
];

export default function ContextStructuralSystemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [savedSystems, setSavedSystems] = useState<Record<number, boolean>>({});

  const filteredSystems = structuralSystemsData.filter((system) => {
    const matchesSearch =
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.applications.some((app) => app.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || system.category === selectedCategory;
    const matchesMaterial = selectedMaterial === "all" || system.materials.some((mat) => mat.toLowerCase().includes(selectedMaterial.toLowerCase()));
    const matchesType = selectedType === "all" || system.systemType.includes(selectedType);
    return matchesSearch && matchesCategory && matchesMaterial && matchesType;
  });

  const toggleSaveSystem = (id: number) => {
    setSavedSystems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Load-Bearing Systems": return Building;
      case "Frame Systems": return Columns;
      case "Foundation Systems": return Mountain;
      case "Roof Systems": return Home;
      case "Seismic Design": return Shield;
      default: return Box;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="border-b bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-accent">
              <Columns className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Context Resource</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl mb-4" data-testid="text-page-title">
              Structural Systems
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Comprehensive guide to structural systems used in Jordanian architecture — from traditional 
              load-bearing masonry to modern reinforced concrete and steel frames. Explore materials, 
              applications, seismic considerations, and design requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-background py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search structural systems, materials, or applications..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className="w-[160px]" data-testid="select-material">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat.value} value={mat.value}>{mat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px]" data-testid="select-type">
                  <SelectValue placeholder="System Type" />
                </SelectTrigger>
                <SelectContent>
                  {systemTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(selectedCategory !== "all" || selectedMaterial !== "all" || selectedType !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedMaterial("all");
                    setSelectedType("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-serif text-2xl font-bold">Structural Systems</h2>
          <p className="text-muted-foreground">{filteredSystems.length} systems found</p>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="grid" data-testid="tab-grid-view">Grid View</TabsTrigger>
            <TabsTrigger value="category" data-testid="tab-category-view">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSystems.map((system) => {
                const CategoryIcon = getCategoryIcon(system.category);
                return (
                  <Card
                    key={system.id}
                    className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent"
                    data-testid={`card-system-${system.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="default">{system.systemType}</Badge>
                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{system.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit text-xs">{system.category}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-3">{system.description}</CardDescription>
                      
                      <div>
                        <p className="text-sm font-semibold mb-2">Materials</p>
                        <div className="flex flex-wrap gap-1">
                          {system.materials.map((material, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Advantages</p>
                        <ul className="space-y-1">
                          {system.advantages.slice(0, 3).map((adv, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="mt-1.5 h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                              {adv}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Limitations</p>
                        <ul className="space-y-1">
                          {system.limitations.slice(0, 2).map((lim, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="mt-1.5 h-1 w-1 rounded-full bg-orange-500 flex-shrink-0" />
                              {lim}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Applications</p>
                        <ul className="space-y-1">
                          {system.applications.slice(0, 3).map((app, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <div className="mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                              {app}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSaveSystem(system.id)}
                          className={`flex-1 ${savedSystems[system.id] ? "bg-accent/10 text-accent" : ""}`}
                          data-testid={`button-save-${system.id}`}
                        >
                          <Bookmark className={`h-4 w-4 mr-2 ${savedSystems[system.id] ? "fill-current" : ""}`} />
                          {savedSystems[system.id] ? "Saved" : "Save"}
                        </Button>
                        <SocialInteractions
                          contentId={system.id.toString()}
                          contentType="structural-system"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredSystems.length === 0 && (
              <div className="text-center py-12">
                <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No systems found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="category">
            {categories.filter(c => c.value !== "all").map((category) => {
              const categoryItems = filteredSystems.filter(s => s.category === category.value);
              if (categoryItems.length === 0) return null;
              const CategoryIcon = getCategoryIcon(category.value);
              return (
                <div key={category.value} className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <CategoryIcon className="h-6 w-6 text-accent" />
                    <h3 className="font-serif text-xl font-bold">{category.label}</h3>
                    <Badge variant="secondary">{categoryItems.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryItems.map((system) => (
                      <Card key={system.id} className="transition-all duration-200 hover:border-accent">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="default" className="text-xs">{system.systemType}</Badge>
                          </div>
                          <CardTitle className="text-base">{system.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{system.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {system.materials.slice(0, 3).map((mat, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{mat}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSaveSystem(system.id)}
                              className={`flex-1 ${savedSystems[system.id] ? "bg-accent/10 text-accent" : ""}`}
                              data-testid={`button-save-cat-${system.id}`}
                            >
                              <Bookmark className={`h-4 w-4 mr-2 ${savedSystems[system.id] ? "fill-current" : ""}`} />
                              {savedSystems[system.id] ? "Saved" : "Save"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </section>

      <section className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <h2 className="font-serif text-2xl font-bold mb-8">Seismic Design Considerations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {seismicInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group rounded-lg border bg-background p-6 transition-all duration-200 hover:border-accent hover:shadow-md"
                  data-testid={`card-seismic-${index}`}
                >
                  <Icon className="h-10 w-10 text-accent mb-4 transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="font-serif text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="container mx-auto px-4 py-12">
          <h2 className="font-serif text-2xl font-bold mb-6">Material Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-semibold">Material</th>
                  <th className="p-3 text-left font-semibold">Strength</th>
                  <th className="p-3 text-left font-semibold">Durability</th>
                  <th className="p-3 text-left font-semibold">Cost</th>
                  <th className="p-3 text-left font-semibold">Sustainability</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-3 font-semibold">Reinforced Concrete</td>
                  <td className="p-3 text-muted-foreground">High compression</td>
                  <td className="p-3 text-muted-foreground">Excellent</td>
                  <td className="p-3 text-muted-foreground">Moderate</td>
                  <td className="p-3 text-muted-foreground">High embodied energy</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-3 font-semibold">Structural Steel</td>
                  <td className="p-3 text-muted-foreground">High tension & compression</td>
                  <td className="p-3 text-muted-foreground">Good (with protection)</td>
                  <td className="p-3 text-muted-foreground">Higher</td>
                  <td className="p-3 text-muted-foreground">Recyclable</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-3 font-semibold">Stone Masonry</td>
                  <td className="p-3 text-muted-foreground">Good compression</td>
                  <td className="p-3 text-muted-foreground">Excellent</td>
                  <td className="p-3 text-muted-foreground">Variable</td>
                  <td className="p-3 text-muted-foreground">Low embodied energy</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-3 font-semibold">Adobe/Mud Brick</td>
                  <td className="p-3 text-muted-foreground">Low to moderate</td>
                  <td className="p-3 text-muted-foreground">Moderate (if maintained)</td>
                  <td className="p-3 text-muted-foreground">Very low</td>
                  <td className="p-3 text-muted-foreground">Very sustainable</td>
                </tr>
                <tr className="border-b transition-colors hover:bg-accent/5">
                  <td className="p-3 font-semibold">Timber</td>
                  <td className="p-3 text-muted-foreground">Moderate</td>
                  <td className="p-3 text-muted-foreground">Good (with treatment)</td>
                  <td className="p-3 text-muted-foreground">Variable (imported)</td>
                  <td className="p-3 text-muted-foreground">Renewable, carbon storage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">Explore More Context Resources</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Deepen your understanding of Jordanian architecture with our curated context resources.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/context/history-map">
                <Button variant="outline" className="gap-2" data-testid="link-history-map">
                  History Map
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/context/styles">
                <Button variant="outline" className="gap-2" data-testid="link-styles">
                  Architectural Styles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/context/plants">
                <Button variant="outline" className="gap-2" data-testid="link-plants">
                  Natural Environment
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
