import { X, BookMarked, GraduationCap, User, Settings, Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  savedBooks: number;
  projects: number;
  followers: number;
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const { user, logout, isAuthenticated } = useAuth();

  // Fetch real user stats from API
  const { data: stats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ['/api/users', user?.id, 'stats'],
    enabled: !!user?.id && isOpen,
  });

  const displayUser = user || {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "/placeholder-user.jpg",
    title: "Architecture Enthusiast",
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        data-testid="user-sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-serif text-xl font-bold">My Account</h2>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-sidebar">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={displayUser.avatar || "/placeholder-user.jpg"} alt={displayUser.name} />
                <AvatarFallback>{displayUser.name?.charAt(0) || "G"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{displayUser.name}</h3>
                <p className="text-sm text-muted-foreground">{displayUser.title || "Member"}</p>
                <p className="text-xs text-muted-foreground">{displayUser.email}</p>
              </div>
            </div>
            {isAuthenticated ? (
              <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
                <Link href="/profile" onClick={onClose}>View Profile</Link>
              </Button>
            ) : (
              <Button className="mt-4 w-full" asChild>
                <Link href="/login" onClick={onClose}>Sign In</Link>
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <Link
                href="/library"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                <BookMarked className="h-5 w-5" />
                <div>
                  <p className="font-medium">My Library</p>
                  <p className="text-xs text-muted-foreground">Saved books & resources</p>
                </div>
              </Link>

              <Link
                href="/my-courses"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                <GraduationCap className="h-5 w-5" />
                <div>
                  <p className="font-medium">My Courses</p>
                  <p className="text-xs text-muted-foreground">Your subscribed courses</p>
                </div>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                <div>
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-muted-foreground">Bio & personal info</p>
                </div>
              </Link>

              <Link
                href="/activity"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                <Activity className="h-5 w-5" />
                <div>
                  <p className="font-medium">Activity</p>
                  <p className="text-xs text-muted-foreground">Posts & saved items</p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
                onClick={onClose}
              >
                <Settings className="h-5 w-5" />
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">Notifications & privacy</p>
                </div>
              </Link>
            </nav>

            <Separator className="my-4" />

            <div className="rounded-lg bg-secondary/30 p-4">
              <h4 className="mb-3 text-sm font-semibold">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved Books</span>
                  {isLoadingStats ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium" data-testid="text-saved-books-count">{stats?.savedBooks ?? 0}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects</span>
                  {isLoadingStats ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium" data-testid="text-projects-count">{stats?.projects ?? 0}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Followers</span>
                  {isLoadingStats ? (
                    <Skeleton className="h-4 w-8" />
                  ) : (
                    <span className="font-medium" data-testid="text-followers-count">{stats?.followers ?? 0}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
