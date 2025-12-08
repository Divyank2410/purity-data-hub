import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, ScrollText } from "lucide-react";
import WaterQualityForm from "@/components/forms/WaterQualityForm";
import SewerQualityForm from "@/components/forms/SewerQualityForm";
import AmritYojnaForm from "@/components/forms/AmritYojnaForm";
import WaterSampleForm from "@/components/forms/WaterSampleForm";


const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!data.session) {
        navigate("/user-dashboard", { replace: true });
        return;
      }
      
      setUser(data.session.user);
    } catch (error) {
      console.error("Error checking user session:", error);
      toast.error("Error loading dashboard. Please try again.");
      navigate("/user-dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const { data: bucketExists } = await supabase.storage.getBucket('water-mgmt-files');
        if (!bucketExists) {
          console.log('Storage bucket does not exist, creating it...');
          await supabase.storage.createBucket('water-mgmt-files', {
            public: true
          });
        }
      } catch (error) {
        console.error('Error checking storage bucket:', error);
      }
    };

    checkStorage();
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/user-dashboard", { replace: true });
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
      navigate("/user-dashboard", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-600 mt-1">Enter water and sewerage testing data</p>
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
        <CardHeader className="bg-blue-50">
          <CardTitle>Welcome, {user?.email}</CardTitle>
          <CardDescription>
            Use the tabs below to submit different types of quality testing data
          </CardDescription>
        </CardHeader>
      </Card>

      {/* License System Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
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

      <Tabs defaultValue="water-quality" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="water-quality" className="text-xs md:text-sm">Water Quality</TabsTrigger>
          <TabsTrigger value="sewer-quality" className="text-xs md:text-sm">Sewer Quality</TabsTrigger>
          <TabsTrigger value="amrit-yojna" className="text-xs md:text-sm">Amrit Yojna</TabsTrigger>
          <TabsTrigger value="water-sample" className="text-xs md:text-sm">Lab Sample</TabsTrigger>
        </TabsList>

        <TabsContent value="water-quality">
          <WaterQualityForm userId={user?.id} />
        </TabsContent>

        <TabsContent value="sewer-quality">
          <SewerQualityForm userId={user?.id} />
        </TabsContent>

        <TabsContent value="amrit-yojna">
          <AmritYojnaForm userId={user?.id} />
        </TabsContent>

        <TabsContent value="water-sample">
          <WaterSampleForm userId={user?.id} />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default UserDashboard;
