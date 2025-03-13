
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AdminWaterData from "@/components/admin/AdminWaterData";
import AdminSewerData from "@/components/admin/AdminSewerData";
import AdminAmritData from "@/components/admin/AdminAmritData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast.error("Please login to access the admin dashboard");
          navigate("/admin-dashboard");
          return;
        }

        // Check if the email is admin@gmail.com
        if (session.user.email !== "admin@gmail.com") {
          console.log("Non-admin email detected:", session.user.email);
          toast.error("You don't have admin access. Please contact the IT department.");
          await supabase.auth.signOut();
          navigate("/admin-dashboard");
          return;
        }

        console.log("Admin email verified:", session.user.email);
        setIsAdmin(true);
        setLoading(false);
      } catch (err) {
        console.error("Error checking admin status:", err);
        toast.error("An error occurred. Please try again later.");
        navigate("/admin-dashboard");
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully logged out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
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
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="mt-4 md:mt-0"
        >
          Sign Out
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-blue-50">
          <CardTitle>Water and Sewerage Lab Data</CardTitle>
          <CardDescription>
            View and filter data from all categories
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="water-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="water-data">Water Treatment Data</TabsTrigger>
          <TabsTrigger value="sewer-data">Sewer Treatment Data</TabsTrigger>
          <TabsTrigger value="amrit-data">Amrit Yojna Data</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
