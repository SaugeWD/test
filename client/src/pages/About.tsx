import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen, Briefcase, Users, Globe, Heart, Mail, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl font-bold mb-6">About ArchNet Jordan</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your gateway to the architectural community in Jordan and beyond. We connect architects, students, and
            enthusiasts with resources, opportunities, and each other.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ArchNet Jordan was founded with a simple yet powerful vision: to create a unified platform that brings
                together all architectural resources, opportunities, and community in one accessible place.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe that access to knowledge, competitions, and professional networks shouldn't be fragmented
                across countless sources. By centralizing these resources, we empower the next generation of architects
                to learn, grow, and contribute to the built environment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Starting from Jordan, our goal is to expand globally, connecting architectural communities across
                borders and fostering collaboration on the challenges facing our built environment.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="text-center p-6">
                <Globe className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-2xl mb-2">Global Reach</h3>
                <p className="text-sm text-muted-foreground">Connecting architects worldwide</p>
              </Card>
              <Card className="text-center p-6">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-2xl mb-2">2,800+</h3>
                <p className="text-sm text-muted-foreground">Community members</p>
              </Card>
              <Card className="text-center p-6">
                <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-2xl mb-2">500+</h3>
                <p className="text-sm text-muted-foreground">Books & resources</p>
              </Card>
              <Card className="text-center p-6">
                <Trophy className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold text-2xl mb-2">100+</h3>
                <p className="text-sm text-muted-foreground">Competitions listed</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Competitions</CardTitle>
                <CardDescription>
                  Discover global architecture competitions with deadlines, requirements, and prize information.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Books & Research</CardTitle>
                <CardDescription>
                  Access a comprehensive digital library of architecture books, journals, and academic papers.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Briefcase className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Jobs & Internships</CardTitle>
                <CardDescription>
                  Find architectural opportunities from entry-level internships to senior positions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Connect with architects, share projects, and engage in meaningful discussions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Context & Heritage</CardTitle>
                <CardDescription>
                  Explore local architectural context, history, and heritage for informed design decisions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-accent mb-4" />
                <CardTitle>Free & Open</CardTitle>
                <CardDescription>
                  Most resources are free to access, supporting education and professional development.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="mailto:hello@archnetjordan.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/community">
                <MessageSquare className="mr-2 h-4 w-4" />
                Join Community
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
