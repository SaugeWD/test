import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Settings as SettingsIcon, 
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Phone,
  Globe,
  Building2,
  GraduationCap,
  Calendar,
  Users,
  Upload,
  BadgeCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  portfolioUrl: z.string().optional(),
  workplace: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  university: z.string().optional(),
  studentYear: z.string().optional(),
  companySize: z.string().optional(),
  foundedYear: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showEmailPublicly, setShowEmailPublicly] = useState(false);
  const [allowMessagesFromNonConnections, setAllowMessagesFromNonConnections] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [isActivityPublic, setIsActivityPublic] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [defaultPostPrivacy, setDefaultPostPrivacy] = useState("public");
  const [allowMessages, setAllowMessages] = useState(true);
  
  // Verification form state
  const [accountType, setAccountType] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      title: "",
      location: "",
      phone: "",
      portfolioUrl: "",
      workplace: "",
      yearsOfExperience: "",
      university: "",
      studentYear: "",
      companySize: "",
      foundedYear: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        bio: user.bio || "",
        title: user.title || "",
        location: user.location || "",
        phone: user.phone || "",
        portfolioUrl: user.portfolioUrl || "",
        workplace: user.workplace || "",
        yearsOfExperience: user.yearsOfExperience || "",
        university: user.university || "",
        studentYear: user.studentYear || "",
        companySize: user.companySize || "",
        foundedYear: user.foundedYear || "",
      });
      setIsActivityPublic(user.isActivityPublic || false);
    }
  }, [user, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async (verificationType: string) => {
      const response = await apiRequest("POST", "/api/notifications", {
        userId: user?.id,
        type: "verification_request",
        title: "Verification Request",
        message: `User requested ${verificationType} verification`,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted. We'll review it shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Request submitted",
        description: "Your verification request has been noted.",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    toast({
      title: "Password change",
      description: "Password change functionality will be available soon.",
    });
    passwordForm.reset();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Avatar selected",
        description: "Avatar upload functionality will be available soon.",
      });
    }
  };

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: { isActivityPublic: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Privacy updated",
        description: "Your privacy settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleActivityPublicChange = (checked: boolean) => {
    setIsActivityPublic(checked);
    updatePrivacyMutation.mutate({ isActivityPublic: checked });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="flex-wrap gap-1">
              <TabsTrigger value="profile" data-testid="tab-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" data-testid="tab-account">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="verification" data-testid="tab-verification">
                <CheckCircle className="mr-2 h-4 w-4" />
                Verification
              </TabsTrigger>
              <TabsTrigger value="privacy" data-testid="tab-privacy">
                <Shield className="mr-2 h-4 w-4" />
                Privacy & Security
              </TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your profile information visible to others</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-lg h-32 bg-muted">
                          {coverPreview || user.coverImage ? (
                            <img 
                              src={coverPreview || user.coverImage || ""} 
                              alt="Cover" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-r from-accent/20 to-primary/20" />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <Label htmlFor="cover" className="absolute bottom-2 right-2 cursor-pointer">
                            <div className="flex items-center gap-2 rounded-md bg-background/80 backdrop-blur-sm px-3 py-1.5 text-sm hover-elevate">
                              <Camera className="h-4 w-4" />
                              Change Cover
                            </div>
                          </Label>
                          <Input
                            id="cover"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCoverPreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                                toast({
                                  title: "Cover image selected",
                                  description: "Cover image upload functionality will be available soon.",
                                });
                              }
                            }}
                            data-testid="input-cover"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Cover image: Recommended size 1200x400px</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={avatarPreview || user.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Label htmlFor="avatar" className="cursor-pointer">
                            <div className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover-elevate">
                              <Camera className="h-4 w-4" />
                              Change Avatar
                            </div>
                          </Label>
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            data-testid="input-avatar"
                          />
                          <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                      </div>

                      <Separator />

                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Your full name" data-testid="input-name" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="e.g. Senior Architect" data-testid="input-title" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="City, Country" data-testid="input-location" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Tell us about yourself..." 
                                className="resize-none"
                                rows={4}
                                data-testid="input-bio"
                              />
                            </FormControl>
                            <FormDescription>Brief description about yourself and your work</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="+962 7XX XXX XXX" data-testid="input-phone" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfolio URL</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="https://yourportfolio.com" data-testid="input-portfolio" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {user.role === "engineer" && (
                        <>
                          <Separator />
                          <h3 className="text-lg font-semibold">Engineer Details</h3>
                          
                          <FormField
                            control={profileForm.control}
                            name="workplace"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Workplace</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="Company or firm name" data-testid="input-workplace" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="yearsOfExperience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Years of Experience</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="e.g. 5" data-testid="input-experience" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {user.role === "student" && (
                        <>
                          <Separator />
                          <h3 className="text-lg font-semibold">Student Details</h3>
                          
                          <FormField
                            control={profileForm.control}
                            name="university"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>University</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="University name" data-testid="input-university" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="studentYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year of Study</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="e.g. 3rd Year" data-testid="input-student-year" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {user.role === "firm" && (
                        <>
                          <Separator />
                          <h3 className="text-lg font-semibold">Company Details</h3>
                          
                          <FormField
                            control={profileForm.control}
                            name="companySize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="e.g. 50-100 employees" data-testid="input-company-size" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="foundedYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Founded Year</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input {...field} className="pl-10" placeholder="e.g. 2010" data-testid="input-founded-year" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details (read-only)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          value={user.email} 
                          disabled 
                          className="pl-10 bg-muted" 
                          data-testid="input-email-readonly"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                        <Input 
                          value={user.username} 
                          disabled 
                          className="pl-10 bg-muted" 
                          data-testid="input-username-readonly"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="pl-10" 
                                    placeholder="Enter current password"
                                    data-testid="input-current-password"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="pl-10" 
                                    placeholder="Enter new password"
                                    data-testid="input-new-password"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="pl-10" 
                                    placeholder="Confirm new password"
                                    data-testid="input-confirm-password"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" data-testid="button-change-password">
                          Change Password
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <CardTitle>Get Verified</CardTitle>
                      <CardDescription>
                        Verified accounts are trusted members of the architectural community including firms, universities, professors, and professional architects.
                      </CardDescription>
                      <Badge variant={user.isVerified ? "default" : "secondary"} className="mt-2" data-testid="badge-verification-status">
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user.isVerified && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-medium">Account Type</Label>
                          <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger className="w-full" data-testid="select-account-type">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="architect">Licensed Architect</SelectItem>
                              <SelectItem value="firm">Architecture Firm</SelectItem>
                              <SelectItem value="professor">Professor / Educator</SelectItem>
                              <SelectItem value="university">University / Institution</SelectItem>
                              <SelectItem value="student">Architecture Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Organization/Institution Name</Label>
                          <Input 
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            placeholder="e.g., Jordan Engineers Association"
                            data-testid="input-organization-name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">License/Credential Number (if applicable)</Label>
                          <Input 
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder="Professional license or credential number"
                            data-testid="input-license-number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Additional Information</Label>
                          <Textarea 
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder="Provide details about your professional background, credentials, or why you should be verified..."
                            className="resize-none"
                            rows={4}
                            data-testid="input-additional-info"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium">Supporting Documents</Label>
                          <div className="flex items-center gap-3">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => document.getElementById('verification-docs')?.click()}
                              data-testid="button-upload-docs"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Documents
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Upload professional license, ID, or institutional proof
                            </span>
                            <input 
                              type="file" 
                              id="verification-docs" 
                              className="hidden" 
                              multiple 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files) {
                                  setVerificationDocs(Array.from(e.target.files));
                                }
                              }}
                            />
                          </div>
                          {verificationDocs.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {verificationDocs.length} file(s) selected
                            </div>
                          )}
                        </div>

                        <Button 
                          className="w-full"
                          onClick={() => requestVerificationMutation.mutate(accountType || "architect")}
                          disabled={requestVerificationMutation.isPending || !accountType}
                          data-testid="button-submit-verification"
                        >
                          {requestVerificationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit Verification Request
                        </Button>
                      </div>
                    </>
                  )}

                  {user.isVerified && (
                    <div className="flex items-center gap-3 rounded-lg border p-4 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Your account is verified</p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Verified as {user.verificationType || "professional"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle>Privacy</CardTitle>
                      <CardDescription>Control your privacy settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                    </div>
                    <Switch 
                      checked={isPublicProfile} 
                      onCheckedChange={setIsPublicProfile}
                      data-testid="switch-public-profile"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Show Activity</Label>
                      <p className="text-sm text-muted-foreground">Display your activity to followers</p>
                    </div>
                    <Switch 
                      checked={isActivityPublic} 
                      onCheckedChange={handleActivityPublicChange}
                      data-testid="switch-activity-public"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Default Post Privacy</Label>
                    </div>
                    <Select value={defaultPostPrivacy} onValueChange={setDefaultPostPrivacy}>
                      <SelectTrigger className="w-[220px]" data-testid="select-post-privacy">
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see</SelectItem>
                        <SelectItem value="followers">Followers Only</SelectItem>
                        <SelectItem value="private">Private - Only me</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Choose who can see your posts by default</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Allow Messages</Label>
                      <p className="text-sm text-muted-foreground">Let others send you direct messages</p>
                    </div>
                    <Switch 
                      checked={allowMessages} 
                      onCheckedChange={setAllowMessages}
                      data-testid="switch-allow-messages"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                    </div>
                    <Switch 
                      checked={inAppNotifications} 
                      onCheckedChange={setInAppNotifications}
                      data-testid="switch-inapp-notifications"
                    />
                  </div>

                  <Separator />

                  <p className="text-sm text-muted-foreground">
                    Additional notification preferences will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
