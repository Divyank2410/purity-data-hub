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

interface LabTestData {
  id: string;
  sample_id: string;
  submitter_name: string;
  submitter_address: string;
  sample_type: string | null;
  ph: string | null;
  tds: string | null;
  turbidity: string | null;
  calcium: string | null;
  chloride: string | null;
  e_coli: string | null;
  fluoride: string | null;
  iron: string | null;
  created_at: string;
}

interface LabTestReportProps {
  dateRange: DateRange;
}

export const LabTestReport = ({ dateRange }: LabTestReportProps) => {
  const [data, setData] = useState<LabTestData[]>([]);
  const [filteredData, setFilteredData] = useState<LabTestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.submitter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sample_type && item.sample_type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from("lab_tests").select("*");

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: result, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error("Error fetching lab test data:", error);
      toast.error("Failed to fetch lab test data");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Date': format(new Date(item.created_at), 'yyyy-MM-dd HH:mm'),
      'Sample ID': item.sample_id,
      'Submitter Name': item.submitter_name,
      'Address': item.submitter_address,
      'Sample Type': item.sample_type || 'N/A',
      'pH': item.ph || 'N/A',
      'TDS': item.tds || 'N/A',
      'Turbidity': item.turbidity || 'N/A',
      'Calcium': item.calcium || 'N/A',
      'Chloride': item.chloride || 'N/A',
      'E. Coli': item.e_coli || 'N/A',
      'Fluoride': item.fluoride || 'N/A',
      'Iron': item.iron || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    const title = `Lab Test Report - ${format(dateRange?.from || new Date(), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`;
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Test");
    
    const filename = `Lab_Test_Report_${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}_to_${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast.success("Report exported successfully!");
  };

  const chartData = {
    categories: filteredData.map(item => format(new Date(item.created_at), 'MM/dd')),
    series: [
      {
        name: 'pH',
        data: filteredData.map(item => parseFloat(item.ph || '0'))
      },
      {
        name: 'TDS',
        data: filteredData.map(item => parseFloat(item.tds || '0'))
      },
      {
        name: 'Turbidity',
        data: filteredData.map(item => parseFloat(item.turbidity || '0'))
      }
    ]
  };

  const barChartData = {
    categories: ['Calcium', 'Chloride', 'Fluoride', 'Iron'],
    series: [{
      name: 'Average Values',
      data: [
        filteredData.reduce((sum, item) => sum + parseFloat(item.calcium || '0'), 0) / filteredData.length || 0,
        filteredData.reduce((sum, item) => sum + parseFloat(item.chloride || '0'), 0) / filteredData.length || 0,
        filteredData.reduce((sum, item) => sum + parseFloat(item.fluoride || '0'), 0) / filteredData.length || 0,
        filteredData.reduce((sum, item) => sum + parseFloat(item.iron || '0'), 0) / filteredData.length || 0
      ]
    }]
  };

  const chartOptions = {
    chart: {
      type: 'line' as const,
      height: 250,
      background: 'transparent'
    },
    xaxis: {
      categories: chartData.categories
    },
    colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
    stroke: {
      curve: 'smooth' as const,
      width: 2
    }
  };

  const barOptions = {
    chart: {
      type: 'bar' as const,
      height: 250,
      background: 'transparent'
    },
    xaxis: {
      categories: barChartData.categories
    },
    colors: ['hsl(var(--primary))'],
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    }
  };

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by submitter or sample ID..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lab Test Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background">Date</TableHead>
                      <TableHead className="sticky top-0 bg-background">Sample ID</TableHead>
                      <TableHead className="sticky top-0 bg-background">Submitter</TableHead>
                      <TableHead className="sticky top-0 bg-background">Type</TableHead>
                      <TableHead className="sticky top-0 bg-background">pH</TableHead>
                      <TableHead className="sticky top-0 bg-background">TDS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.created_at), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{item.sample_id}</TableCell>
                        <TableCell>{item.submitter_name}</TableCell>
                        <TableCell>{item.sample_type || 'N/A'}</TableCell>
                        <TableCell>{item.ph || 'N/A'}</TableCell>
                        <TableCell>{item.tds || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parameter Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={chartOptions}
                series={chartData.series}
                type="line"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Chemical Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={barOptions}
                series={barChartData.series}
                type="bar"
                height={250}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tests:</span>
                <span className="font-medium">{filteredData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unique Samples:</span>
                <span className="font-medium">
                  {new Set(filteredData.map(item => item.sample_id)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};