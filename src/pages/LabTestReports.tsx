import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, FileText, Clock, CheckCircle, Eye, Download, Droplets, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import DocumentViewer from "@/components/admin/DocumentViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LabTest {
  id: string;
  sample_id: string;
  submitter_name: string;
  submitter_email: string;
  submitter_mobile: string;
  submitter_address: string;
  created_at: string;
  updated_at: string;
  sample_image_url: string;
  calcium?: string;
  chloride?: string;
  e_coli?: string;
  fluoride?: string;
  free_residual_chlorine?: string;
  iron?: string;
  magnesium?: string;
  ph?: string;
  sulphate?: string;
  tds?: string;
  total_alkalinity?: string;
  total_coliform?: string;
  total_hardness?: string;
  turbidity?: string;
  notes?: string;
}

const LabTestReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [samples, setSamples] = useState<LabTest[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<LabTest[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  
  // Stats
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    treatedSamples: 0,
  });

  const [selectedSample, setSelectedSample] = useState<LabTest | null>(null);

  useEffect(() => {
    checkAuth();
    fetchSamples();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [samples, searchTerm, statusFilter, dateFrom, dateTo]);

  const checkAuth = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        navigate("/auth/login");
        return;
      }

      setUser(sessionData.session.user);

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData.session.user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSamples(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching samples:", error);
      toast.error("Failed to load samples");
    }
  };

  const calculateStats = (data: LabTest[]) => {
    const total = data.length;
    const testFields = ['ph', 'tds', 'turbidity', 'calcium', 'chloride'];
    
    const treated = data.filter(sample => 
      testFields.some(field => sample[field as keyof LabTest] && sample[field as keyof LabTest] !== null && sample[field as keyof LabTest] !== "")
    ).length;
    
    setStats({
      totalSamples: total,
      pendingSamples: total - treated,
      treatedSamples: treated,
    });
  };

  const applyFilters = () => {
    let filtered = [...samples];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sample => 
        sample.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.submitter_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const testFields = ['ph', 'tds', 'turbidity', 'calcium', 'chloride'];
      
      if (statusFilter === "pending") {
        filtered = filtered.filter(sample => 
          !testFields.some(field => sample[field as keyof LabTest] && sample[field as keyof LabTest] !== null && sample[field as keyof LabTest] !== "")
        );
      } else if (statusFilter === "treated") {
        filtered = filtered.filter(sample => 
          testFields.some(field => sample[field as keyof LabTest] && sample[field as keyof LabTest] !== null && sample[field as keyof LabTest] !== "")
        );
      }
    }

    // Date filter
    if (dateFrom && dateTo) {
      filtered = filtered.filter(sample => {
        const sampleDate = new Date(sample.created_at);
        return sampleDate >= dateFrom && sampleDate <= dateTo;
      });
    }

    setFilteredSamples(filtered);
  };

  const getSampleStatus = (sample: LabTest) => {
    const testFields = ['ph', 'tds', 'turbidity', 'calcium', 'chloride'];
    return testFields.some(field => sample[field as keyof LabTest] && sample[field as keyof LabTest] !== null && sample[field as keyof LabTest] !== "") ? 'treated' : 'pending';
  };

  const exportSampleReport = (sample: LabTest) => {
    const fields = [
      ["Sample ID", sample.sample_id],
      ["Submitter Name", sample.submitter_name],
      ["Email", sample.submitter_email],
      ["Mobile", sample.submitter_mobile],
      ["Address", sample.submitter_address],
      ["Date Submitted", format(new Date(sample.created_at), "PPP")],
      ["Calcium (mg/L)", sample.calcium || "Not tested"],
      ["Chloride (mg/L)", sample.chloride || "Not tested"],
      ["E.coli (CFU/100mL)", sample.e_coli || "Not tested"],
      ["Fluoride (mg/L)", sample.fluoride || "Not tested"],
      ["Free Residual Chlorine (mg/L)", sample.free_residual_chlorine || "Not tested"],
      ["Iron (mg/L)", sample.iron || "Not tested"],
      ["Magnesium (mg/L)", sample.magnesium || "Not tested"],
      ["pH", sample.ph || "Not tested"],
      ["Sulphate (mg/L)", sample.sulphate || "Not tested"],
      ["TDS (mg/L)", sample.tds || "Not tested"],
      ["Total Alkalinity (mg/L)", sample.total_alkalinity || "Not tested"],
      ["Total Coliform (CFU/100mL)", sample.total_coliform || "Not tested"],
      ["Total Hardness (mg/L)", sample.total_hardness || "Not tested"],
      ["Turbidity (NTU)", sample.turbidity || "Not tested"],
      ["Notes", sample.notes || "No notes"],
    ];

    const csvContent = fields.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lab-test-report-${sample.sample_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading lab test system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Droplets className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Water Treatment Lab Test Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive sample testing and analysis system</p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="mt-4 md:mt-0"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-200 shadow-sm">
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submitted Samples</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.totalSamples}</h3>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 shadow-sm">
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Samples</p>
              <h3 className="text-3xl font-bold text-amber-600">{stats.pendingSamples}</h3>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
        
        <Card className="border-green-200 shadow-sm">
          <CardContent className="flex flex-row items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Treated Samples</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.treatedSamples}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="pending">Pending Samples</TabsTrigger>
          <TabsTrigger value="treated">Treated Samples</TabsTrigger>
        </TabsList>

        {/* Pending Samples Tab */}
        <TabsContent value="pending" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Pending Samples
              </CardTitle>
              <CardDescription>
                View samples awaiting laboratory testing and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Search by Sample ID or Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Enter sample ID or submitter name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Samples List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSamples.filter(sample => getSampleStatus(sample) === 'pending').map((sample) => (
              <Card key={sample.id} className="border-amber-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{sample.sample_id}</CardTitle>
                    <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Awaiting Test
                    </Badge>
                  </div>
                  <CardDescription>{sample.submitter_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Email:</strong> {sample.submitter_email}</p>
                    <p><strong>Mobile:</strong> {sample.submitter_mobile}</p>
                    <p><strong>Submitted:</strong> {format(new Date(sample.created_at), "PPP")}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <DocumentViewer documentUrl={sample.sample_image_url} />
                    <span className="text-sm text-gray-500">Sample Image</span>
                  </div>

                  {isAdmin && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-700 text-center">
                        Use the Admin Dashboard → Pending Lab Tests to enter test parameters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treated Samples Tab */}
        <TabsContent value="treated" className="space-y-6">
          {/* Filters (same as pending) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Treated Samples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search-treated">Search by Sample ID or Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-treated"
                      placeholder="Enter sample ID or submitter name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treated Samples List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSamples.filter(sample => getSampleStatus(sample) === 'treated').map((sample) => (
              <Card key={sample.id} className="border-green-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{sample.sample_id}</CardTitle>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tested
                    </Badge>
                  </div>
                  <CardDescription>{sample.submitter_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Tested on:</strong> {format(new Date(sample.updated_at), "PPP")}</p>
                    <p><strong>Submitted:</strong> {format(new Date(sample.created_at), "PPP")}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSample(sample)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Complete Test Report - {sample.sample_id}</DialogTitle>
                        </DialogHeader>
                        {selectedSample && (
                          <div className="space-y-6 p-4">
                            {/* Submitter Info */}
                            <div>
                              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Submitter Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Name</p>
                                  <p className="font-medium">{selectedSample.submitter_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <p className="font-medium">{selectedSample.submitter_email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Mobile</p>
                                  <p className="font-medium">{selectedSample.submitter_mobile}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Address</p>
                                  <p className="font-medium">{selectedSample.submitter_address}</p>
                                </div>
                              </div>
                            </div>

                            {/* Test Results */}
                            <div>
                              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Test Results</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                  { label: "Calcium (mg/L)", value: selectedSample.calcium },
                                  { label: "Chloride (mg/L)", value: selectedSample.chloride },
                                  { label: "E. coli (CFU/100mL)", value: selectedSample.e_coli },
                                  { label: "Fluoride (mg/L)", value: selectedSample.fluoride },
                                  { label: "Free Residual Chlorine (mg/L)", value: selectedSample.free_residual_chlorine },
                                  { label: "Iron (mg/L)", value: selectedSample.iron },
                                  { label: "Magnesium (mg/L)", value: selectedSample.magnesium },
                                  { label: "pH", value: selectedSample.ph },
                                  { label: "Sulphate (mg/L)", value: selectedSample.sulphate },
                                  { label: "TDS (mg/L)", value: selectedSample.tds },
                                  { label: "Total Alkalinity (mg/L)", value: selectedSample.total_alkalinity },
                                  { label: "Total Coliform (CFU/100mL)", value: selectedSample.total_coliform },
                                  { label: "Total Hardness (mg/L)", value: selectedSample.total_hardness },
                                  { label: "Turbidity (NTU)", value: selectedSample.turbidity },
                                ].map((param) => (
                                  <div key={param.label} className="p-3 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-500">{param.label}</p>
                                    <p className="font-semibold text-lg">{param.value || "Not tested"}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {selectedSample.notes && (
                              <div>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Laboratory Notes</h3>
                                <p className="bg-gray-50 p-3 rounded">{selectedSample.notes}</p>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button onClick={() => exportSampleReport(selectedSample)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportSampleReport(sample)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LabTestReports;