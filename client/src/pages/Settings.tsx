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
  FileText
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

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      title: "",
      location: "",
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
                  <CardTitle>Account Verification</CardTitle>
                  <CardDescription>Get verified to show your professional credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      {user.isVerified ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid="text-verification-status">
                        {user.isVerified ? "Verified Account" : "Not Verified"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.isVerified 
                          ? `Your account is verified as ${user.verificationType || "professional"}`
                          : "Request verification to display a badge on your profile"
                        }
                      </p>
                    </div>
                    {user.isVerified && user.verificationType && (
                      <Badge variant="secondary" className="capitalize">
                        {user.verificationType}
                      </Badge>
                    )}
                  </div>

                  {!user.isVerified && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Select Verification Type</h4>
                        <RadioGroup defaultValue="architect" className="space-y-3">
                          <div className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate">
                            <RadioGroupItem value="architect" id="architect" data-testid="radio-architect" />
                            <Label htmlFor="architect" className="flex-1 cursor-pointer">
                              <div className="font-medium">Licensed Architect</div>
                              <div className="text-sm text-muted-foreground">For practicing architects with valid licenses</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate">
                            <RadioGroupItem value="firm" id="firm" data-testid="radio-firm" />
                            <Label htmlFor="firm" className="flex-1 cursor-pointer">
                              <div className="font-medium">Architecture Firm</div>
                              <div className="text-sm text-muted-foreground">For registered architecture firms and studios</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate">
                            <RadioGroupItem value="student" id="student" data-testid="radio-student" />
                            <Label htmlFor="student" className="flex-1 cursor-pointer">
                              <div className="font-medium">Architecture Student</div>
                              <div className="text-sm text-muted-foreground">For students enrolled in architecture programs</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate">
                            <RadioGroupItem value="educator" id="educator" data-testid="radio-educator" />
                            <Label htmlFor="educator" className="flex-1 cursor-pointer">
                              <div className="font-medium">Educator</div>
                              <div className="text-sm text-muted-foreground">For professors and instructors in architecture</div>
                            </Label>
                          </div>
                        </RadioGroup>

                        <Button 
                          onClick={() => requestVerificationMutation.mutate("architect")}
                          disabled={requestVerificationMutation.isPending}
                          data-testid="button-request-verification"
                        >
                          {requestVerificationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Request Verification
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Control your privacy settings and security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Publicly</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your email on your profile</p>
                    </div>
                    <Switch 
                      checked={showEmailPublicly} 
                      onCheckedChange={setShowEmailPublicly}
                      data-testid="switch-show-email"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Messages from Non-Connections</Label>
                      <p className="text-sm text-muted-foreground">Receive messages from users you don't follow</p>
                    </div>
                    <Switch 
                      checked={allowMessagesFromNonConnections} 
                      onCheckedChange={setAllowMessagesFromNonConnections}
                      data-testid="switch-allow-messages"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Activity Publicly</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your likes and comments on your profile</p>
                    </div>
                    <Switch 
                      checked={isActivityPublic} 
                      onCheckedChange={handleActivityPublicChange}
                      data-testid="switch-activity-public"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Session Information</h4>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid="text-session-status">Current session active</p>
                        <p className="text-sm text-muted-foreground">Logged in from this device</p>
                      </div>
                    </div>
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
