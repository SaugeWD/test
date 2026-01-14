import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Leaf, Building2, Construction, Clock, Sun, Wind, Droplets, TreePine } from "lucide-react";

const historyPeriods = [
  {
    era: "Ancient",
    period: "3000 BCE - 500 CE",
    description: "Encompasses Egyptian, Greek, and Roman civilizations. Characterized by monumental structures, mathematical precision, and enduring stone construction techniques.",
    characteristics: ["Columns and orders", "Symmetry", "Monumental scale", "Stone masonry"],
  },
  {
    era: "Medieval",
    period: "500 - 1500 CE",
    description: "Includes Romanesque and Gothic styles. Features heavy stone walls, rounded and pointed arches, ribbed vaults, and flying buttresses enabling tall cathedral construction.",
    characteristics: ["Pointed arches", "Flying buttresses", "Stained glass", "Ribbed vaults"],
  },
  {
    era: "Renaissance & Baroque",
    period: "1400 - 1750",
    description: "Revival of classical ideals with emphasis on proportion and harmony. Baroque added drama, grandeur, and ornate decoration to create emotional impact.",
    characteristics: ["Classical orders", "Domes", "Symmetry", "Ornate decoration"],
  },
  {
    era: "Industrial Revolution",
    period: "1750 - 1900",
    description: "Introduction of iron, steel, and glass enabled new structural possibilities. The Crystal Palace and Eiffel Tower exemplified engineering innovation.",
    characteristics: ["Iron frames", "Glass facades", "Prefabrication", "Railway stations"],
  },
  {
    era: "Modernism",
    period: "1900 - 1970",
    description: "Bauhaus and International Style rejected ornamentation. Form follows function became the guiding principle, with emphasis on open plans and industrial materials.",
    characteristics: ["Clean lines", "Open floor plans", "Glass curtain walls", "Pilotis"],
  },
  {
    era: "Post-Modernism",
    period: "1970 - 2000",
    description: "Reaction against Modernist austerity. Embraced historical references, color, symbolism, and wit while challenging the notion of a single architectural truth.",
    characteristics: ["Historical references", "Bold colors", "Irony", "Mixed styles"],
  },
  {
    era: "Contemporary",
    period: "2000 - Present",
    description: "Diverse approaches including sustainable design, parametric forms, and contextual sensitivity. Technology enables complex geometries and adaptive facades.",
    characteristics: ["Sustainability", "Digital fabrication", "Contextual design", "Adaptive reuse"],
  },
];

const environmentalFactors = [
  {
    factor: "Climate Analysis",
    description: "Understanding local climate zones is essential for appropriate design responses. Hot-arid climates require thermal mass and shading, temperate zones balance heating and cooling, tropical regions prioritize ventilation, and cold climates emphasize insulation and solar gain.",
    icon: Sun,
  },
  {
    factor: "Site Orientation",
    description: "Building orientation affects solar exposure, natural lighting, and energy efficiency. Proper orientation maximizes beneficial sun angles while minimizing overheating, considering prevailing winds and views.",
    icon: Landmark,
  },
  {
    factor: "Natural Ventilation",
    description: "Cross-ventilation and stack effect strategies reduce mechanical cooling needs. Window placement, building form, and internal layout influence air movement patterns and thermal comfort.",
    icon: Wind,
  },
  {
    factor: "Passive Solar Design",
    description: "Harnessing solar energy through building design reduces heating costs. South-facing glazing, thermal mass, and proper shading devices work together to collect, store, and distribute solar heat.",
    icon: Droplets,
  },
  {
    factor: "Sustainable Materials",
    description: "Material selection impacts embodied energy, indoor air quality, and building longevity. Local, renewable, and recycled materials reduce environmental footprint while supporting regional economies.",
    icon: TreePine,
  },
];

const architecturalStyles = [
  {
    style: "Brutalism",
    description: "Raw concrete construction expressing structural honesty and sculptural form. Characterized by massive, fortress-like appearances with exposed building systems.",
    architects: ["Le Corbusier", "Paul Rudolph", "Tadao Ando"],
  },
  {
    style: "Deconstructivism",
    description: "Challenges conventional form through fragmentation, distortion, and unpredictability. Creates dynamic tension by dismantling architectural conventions.",
    architects: ["Frank Gehry", "Zaha Hadid", "Daniel Libeskind"],
  },
  {
    style: "Minimalism",
    description: "Reduces architecture to essential elements using simple forms, monochromatic palettes, and refined details. Emphasizes space, light, and material quality.",
    architects: ["John Pawson", "Alberto Campo Baeza", "Claudio Silvestrin"],
  },
  {
    style: "High-tech",
    description: "Celebrates technology and industrial aesthetics by exposing structural and mechanical systems. Uses prefabricated elements and innovative engineering solutions.",
    architects: ["Norman Foster", "Richard Rogers", "Renzo Piano"],
  },
  {
    style: "Parametricism",
    description: "Uses computational design to generate complex, fluid forms based on algorithmic parameters. Creates organic geometries impossible with traditional methods.",
    architects: ["Zaha Hadid", "Patrik Schumacher", "MAD Architects"],
  },
  {
    style: "Sustainable/Green Architecture",
    description: "Prioritizes environmental responsibility through energy efficiency, renewable materials, and ecological integration. Aims for net-zero or regenerative building performance.",
    architects: ["Ken Yeang", "William McDonough", "Stefano Boeri"],
  },
];

const structuralSystems = [
  {
    system: "Load-bearing Walls",
    description: "Walls carry building loads directly to the foundation. Traditional approach using masonry, stone, or concrete that limits opening sizes and flexibility.",
    uses: ["Residential buildings", "Low-rise construction", "Historical restoration"],
  },
  {
    system: "Frame Structures",
    description: "Steel or concrete skeleton carries loads, freeing walls from structural duty. Enables flexible floor plans, large openings, and curtain wall facades.",
    uses: ["High-rise buildings", "Commercial spaces", "Industrial facilities"],
  },
  {
    system: "Shell Structures",
    description: "Thin curved surfaces distribute loads through membrane action. Efficient for spanning large areas with minimal material using concrete, steel, or timber.",
    uses: ["Sports arenas", "Exhibition halls", "Airport terminals"],
  },
  {
    system: "Tensile Structures",
    description: "Membrane or cable systems work primarily in tension. Creates lightweight, dynamic forms suitable for temporary or permanent roofing solutions.",
    uses: ["Stadium roofs", "Temporary pavilions", "Canopy structures"],
  },
  {
    system: "Cable-stayed Structures",
    description: "Cables attached to towers support horizontal elements. Enables long spans with elegant profiles, commonly used in bridges and roof systems.",
    uses: ["Bridges", "Large-span roofs", "Suspended walkways"],
  },
];

export default function ContextSystemsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Landmark className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl font-bold">Context Systems</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore architectural history, environmental considerations, design styles, and structural systems to inform your design decisions.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="history" data-testid="tab-history">
                <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
                History Map
              </TabsTrigger>
              <TabsTrigger value="environmental" data-testid="tab-environmental">
                <Leaf className="h-4 w-4 mr-2 hidden sm:inline" />
                Environmental
              </TabsTrigger>
              <TabsTrigger value="styles" data-testid="tab-styles">
                <Building2 className="h-4 w-4 mr-2 hidden sm:inline" />
                Styles
              </TabsTrigger>
              <TabsTrigger value="structural" data-testid="tab-structural">
                <Construction className="h-4 w-4 mr-2 hidden sm:inline" />
                Structural
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold mb-2">Architectural History Periods</h2>
                <p className="text-muted-foreground">A timeline of major architectural movements and their defining characteristics.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {historyPeriods.map((period) => (
                  <Card key={period.era} data-testid={`card-history-${period.era.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle>{period.era}</CardTitle>
                        <Badge variant="outline">{period.period}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">{period.description}</CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {period.characteristics.map((char) => (
                          <Badge key={char} variant="secondary" className="text-xs">{char}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="environmental">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold mb-2">Environmental Context</h2>
                <p className="text-muted-foreground">Natural and environmental considerations for sustainable architectural design.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {environmentalFactors.map((factor) => (
                  <Card key={factor.factor} data-testid={`card-env-${factor.factor.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <factor.icon className="h-6 w-6 text-accent" />
                        <CardTitle>{factor.factor}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{factor.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="styles">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold mb-2">Architectural Styles</h2>
                <p className="text-muted-foreground">Major contemporary architectural movements and their notable practitioners.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {architecturalStyles.map((style) => (
                  <Card key={style.style} data-testid={`card-style-${style.style.toLowerCase().replace(/[\s/]+/g, "-")}`}>
                    <CardHeader>
                      <CardTitle>{style.style}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">{style.description}</CardDescription>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Notable Architects:</p>
                        <div className="flex flex-wrap gap-2">
                          {style.architects.map((architect) => (
                            <Badge key={architect} variant="outline" className="text-xs">{architect}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="structural">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold mb-2">Structural Systems</h2>
                <p className="text-muted-foreground">Common building structure types and their typical applications.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {structuralSystems.map((system) => (
                  <Card key={system.system} data-testid={`card-struct-${system.system.toLowerCase().replace(/[\s-]+/g, "-")}`}>
                    <CardHeader>
                      <CardTitle>{system.system}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">{system.description}</CardDescription>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Typical Uses:</p>
                        <div className="flex flex-wrap gap-2">
                          {system.uses.map((use) => (
                            <Badge key={use} variant="secondary" className="text-xs">{use}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
