import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Chart from "react-apexcharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WaterQualityData {
  id: string;
  plant_id: string;
  water_type: string;
  turbidity: string | null;
  ph_value: string | null;
  alkalinity: string | null;
  chlorides: string | null;
  hardness: string | null;
  iron: string | null;
  dissolved_oxygen: string | null;
  created_at: string;
  water_treatment_plants?: {
    name: string;
    location: string;
  };
}

interface WaterTreatmentReportProps {
  dateRange: DateRange;
}

export const WaterTreatmentReport = ({ dateRange }: WaterTreatmentReportProps) => {
  const [data, setData] = useState<WaterQualityData[]>([]);
  const [filteredData, setFilteredData] = useState<WaterQualityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.water_treatment_plants?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.water_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("water_quality_data")
        .select(`
          *,
          water_treatment_plants (name, location)
        `);

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: result, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error("Error fetching water treatment data:", error);
      toast.error("Failed to fetch water treatment data");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Date': format(new Date(item.created_at), 'yyyy-MM-dd HH:mm'),
      'Plant Name': item.water_treatment_plants?.name || 'N/A',
      'Location': item.water_treatment_plants?.location || 'N/A',
      'Water Type': item.water_type,
      'Turbidity': item.turbidity || 'N/A',
      'pH Value': item.ph_value || 'N/A',
      'Alkalinity': item.alkalinity || 'N/A',
      'Chlorides': item.chlorides || 'N/A',
      'Hardness': item.hardness || 'N/A',
      'Iron': item.iron || 'N/A',
      'Dissolved Oxygen': item.dissolved_oxygen || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    // Add title row
    const title = `Water Treatment Report - ${format(dateRange?.from || new Date(), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`;
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Water Treatment");
    
    const filename = `Water_Treatment_Report_${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}_to_${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast.success("Report exported successfully!");
  };

  // Chart data preparation
  const chartData = {
    categories: filteredData.map(item => format(new Date(item.created_at), 'MM/dd')),
    series: [
      {
        name: 'pH Value',
        data: filteredData.map(item => parseFloat(item.ph_value || '0'))
      },
      {
        name: 'Turbidity',
        data: filteredData.map(item => parseFloat(item.turbidity || '0'))
      }
    ]
  };

  const chartOptions = {
    chart: {
      type: 'line' as const,
      height: 300,
      background: 'transparent'
    },
    xaxis: {
      categories: chartData.categories
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--secondary))'],
    stroke: {
      curve: 'smooth' as const,
      width: 2
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by plant name or water type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Water Treatment Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background">Date</TableHead>
                      <TableHead className="sticky top-0 bg-background">Plant</TableHead>
                      <TableHead className="sticky top-0 bg-background">Type</TableHead>
                      <TableHead className="sticky top-0 bg-background">pH</TableHead>
                      <TableHead className="sticky top-0 bg-background">Turbidity</TableHead>
                      <TableHead className="sticky top-0 bg-background">Iron</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.created_at), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{item.water_treatment_plants?.name || 'N/A'}</TableCell>
                        <TableCell>{item.water_type}</TableCell>
                        <TableCell>{item.ph_value || 'N/A'}</TableCell>
                        <TableCell>{item.turbidity || 'N/A'}</TableCell>
                        <TableCell>{item.iron || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">pH & Turbidity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={chartOptions}
                series={chartData.series}
                type="line"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-medium">{filteredData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raw Water:</span>
                <span className="font-medium">
                  {filteredData.filter(item => item.water_type === 'raw').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Treated Water:</span>
                <span className="font-medium">
                  {filteredData.filter(item => item.water_type === 'treated').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};