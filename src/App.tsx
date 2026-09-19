import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Live = lazy(() => import("./pages/Live"));
const ForumPage = lazy(() => import("./pages/ForumPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CourseEditor = lazy(() => import("./pages/admin/CourseEditor"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminOrganizations = lazy(() => import("./pages/admin/AdminOrganizations"));
const Accountability = lazy(() => import("./pages/Accountability"));
import { RequirePlatformAdmin, RequireSession } from "@/components/auth/RouteGuards";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<RequireSession />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseViewer />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/live" element={<Live />} />
              <Route path="/community" element={<ForumPage />} />
              <Route element={<RequireSession />}><Route path="/accountability" element={<Accountability />} /></Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<RequirePlatformAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/organizations" element={<AdminOrganizations />} />
                <Route path="/admin/courses/new" element={<CourseEditor />} />
                <Route path="/admin/courses/:courseId" element={<CourseEditor />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
