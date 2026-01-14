import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SocialInteractions } from "@/components/SocialInteractions";
import {
  Search,
  BookOpen,
  Download,
  Filter,
  GraduationCap,
  FileText,
  X,
  Scale,
  Users,
  Calendar,
  Quote,
  Loader2,
  Upload,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUpload } from "@/hooks/use-upload";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  university: string;
  year: number;
  language: string;
  category: string;
  abstract: string;
  citations: number;
  pdfUrl: string | null;
  image: string | null;
  downloads: number;
  likes: number;
  comments: number;
}

const categories = ["all", "Sustainability", "Heritage", "Technology", "Urban Planning", "Theory", "Design"];
const languages = ["all", "Arabic", "English"];
const universities = [
  "all",
  "University of Jordan",
  "German Jordanian University",
  "Jordan University of Science and Technology",
  "Al-Balqa Applied University",
  "Yarmouk University",
  "Hashemite University",
];

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload();

  // Submit form state
  const [submitForm, setSubmitForm] = useState({
    title: "",
    abstract: "",
    authors: "",
    category: "",
    language: "",
    university: "",
    pdfFile: null as File | null,
    image: "",
  });

  // Fetch research papers from API
  const { data: research = [], isLoading } = useQuery<ResearchPaper[]>({
    queryKey: ["/api/research"],
    queryFn: async () => {
      const response = await fetch("/api/research", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch research");
      const data = await response.json();
      // Map API response to ResearchPaper interface, adding default values for missing fields
      return data.map((paper: any) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors || "Unknown",
        university: paper.university || "Unknown",
        year: paper.publishedYear ? parseInt(paper.publishedYear) : new Date().getFullYear(),
        language: paper.language || "English",
        category: paper.category || "General",
        abstract: paper.abstract || "",
        citations: paper.citations || 0,
        pdfUrl: paper.pdfUrl,
        image: paper.image || null,
        downloads: 0,
        likes: 0,
        comments: 0,
      }));
    },
  });

  // Submit research mutation
  const submitResearch = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/research", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Research submitted successfully!",
        description: "Your research will be reviewed and published soon.",
      });
      setSubmitForm({
        title: "",
        abstract: "",
        authors: "",
        category: "",
        language: "",
        university: "",
        pdfFile: null,
        image: "",
      });
      setSubmitDialogOpen(false);
      // Invalidate and refetch research query
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit research",
        description: error.message || "An error occurred while submitting your research.",
        variant: "destructive",
      });
    },
  });

  const filteredResearch = research
    .filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || paper.category === selectedCategory;
      const matchesLanguage = selectedLanguage === "all" || paper.language === selectedLanguage;
      const matchesUniversity = selectedUniversity === "all" || paper.university === selectedUniversity;
      return matchesSearch && matchesCategory && matchesLanguage && matchesUniversity;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return b.year - a.year;
      if (sortBy === "citations") return b.citations - a.citations;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "popular") return b.likes - a.likes;
      return 0;
    });

  const handleCompareToggle = (paperId: string) => {
    setSelectedPapers((prev) =>
      prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId]
    );
  };

  const handleSubmitResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.abstract || !submitForm.authors || !submitForm.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    // Submit to API using mutation
    submitResearch.mutate({
      title: submitForm.title,
      abstract: submitForm.abstract,
      authors: submitForm.authors,
      category: submitForm.category,
      language: submitForm.language || undefined,
      university: submitForm.university || undefined,
      pdfUrl: submitForm.pdfFile ? submitForm.pdfFile.name : undefined,
      image: submitForm.image || undefined,
    });
  };

  const selectedPapersData = research.filter((p) => selectedPapers.includes(p.id));

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b bg-secondary/30 py-12" data-testid="section-hero">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 px-4 py-2">
              <BookOpen className="mr-2 h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Research Hub</span>
            </div>
            <h1 className="font-serif text-4xl font-bold md:text-5xl text-balance" data-testid="heading-research-hub">
              Research Hub
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Explore architectural research shaping the future — from Jordanian universities and practitioners
            </p>
            <div className="mt-6">
              <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" data-testid="button-submit-research">
                    Submit Your Research
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Submit Research Paper</DialogTitle>
                    <DialogDescription>
                      Share your architectural research with the ArchNet community. All submissions are reviewed before
                      publication.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmitResearch} className="space-y-6" data-testid="form-submit-research">
                    <div className="space-y-2">
                      <Label htmlFor="submit-title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="submit-title"
                        placeholder="Enter research paper title"
                        value={submitForm.title}
                        onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                        data-testid="input-submit-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submit-authors">
                        Authors <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="submit-authors"
                        placeholder="e.g., Dr. Sarah Ahmed, Prof. Omar Hassan (comma-separated)"
                        value={submitForm.authors}
                        onChange={(e) => setSubmitForm({ ...submitForm, authors: e.target.value })}
                        data-testid="input-submit-authors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submit-university">University/Institution</Label>
                      <Input
                        id="submit-university"
                        placeholder="Enter university or institution name"
                        value={submitForm.university}
                        onChange={(e) => setSubmitForm({ ...submitForm, university: e.target.value })}
                        data-testid="input-submit-university"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="submit-category">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={submitForm.category}
                          onValueChange={(val) => setSubmitForm({ ...submitForm, category: val })}
                        >
                          <SelectTrigger id="submit-category" data-testid="select-submit-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                            <SelectItem value="Theory">Theory</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Sustainability">Sustainability</SelectItem>
                            <SelectItem value="Heritage">Heritage</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="submit-language">Language</Label>
                        <Select
                          value={submitForm.language}
                          onValueChange={(val) => setSubmitForm({ ...submitForm, language: val })}
                        >
                          <SelectTrigger id="submit-language" data-testid="select-submit-language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submit-abstract">
                        Abstract <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="submit-abstract"
                        placeholder="Enter research abstract (200-500 words)"
                        rows={6}
                        value={submitForm.abstract}
                        onChange={(e) => setSubmitForm({ ...submitForm, abstract: e.target.value })}
                        data-testid="textarea-submit-abstract"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submit-image">Cover Image</Label>
                      <div className="flex items-center gap-4">
                        {submitForm.image ? (
                          <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted">
                            <img src={submitForm.image} alt="Cover" className="w-full h-full object-cover" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                              onClick={() => setSubmitForm({ ...submitForm, image: "" })}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button type="button" variant="outline" className="relative" disabled={isUploading}>
                            <label htmlFor="submit-image" className="cursor-pointer flex items-center">
                              {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ImageIcon className="mr-2 h-4 w-4" />
                              )}
                              Upload Cover Image
                              <input
                                id="submit-image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadFile(file);
                                    if (url) setSubmitForm({ ...submitForm, image: url });
                                  }
                                }}
                                data-testid="input-submit-image"
                              />
                            </label>
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Optional: Add a cover image for your research paper</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submit-pdf">PDF Document</Label>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="relative" asChild>
                          <label htmlFor="submit-pdf" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            {submitForm.pdfFile ? "Change PDF" : "Upload PDF"}
                            <input
                              id="submit-pdf"
                              type="file"
                              accept=".pdf"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSubmitForm({ ...submitForm, pdfFile: file });
                              }}
                              data-testid="input-submit-pdf"
                            />
                          </label>
                        </Button>
                        {submitForm.pdfFile && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{submitForm.pdfFile.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSubmitForm({ ...submitForm, pdfFile: null })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setSubmitDialogOpen(false)} disabled={submitResearch.isPending}>
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-submit-research-form" disabled={submitResearch.isPending}>
                        {submitResearch.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Research"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b bg-background py-6" data-testid="section-filters">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search research, authors, keywords..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-research"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]" data-testid="select-category">
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
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[160px]" data-testid="select-language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language === "all" ? "All Languages" : language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="w-[220px]" data-testid="select-university">
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university === "all" ? "All Universities" : university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="citations">Most Cited</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                <Filter className="inline h-4 w-4 mr-1" />
                {filteredResearch.length} research papers found
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Papers List */}
      <section className="py-12" data-testid="section-papers">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>Loading research papers...</p>
              </div>
            </div>
          ) : filteredResearch.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No research papers found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResearch.map((paper) => (
                <Link 
                  key={paper.id}
                  href={`/research/${paper.id}`}
                  className="block"
                >
                  <Card
                    className="overflow-hidden hover-elevate cursor-pointer"
                    data-testid={`card-research-${paper.id}`}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image on left */}
                      <div className="shrink-0 w-full md:w-56 h-40 md:h-auto bg-muted overflow-hidden">
                        {paper.image ? (
                          <img 
                            src={paper.image} 
                            alt={paper.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <BookOpen className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content on right */}
                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Category and Year badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {paper.category}
                            </Badge>
                            {paper.language && (
                              <Badge variant="secondary" className="text-xs">
                                {paper.language}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{paper.year}</span>
                          </div>

                          {/* Title */}
                          <h3
                            className="font-semibold text-lg leading-tight line-clamp-2"
                            data-testid={`text-title-${paper.id}`}
                          >
                            {paper.title}
                          </h3>

                          {/* Authors */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1" data-testid={`text-authors-${paper.id}`}>
                              {paper.authors}
                            </span>
                          </div>

                          {/* University */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GraduationCap className="h-4 w-4 flex-shrink-0" />
                            <span data-testid={`text-university-${paper.id}`}>{paper.university}</span>
                          </div>

                          {/* Abstract preview */}
                          <p
                            className="text-sm text-muted-foreground line-clamp-2"
                            data-testid={`text-abstract-${paper.id}`}
                          >
                            {paper.abstract}
                          </p>
                        </div>

                        {/* Footer stats */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {paper.citations} citations
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3.5 w-3.5" />
                              {paper.downloads} downloads
                            </span>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                            <Checkbox
                              id={`compare-${paper.id}`}
                              checked={selectedPapers.includes(paper.id)}
                              onCheckedChange={() => handleCompareToggle(paper.id)}
                              data-testid={`checkbox-compare-${paper.id}`}
                            />
                            <label
                              htmlFor={`compare-${paper.id}`}
                              className="text-xs cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Compare
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Compare Bar */}
      {selectedPapers.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          data-testid="compare-bar"
        >
          <Card className="shadow-lg">
            <CardContent className="flex items-center gap-4 p-4">
              <Scale className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">
                {selectedPapers.length} paper{selectedPapers.length > 1 ? "s" : ""} selected
              </span>
              <Button variant="outline" size="sm" onClick={() => setSelectedPapers([])}>
                Clear
              </Button>
              <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={selectedPapers.length < 2} data-testid="button-compare">
                    Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Research Comparison</DialogTitle>
                    <DialogDescription>
                      Comparing {selectedPapersData.length} research papers
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4" data-testid="compare-modal-content">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium text-muted-foreground">Attribute</th>
                            {selectedPapersData.map((paper) => (
                              <th key={paper.id} className="text-left p-2 font-medium">
                                {paper.title.length > 30 ? paper.title.substring(0, 30) + "..." : paper.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Authors</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                {paper.authors}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">University</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                {paper.university}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Year</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                {paper.year}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Language</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                <Badge variant="secondary">
                                  {paper.language}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Category</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                <Badge variant="outline">
                                  {paper.category}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Citations</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2 font-semibold">
                                {paper.citations}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="p-2 font-medium text-muted-foreground">Downloads</td>
                            {selectedPapersData.map((paper) => (
                              <td key={paper.id} className="p-2">
                                {paper.downloads}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
