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

interface AmritYojnaData {
  id: string;
  date: string;
  ward_no: string;
  connection_number: string;
  customer_name: string;
  mobile_no: string;
  color: string | null;
  smell: string | null;
  ph_value: string | null;
  tds: string | null;
  conductivity_cl: string | null;
  created_at: string;
}

interface AmritYojnaReportProps {
  dateRange: DateRange;
}

export const AmritYojnaReport = ({ dateRange }: AmritYojnaReportProps) => {
  const [data, setData] = useState<AmritYojnaData[]>([]);
  const [filteredData, setFilteredData] = useState<AmritYojnaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ward_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.connection_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from("amrit_yojna_data").select("*");

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data: result, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error("Error fetching Amrit Yojna data:", error);
      toast.error("Failed to fetch Amrit Yojna data");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Date': format(new Date(item.date), 'yyyy-MM-dd'),
      'Ward No': item.ward_no,
      'Connection Number': item.connection_number,
      'Customer Name': item.customer_name,
      'Mobile No': item.mobile_no,
      'Color': item.color || 'N/A',
      'Smell': item.smell || 'N/A',
      'pH Value': item.ph_value || 'N/A',
      'TDS': item.tds || 'N/A',
      'Conductivity Cl': item.conductivity_cl || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    const title = `Amrit Yojna Report - ${format(dateRange?.from || new Date(), 'yyyy-MM-dd')} to ${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`;
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Amrit Yojna");
    
    const filename = `Amrit_Yojna_Report_${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}_to_${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast.success("Report exported successfully!");
  };

  const chartData = {
    categories: filteredData.map(item => format(new Date(item.date), 'MM/dd')),
    series: [
      {
        name: 'pH Value',
        data: filteredData.map(item => parseFloat(item.ph_value || '0'))
      },
      {
        name: 'TDS',
        data: filteredData.map(item => parseFloat(item.tds || '0'))
      }
    ]
  };

  const pieChartData = {
    series: [
      filteredData.filter(item => item.color === 'clear').length,
      filteredData.filter(item => item.color === 'cloudy').length,
      filteredData.filter(item => item.color === 'colored').length
    ],
    labels: ['Clear', 'Cloudy', 'Colored']
  };

  const chartOptions = {
    chart: {
      type: 'line' as const,
      height: 250,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: chartData.categories.length > 0 ? chartData.categories : ['No Data']
    },
    colors: ['#10b981', '#3b82f6'],
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    grid: {
      borderColor: '#e5e7eb'
    }
  };

  const pieOptions = {
    chart: {
      type: 'pie' as const,
      height: 250,
      background: 'transparent'
    },
    labels: pieChartData.labels,
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    legend: {
      position: 'bottom' as const
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
            placeholder="Search by customer, ward, or connection..."
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
              <CardTitle>Amrit Yojna Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background">Date</TableHead>
                      <TableHead className="sticky top-0 bg-background">Customer</TableHead>
                      <TableHead className="sticky top-0 bg-background">Ward</TableHead>
                      <TableHead className="sticky top-0 bg-background">Connection</TableHead>
                      <TableHead className="sticky top-0 bg-background">pH</TableHead>
                      <TableHead className="sticky top-0 bg-background">TDS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.date), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>{item.ward_no}</TableCell>
                        <TableCell>{item.connection_number}</TableCell>
                        <TableCell>{item.ph_value || 'N/A'}</TableCell>
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
              <CardTitle className="text-lg">pH & TDS Trends</CardTitle>
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
              <CardTitle className="text-lg">Water Color Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={pieOptions}
                series={pieChartData.series}
                type="pie"
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
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-medium">{filteredData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Connections:</span>
                <span className="font-medium">
                  {new Set(filteredData.map(item => item.connection_number)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};