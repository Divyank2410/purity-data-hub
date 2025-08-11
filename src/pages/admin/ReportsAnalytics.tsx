import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, Archive } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays, startOfMonth, startOfYear } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { WaterTreatmentReport } from "@/components/reports/WaterTreatmentReport";
import { SewerTreatmentReport } from "@/components/reports/SewerTreatmentReport";
import { AmritYojnaReport } from "@/components/reports/AmritYojnaReport";
import { LabTestReport } from "@/components/reports/LabTestReport";

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("water-treatment");
  
  // Default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please login to access the admin dashboard");
          navigate("/admin-dashboard", { replace: true });
          return;
        }

        if (session.user.email !== "admin@gmail.com") {
          toast.error("You don't have admin access. Please contact the IT department.");
          await supabase.auth.signOut();
          navigate("/admin-dashboard", { replace: true });
          return;
        }

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

  const handleQuickSelect = (period: string) => {
    const today = new Date();
    let from: Date;
    
    switch (period) {
      case "today":
        from = today;
        break;
      case "week":
        from = subDays(today, 7);
        break;
      case "month":
        from = startOfMonth(today);
        break;
      case "year":
        from = startOfYear(today);
        break;
      default:
        from = subDays(today, 30);
    }
    
    setDateRange({ from, to: today });
  };

  const handleExportAll = async () => {
    toast.info("Preparing combined export...");
    // Implementation for ZIP export of all tabs
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive data analysis and reporting</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin-dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Date Range and Quick Select */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <DatePickerWithRange 
                date={dateRange} 
                onDateChange={setDateRange}
              />
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickSelect("today")}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickSelect("week")}
                >
                  This Week
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickSelect("month")}
                >
                  This Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickSelect("year")}
                >
                  This Year
                </Button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleExportAll}
              >
                <Archive className="h-4 w-4 mr-2" />
                Export All (ZIP)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs 
        defaultValue="water-treatment" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="water-treatment">Water Treatment</TabsTrigger>
          <TabsTrigger value="sewer-treatment">Sewer Treatment</TabsTrigger>
          <TabsTrigger value="amrit-yojna">Amrit Yojna</TabsTrigger>
          <TabsTrigger value="lab-test">Lab Test</TabsTrigger>
        </TabsList>

        <TabsContent value="water-treatment">
          <WaterTreatmentReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="sewer-treatment">
          <SewerTreatmentReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="amrit-yojna">
          <AmritYojnaReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="lab-test">
          <LabTestReport dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;