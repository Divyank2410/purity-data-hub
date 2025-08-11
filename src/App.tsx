
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import UserDashboard from "./pages/user/UserDashboard";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import LabTestReports from "./pages/LabTestReports";

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents unnecessary refetches
      retry: 1, // Limit retries to reduce load
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  },
});

const App = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          // Check if the user is the admin
          if (session.user.email === "admin@gmail.com") {
            setUserRole("admin");
          } else {
            await fetchUserRole(session.user.id);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes - using the subscription to avoid memory leaks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          // Check if the user is the admin
          if (session.user.email === "admin@gmail.com") {
            setUserRole("admin");
            setLoading(false);
          } else {
            fetchUserRole(session.user.id);
          }
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      // Check if data exists and has a role property before accessing it
      if (data && 'role' in data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preload the components to improve perceived performance
  const renderProtectedRoute = (Component, requiredRole = null) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!session) {
      return <Login />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      return <Login />;
    }
    
    return <Component />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar session={session} userRole={userRole} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/user-dashboard" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={renderProtectedRoute(UserDashboard)} />
                <Route path="/admin-dashboard" element={renderProtectedRoute(AdminDashboard, "admin")} />
                <Route path="/admin/reports" element={renderProtectedRoute(ReportsAnalytics, "admin")} />
                <Route path="/lab-test-reports" element={renderProtectedRoute(LabTestReports)} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
