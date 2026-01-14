import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, Briefcase, ArrowRight, Wrench, Rss, GraduationCap, Award } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl text-balance">
              Your Global Gateway to Architecture
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed md:text-xl text-pretty">
              Starting from Jordan — Discover global competitions, resources, opportunities, and connect with the
              architectural community worldwide.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-explore-feed">
                <Link href="/feed">
                  <Rss className="mr-2 h-4 w-4" />
                  Explore Feed
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-explore-competitions">
                <Link href="/competitions">
                  Explore Competitions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/community">Join Community</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Rss className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Feed</CardTitle>
              <CardDescription>Personalized updates from the architectural community</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/feed"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                View your feed
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Competitions</CardTitle>
              <CardDescription>Global architecture competitions with deadlines and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/competitions"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                View all competitions
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Books & References</CardTitle>
              <CardDescription>
                Global digital library of architecture books, magazines, and academic resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/books"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                Browse library
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Briefcase className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Jobs & Internships</CardTitle>
              <CardDescription>Find architectural opportunities and internships across Jordan</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/jobs"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                Find opportunities
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Research Hub</CardTitle>
              <CardDescription>
                Academic papers, theses, and architectural research from around the world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/research"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                Explore research
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Wrench className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Tools and Software</CardTitle>
              <CardDescription>Essential architectural analysis tools and software for design</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/tools"
                className="inline-flex items-center text-sm font-medium text-accent group-hover:underline"
              >
                Explore tools
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold">Featured Competitions</h2>
              <p className="mt-2 text-muted-foreground">Global opportunities you don't want to miss</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent">
              <Link href="/competitions">View All</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Jordan National Museum Design Competition",
                deadline: "March 15, 2025",
                prize: "$50,000",
                status: "Ongoing",
                category: "Cultural",
              },
              {
                title: "Sustainable Housing Initiative Amman",
                deadline: "April 20, 2025",
                prize: "$30,000",
                status: "Ongoing",
                category: "Residential",
              },
              {
                title: "Petra Visitor Center Redesign",
                deadline: "May 10, 2025",
                prize: "$40,000",
                status: "Upcoming",
                category: "Tourism",
              },
            ].map((competition, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-lg" data-testid={`card-competition-${index}`}>
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20" />
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={competition.status === "Ongoing" ? "default" : "secondary"}>
                      {competition.status}
                    </Badge>
                    <Badge variant="outline">{competition.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{competition.title}</CardTitle>
                  <CardDescription>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Deadline: {competition.deadline}</span>
                      <span className="font-semibold text-accent">{competition.prize}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/competitions">View All Competitions</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y bg-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-6 w-6 text-accent" />
                <h2 className="font-serif text-3xl font-bold">Competition Highlights</h2>
              </div>
              <p className="text-muted-foreground">Recent competition winners and outstanding submissions</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent">
              <Link href="/competitions">View All Results</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                competition: "Jordan National Museum Design",
                winner: "Sarah Al-Masri",
                username: "sarah-almasri",
                projectTitle: "Heritage Reimagined",
                prize: "1st Place - $50,000",
                isVerified: true,
              },
              {
                competition: "Sustainable Housing Initiative",
                winner: "Ahmad Khalil",
                username: "ahmad-khalil",
                projectTitle: "Green Living Amman",
                prize: "1st Place - $30,000",
                isVerified: true,
              },
              {
                competition: "Petra Visitor Center Redesign",
                winner: "Layla Hassan",
                username: "layla-hassan",
                projectTitle: "Desert Gateway",
                prize: "1st Place - $40,000",
                isVerified: false,
              },
            ].map((winner, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video overflow-hidden relative bg-gradient-to-br from-accent/30 to-primary/30">
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-accent text-accent-foreground">
                      <Trophy className="mr-1 h-3 w-3" />
                      Winner
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {winner.competition}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{winner.projectTitle}</CardTitle>
                  <CardDescription>
                    <Link
                      href={`/profile/${winner.username}`}
                      className="flex items-center gap-1.5 hover:text-accent transition-colors"
                    >
                      <span>by {winner.winner}</span>
                      {winner.isVerified && <VerificationBadge type="architect" size="sm" />}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-accent">{winner.prize}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold">Popular Books</h2>
              <p className="mt-2 text-muted-foreground">Essential reading for architects worldwide</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent">
              <Link href="/books">Browse Library</Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Architectural Theory", author: "Various Authors", category: "Theory" },
              { title: "Sustainable Design Principles", author: "Dr. Ahmad Hassan", category: "Sustainability" },
              { title: "Urban Planning in MENA", author: "Sarah Al-Masri", category: "Urban Planning" },
              { title: "Construction Methods", author: "Engineering Dept.", category: "Construction" },
            ].map((book, index) => (
              <Card key={index} className="transition-all hover:shadow-lg" data-testid={`card-book-${index}`}>
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10" />
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {book.category}
                  </Badge>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/books">Browse All Books</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y bg-accent py-16 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">Join the ArchNet Community</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90 text-pretty">
            Connect with architects worldwide, share your work, and stay updated with global opportunities — starting
            from Jordan's vibrant architectural scene.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/community">Join Community</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent bg-transparent"
              asChild
            >
              <Link href="/projects">Share Your Work</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
