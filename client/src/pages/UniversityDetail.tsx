import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  ArrowLeft,
  Calendar,
  BookOpen,
  Building2,
  Loader2
} from "lucide-react";

// Jordanian universities with Architecture programs
const JORDANIAN_UNIVERSITIES = [
  { id: "uj", name: "University of Jordan", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Public", founded: 1962, description: "The University of Jordan is the largest and oldest university in Jordan, known for its strong architecture program and research facilities." },
  { id: "just", name: "Jordan University of Science and Technology", city: "Irbid", programs: ["Architecture", "Urban Planning"], type: "Public", founded: 1986, description: "JUST is a leading technical university with a focus on science and technology, offering comprehensive architecture and urban planning programs." },
  { id: "gju", name: "German Jordanian University", city: "Amman", programs: ["Architecture", "Interior Architecture"], type: "Public", founded: 2005, description: "GJU follows the German model of applied sciences, offering a unique architecture curriculum with international standards." },
  { id: "asu", name: "Applied Science Private University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1991, description: "ASU offers practical, hands-on architecture education with modern facilities and industry connections." },
  { id: "petra", name: "Petra University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1991, description: "Petra University provides quality architecture education with a focus on sustainable design and local heritage." },
  { id: "philadelphia", name: "Philadelphia University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1989, description: "Philadelphia University has a well-established architecture faculty with strong community engagement." },
  { id: "aau", name: "Al-Ahliyya Amman University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1990, description: "AAU offers a comprehensive architecture program with emphasis on design innovation and professional practice." },
  { id: "hu", name: "Hashemite University", city: "Zarqa", programs: ["Architecture"], type: "Public", founded: 1995, description: "The Hashemite University provides quality architecture education with a focus on environmental sustainability." },
  { id: "zu", name: "Zarqa University", city: "Zarqa", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1994, description: "Zarqa University offers accessible architecture education with practical training opportunities." },
  { id: "bau", name: "Al-Balqa Applied University", city: "Salt", programs: ["Architectural Engineering"], type: "Public", founded: 1997, description: "BAU focuses on applied architectural engineering with strong technical foundations." },
  { id: "yu", name: "Yarmouk University", city: "Irbid", programs: ["Architecture"], type: "Public", founded: 1976, description: "Yarmouk University is one of Jordan's oldest public universities with a respected architecture department." },
  { id: "isra", name: "Isra University", city: "Amman", programs: ["Architecture", "Interior Design"], type: "Private", founded: 1991, description: "Isra University provides diverse architecture programs with modern teaching methodologies." },
  { id: "meu", name: "Middle East University", city: "Amman", programs: ["Architecture"], type: "Private", founded: 2005, description: "MEU offers contemporary architecture education with international academic partnerships." },
  { id: "psut", name: "Princess Sumaya University for Technology", city: "Amman", programs: ["Architecture"], type: "Private", founded: 1991, description: "PSUT combines technology and design in its architecture program, fostering innovation." },
  { id: "aum", name: "American University of Madaba", city: "Madaba", programs: ["Architecture", "Interior Design"], type: "Private", founded: 2011, description: "AUM follows American educational standards, offering a liberal arts approach to architecture." },
  { id: "jadara", name: "Jadara University", city: "Irbid", programs: ["Architecture"], type: "Private", founded: 2005, description: "Jadara University provides architecture education with a focus on regional architectural heritage." },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UniversityDetailPage() {
  const params = useParams();
  const universityId = params.id;

  const university = JORDANIAN_UNIVERSITIES.find(u => u.id === universityId);

  // Fetch users from this university
  const { data: allUsers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/users']
  });

  const universityMembers = allUsers.filter(
    (user: any) => user.university === university?.name
  );

  if (!university) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">University Not Found</h1>
            <Button asChild>
              <Link href="/community">Back to Community</Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
            <Link href="/community">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Link>
          </Button>

          {/* University Header */}
          <Card className="mb-8" data-testid="card-university-header">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-10 w-10 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{university.type}</Badge>
                    <Badge variant="secondary">Est. {university.founded}</Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-2" data-testid="text-university-name">
                    {university.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    {university.city}, Jordan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6" data-testid="text-university-description">
                {university.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Programs</p>
                    <p className="font-semibold">{university.programs.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="font-semibold">{universityMembers.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="font-semibold">{university.founded}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{university.type}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card className="mb-8" data-testid="card-programs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {university.programs.map((program) => (
                  <Badge key={program} variant="secondary" className="text-sm py-1 px-3">
                    {program}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Members from this University */}
          <Card data-testid="card-members">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Members ({universityMembers.length})
              </CardTitle>
              <CardDescription>
                Students and alumni from {university.name} on ArchNet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading members...</span>
                </div>
              ) : universityMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No members from this university yet. Be the first to join!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {universityMembers.map((member: any) => (
                    <Link key={member.id} href={`/profile/${member.username}`}>
                      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-member-${member.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {member.avatar && <AvatarImage src={member.avatar} />}
                              <AvatarFallback>{getInitials(member.name || 'U')}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{member.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {member.major || member.title || 'Student'}
                              </p>
                              {member.yearOfStudy && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {member.yearOfStudy}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
