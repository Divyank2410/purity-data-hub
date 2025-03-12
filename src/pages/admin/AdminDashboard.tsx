
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AdminWaterData from "@/components/admin/AdminWaterData";
import AdminSewerData from "@/components/admin/AdminSewerData";
import AdminAmritData from "@/components/admin/AdminAmritData";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin-dashboard");
        return;
      }

      // Check if the email is admin@gmail.com
      if (session.user.email !== "admin@gmail.com") {
        toast.error("You don't have admin access. Please contact the IT department.");
        await supabase.auth.signOut();
        navigate("/admin-dashboard");
        return;
      }

      // As a double check, verify through the is_admin function
      try {
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });

        if (error || !data) {
          console.error("RPC error:", error);
          toast.error("You don't have admin access. Please contact the IT department.");
          await supabase.auth.signOut();
          navigate("/admin-dashboard");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Error checking admin status:", err);
        toast.error("An error occurred. Please try again later.");
        await supabase.auth.signOut();
        navigate("/admin-dashboard");
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

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
