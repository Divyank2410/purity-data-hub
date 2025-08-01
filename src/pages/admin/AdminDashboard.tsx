
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AdminWaterData from "@/components/admin/AdminWaterData";
import AdminSewerData from "@/components/admin/AdminSewerData";
import AdminAmritData from "@/components/admin/AdminAmritData";
import AdminWaterSamples from "@/components/admin/AdminWaterSamples";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("water-data");

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast.error("Please login to access the admin dashboard");
          navigate("/admin-dashboard", { replace: true });
          return;
        }

        // Check if the email is admin@gmail.com
        if (session.user.email !== "admin@gmail.com") {
          console.log("Non-admin email detected:", session.user.email);
          toast.error("You don't have admin access. Please contact the IT department.");
          await supabase.auth.signOut();
          navigate("/admin-dashboard", { replace: true });
          return;
        }

        console.log("Admin email verified:", session.user.email);
        setIsAdmin(true);
        setLoading(false);
      } catch (err) {
        console.error("Error checking admin status:", err);
        toast.error("An error occurred. Please try again later.");
        navigate("/admin-dashboard", { replace: true });
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    console.log("Tab changed to:", value);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">View and manage all data</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-blue-50">
          <CardTitle>Water and Sewerage Lab Data</CardTitle>
          <CardDescription>
            View and filter data from all categories
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs 
        defaultValue="water-data" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="water-data" className="text-xs md:text-sm">Water</TabsTrigger>
          <TabsTrigger value="sewer-data" className="text-xs md:text-sm">Sewer</TabsTrigger>
          <TabsTrigger value="amrit-data" className="text-xs md:text-sm">Amrit</TabsTrigger>
          <TabsTrigger value="water-samples" className="text-xs md:text-sm">Lab Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="water-data">
          <AdminWaterData />
        </TabsContent>

        <TabsContent value="sewer-data">
          <AdminSewerData />
        </TabsContent>

        <TabsContent value="amrit-data">
          <AdminAmritData />
        </TabsContent>

        <TabsContent value="water-samples">
          <AdminWaterSamples />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminDashboard;
