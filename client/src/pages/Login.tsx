import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { LogIn, Mail, Lock, UserIcon, Building2, GraduationCap, Briefcase, MapPin, ArrowLeft, ArrowRight, Globe, Phone, Calendar, Users, BookOpen, Link as LinkIcon, ChevronsUpDown, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type UserRole = "firm" | "engineer" | "student";

const SPECIALIZATIONS = [
  "Residential Architecture",
  "Commercial Architecture",
  "Interior Design",
  "Landscape Architecture",
  "Urban Planning",
  "Sustainable Design",
  "Historic Preservation",
  "Healthcare Architecture",
  "Educational Facilities",
  "Industrial Architecture",
  "Hospitality Design",
  "Mixed-Use Development"
];

const MAJORS = [
  "Architecture",
  "Interior Architecture",
  "Urban Planning",
  "Landscape Architecture",
  "Architectural Engineering",
  "Environmental Design"
];

const YEARS_OF_STUDY = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate Student",
  "Masters",
  "PhD"
];

const EXPERIENCE_LEVELS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10-15 years",
  "15+ years"
];

const COMPANY_SIZES = [
  "1-5 employees",
  "6-20 employees",
  "21-50 employees",
  "51-100 employees",
  "100+ employees"
];

// Graduation years (next 8 years)
const GRADUATION_YEARS = [
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
  "2031",
  "2032"
];

// Jordanian cities/locations
const JORDANIAN_LOCATIONS = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Aqaba",
  "Salt",
  "Madaba",
  "Mafraq",
  "Jerash",
  "Ajloun",
  "Karak",
  "Tafilah",
  "Ma'an"
];

// Jordanian universities with Architecture programs
const JORDANIAN_UNIVERSITIES = [
  { name: "University of Jordan", city: "Amman", programs: ["Architecture", "Interior Design"] },
  { name: "Jordan University of Science and Technology", city: "Irbid", programs: ["Architecture", "Urban Planning"] },
  { name: "German Jordanian University", city: "Amman", programs: ["Architecture", "Interior Architecture"] },
  { name: "Applied Science Private University", city: "Amman", programs: ["Architecture", "Interior Design"] },
  { name: "Petra University", city: "Amman", programs: ["Architecture"] },
  { name: "Philadelphia University", city: "Amman", programs: ["Architecture", "Interior Design"] },
  { name: "Al-Ahliyya Amman University", city: "Amman", programs: ["Architecture"] },
  { name: "Hashemite University", city: "Zarqa", programs: ["Architecture"] },
  { name: "Zarqa University", city: "Zarqa", programs: ["Architecture", "Interior Design"] },
  { name: "Al-Balqa Applied University", city: "Salt", programs: ["Architectural Engineering"] },
  { name: "Yarmouk University", city: "Irbid", programs: ["Architecture"] },
  { name: "Isra University", city: "Amman", programs: ["Architecture", "Interior Design"] },
  { name: "Middle East University", city: "Amman", programs: ["Architecture"] },
  { name: "Princess Sumaya University for Technology", city: "Amman", programs: ["Architecture"] },
  { name: "American University of Madaba", city: "Madaba", programs: ["Architecture", "Interior Design"] },
  { name: "Jadara University", city: "Irbid", programs: ["Architecture"] },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Basic fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  // Firm-specific fields
  const [companySize, setCompanySize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  
  // Engineer-specific fields
  const [title, setTitle] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  
  // Student-specific fields
  const [university, setUniversity] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [major, setMajor] = useState("");
  const [expectedGraduation, setExpectedGraduation] = useState("");
  
  // Optional for all
  const [portfolioUrl, setPortfolioUrl] = useState("");
  
  // University combobox state
  const [universityOpen, setUniversityOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocationPath] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const roleOptions = [
    {
      role: "firm" as UserRole,
      icon: Building2,
      title: "Architectural Firm",
      description: "For architectural offices and design companies"
    },
    {
      role: "engineer" as UserRole,
      icon: Briefcase,
      title: "Architect / Engineer",
      description: "For licensed architects and practicing engineers"
    },
    {
      role: "student" as UserRole,
      icon: GraduationCap,
      title: "Architecture Student",
      description: "For students studying architecture or related fields"
    }
  ];

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocationPath("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const registerData: any = {
        email,
        password,
        name,
        username,
        role: selectedRole,
        location: location || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        portfolioUrl: portfolioUrl || undefined,
      };

      // Add role-specific fields
      if (selectedRole === "firm") {
        registerData.companySize = companySize || undefined;
        registerData.foundedYear = foundedYear || undefined;
        registerData.specializations = selectedSpecializations.length > 0 ? selectedSpecializations : undefined;
        registerData.website = website || undefined;
      } else if (selectedRole === "engineer") {
        registerData.title = title || undefined;
        registerData.workplace = workplace || undefined;
        registerData.yearsOfExperience = yearsOfExperience || undefined;
        registerData.specializations = selectedSpecializations.length > 0 ? selectedSpecializations : undefined;
      } else if (selectedRole === "student") {
        registerData.university = university || undefined;
        registerData.yearOfStudy = yearOfStudy || undefined;
        registerData.major = major || undefined;
        registerData.expectedGraduation = expectedGraduation || undefined;
      }

      await apiRequest("POST", "/api/auth/register", registerData);
      await login(email, password);
      
      toast({
        title: "Account created!",
        description: "Welcome to ArchNet Jordan.",
      });
      setLocationPath("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetRegistration = () => {
    setRegistrationStep(1);
    setSelectedRole(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setUsername("");
    setLocation("");
    setPhone("");
    setBio("");
    setCompanySize("");
    setFoundedYear("");
    setSelectedSpecializations([]);
    setWebsite("");
    setTitle("");
    setWorkplace("");
    setYearsOfExperience("");
    setUniversity("");
    setYearOfStudy("");
    setMajor("");
    setExpectedGraduation("");
    setPortfolioUrl("");
  };

  const switchToLogin = () => {
    setIsLogin(true);
    resetRegistration();
  };

  const switchToRegister = () => {
    setIsLogin(false);
    resetRegistration();
  };

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground mb-6">
        Select your account type to get started
      </p>
      <div className="space-y-3">
        {roleOptions.map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => {
              setSelectedRole(option.role);
              setRegistrationStep(2);
            }}
            className="w-full p-4 rounded-lg border border-border hover-elevate text-left transition-all flex items-start gap-4"
            data-testid={`button-role-${option.role}`}
          >
            <div className="rounded-full bg-accent/10 p-3">
              <option.icon className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{option.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground self-center" />
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Account Credentials
  const renderAccountCredentials = () => (
    <form onSubmit={(e) => { e.preventDefault(); setRegistrationStep(3); }} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setRegistrationStep(1)} data-testid="button-back-step1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Step 1 of 3 - Account Details</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          {selectedRole === "firm" ? "Firm / Company Name" : "Full Name"} *
        </Label>
        <div className="relative">
          {selectedRole === "firm" ? (
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          ) : (
            <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id="name"
            type="text"
            placeholder={selectedRole === "firm" ? "e.g. Horizon Architecture Studio" : "e.g. Ahmad Al-Rashid"}
            className="pl-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="input-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <Input
            id="username"
            type="text"
            placeholder="yourname"
            className="pl-10"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            required
            data-testid="input-username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-email"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-password"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              className="pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-confirm-password"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" data-testid="button-next-step2">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );

  // Step 3: Role-Specific Details
  const renderRoleSpecificDetails = () => {
    if (selectedRole === "firm") {
      return renderFirmDetails();
    } else if (selectedRole === "engineer") {
      return renderEngineerDetails();
    } else if (selectedRole === "student") {
      return renderStudentDetails();
    }
    return null;
  };

  // Firm Registration Details
  const renderFirmDetails = () => (
    <form onSubmit={(e) => { e.preventDefault(); setRegistrationStep(4); }} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setRegistrationStep(2)} data-testid="button-back-step2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Step 2 of 3 - Firm Information</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="location">Location / City *</Label>
          <Select value={location} onValueChange={setLocation} required>
            <SelectTrigger data-testid="select-location">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {JORDANIAN_LOCATIONS.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+962 7X XXX XXXX"
              className="pl-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-testid="input-phone"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={companySize} onValueChange={setCompanySize}>
            <SelectTrigger data-testid="select-company-size">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="foundedYear">Founded Year</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="foundedYear"
              type="text"
              placeholder="e.g. 2010"
              className="pl-10"
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              data-testid="input-founded-year"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            placeholder="https://www.yourfirm.com"
            className="pl-10"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            data-testid="input-website"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Specializations (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
          {SPECIALIZATIONS.map((spec) => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox
                id={spec}
                checked={selectedSpecializations.includes(spec)}
                onCheckedChange={() => toggleSpecialization(spec)}
                data-testid={`checkbox-spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <label htmlFor={spec} className="text-sm cursor-pointer">{spec}</label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" data-testid="button-next-step3">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );

  // Engineer Registration Details
  const renderEngineerDetails = () => (
    <form onSubmit={(e) => { e.preventDefault(); setRegistrationStep(4); }} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setRegistrationStep(2)} data-testid="button-back-step2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Step 2 of 3 - Professional Information</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Professional Title *</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="title"
            type="text"
            placeholder="e.g. Senior Architect, Project Manager"
            className="pl-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            data-testid="input-title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workplace">Current Workplace / Company</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="workplace"
            type="text"
            placeholder="e.g. XYZ Architecture Studio"
            className="pl-10"
            value={workplace}
            onChange={(e) => setWorkplace(e.target.value)}
            data-testid="input-workplace"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Experience Level</Label>
          <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
            <SelectTrigger data-testid="select-experience">
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Select value={location} onValueChange={setLocation} required>
            <SelectTrigger data-testid="select-location">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {JORDANIAN_LOCATIONS.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+962 7X XXX XXXX"
            className="pl-10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-phone"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Areas of Expertise (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
          {SPECIALIZATIONS.map((spec) => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox
                id={spec}
                checked={selectedSpecializations.includes(spec)}
                onCheckedChange={() => toggleSpecialization(spec)}
                data-testid={`checkbox-spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <label htmlFor={spec} className="text-sm cursor-pointer">{spec}</label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" data-testid="button-next-step3">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );

  // Student Registration Details
  const renderStudentDetails = () => (
    <form onSubmit={(e) => { e.preventDefault(); setRegistrationStep(4); }} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setRegistrationStep(2)} data-testid="button-back-step2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Step 2 of 3 - Academic Information</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University / School *</Label>
        <Popover open={universityOpen} onOpenChange={setUniversityOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={universityOpen}
              className="w-full justify-between font-normal"
              data-testid="input-university"
            >
              <div className="flex items-center gap-2 truncate">
                <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={cn("truncate", !university && "text-muted-foreground")}>
                  {university || "Select university..."}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search universities..." />
              <CommandList>
                <CommandEmpty>No university found.</CommandEmpty>
                <CommandGroup>
                  {JORDANIAN_UNIVERSITIES.map((uni) => (
                    <CommandItem
                      key={uni.name}
                      value={uni.name}
                      onSelect={(value) => {
                        setUniversity(value === university ? "" : value);
                        setUniversityOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          university === uni.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{uni.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {uni.city} - {uni.programs.join(", ")}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="major">Major / Program *</Label>
          <Select value={major} onValueChange={setMajor} required>
            <SelectTrigger data-testid="select-major">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent>
              {MAJORS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearOfStudy">Year of Study *</Label>
          <Select value={yearOfStudy} onValueChange={setYearOfStudy} required>
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS_OF_STUDY.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">Expected Graduation</Label>
          <Select value={expectedGraduation} onValueChange={setExpectedGraduation}>
            <SelectTrigger data-testid="select-graduation">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {GRADUATION_YEARS.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger data-testid="select-location">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {JORDANIAN_LOCATIONS.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+962 7X XXX XXXX"
            className="pl-10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-phone"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" data-testid="button-next-step3">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );

  // Step 4: Bio & Portfolio (Final step)
  const renderFinalDetails = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setRegistrationStep(3)} data-testid="button-back-step3">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Step 3 of 3 - About You (Optional)</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          {selectedRole === "firm" ? "About Your Firm" : selectedRole === "student" ? "About Yourself" : "Professional Bio"}
        </Label>
        <Textarea
          id="bio"
          placeholder={
            selectedRole === "firm"
              ? "Describe your firm's philosophy, notable projects, awards, and what makes you unique..."
              : selectedRole === "student"
              ? "Share your interests, academic achievements, goals, and what inspires you in architecture..."
              : "Describe your experience, expertise, projects you've worked on, and professional interests..."
          }
          className="min-h-[120px] resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          data-testid="input-bio"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portfolio Link</Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="portfolioUrl"
            type="url"
            placeholder="https://behance.net/yourportfolio or similar"
            className="pl-10"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            data-testid="input-portfolio"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Share a link to your portfolio on Behance, Dribbble, personal website, or any other platform
        </p>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-submit-register">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          size="lg" 
          onClick={handleRegister}
          disabled={isLoading}
          data-testid="button-skip-create"
        >
          {isLoading ? "Creating Account..." : "Skip & Create Account"}
        </Button>
      </div>
    </form>
  );

  // Login Form
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="input-password"
          />
        </div>
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-accent hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-submit-login">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );

  const getRegistrationTitle = () => {
    if (registrationStep === 1) return "Join ArchNet";
    const roleOption = roleOptions.find(r => r.role === selectedRole);
    return roleOption ? `Register as ${roleOption.title}` : "Join ArchNet";
  };

  const getRegistrationDescription = () => {
    if (registrationStep === 1) return "Create an account to connect with the architectural community";
    if (registrationStep === 2) return "Enter your account credentials";
    if (registrationStep === 3) {
      if (selectedRole === "firm") return "Tell us about your architectural firm";
      if (selectedRole === "engineer") return "Tell us about your professional experience";
      if (selectedRole === "student") return "Tell us about your academic background";
    }
    return "Complete your profile";
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-3 mx-auto">
                  <LogIn className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-serif text-3xl">
                  {isLogin ? "Welcome Back" : getRegistrationTitle()}
                </CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Sign in to your account to continue"
                    : getRegistrationDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  renderLoginForm()
                ) : (
                  <>
                    {registrationStep === 1 && renderRoleSelection()}
                    {registrationStep === 2 && renderAccountCredentials()}
                    {registrationStep === 3 && renderRoleSpecificDetails()}
                    {registrationStep === 4 && renderFinalDetails()}
                  </>
                )}

                <div className="my-6">
                  <Separator />
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground -mt-3">Or</span>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  {isLogin ? (
                    <p>
                      Don't have an account?{" "}
                      <button onClick={switchToRegister} className="text-accent hover:underline font-medium" data-testid="button-switch-to-register">
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <button onClick={switchToLogin} className="text-accent hover:underline font-medium" data-testid="button-switch-to-login">
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
