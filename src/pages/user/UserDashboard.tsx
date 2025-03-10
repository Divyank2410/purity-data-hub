
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import WaterQualityForm from "@/components/forms/WaterQualityForm";
import SewerQualityForm from "@/components/forms/SewerQualityForm";
import AmritYojnaForm from "@/components/forms/AmritYojnaForm";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/user-dashboard");
        return;
      }
      
      setUser(data.session.user);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/user-dashboard");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully signed out!");
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
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
        <button
          onClick={handleSignOut}
          className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
        >
          Sign Out
        </button>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-blue-50">
          <CardTitle>Welcome, {user?.email}</CardTitle>
          <CardDescription>
            Use the tabs below to submit different types of quality testing data
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="water-quality" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="water-quality">Water Quality Data</TabsTrigger>
          <TabsTrigger value="sewer-quality">Sewer Quality Data</TabsTrigger>
          <TabsTrigger value="amrit-yojna">Amrit Yojna Data</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default UserDashboard;
