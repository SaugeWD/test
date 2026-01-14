import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import FeedPage from "@/pages/Feed";
import ProfilePage from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import DashboardPage from "@/pages/Dashboard";
import CompetitionsPage from "@/pages/Competitions";
import CompetitionDetailsPage from "@/pages/CompetitionDetails";
import BooksPage from "@/pages/Books";
import BookDetailsPage from "@/pages/BookDetails";
import ProjectsPage from "@/pages/Projects";
import ProjectDetailPage from "@/pages/ProjectDetail";
import JobsPage from "@/pages/Jobs";
import ResearchPage from "@/pages/Research";
import ResearchDetailPage from "@/pages/ResearchDetail";
import ToolsPage from "@/pages/Tools";
import NewsPage from "@/pages/News";
import CommunityPage from "@/pages/Community";
import UniversityDetailPage from "@/pages/UniversityDetail";
import AboutPage from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import ContextSystemsPage from "@/pages/ContextSystems";
import ContextHistoryMapPage from "@/pages/context/HistoryMap";
import ContextPlantsPage from "@/pages/context/Plants";
import ContextStylesPage from "@/pages/context/Styles";
import ContextStructuralSystemsPage from "@/pages/context/StructuralSystems";
import ActivityPage from "@/pages/Activity";
import MessagesPage from "@/pages/Messages";
import MyCoursesPage from "@/pages/MyCourses";
import LibraryPage from "@/pages/Library";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/profile/:username?" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/my-courses" component={MyCoursesPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/competitions" component={CompetitionsPage} />
      <Route path="/competitions/:id" component={CompetitionDetailsPage} />
      <Route path="/books" component={BooksPage} />
      <Route path="/books/:id" component={BookDetailsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/research" component={ResearchPage} />
      <Route path="/research/:id" component={ResearchDetailPage} />
      <Route path="/tools" component={ToolsPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/community/university/:id" component={UniversityDetailPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/context" component={ContextSystemsPage} />
      <Route path="/context/history-map" component={ContextHistoryMapPage} />
      <Route path="/context/plants" component={ContextPlantsPage} />
      <Route path="/context/styles" component={ContextStylesPage} />
      <Route path="/context/structural-systems" component={ContextStructuralSystemsPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
