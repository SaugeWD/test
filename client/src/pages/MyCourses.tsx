import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Lock } from "lucide-react";

export default function MyCoursesPage() {
  // Example course placeholders for the coming soon state
  const exampleCourses = [
    {
      id: "1",
      title: "Architectural History & Theory",
      instructor: "Prof. James Mitchell",
      level: "Intermediate",
      progress: 0,
    },
    {
      id: "2",
      title: "Digital Design Fundamentals",
      instructor: "Dr. Sarah Chen",
      level: "Beginner",
      progress: 0,
    },
    {
      id: "3",
      title: "Sustainable Building Design",
      instructor: "Prof. Michael Torres",
      level: "Advanced",
      progress: 0,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="border-b bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h1 className="font-serif text-4xl font-bold">My Courses</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore your enrolled courses and continue your learning journey.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Coming Soon Message */}
          <Card className="mb-12">
            <CardContent className="py-16 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-serif font-bold mb-2">Coming Soon</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your subscribed courses will appear here
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Courses are coming soon to the platform. Start exploring available courses and subscribe to begin your learning journey.
              </p>
            </CardContent>
          </Card>

          {/* Example Course Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Example Courses</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exampleCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover-elevate relative" data-testid={`card-course-${course.id}`}>
                  {/* Placeholder Course Image */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                  </div>

                  {/* Coming Soon Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-medium">Course features coming soon</p>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 flex-1">{course.title}</CardTitle>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {course.level}
                      </Badge>
                    </div>
                    <CardDescription>{course.instructor}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button className="w-full" disabled>
                      View Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-secondary/30">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Want to start learning?</h3>
              <p className="text-muted-foreground mb-6">
                Explore more content in the Books, Projects, and Research sections while courses are being developed.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="outline" asChild>
                  <a href="/books">Browse Books</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/projects">View Projects</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/research">Explore Research</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
