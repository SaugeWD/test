import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen, Briefcase, ArrowRight, Wrench, Rss, GraduationCap } from "lucide-react";

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
