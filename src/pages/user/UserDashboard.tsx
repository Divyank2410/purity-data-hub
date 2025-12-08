import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, ScrollText } from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!data.session) {
        navigate("/login", { replace: true });
        return;
      }
      
      setUser(data.session.user);
    } catch (error) {
      console.error("Error checking user session:", error);
      toast.error("Error loading dashboard. Please try again.");
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login", { replace: true });
        } else if (session) {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, checkUser]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully signed out!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your water supply license applications</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="mt-4 md:mt-0"
        >
          Sign Out
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-primary/5">
          <CardTitle>Welcome, {user?.email}</CardTitle>
          <CardDescription>
            Use the options below to apply for a license, track your applications, or view your approved licenses.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* License System Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Apply for License
            </CardTitle>
            <CardDescription>Submit a new water supply license application</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/apply-license">
              <Button className="w-full">Apply Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              Track Application
            </CardTitle>
            <CardDescription>Monitor the status of your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/track-application">
              <Button className="w-full" variant="outline">Track Status</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-green-600" />
              My Licenses
            </CardTitle>
            <CardDescription>View and manage your active licenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/my-licenses">
              <Button className="w-full" variant="outline">View Licenses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
